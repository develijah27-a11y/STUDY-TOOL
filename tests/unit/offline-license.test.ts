import { describe, it, expect } from "vitest";
import { OfflineLicenseService } from "../../src/lib/offline/offline-license";

describe("OfflineLicenseService", () => {
  const sampleParams = {
    studentId: "user-student-1",
    documentId: "doc-csc2101-notes",
    documentVersion: 2,
    orderId: "ord-test-001",
    deviceInstallationId: "dev-inst-xyz-987",
    durationDays: 30,
  };

  it("issues a signed offline license with valid HMAC-SHA256 signature and 30-day expiry", () => {
    const license = OfflineLicenseService.issueLicense(sampleParams);

    expect(license.licenseId).toBeDefined();
    expect(license.studentId).toBe(sampleParams.studentId);
    expect(license.documentId).toBe(sampleParams.documentId);
    expect(license.deviceInstallationId).toBe(sampleParams.deviceInstallationId);
    expect(license.status).toBe("active");
    expect(license.signature).toHaveLength(64); // SHA-256 hex length

    const issuedTime = new Date(license.issuedAt).getTime();
    const expiryTime = new Date(license.expiresAt).getTime();
    const diffDays = Math.round((expiryTime - issuedTime) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it("verifies a legitimate license on the matching device installation", () => {
    const license = OfflineLicenseService.issueLicense(sampleParams);
    const result = OfflineLicenseService.verifyLicense(
      license,
      sampleParams.deviceInstallationId
    );

    expect(result.valid).toBe(true);
    expect(result.requiresRenewal).toBe(false);
    expect(result.daysRemaining).toBe(30);
  });

  it("detects and rejects device installation mismatch", () => {
    const license = OfflineLicenseService.issueLicense(sampleParams);
    const result = OfflineLicenseService.verifyLicense(
      license,
      "dev-inst-DIFFERENT-DEVICE"
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain("DEVICE_MISMATCH");
  });

  it("detects and rejects tampered license metadata (e.g. forged student ID or expiry)", () => {
    const license = OfflineLicenseService.issueLicense(sampleParams);

    // Tamper with studentId
    const forgedStudentLicense = {
      ...license,
      studentId: "user-student-IMPOSTOR",
    };

    const studentResult = OfflineLicenseService.verifyLicense(
      forgedStudentLicense,
      sampleParams.deviceInstallationId
    );
    expect(studentResult.valid).toBe(false);
    expect(studentResult.error).toContain("SIGNATURE_INVALID");

    // Tamper with expiration date to extend fraudulently
    const forgedExpiryLicense = {
      ...license,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const expiryResult = OfflineLicenseService.verifyLicense(
      forgedExpiryLicense,
      sampleParams.deviceInstallationId
    );
    expect(expiryResult.valid).toBe(false);
    expect(expiryResult.error).toContain("SIGNATURE_INVALID");
  });

  it("marks expired license as requiring renewal without throwing unexpected errors", () => {
    // Issue license with negative duration
    const expiredLicense = OfflineLicenseService.issueLicense({
      ...sampleParams,
      durationDays: -1,
    });

    const result = OfflineLicenseService.verifyLicense(
      expiredLicense,
      sampleParams.deviceInstallationId
    );

    expect(result.valid).toBe(false);
    expect(result.requiresRenewal).toBe(true);
    expect(result.daysRemaining).toBe(0);
    expect(result.error).toContain("LICENSE_EXPIRED");
  });
});
