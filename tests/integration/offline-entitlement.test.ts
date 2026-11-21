import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";
import { POST as downloadAuthHandler } from "@/app/api/documents/[id]/download-auth/route";
import { GET as chunkHandler } from "@/app/api/documents/[id]/encrypted-chunks/[chunkIndex]/route";
import { POST as renewLicenseHandler } from "@/app/api/documents/[id]/renew-license/route";
import { OfflineLicenseService } from "@/lib/offline/offline-license";
import { DocumentEncryptionService } from "@/lib/crypto/document-encryption";

describe("Offline Encrypted Learning & Entitlement Integration Tests (Parts C, F & G)", () => {
  beforeEach(() => {
    dbStore.resetAndSeed();
    dbStore.entitlements.push({
      id: "ent-test-001",
      studentId: entitledStudentId,
      documentId: targetDocId,
      documentVersion: 2,
      orderId: "ord-test-001",
      grantedAt: new Date().toISOString(),
      isActive: true,
    });
  });

  const entitledStudentId = "user-student-1"; // Seeded with active entitlement for doc-csc2101-notes
  const unpurchasedStudentId = "user-student-unpurchased";
  const targetDocId = "doc-csc2101-notes";
  const deviceInstallationId = "dev-android-pwa-001";

  it("strictly denies download authorization (HTTP 403) to a student without an active purchase entitlement", async () => {
    const req = new NextRequest("http://localhost:3000/api/documents/doc-csc2101-notes/download-auth", {
      method: "POST",
      body: JSON.stringify({
        studentId: unpurchasedStudentId,
        deviceInstallationId,
      }),
    });

    const res = await downloadAuthHandler(req, { params: { id: targetDocId } });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.authorized).toBe(false);
    expect(data.error).toContain("ACCESS_DENIED");
  });

  it("authorizes download for an entitled student and returns signed license, chunks manifest, and download token", async () => {
    const req = new NextRequest(`http://localhost:3000/api/documents/${targetDocId}/download-auth`, {
      method: "POST",
      body: JSON.stringify({
        studentId: entitledStudentId,
        deviceInstallationId,
      }),
    });

    const res = await downloadAuthHandler(req, { params: { id: targetDocId } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.authorized).toBe(true);
    expect(data.authToken).toBeDefined();
    expect(data.totalChunks).toBeGreaterThan(0);
    expect(data.chunkManifest).toHaveLength(data.totalChunks);
    expect(data.derivedKeyHex).toBeDefined();

    // Verify offline license
    expect(data.license).toBeDefined();
    expect(data.license.studentId).toBe(entitledStudentId);
    expect(data.license.documentId).toBe(targetDocId);
    expect(data.license.deviceInstallationId).toBe(deviceInstallationId);

    const licenseVer = OfflineLicenseService.verifyLicense(data.license, deviceInstallationId);
    expect(licenseVer.valid).toBe(true);
    expect(licenseVer.daysRemaining).toBe(30);
  });

  it("serves encrypted AES-GCM chunk when presented with valid download token", async () => {
    // 1. Obtain authorization token
    const authReq = new NextRequest(`http://localhost:3000/api/documents/${targetDocId}/download-auth`, {
      method: "POST",
      body: JSON.stringify({
        studentId: entitledStudentId,
        deviceInstallationId,
      }),
    });
    const authRes = await downloadAuthHandler(authReq, { params: { id: targetDocId } });
    const authData = await authRes.json();
    const token = authData.authToken;
    const derivedKeyHex = authData.derivedKeyHex;

    // 2. Request chunk 0 with token
    const chunkReq = new NextRequest(
      `http://localhost:3000/api/documents/${targetDocId}/encrypted-chunks/0?token=${encodeURIComponent(token)}`
    );
    const chunkRes = await chunkHandler(chunkReq, {
      params: { id: targetDocId, chunkIndex: "0" },
    });
    const chunkData = await chunkRes.json();

    expect(chunkRes.status).toBe(200);
    expect(chunkData.chunkIndex).toBe(0);
    expect(chunkData.ivHex).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(chunkData.ciphertextBase64).toBeDefined();
    expect(chunkData.plaintextSha256).toBeDefined();

    // 3. Verify chunk cannot be opened as a plain PDF
    const ciphertextBytes = DocumentEncryptionService.base64ToBytes(chunkData.ciphertextBase64);
    const headerPrefix = new TextDecoder().decode(ciphertextBytes.slice(0, 5));
    expect(headerPrefix).not.toBe("%PDF-"); // Ciphered!

    // 4. Decrypt chunk in memory with the authorized key
    const docKey = await DocumentEncryptionService.importKeyFromHex(derivedKeyHex);
    const decryptedBytes = await DocumentEncryptionService.decryptChunk(chunkData, docKey);
    expect(decryptedBytes.length).toBeGreaterThan(0);
  }, 15000);

  it("rejects chunk request if token is missing or forged (HTTP 403)", async () => {
    // Missing token
    const noTokenReq = new NextRequest(
      `http://localhost:3000/api/documents/${targetDocId}/encrypted-chunks/0`
    );
    const noTokenRes = await chunkHandler(noTokenReq, {
      params: { id: targetDocId, chunkIndex: "0" },
    });
    expect(noTokenRes.status).toBe(403);

    // Forged token
    const forgedToken = "impostor:doc-csc2101-notes:dev-123:9999999999999:fake_signature";
    const forgedReq = new NextRequest(
      `http://localhost:3000/api/documents/${targetDocId}/encrypted-chunks/0?token=${encodeURIComponent(forgedToken)}`
    );
    const forgedRes = await chunkHandler(forgedReq, {
      params: { id: targetDocId, chunkIndex: "0" },
    });
    expect(forgedRes.status).toBe(403);
  });

  it("renews a 30-day offline license for an entitled student", async () => {
    const renewReq = new NextRequest(
      `http://localhost:3000/api/documents/${targetDocId}/renew-license`,
      {
        method: "POST",
        body: JSON.stringify({
          studentId: entitledStudentId,
          deviceInstallationId,
        }),
      }
    );

    const renewRes = await renewLicenseHandler(renewReq, { params: { id: targetDocId } });
    const renewData = await renewRes.json();

    expect(renewRes.status).toBe(200);
    expect(renewData.success).toBe(true);
    expect(renewData.license).toBeDefined();

    const ver = OfflineLicenseService.verifyLicense(renewData.license, deviceInstallationId);
    expect(ver.valid).toBe(true);
    expect(ver.daysRemaining).toBe(30);
  });
});
