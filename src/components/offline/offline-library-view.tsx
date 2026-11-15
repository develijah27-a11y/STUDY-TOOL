"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  Trash2,
  BookOpen,
  HardDrive,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  offlineStorage,
  OfflineMaterialMeta,
  StorageEstimateResult,
} from "@/lib/offline/offline-storage";
import {
  resumableDownloadEngine,
  DownloadProgress,
} from "@/lib/offline/download-engine";
import { OfflineLicenseService, OfflineLicense } from "@/lib/offline/offline-license";
import { DeviceKeyManager } from "@/lib/crypto/device-keys";

interface OfflineItemWithLicense extends OfflineMaterialMeta {
  license?: OfflineLicense | null;
  daysRemaining?: number;
  isExpired?: boolean;
}

export default function OfflineLibraryView({
  studentId = "user-student-1",
}: {
  studentId?: string;
}) {
  const [offlineItems, setOfflineItems] = useState<OfflineItemWithLicense[]>([]);
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDownloads, setActiveDownloads] = useState<Map<string, DownloadProgress>>(new Map());
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [renewingDocId, setRenewingDocId] = useState<string | null>(null);

  const loadOfflineData = useCallback(async () => {
    setLoading(true);
    try {
      const [materials, estimate] = await Promise.all([
        offlineStorage.getAllOfflineMaterials(),
        offlineStorage.getStorageEstimate(),
      ]);

      const deviceId = DeviceKeyManager.getDeviceInstallationId();

      const itemsWithLic: OfflineItemWithLicense[] = await Promise.all(
        materials.map(async (m) => {
          const lic = await offlineStorage.getLicense(m.documentId);
          let daysRemaining = 30;
          let isExpired = false;

          if (lic) {
            const ver = OfflineLicenseService.verifyLicense(lic, deviceId);
            daysRemaining = ver.daysRemaining ?? 0;
            isExpired = !ver.valid;
          }

          return {
            ...m,
            license: lic,
            daysRemaining,
            isExpired,
          };
        })
      );

      setOfflineItems(itemsWithLic);
      setStorageEstimate(estimate);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOfflineData();
  }, [loadOfflineData]);

  // Request persistent storage
  const handleRequestPersistence = async () => {
    const success = await offlineStorage.requestPersistentStorage();
    if (success) {
      setActionMessage("Persistent device storage granted by browser.");
    } else {
      setActionMessage("Browser could not grant persistent storage permission.");
    }
    loadOfflineData();
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Delete single offline copy
  const handleDeleteCopy = async (docId: string, title: string) => {
    const confirmed = window.confirm(
      `Delete offline copy of "${title}"?\n\nThis will free up device storage. Your purchase entitlement remains valid and you can re-download this material anytime when connected.`
    );
    if (!confirmed) return;

    await offlineStorage.deleteOfflineMaterial(docId);
    setActionMessage(`Deleted offline copy of "${title}".`);
    loadOfflineData();
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Clear all offline copies
  const handleClearAll = async () => {
    const confirmed = window.confirm(
      "Remove ALL offline documents from this device?\n\nYour purchase entitlements remain safe on the server."
    );
    if (!confirmed) return;

    await offlineStorage.clearAllOfflineData();
    setActionMessage("All offline encrypted documents removed from device storage.");
    loadOfflineData();
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Renew 30-day offline license
  const handleRenewLicense = async (docId: string) => {
    setRenewingDocId(docId);
    try {
      const deviceInstallationId = DeviceKeyManager.getDeviceInstallationId();
      const res = await fetch(`/api/documents/${docId}/renew-license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, deviceInstallationId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to renew license");
      }

      await offlineStorage.saveLicense(data.license);
      setActionMessage("Offline authorization renewed for 30 days.");
      loadOfflineData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error renewing";
      setActionMessage(`Renewal failed: ${msg}`);
    } finally {
      setRenewingDocId(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const formatMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Storage Management Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#147D78]">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Offline Storage &amp; Cache Manager
              </h3>
              <p className="text-xs text-slate-500">
                Encrypted AES-GCM chunks stored safely in browser IndexedDB.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!storageEstimate?.persistent && (
              <button
                type="button"
                onClick={handleRequestPersistence}
                className="rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 text-xs font-bold text-[#147D78] transition"
              >
                Protect from Auto-Cleanup
              </button>
            )}

            {offlineItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 transition"
              >
                Clear All Offline (Free Storage)
              </button>
            )}
          </div>
        </div>

        {/* Storage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              Total Used by SomaUG:{" "}
              <strong className="text-slate-900">
                {formatMB(storageEstimate?.usedBytes || 0)}
              </strong>
              {storageEstimate?.quotaBytes ? ` of ${formatMB(storageEstimate.quotaBytes)} available` : ""}
            </span>
            <span>{offlineItems.length} Saved Document{offlineItems.length === 1 ? "" : "s"}</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#147D78] h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(2, storageEstimate?.percentageUsed || (offlineItems.length > 0 ? 5 : 0)))}%`,
              }}
            />
          </div>
        </div>

        {actionMessage && (
          <div className="rounded-xl bg-teal-50 border border-teal-200 px-3.5 py-2 text-xs font-semibold text-[#147D78]">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Offline Documents List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Scanning device storage for encrypted academic materials...
        </div>
      ) : offlineItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <HardDrive className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">
              No Materials Downloaded for Offline Reading
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Download your purchased study materials to read them anywhere across Uganda without mobile data or internet access.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B45] hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span>Browse Course Materials</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {offlineItems.map((item) => (
            <div
              key={item.documentId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 font-bold">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Encrypted &amp; Offline Ready</span>
                  </span>

                  <span className="font-semibold text-slate-500">
                    {formatMB(item.fileSizeBytes)} • {item.pageCount} Pages
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.institutionName} • {item.courseCode} • {item.lecturerName}
                  </p>
                </div>

                {/* License & Reading Progress Badges */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>Last Read: Page {item.lastReadPage} of {item.pageCount}</span>
                    </span>
                    <span className="font-semibold text-[#147D78]">
                      {Math.round((item.lastReadPage / Math.max(1, item.pageCount)) * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    {item.isExpired ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>License Expired • Connect to Renew</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Offline Authorization:{" "}
                        <strong className="text-slate-800">
                          {item.daysRemaining} Days Remaining
                        </strong>
                      </span>
                    )}

                    {item.isExpired && (
                      <button
                        type="button"
                        onClick={() => handleRenewLicense(item.documentId)}
                        disabled={renewingDocId === item.documentId}
                        className="text-[#147D78] font-bold underline hover:text-teal-900"
                      >
                        {renewingDocId === item.documentId ? "Renewing..." : "Renew Now"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteCopy(item.documentId, item.title)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 p-2 text-slate-500 transition"
                  title="Delete Offline Copy (Frees Storage)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRenewLicense(item.documentId)}
                    disabled={renewingDocId === item.documentId}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    <RefreshCw
                      className={`inline h-3 w-3 mr-1 text-slate-400 ${
                        renewingDocId === item.documentId ? "animate-spin" : ""
                      }`}
                    />
                    <span>Renew</span>
                  </button>

                  <Link
                    href={`/student/read/${item.documentId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#147D78] hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Resume Reading</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
