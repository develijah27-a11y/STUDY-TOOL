import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";
import { PublishingAndDeliveryService } from "@/lib/documents/publishing-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || undefined;
  const documentId = searchParams.get("documentId") || "";
  const pageNumber = Number(searchParams.get("page") || 1);

  const pageAccess = PublishingAndDeliveryService.getAuthorizedPageContent({
    userId,
    documentId,
    pageNumber,
  });

  if (!pageAccess.authorized) {
    return NextResponse.json(pageAccess, { status: 403 });
  }

  // Only return the calling student's own reading progress, bookmarks, and personal notes
  const progress = userId
    ? dbStore.readingProgress.find(
        (rp) => rp.studentId === userId && rp.documentId === documentId
      )
    : undefined;

  const bookmarks = userId
    ? dbStore.bookmarks.filter(
        (b) => b.studentId === userId && b.documentId === documentId
      )
    : [];

  const notes = userId
    ? dbStore.personalNotes.filter(
        (n) => n.studentId === userId && n.documentId === documentId
      )
    : [];

  return NextResponse.json({
    ...pageAccess,
    progress,
    bookmarks,
    notes,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, studentId, documentId } = body;

    if (!studentId || !documentId) {
      return NextResponse.json({ error: "MISSING_PARAMETERS" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (action === "save_progress") {
      const doc = dbStore.documents.find((d) => d.id === documentId);
      const totalPages = doc?.pageCount || 1;
      const lastReadPage = Math.max(1, Math.min(totalPages, Number(body.pageNumber || 1)));
      const completionPercent = Math.round((lastReadPage / totalPages) * 100);

      let existing = dbStore.readingProgress.find(
        (rp) => rp.studentId === studentId && rp.documentId === documentId
      );

      if (existing) {
        existing.lastReadPage = lastReadPage;
        existing.completionPercent = completionPercent;
        existing.lastReadAt = now;
      } else {
        existing = {
          id: `rp-${Date.now()}`,
          studentId,
          documentId,
          documentVersion: doc?.currentVersion || 1,
          lastReadPage,
          totalPages,
          completionPercent,
          lastReadAt: now,
        };
        dbStore.readingProgress.push(existing);
      }

      return NextResponse.json({ success: true, progress: existing });
    }

    if (action === "add_bookmark") {
      const bm = {
        id: `bm-${Date.now()}`,
        studentId,
        documentId,
        pageNumber: Number(body.pageNumber || 1),
        title: body.title || `Page ${body.pageNumber} Bookmark`,
        createdAt: now,
      };
      dbStore.bookmarks.push(bm);
      return NextResponse.json({ success: true, bookmark: bm });
    }

    if (action === "add_note") {
      const note = {
        id: `note-${Date.now()}`,
        studentId,
        documentId,
        pageNumber: Number(body.pageNumber || 1),
        noteText: String(body.noteText || "").trim(),
        createdAt: now,
        updatedAt: now,
      };
      dbStore.personalNotes.push(note);
      return NextResponse.json({ success: true, note });
    }

    if (action === "report_document") {
      const report = {
        id: `rep-${Date.now()}`,
        reporterId: studentId,
        documentId,
        category: body.category || "document_error",
        details: String(body.details || "").trim(),
        status: "open" as const,
        createdAt: now,
      };
      dbStore.reports.unshift(report);
      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json({ error: "UNKNOWN_READER_ACTION" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Reader server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

