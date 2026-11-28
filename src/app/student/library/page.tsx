"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  Library,
  BookOpen,
  CheckCircle2,
  Receipt,
  Search,
  Wallet,
  Clock,
  Download,
  HardDrive,
  ShieldCheck,
  Pause,
  Play,
} from "lucide-react";
import OfflineLibraryView from "@/components/offline/offline-library-view";
import { offlineStorage } from "@/lib/offline/offline-storage";
import {
  resumableDownloadEngine,
  DownloadProgress,
} from "@/lib/offline/download-engine";

interface EntitledOrder {
  id: string;
  orderNumber: string;
  documentId: string;
  documentVersion: number;
  grossAmountUGX: number;
  receiptReference: string;
  status: string;
  createdAt: string;
}

interface CatalogueDoc {
  id: string;
  title: string;
  courseCode: string;
  institutionShortCode: string;
  lecturerName: string;
  pageCount: number;
  fileSizeBytes?: number;
  currentVersion: number;
}

export default function StudentLibraryPage() {
  const [studentId, setStudentId] = useState("user-student-1");
  const [studentName, setStudentName] = useState("Student");
  const [orders, setOrders] = useState<EntitledOrder[]>([]);
  const [docs, setDocs] = useState<CatalogueDoc[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "offline">("all");

  const [offlineDocIds, setOfflineDocIds] = useState<Set<string>>(new Set());
  const [downloadStates, setDownloadStates] = useState<Map<string, DownloadProgress>>(new Map());

  const checkOfflineDocuments = useCallback(async () => {
    try {
      const items = await offlineStorage.getAllOfflineMaterials();
      setOfflineDocIds(new Set(items.map((i) => i.documentId)));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let currentId = "";
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.id) currentId = u.id;
        if (u.fullName) setStudentName(u.fullName);
      }
    } catch { }

    async function loadLibrary() {
      // Enforce authentication: My Library requires student to be logged in
      if (!currentId) {
        try {
          const sessRes = await fetch("/api/auth/session");
          if (sessRes.ok) {
            const sessData = await sessRes.json();
            if (sessData?.user?.id) {
              currentId = sessData.user.id;
              if (sessData.user.fullName) setStudentName(sessData.user.fullName);
              setStudentId(currentId);
            }
          }
        } catch { }
      }

      if (!currentId) {
        // Not authenticated: redirect to sign-in
        window.location.href = "/sign-in?redirect=/student/library";
        return;
      }

      setStudentId(currentId);
      setLoading(true);
      try {
        const [walRes, catRes] = await Promise.all([
          fetch(`/api/wallet?userId=${currentId}&targetUserId=${currentId}&walletType=student`),
          fetch("/api/catalogue"),
        ]);
        const walData = await walRes.json();
        const catData = await catRes.json();
        setOrders(walData.orders || []);
        setWalletBalance(walData.wallet?.spendableBalanceUGX ?? 0);
        setDocs(catData.documents || []);
      } finally {
        setLoading(false);
      }
    }
    loadLibrary();
    checkOfflineDocuments();
  }, [checkOfflineDocuments]);

  // Handle Download for Offline Reading
  const handleStartDownload = async (docId: string) => {
    resumableDownloadEngine.onProgress(docId, (progress) => {
      setDownloadStates((prev) => new Map(prev).set(docId, progress));
      if (progress.status === "completed") {
        checkOfflineDocuments();
      }
    });

    try {
      await resumableDownloadEngine.startOrResumeDownload({
        studentId,
        documentId: docId,
      });
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handlePauseDownload = (docId: string) => {
    resumableDownloadEngine.pauseDownload(docId);
  };

  const activeOrders = orders.filter((o) => o.status === "completed");

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "2.5 MB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-sky-600 dark:bg-sky-950 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-sky-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-300 dark:text-orange-400">
            <Library className="h-4 w-4" />
            <span>My Library</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{studentName}&apos;s Materials</h1>
          <p className="text-xs text-sky-100 font-medium">
            Your unlocked study notes, revision compendiums, and offline copies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/catalogue"
            className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 text-xs font-bold transition shadow-xs"
          >
            <Search className="inline h-3.5 w-3.5 mr-1 text-sky-600" />
            Find Materials
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === "all"
            ? "bg-sky-500 text-white shadow-xs"
            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
        >
          All Materials ({activeOrders.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("offline");
            checkOfflineDocuments();
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === "offline"
            ? "bg-orange-500 text-white shadow-xs"
            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
        >
          <HardDrive className="h-3.5 w-3.5" />
          <span>Offline Ready ({offlineDocIds.size})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "offline" ? (
        <OfflineLibraryView studentId={studentId} />
      ) : loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading your study library...</div>
      ) : activeOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-4">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              No Unlocked Publications Yet
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Explore course materials, past papers, and lecture notes in the catalogue. When you unlock materials with your UGX balance or Mobile Money, they will appear here in your permanent study library.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/catalogue"
              className="rounded-xl bg-[#142B45] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
            >
              Browse Full Catalogue
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {activeOrders.map((ord) => {
            const doc = docs.find((d) => d.id === ord.documentId);
            const isOffline = offlineDocIds.has(ord.documentId);
            const downloadProgress = downloadStates.get(ord.documentId);
            const isDownloading = downloadProgress && downloadProgress.status === "downloading";
            const isPaused = downloadProgress && downloadProgress.status === "paused";

            return (
              <div
                key={ord.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-bold text-emerald-800 inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Entitled Version v{ord.documentVersion}.0</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 inline-flex items-center gap-1">
                      <Receipt className="h-3 w-3" />
                      <span>{ord.receiptReference}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {doc?.title || `Document ${ord.documentId}`}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {doc?.institutionShortCode} • {doc?.lecturerName} • {doc?.pageCount} Pages
                  </p>

                  {/* Offline Status Badge */}
                  {isOffline ? (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 border border-teal-200 px-2.5 py-1 text-[11px] font-bold text-[#147D78]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Available Offline (Encrypted on Device)</span>
                    </div>
                  ) : null}

                  {/* Active Download Progress Bar */}
                  {downloadProgress && downloadProgress.status !== "completed" && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5 text-[#147D78] animate-bounce" />
                          <span>
                            {isPaused
                              ? "Download Paused"
                              : `Downloading chunk ${downloadProgress.completedChunks} of ${downloadProgress.totalChunks}...`}
                          </span>
                        </span>
                        <span className="text-[#147D78]">{downloadProgress.percent}%</span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#147D78] h-2 rounded-full transition-all duration-200"
                          style={{ width: `${downloadProgress.percent}%` }}
                        />
                      </div>

                      {downloadProgress.error && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          {downloadProgress.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatDate(ord.createdAt)} • {formatUGX(ord.grossAmountUGX)}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Offline Download Button if not already downloaded */}
                    {!isOffline && (
                      <button
                        type="button"
                        onClick={() =>
                          isDownloading
                            ? handlePauseDownload(ord.documentId)
                            : handleStartDownload(ord.documentId)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-2 text-xs font-bold text-[#147D78] transition"
                        title="Download encrypted copy for reading without internet"
                      >
                        {isDownloading ? (
                          <>
                            <Pause className="h-3.5 w-3.5" />
                            <span>Pause</span>
                          </>
                        ) : isPaused ? (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            <span>Resume</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Offline ({formatFileSize(doc?.fileSizeBytes)})</span>
                          </>
                        )}
                      </button>
                    )}

                    <Link
                      href={`/student/read/${ord.documentId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B45] hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-[#E9B949]" />
                      <span>{isOffline ? "Read Offline" : "Open Reader"}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
