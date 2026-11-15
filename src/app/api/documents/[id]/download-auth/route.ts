import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbStore } from "@/lib/db/in-memory-store";
import { OfflineLicenseService } from "@/lib/offline/offline-license";
import { DocumentEncryptionService } from "@/lib/crypto/document-encryption";

const DOWNLOAD_TOKEN_SECRET =
  process.env.DOWNLOAD_TOKEN_SECRET || "somaug_download_token_secret_2026";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const body = await req.json();
    const { studentId, deviceInstallationId } = body;

    if (!studentId || !deviceInstallationId) {
      return NextResponse.json(
        {
          authorized: false,
          error: "MISSING_PARAMETERS: studentId and deviceInstallationId are required",
        },
        { status: 400 }
      );
    }

    // 1. Find document
    const doc = dbStore.documents.find((d) => d.id === documentId);
    if (!doc || doc.status !== "published") {
      return NextResponse.json(
        { authorized: false, error: "DOCUMENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 2. SERVER-SIDE ENTITLEMENT VERIFICATION (Part C Section 7)
    // Only verified purchases can download. Never trust frontend or localStorage.
    const entitlement = dbStore.entitlements.find(
      (e) => e.studentId === studentId && e.documentId === documentId && e.isActive
    );

    // Also allow the verified author/lecturer to download their own work
    const lec = dbStore.lecturerProfiles.find((l) => l.userId === studentId);
    const isLecturerAuthor = lec && lec.id === doc.lecturerId;

    if (!entitlement && !isLecturerAuthor) {
      return NextResponse.json(
        {
          authorized: false,
          error: `ACCESS_DENIED: Student ${studentId} does not possess an active purchase entitlement for ${doc.title}. Please purchase first to enable offline reading.`,
        },
        { status: 403 }
      );
    }

    const orderId = entitlement?.orderId || `author-preview-${doc.id}`;

    // 3. Issue signed Offline License (Part C Section 10)
    const license = OfflineLicenseService.issueLicense({
      studentId,
      documentId: doc.id,
      documentVersion: doc.currentVersion,
      orderId,
      deviceInstallationId,
      durationDays: 30, // 30-day offline validity
    });

    // 4. Generate / Derive Document Encryption Key (AES-GCM 256-bit)
    // Deterministic key derived from document ID + secret salt for reproducible chunk delivery
    const saltHex = crypto
      .createHash("sha256")
      .update(`${doc.id}-${doc.currentVersion}-academic-salt`)
      .digest("hex");
    const docKey = await DocumentEncryptionService.deriveDocumentKey(
      DOWNLOAD_TOKEN_SECRET,
      saltHex
    );
    const derivedKeyHex = await DocumentEncryptionService.exportKeyToHex(docKey);

    // 5. Build Chunk Manifest (512 KB chunks)
    const chunkSizeBytes = 512 * 1024;
    const totalChunks = Math.max(1, Math.ceil(doc.fileSizeBytes / chunkSizeBytes));
    const chunkManifest = [];

    for (let i = 0; i < totalChunks; i++) {
      const isLast = i === totalChunks - 1;
      const sizeBytes = isLast ? doc.fileSizeBytes - i * chunkSizeBytes : chunkSizeBytes;
      const chunkHash = crypto
        .createHash("sha256")
        .update(`${doc.id}-chunk-${i}-v${doc.currentVersion}`)
        .digest("hex");

      chunkManifest.push({
        chunkIndex: i,
        sizeBytes,
        sha256Hash: chunkHash,
      });
    }

    // 6. Sign Time-Limited Download Token (Valid for 2 hours)
    const expiresAt = Date.now() + 2 * 60 * 60 * 1000;
    const tokenData = `${studentId}:${doc.id}:${deviceInstallationId}:${expiresAt}`;
    const tokenSignature = crypto
      .createHmac("sha256", DOWNLOAD_TOKEN_SECRET)
      .update(tokenData)
      .digest("hex");
    const authToken = `${tokenData}:${tokenSignature}`;

    const inst = dbStore.institutions.find((i) => i.id === doc.institutionId);
    const author = dbStore.lecturerProfiles.find((l) => l.id === doc.lecturerId);
    const course = dbStore.courses.find((c) => c.id === doc.courseUnitId);

    return NextResponse.json({
      authorized: true,
      authToken,
      materialMeta: {
        id: doc.id,
        title: doc.title,
        lecturerName: author?.fullName || "Verified Lecturer",
        institutionName: inst?.name || "Institution",
        courseCode: course?.code || "Course",
        pageCount: doc.pageCount,
        fileSizeBytes: doc.fileSizeBytes,
        documentVersion: doc.currentVersion,
      },
      totalChunks,
      chunkManifest,
      license,
      derivedKeyHex,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ authorized: false, error: message }, { status: 500 });
  }
}
