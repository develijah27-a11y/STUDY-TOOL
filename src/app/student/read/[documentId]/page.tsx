"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Bookmark as BookmarkIcon,
  StickyNote,
  Flag,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

interface BookmarkItem {
  id: string;
  pageNumber: number;
  title?: string;
}

interface NoteItem {
  id: string;
  pageNumber: number;
  noteText: string;
}

export default function ProtectedReaderPage() {
  const params = useParams();
  const documentId = String(params?.documentId || "doc-csc2101-notes");

  const [studentId] = useState("user-student-1");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(48);
  const [zoomPercent, setZoomPercent] = useState(100);

  const [authorized, setAuthorized] = useState<boolean>(true);
  const [accessMode, setAccessMode] = useState<string>("permitted_preview");
  const [watermarkText, setWatermarkText] = useState<string>("");
  const [docTitle, setDocTitle] = useState<string>("Loading publication...");
  const [pageBodyText, setPageBodyText] = useState<string>("");
  const [accessError, setAccessError] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportCategory, setReportCategory] = useState("document_error");
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      const res = await fetch(
        `/api/reader?userId=${studentId}&documentId=${documentId}&page=${pageNumber}`
      );
      const data = await res.json();

      if (!res.ok || !data.authorized) {
        setAuthorized(false);
        setAccessError(data.error || "Access denied to protected page");
        return;
      }

      setAuthorized(true);
      setAccessError(null);
      setAccessMode(data.accessMode || "permitted_preview");
      setWatermarkText(data.watermarkText || "");
      setDocTitle(data.pageData?.title || "Academic Publication");
      setTotalPages(data.pageData?.totalPages || 48);
      setPageBodyText(data.pageData?.bodyText || "");
      setBookmarks(data.bookmarks || []);
      setNotes(data.notes || []);

      // Auto-sync reading progress
      await fetch("/api/reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_progress",
          studentId,
          documentId,
          pageNumber,
        }),
      });
    }
    fetchPage();
  }, [studentId, documentId, pageNumber]);

  const handleAddBookmark = async () => {
    const res = await fetch("/api/reader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_bookmark",
        studentId,
        documentId,
        pageNumber,
        title: `Page ${pageNumber} Reference`,
      }),
    });
    const data = await res.json();
    if (data.bookmark) {
      setBookmarks((prev) => [...prev, data.bookmark]);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const res = await fetch("/api/reader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_note",
        studentId,
        documentId,
        pageNumber,
        noteText: newNoteText,
      }),
    });
    const data = await res.json();
    if (data.note) {
      setNotes((prev) => [...prev, data.note]);
      setNewNoteText("");
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    const res = await fetch("/api/reader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "report_document",
        studentId,
        documentId,
        category: reportCategory,
        details: reportText,
      }),
    });
    if (res.ok) {
      setReportText("");
      setReportStatus("Report submitted to Academic Moderation & Lecturer.");
      setTimeout(() => setReportStatus(null), 4000);
    }
  };

  const completionPercent = Math.round((pageNumber / Math.max(1, totalPages)) * 100);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Top Reader Toolbar */}
      <div className="rounded-xl bg-[#0f2027] text-white p-4 flex flex-wrap items-center justify-between gap-4 shadow">
        <div className="flex items-center gap-3">
          <Link
            href={`/catalogue/${documentId}`}
            className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
            title="Back to Document Details"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase">
                {accessMode === "entitled_full_access"
                  ? "Full Purchased Entitlement"
                  : "Sample Preview Mode"}
              </span>
              <span className="text-[11px] text-slate-300">
                • Progress: {completionPercent}%
              </span>
            </div>
            <h1 className="text-sm md:text-base font-bold truncate max-w-md md:max-w-xl">
              {docTitle}
            </h1>
          </div>
        </div>

        {/* Page Navigation & Zoom Controls for Android & Desktop */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <span className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-mono font-bold">
            Page {pageNumber} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
            disabled={pageNumber >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="hidden sm:flex items-center gap-1 ml-2 border-l border-white/15 pl-2">
            <button
              type="button"
              onClick={() => setZoomPercent((z) => Math.max(80, z - 10))}
              className="rounded bg-white/10 p-1.5 hover:bg-white/20"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-mono px-1.5">{zoomPercent}%</span>
            <button
              type="button"
              onClick={() => setZoomPercent((z) => Math.min(140, z + 10))}
              className="rounded bg-white/10 p-1.5 hover:bg-white/20"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddBookmark}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <BookmarkIcon className="h-3.5 w-3.5" />
            Bookmark Page {pageNumber}
          </button>
        </div>
      </div>

      {/* Main Reader Grid: Protected Canvas + Study Annotations Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Protected Document Viewport */}
        <div className="lg:col-span-2">
          {!authorized ? (
            <div className="rounded-xl border-2 border-amber-400 bg-white p-8 text-center space-y-4 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Protected Page {pageNumber} Requires Purchase Entitlement
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {accessError}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href={`/catalogue/${documentId}`}
                  className="rounded-lg bg-[#0f2027] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Purchase Full Document with Student Wallet
                </Link>
                <button
                  type="button"
                  onClick={() => setPageNumber(1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Return to Page 1 Sample
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-300 bg-white p-6 md:p-10 shadow-md relative overflow-hidden select-none">
              {/* Personalized Dynamic Watermark Header */}
              <div className="mb-6 rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-[11px] font-mono font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  {watermarkText}
                </span>
                <span className="text-slate-400">DRM Protected</span>
              </div>

              {/* Diagonal Background Watermark */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] rotate-[-24deg]">
                <span className="text-3xl font-extrabold uppercase tracking-widest text-slate-900">
                  {watermarkText}
                </span>
              </div>

              {/* Rendered Page Content */}
              <div
                style={{ fontSize: `${Math.round((13 * zoomPercent) / 100)}px` }}
                className="relative z-10 font-mono text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[420px]"
              >
                {pageBodyText}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Notice: Browser DRM embeds buyer identity &amp; blocks direct PDF file download.
                </span>
                <span>
                  Page {pageNumber} of {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Study Sidebar: Bookmarks, Private Notes & Quality Reporting */}
        <div className="space-y-6">
          {/* Bookmarks Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BookmarkIcon className="h-4 w-4 text-amber-600" />
              <span>Saved Bookmarks ({bookmarks.length})</span>
            </h2>
            {bookmarks.length === 0 ? (
              <p className="text-xs text-slate-500">
                Click &ldquo;Bookmark Page&rdquo; in the toolbar to save key exam formulas or pages.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {bookmarks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setPageNumber(b.pageNumber)}
                    className="rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100"
                  >
                    Page {b.pageNumber}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Private Study Notes Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <StickyNote className="h-4 w-4 text-emerald-600" />
              <span>Private Study Notes (Strictly Private to You)</span>
            </h2>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={`Write a personal note for Page ${pageNumber}...`}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-slate-900 outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-[#0f2027] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Save Note on Page {pageNumber}
              </button>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPageNumber(n.pageNumber)}
                      className="font-bold text-amber-700 hover:underline"
                    >
                      Page {n.pageNumber}
                    </button>
                    <span className="text-[10px] text-slate-400">Private</span>
                  </div>
                  <p className="text-slate-700">{n.noteText}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report Document Error or Copyright Concern (Journey 16) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Flag className="h-4 w-4 text-red-600" />
              <span>Report Document Error or Copyright Issue</span>
            </h2>
            <form onSubmit={handleReportSubmit} className="space-y-2.5">
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              >
                <option value="document_error">Typo / Formula Error on Page</option>
                <option value="copyright_infringement">Suspected Copyright Infringement</option>
                <option value="low_quality">Illegible / Missing Content</option>
              </select>
              <input
                type="text"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe the issue and page number..."
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800 hover:bg-red-100"
              >
                Submit Report to Moderation
              </button>
              {reportStatus && (
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {reportStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

