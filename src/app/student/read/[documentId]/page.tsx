"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Sun,
  Moon,
  Coffee,
  Maximize2,
  Minimize2,
  Trash2,
  Sparkles,
  BookOpen,
  Share2,
  AlertCircle,
  Clock,
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

type ReaderTheme = "light" | "sepia" | "dark";

export default function ProtectedReaderPage() {
  const params = useParams();
  const documentId = String(params?.documentId || "doc-csc2101-notes");

  const [studentId] = useState("user-student-1");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(48);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [sidebarTab, setSidebarTab] = useState<"notes" | "bookmarks" | "report">("notes");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [authorized, setAuthorized] = useState<boolean>(true);
  const [accessMode, setAccessMode] = useState<string>("permitted_preview");
  const [watermarkText, setWatermarkText] = useState<string>("");
  const [docTitle, setDocTitle] = useState<string>("Loading publication...");
  const [pageBodyText, setPageBodyText] = useState<string>("");
  const [accessError, setAccessError] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportCategory, setReportCategory] = useState("document_error");
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    setLoadingPage(true);
    try {
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

      // Auto-sync reading progress asynchronously
      fetch("/api/reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_progress",
          studentId,
          documentId,
          pageNumber,
        }),
      }).catch(() => {});
    } catch (err) {
      setAccessError("Network error loading page content.");
    } finally {
      setLoadingPage(false);
    }
  }, [studentId, documentId, pageNumber]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        setPageNumber((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight") {
        setPageNumber((p) => Math.min(totalPages, p + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages]);

  const handleAddBookmark = async () => {
    const exists = bookmarks.some((b) => b.pageNumber === pageNumber);
    if (exists) return;

    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    try {
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
        setReportStatus("Report submitted to Academic Moderation team.");
        setTimeout(() => setReportStatus(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completionPercent = Math.round((pageNumber / Math.max(1, totalPages)) * 100);
  const isBookmarked = bookmarks.some((b) => b.pageNumber === pageNumber);
  const currentPageNotes = notes.filter((n) => n.pageNumber === pageNumber);

  // Theme style classes
  const themeClasses = {
    light: "bg-white text-slate-900 border-slate-300",
    sepia: "bg-[#FBF0D9] text-[#433422] border-[#E8D8B8]",
    dark: "bg-[#121820] text-slate-100 border-slate-800",
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-12">
      {/* Sticky Reader Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B192C] text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Back & Document Metadata */}
          <div className="flex items-center gap-3">
            <Link
              href={`/catalogue/${documentId}`}
              className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition"
              title="Back to Document Details"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {accessMode === "entitled_full_access"
                    ? "Full Entitlement"
                    : "Sample Preview"}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  • {completionPercent}% completed
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-extrabold truncate max-w-[220px] sm:max-w-md md:max-w-lg">
                {docTitle}
              </h1>
            </div>
          </div>

          {/* Center: Pagination Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20 disabled:opacity-30 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold">
              <span>{pageNumber}</span>
              <span className="text-slate-500">/</span>
              <span>{totalPages}</span>
            </div>

            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              disabled={pageNumber >= totalPages}
              className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20 disabled:opacity-30 transition"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Theme, Zoom, Bookmark & Sidebar Toggle */}
          <div className="flex items-center gap-2">
            
            {/* Theme Selector */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-900 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-lg transition ${theme === "light" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"}`}
                title="Light Mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("sepia")}
                className={`p-1.5 rounded-lg transition ${theme === "sepia" ? "bg-[#E8D8B8] text-amber-950" : "text-slate-400 hover:text-white"}`}
                title="Sepia Academic Mode"
              >
                <Coffee className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-lg transition ${theme === "dark" ? "bg-slate-700 text-amber-400" : "text-slate-400 hover:text-white"}`}
                title="Dark Mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl">
              <button
                type="button"
                onClick={() => setZoomPercent((z) => Math.max(80, z - 10))}
                className="text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1">{zoomPercent}%</span>
              <button
                type="button"
                onClick={() => setZoomPercent((z) => Math.min(140, z + 10))}
                className="text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick Bookmark Toggle */}
            <button
              type="button"
              onClick={handleAddBookmark}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                isBookmarked
                  ? "bg-amber-500 text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <BookmarkIcon className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>

            {/* Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              title="Toggle Study Notes & Bookmarks Drawer"
            >
              <StickyNote className="h-4 w-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Reading Progress Indicator Line */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-amber-400 h-1 transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Document Reader Canvas Viewport (8 or 12 cols depending on sidebar) */}
          <div className={isSidebarOpen ? "lg:col-span-8" : "lg:col-span-12"}>
            {!authorized ? (
              <div className="rounded-3xl border-2 border-amber-400 bg-white p-8 md:p-12 text-center space-y-5 shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-sm">
                  <Lock className="h-8 w-8" />
                </div>
                
                <div className="space-y-2 max-w-md mx-auto">
                  <h2 className="text-xl font-black text-slate-900">
                    Protected Page {pageNumber} Locked
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {accessError}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
                  <Link
                    href={`/catalogue/${documentId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-6 py-3 text-xs font-black text-white hover:bg-[#162942] transition shadow-md"
                  >
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    <span>Purchase Full Publication with Wallet</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setPageNumber(1)}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Return to Permitted Sample Page 1
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-3xl border p-6 sm:p-10 md:p-14 shadow-lg relative overflow-hidden select-none transition-colors duration-200 ${
                  themeClasses[theme]
                }`}
                style={{ transform: `scale(${zoomPercent / 100})`, transformOrigin: "top center" }}
              >
                {/* Dynamic Watermark Banner */}
                <div className="mb-8 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2.5 text-xs font-mono font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{watermarkText}</span>
                  </span>
                  <span className="text-[11px] opacity-70">Anti-Piracy DRM Active</span>
                </div>

                {/* Subtitle / Document Header on First Page */}
                <div className="border-b border-current/10 pb-4 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                    University Course Compendium • Page {pageNumber} of {totalPages}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1">
                    {docTitle}
                  </h2>
                </div>

                {/* Main Rendered Page Text */}
                {loadingPage ? (
                  <div className="py-24 text-center space-y-3">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
                    <p className="text-xs font-bold opacity-60">Decrypting authenticated page content...</p>
                  </div>
                ) : (
                  <div className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap min-h-[400px]">
                    {pageBodyText}
                  </div>
                )}

                {/* Subtle Repeated Watermark Pattern at Bottom */}
                <div className="mt-12 pt-6 border-t border-current/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] opacity-50 font-mono gap-2">
                  <span>Protected Academic Copy — Authorized for {studentId}</span>
                  <span>SomaUG Ledger Integrity Verified</span>
                </div>
              </div>
            )}

            {/* Bottom Floating Navigation for Mobile Handsets */}
            <div className="flex items-center justify-between gap-4 mt-6">
              <button
                type="button"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-40 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Page</span>
              </button>

              <button
                type="button"
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber >= totalPages}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-4 py-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 shadow-sm"
              >
                <span>Next Page</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Study Sidebar (4 cols): Notes, Bookmarks & Issues */}
          {isSidebarOpen && (
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                
                {/* Sidebar Tab Header */}
                <div className="flex border-b border-slate-100 pb-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSidebarTab("notes")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                      sidebarTab === "notes"
                        ? "bg-amber-100 text-amber-900"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                    <span>Page Notes ({currentPageNotes.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarTab("bookmarks")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                      sidebarTab === "bookmarks"
                        ? "bg-amber-100 text-amber-900"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <BookmarkIcon className="h-3.5 w-3.5" />
                    <span>Bookmarks ({bookmarks.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarTab("report")}
                    className={`p-2 rounded-xl text-xs font-bold transition ${
                      sidebarTab === "report"
                        ? "bg-red-100 text-red-900"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                    title="Report Issue"
                  >
                    <Flag className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Tab 1: Notes & Annotations */}
                {sidebarTab === "notes" && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Add Study Note for Page {pageNumber}:
                      </label>
                      <textarea
                        rows={3}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="e.g. Remember theorem definition for exam section 3..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#0B192C] px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                      >
                        Save Page Note
                      </button>
                    </form>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Saved Notes for Current Page:
                      </span>
                      {currentPageNotes.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">
                          No notes saved on Page {pageNumber} yet.
                        </p>
                      ) : (
                        currentPageNotes.map((nt) => (
                          <div
                            key={nt.id}
                            className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-slate-800 leading-relaxed space-y-1"
                          >
                            <p>{nt.noteText}</p>
                            <span className="text-[10px] text-amber-800 font-bold block">
                              Page {nt.pageNumber} Annotation
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: Saved Bookmarks */}
                {sidebarTab === "bookmarks" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Saved Document Bookmarks</span>
                      <button
                        type="button"
                        onClick={handleAddBookmark}
                        className="text-[11px] font-bold text-amber-700 hover:underline"
                      >
                        + Bookmark Current Page
                      </button>
                    </div>

                    {bookmarks.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        No pages bookmarked yet.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {bookmarks.map((bm) => (
                          <button
                            key={bm.id}
                            type="button"
                            onClick={() => setPageNumber(bm.pageNumber)}
                            className={`w-full text-left rounded-xl border p-3 text-xs font-bold transition flex items-center justify-between ${
                              pageNumber === bm.pageNumber
                                ? "bg-amber-50 border-amber-300 text-amber-950"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <BookmarkIcon className="h-3.5 w-3.5 text-amber-600 fill-current" />
                              <span>{bm.title || `Page ${bm.pageNumber}`}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Jump →</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Content or Formatting Report */}
                {sidebarTab === "report" && (
                  <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Report Issue to Moderation:
                      </label>
                      <select
                        value={reportCategory}
                        onChange={(e) => setReportCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                      >
                        <option value="document_error">Typo / Syllabus Error on this Page</option>
                        <option value="rendering_issue">Visual / Formatting Rendering Bug</option>
                        <option value="copyright_infringement">Academic Copyright Concern</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder="Describe the issue with this page..."
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-red-400"
                        required
                      />
                    </div>

                    {reportStatus && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium">
                        {reportStatus}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-red-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
                    >
                      Submit Report
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
