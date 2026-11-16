import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";
import { PublishingAndDeliveryService } from "@/lib/documents/publishing-service";
import { UserAuthContext } from "@/lib/auth/roles";
import { DocumentType } from "@/types/domain";
import { findUserById } from "@/lib/auth/user-store";

function getAuthContextFromUser(userId: string): UserAuthContext {
  const profile = dbStore.profiles.find((p) => p.id === userId);
  const localUser = findUserById(userId);
  const roles = dbStore.userRoles.get(userId) || (localUser ? [localUser.role] : ["student"]);
  const lec = dbStore.lecturerProfiles.find((l) => l.userId === userId || l.id === userId);

  const isVerified =
    lec?.verificationStatus === "approved" ||
    localUser?.verificationStatus === "verified" ||
    roles.includes("admin");

  return {
    userId,
    email: profile?.email || localUser?.email || "",
    roles,
    lecturerProfile: (roles.includes("lecturer") || roles.includes("admin"))
      ? {
          id: lec ? lec.id : `lec-${userId}`,
          verificationStatus: isVerified ? "approved" : "under_review",
          institutionId: lec?.institutionId || localUser?.institutionId || "inst-mak",
        }
      : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId = "user-lecturer-1" } = body;
    const authContext = getAuthContextFromUser(userId);

    if (action === "publish_document") {
      // Create valid PDF binary signature buffer if uploading via JSON metadata payload
      const rawBuffer = Buffer.from(
        `%PDF-1.7\n${body.title || "Academic Publication"}\n${Date.now()}`
      );

      const res = PublishingAndDeliveryService.publishDocument({
        authContext,
        title: body.title,
        description: body.description,
        institutionId: body.institutionId || "inst-mak",
        programmeId: body.programmeId,
        courseUnitId: body.courseUnitId || "course-csc2101",
        documentType: (body.documentType || "lecture_notes") as DocumentType,
        priceUGX: Number(body.priceUGX),
        pageCount: Number(body.pageCount || 15),
        fileBuffer: rawBuffer,
        fileName: body.fileName || "publication.pdf",
        topics: Array.isArray(body.topics)
          ? body.topics
          : String(body.topics || "University Notes")
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean),
        suggestedPreviewPages: body.suggestedPreviewPages,
        ownershipConfirmed: Boolean(body.ownershipConfirmed),
      });

      return NextResponse.json(res, { status: res.success ? 200 : 403 });
    }

    if (action === "upload_version") {
      const rawBuffer = Buffer.from(`%PDF-1.7\nUpdated Version\n${Date.now()}`);
      const res = PublishingAndDeliveryService.uploadNewVersion({
        authContext,
        documentId: body.documentId,
        changeSummary: body.changeSummary || "Updated edition",
        pageCount: Number(body.pageCount || 20),
        fileBuffer: rawBuffer,
        fileName: body.fileName || "updated.pdf",
        suggestedPreviewPages: body.suggestedPreviewPages,
      });

      return NextResponse.json(res, { status: res.success ? 200 : 403 });
    }

    if (action === "update_document") {
      const res = PublishingAndDeliveryService.updateDocument({
        authContext,
        documentId: body.documentId,
        title: body.title,
        description: body.description,
        priceUGX: typeof body.priceUGX === "number" ? body.priceUGX : undefined,
        topics: body.topics,
        courseUnitId: body.courseUnitId,
      });

      return NextResponse.json(res, { status: res.success ? 200 : 403 });
    }

    if (action === "set_document_status") {
      const res = PublishingAndDeliveryService.setDocumentStatus({
        authContext,
        documentId: body.documentId,
        status: body.status || "draft",
      });

      return NextResponse.json(res, { status: res.success ? 200 : 403 });
    }

    if (action === "create_collection") {
      const res = await PublishingAndDeliveryService.createCollection({
        authContext,
        title: body.title,
        description: body.description,
        institutionId: body.institutionId || "inst-mak",
        courseUnitId: body.courseUnitId,
        documentIds: body.documentIds || [],
      });

      return NextResponse.json(res, { status: res.success ? 200 : 403 });
    }

    return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

