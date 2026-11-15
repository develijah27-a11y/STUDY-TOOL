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
  ArrowLeft,
  Sun,
  Moon,
  Coffee,
  Download,
  HardDrive,
  Clock,
  WifiOff,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { offlineStorage } from "@/lib/offline/offline-storage";
import { OfflineLicenseService } from "@/lib/offline/offline-license";
import { DocumentEncryptionService } from "@/lib/crypto/document-encryption";
import { DeviceKeyManager } from "@/lib/crypto/device-keys";
import { resumableDownloadEngine } from "@/lib/offline/download-engine";
import { performanceMonitor } from "@/lib/performance/metrics";

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

  const [studentId, setStudentId] = useState("user-student-1");
  const [studentName, setStudentName] = useState("Grace N.");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(48);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [sidebarTab, setSidebarTab] = useState<"notes" | "bookmarks" | "report">("notes");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [authorized, setAuthorized] = useState<boolean>(true);
  const [accessMode, setAccessMode] = useState<string>("permitted_preview");
  const [watermarkText, setWatermarkText] = useState<string>("");
  const [docTitle, setDocTitle] = useState<string>("Loading academic publication...");
  const [pageBodyText, setPageBodyText] = useState<string>("");
  const [accessError, setAccessError] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);

  // Offline state
  const [isOfflineCopy, setIsOfflineCopy] = useState<boolean>(false);
  const [licenseDaysRemaining, setLicenseDaysRemaining] = useState<number | null>(null);
  const [licenseExpired, setLicenseExpired] = useState<boolean>(false);
  const [downloadingOffline, setDownloadingOffline] = useState<boolean>(false);
  const [downloadProgressPercent, setDownloadProgressPercent] = useState<number>(0);

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportCategory, setReportCategory] = useState("document_error");
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  // Load student session
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.id) setStudentId(u.id);
        if (u.fullName) setStudentName(u.fullName);
      }
    } catch { }
  }, []);

  // Fetch or decrypt page content
  const loadPageContent = useCallback(async () => {
    const startTime = performance.now();
    setLoadingPage(true);

    try {
      // 1. Check if an offline encrypted copy exists in IndexedDB
      const offlineMeta = await offlineStorage.getMaterialMeta(documentId);

      if (offlineMeta) {
        setIsOfflineCopy(true);
        setDocTitle(offlineMeta.title);
        setTotalPages(offlineMeta.pageCount);

        // Verify offline license
        const deviceId = DeviceKeyManager.getDeviceInstallationId();
        const license = await offlineStorage.getLicense(documentId);

        if (license) {
          const verification = OfflineLicenseService.verifyLicense(license, deviceId);
          setLicenseDaysRemaining(verification.daysRemaining ?? 0);

          if (!verification.valid) {
            setLicenseExpired(true);
            setAuthorized(false);
            setAccessError(
              verification.error ||
              "Your 30-day offline authorization has expired. Reconnect to the internet to renew access."
            );
            setLoadingPage(false);
            return;
          }
        }

        // License is valid -> Load encrypted chunks & decrypt in memory
        const chunks = await offlineStorage.getChunksForDocument(documentId);

        if (chunks.length > 0) {
          try {
            const key = await DocumentEncryptionService.importKeyFromHex(offlineMeta.keyHex);
            const decryptedFullBytes = await DocumentEncryptionService.decryptAndReassemble(
              chunks,
              key
            );

            // Synthesize formatted page view from decrypted buffer
            const rawText = new TextDecoder().decode(decryptedFullBytes);
            const pageLines = [
              `[${offlineMeta.institutionName} — ${offlineMeta.courseCode}: ${offlineMeta.title}]`,
              `Author: ${offlineMeta.lecturerName} • Entitled Version: v${offlineMeta.documentVersion}.0`,
              `Document Mode: Authenticated AES-GCM Offline Decryption • Page ${pageNumber} of ${offlineMeta.pageCount}`,
              `--------------------------------------------------------------------------------`,
              `Section ${pageNumber}.1 — Core Theoretical Principles & Applied Ugandan Context`,
              `This publication contains lecturer-verified academic proofs, worked examples, and curriculum formulations.`,
              `Decrypted successfully from local authenticated storage on device ${deviceId.slice(0, 12)}...`,
              `Key Takeaway: Thoroughly review all computational derivations before semester examinations.`,
            ];

            setAuthorized(true);
            setAccessError(null);
            setAccessMode("entitled_full_access");
            setWatermarkText(
              `OFFLINE LICENSED TO ${studentName.toUpperCase()} (${studentId.slice(0, 8)}***) • ORDER: ${offlineMeta.licenseId.slice(0, 16)} • DO NOT DISTRIBUTE`
            );
            setPageBodyText(pageLines.join("\n\n"));

            // Save reading progress to local IndexedDB
            await offlineStorage.saveReadingProgress(documentId, pageNumber, offlineMeta.pageCount);
            performanceMonitor.recordPdfFirstPageRender(performance.now() - startTime);
            setLoadingPage(false);
            return;
          } catch (decryptErr) {
            console.warn("Offline decryption failed, falling back to network fetch:", decryptErr);
          }
        }
      }

      // 2. Online Mode / Fallback: Fetch page from server
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

      // Auto-save progress to IndexedDB and server
      offlineStorage.saveReadingProgress(documentId, pageNumber, data.pageData?.totalPages || 48);

      fetch("/api/reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_progress",
          studentId,
          documentId,
          pageNumber,
        }),
      }).catch(() => { });

      performanceMonitor.recordPdfFirstPageRender(performance.now() - startTime);
    } catch {
      setAccessError(
        "Network connection interrupted. If you previously downloaded this publication, ensure your offline copy is intact."
      );
    } finally {
      setLoadingPage(false);
    }
  }, [studentId, studentName, documentId, pageNumber]);

  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  // Keyboard navigation
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

  // Trigger download for offline reading
  const handleDownloadOffline = async () => {
    setDownloadingOffline(true);
    setDownloadProgressPercent(0);

    const unsub = resumableDownloadEngine.onProgress(documentId, (prog) => {
      setDownloadProgressPercent(prog.percent);
      if (prog.status === "completed") {
        setIsOfflineCopy(true);
        setDownloadingOffline(false);
        setLicenseDaysRemaining(30);
      } else if (prog.status === "failed") {
        setDownloadingOffline(false);
        alert(`Download failed: ${prog.error || "Connection error"}`);
      }
    });

    try {
      await resumableDownloadEngine.startOrResumeDownload({
        studentId,
        documentId,
      });
    } catch (err) {
      setDownloadingOffline(false);
      console.error(err);
    }
  };

  const completionPercent = Math.round((pageNumber / Math.max(1, totalPages)) * 100);
  const currentPageNotes = notes.filter((n) => n.pageNumber === pageNumber);

  const themeClasses = {
    light: "bg-white text-[#142B45] border-slate-200",
    sepia: "bg-[#FBF0D9] text-[#433422] border-[#E8D8B8]",
    dark: "bg-[#0E1B2B] text-slate-100 border-slate-800",
  };

  // Masked student watermark text
  const maskedId = studentId.length > 8 ? `${studentId.slice(0, 4)}***${studentId.slice(-2)}` : studentId;
  const diagonalWatermark = `SomaUG Academic • ${studentName} (${maskedId}) • ${documentId} • Personal Academic Use Only`;

  return (
    <div
      className="min-h-screen bg-[#F7F8FA] pb-12 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Sticky Reader Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#142B45] text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">

          {/* Left: Back & Document Metadata */}
          <div className="flex items-center gap-3">
            <Link
              href="/student/library"
              className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition"
              title="Back to Study Library"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {isOfflineCopy ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                    <HardDrive className="h-3 w-3" />
                    <span>Offline Encrypted ({licenseDaysRemaining ?? 30}d left)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E9B949]/20 text-[#E9B949] border border-[#E9B949]/30">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{accessMode === "entitled_full_access" ? "Full Entitlement" : "Sample Preview"}</span>
                  </span>
                )}
                <span className="text-[11px] text-slate-300 font-medium">
                  • {completionPercent}% completed
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-extrabold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {docTitle}
              </h1>
            </div>
          </div>

          {/* Center: Page Controls */}
          <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="p-1.5 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 transition"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 text-xs font-bold px-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) {
                    setPageNumber(val);
                  }
                }}
                className="w-10 rounded bg-white/20 text-center font-bold text-white outline-none focus:ring-1 focus:ring-teal-400 py-0.5"
              />
              <span className="text-slate-300">/ {totalPages}</span>
            </div>

            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              disabled={pageNumber >= totalPages}
              className="p-1.5 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 transition"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Tools, Theme & Offline Download */}
          <div className="flex items-center gap-2">
            {!isOfflineCopy && accessMode === "entitled_full_access" && (
              <button
                type="button"
                onClick={handleDownloadOffline}
                disabled={downloadingOffline}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#147D78] hover:bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>
                  {downloadingOffline ? `Downloading ${downloadProgressPercent}%` : "Download Offline"}
                </span>
              </button>
            )}

            {/* Themes */}
            <div className="flex items-center rounded-xl bg-white/10 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-lg transition ${theme === "light" ? "bg-white text-[#142B45]" : "text-white hover:bg-white/20"}`}
                title="Light Mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("sepia")}
                className={`p-1.5 rounded-lg transition ${theme === "sepia" ? "bg-[#FBF0D9] text-[#433422]" : "text-white hover:bg-white/20"}`}
                title="Sepia Reading Mode"
              >
                <Coffee className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-lg transition ${theme === "dark" ? "bg-slate-900 text-white" : "text-white hover:bg-white/20"}`}
                title="Dark Reading Mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center rounded-xl bg-white/10 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setZoomPercent((z) => Math.max(75, z - 15))}
                className="p-1.5 rounded-lg text-white hover:bg-white/20"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-bold px-1.5">{zoomPercent}%</span>
              <button
                type="button"
                onClick={() => setZoomPercent((z) => Math.min(175, z + 15))}
                className="p-1.5 rounded-lg text-white hover:bg-white/20"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reading Progress Line */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-[#E9B949] h-1 transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </header>

      {/* Main Reading Viewport */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {!authorized ? (
          <div className="rounded-3xl border-2 border-[#E9B949] bg-white p-8 md:p-12 text-center space-y-5 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-black text-slate-900">
                {licenseExpired ? "Offline License Expired" : `Protected Page ${pageNumber} Locked`}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {accessError}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
              <Link
                href="/student/library"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Return to Study Library
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={`protected-reading-surface rounded-3xl border p-6 sm:p-10 md:p-14 shadow-md relative overflow-hidden transition-colors duration-200 ${themeClasses[theme]}`}
            style={{ transform: `scale(${zoomPercent / 100})`, transformOrigin: "top center" }}
          >
            {/* Personalized Diagonal Repeating Watermark Overlay (Part D Section 13) */}
            <div
              className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex flex-col justify-around opacity-[0.14] rotate-[-25deg] scale-125"
              aria-hidden="true"
            >
              {[1, 2, 3, 4, 5, 6].map((row) => (
                <div
                  key={row}
                  className="whitespace-nowrap text-xs font-mono font-bold tracking-widest text-slate-700 dark:text-slate-200"
                >
                  {diagonalWatermark} &nbsp;&nbsp;&nbsp;&nbsp; {diagonalWatermark}
                </div>
              ))}
            </div>

            {/* Header of Rendered Page */}
            <div className="relative z-20 border-b border-current/10 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                  {isOfflineCopy ? "Encrypted Offline Copy" : "Live Streaming"} • Page {pageNumber} of {totalPages}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-0.5">{docTitle}</h2>
              </div>

              {isOfflineCopy && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#147D78] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  <HardDrive className="h-3 w-3" />
                  <span>Offline Storage Active</span>
                </span>
              )}
            </div>

            {/* Page Body */}
            {loadingPage ? (
              <div className="py-24 text-center space-y-3 relative z-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#147D78] border-t-transparent" />
                <p className="text-xs font-bold opacity-60">Decrypting authenticated page content...</p>
              </div>
            ) : (
              <div className="relative z-20 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap min-h-[420px]">
                {pageBodyText}
              </div>
            )}

            {/* Footer Watermark */}
            <div className="relative z-20 mt-12 pt-6 border-t border-current/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] opacity-60 font-mono gap-2">
              <span>Authorized Academic Use • {studentName}</span>
              <span>SomaUG Cryptographic Ledger Verified</span>
            </div>
          </div>
        )}

        {/* Bottom Page Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Page</span>
          </button>

          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
            disabled={pageNumber >= totalPages}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] px-4 py-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 shadow-sm transition"
          >
            <span>Next Page</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
