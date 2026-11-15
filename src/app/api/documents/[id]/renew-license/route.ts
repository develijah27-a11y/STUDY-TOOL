import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";
import { OfflineLicenseService } from "@/lib/offline/offline-license";

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
        { error: "MISSING_PARAMETERS: studentId and deviceInstallationId are required" },
        { status: 400 }
      );
    }

    const doc = dbStore.documents.find((d) => d.id === documentId);
    if (!doc) {
      return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    }

    // Verify entitlement on the server
    const entitlement = dbStore.entitlements.find(
      (e) => e.studentId === studentId && e.documentId === documentId && e.isActive
    );

    const lec = dbStore.lecturerProfiles.find((l) => l.userId === studentId);
    const isLecturerAuthor = lec && lec.id === doc.lecturerId;

    if (!entitlement && !isLecturerAuthor) {
      return NextResponse.json(
        {
          error:
            "RENEWAL_DENIED: No active purchase entitlement exists. Purchase is required to renew offline authorization.",
        },
        { status: 403 }
      );
    }

    const orderId = entitlement?.orderId || `author-${doc.id}`;

    // Issue refreshed 30-day signed offline license
    const renewedLicense = OfflineLicenseService.issueLicense({
      studentId,
      documentId: doc.id,
      documentVersion: doc.currentVersion,
      orderId,
      deviceInstallationId,
      durationDays: 30,
    });

    return NextResponse.json({
      success: true,
      license: renewedLicense,
      message: "Offline authorization successfully renewed for 30 days.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
