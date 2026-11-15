/**
 * Resumable Encrypted Download Engine for SomaUG Academic
 * Downloads documents chunk-by-chunk with SHA-256 integrity checks,
 * auto-resumes after network interruptions, and stores encrypted chunks in IndexedDB.
 */

import { EncryptedChunkPayload } from "@/lib/crypto/document-encryption";
import { offlineStorage, OfflineMaterialMeta } from "@/lib/offline/offline-storage";
import { OfflineLicense } from "@/lib/offline/offline-license";
import { DeviceKeyManager } from "@/lib/crypto/device-keys";
import { performanceMonitor } from "@/lib/performance/metrics";

export type DownloadStatus =
  | "idle"
  | "requesting_auth"
  | "downloading"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface DownloadProgress {
  documentId: string;
  status: DownloadStatus;
  bytesDownloaded: number;
  totalBytes: number;
  percent: number;
  completedChunks: number;
  totalChunks: number;
  speedBps?: number;
  error?: string;
}

export interface DownloadAuthResponse {
  authorized: boolean;
  error?: string;
  authToken?: string;
  materialMeta?: {
    id: string;
    title: string;
    lecturerName: string;
    institutionName: string;
    courseCode: string;
    pageCount: number;
    fileSizeBytes: number;
    documentVersion: number;
  };
  totalChunks?: number;
  chunkManifest?: Array<{
    chunkIndex: number;
    sizeBytes: number;
    sha256Hash: string;
  }>;
  license?: OfflineLicense;
  derivedKeyHex?: string;
}

export class ResumableDownloadEngine {
  private activeControllers = new Map<string, AbortController>();
  private listeners = new Map<string, Set<(p: DownloadProgress) => void>>();
  private currentProgress = new Map<string, DownloadProgress>();

  public onProgress(documentId: string, listener: (p: DownloadProgress) => void): () => void {
    if (!this.listeners.has(documentId)) {
      this.listeners.set(documentId, new Set());
    }
    this.listeners.get(documentId)!.add(listener);

    // Send latest known progress if available
    const existing = this.currentProgress.get(documentId);
    if (existing) listener(existing);

    return () => {
      this.listeners.get(documentId)?.delete(listener);
    };
  }

  private emitProgress(progress: DownloadProgress) {
    this.currentProgress.set(progress.documentId, progress);
    const callbacks = this.listeners.get(progress.documentId);
    if (callbacks) {
      for (const cb of callbacks) {
        try {
          cb(progress);
        } catch {
          // ignore callback error
        }
      }
    }
  }

  public getProgress(documentId: string): DownloadProgress | undefined {
    return this.currentProgress.get(documentId);
  }

  public pauseDownload(documentId: string): void {
    const controller = this.activeControllers.get(documentId);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(documentId);
    }
    const current = this.currentProgress.get(documentId);
    if (current && current.status === "downloading") {
      this.emitProgress({
        ...current,
        status: "paused",
      });
    }
  }

  public cancelDownload(documentId: string): void {
    this.pauseDownload(documentId);
    this.emitProgress({
      documentId,
      status: "cancelled",
      bytesDownloaded: 0,
      totalBytes: 0,
      percent: 0,
      completedChunks: 0,
      totalChunks: 0,
    });
  }

  /**
   * Starts or resumes an encrypted chunked download for a purchased material.
   */
  public async startOrResumeDownload(params: {
    studentId: string;
    documentId: string;
    maxRetries?: number;
  }): Promise<void> {
    const { studentId, documentId, maxRetries = 3 } = params;

    // Abort any existing controller for this document
    if (this.activeControllers.has(documentId)) {
      this.activeControllers.get(documentId)!.abort();
    }

    const abortController = new AbortController();
    this.activeControllers.set(documentId, abortController);

    this.emitProgress({
      documentId,
      status: "requesting_auth",
      bytesDownloaded: 0,
      totalBytes: 0,
      percent: 0,
      completedChunks: 0,
      totalChunks: 0,
    });

    try {
      // 1. Request Download Authorization from the backend
      const deviceInstallationId = DeviceKeyManager.getDeviceInstallationId();
      const authRes = await fetch(`/api/documents/${documentId}/download-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          deviceInstallationId,
        }),
        signal: abortController.signal,
      });

      const authData: DownloadAuthResponse = await authRes.json();

      if (!authRes.ok || !authData.authorized) {
        throw new Error(authData.error || "Server denied download authorization");
      }

      const { authToken, materialMeta, totalChunks = 1, chunkManifest = [], license, derivedKeyHex } =
        authData;

      if (!materialMeta || !authToken || !license || !derivedKeyHex) {
        throw new Error("INCOMPLETE_AUTH_PAYLOAD: Server returned incomplete authorization");
      }

      // Save signed license immediately to offline storage
      await offlineStorage.saveLicense(license);

      // 2. Discover already completed chunks from IndexedDB (Resumption Support)
      const existingCompleted = await offlineStorage.getCompletedChunkIndices(documentId);
      const completedSet = new Set(existingCompleted);

      const totalBytes = materialMeta.fileSizeBytes;
      let downloadedBytes = 0;

      // Approximate bytes already saved
      const avgChunkSize = totalBytes / totalChunks;
      downloadedBytes = completedSet.size * avgChunkSize;

      this.emitProgress({
        documentId,
        status: "downloading",
        bytesDownloaded: Math.round(downloadedBytes),
        totalBytes,
        percent: Math.round((completedSet.size / totalChunks) * 100),
        completedChunks: completedSet.size,
        totalChunks,
      });

      // 3. Download remaining chunks sequentially with retry logic
      for (let i = 0; i < totalChunks; i++) {
        if (abortController.signal.aborted) {
          return;
        }

        if (completedSet.has(i)) {
          continue; // Already downloaded in previous session
        }

        let chunkSuccess = false;
        let attempt = 0;
        let lastError: Error | null = null;

        while (!chunkSuccess && attempt < maxRetries) {
          if (abortController.signal.aborted) return;
          attempt++;

          try {
            const chunkRes = await fetch(
              `/api/documents/${documentId}/encrypted-chunks/${i}?token=${encodeURIComponent(
                authToken
              )}`,
              {
                signal: abortController.signal,
              }
            );

            if (!chunkRes.ok) {
              const errJson = await chunkRes.json().catch(() => ({}));
              throw new Error(
                errJson.error || `HTTP ${chunkRes.status} downloading chunk ${i}`
              );
            }

            const chunkPayload: EncryptedChunkPayload = await chunkRes.json();

            // Integrity check against manifest if provided
            const manifestItem = chunkManifest.find((m) => m.chunkIndex === i);
            if (
              manifestItem &&
              manifestItem.sha256Hash &&
              chunkPayload.plaintextSha256 !== manifestItem.sha256Hash
            ) {
              throw new Error(
                `INTEGRITY_MISMATCH: Chunk ${i} plaintext SHA-256 does not match manifest`
              );
            }

            // Save chunk to IndexedDB
            await offlineStorage.saveChunk(documentId, i, chunkPayload);
            completedSet.add(i);
            chunkSuccess = true;

            downloadedBytes = Math.min(totalBytes, completedSet.size * avgChunkSize);
            const percent = Math.min(100, Math.round((completedSet.size / totalChunks) * 100));

            this.emitProgress({
              documentId,
              status: "downloading",
              bytesDownloaded: Math.round(downloadedBytes),
              totalBytes,
              percent,
              completedChunks: completedSet.size,
              totalChunks,
            });
          } catch (err: unknown) {
            lastError = err instanceof Error ? err : new Error(String(err));
            if (abortController.signal.aborted) return;

            // Exponential backoff delay (300ms, 600ms, 1200ms)
            if (attempt < maxRetries) {
              await new Promise((res) => setTimeout(res, 300 * Math.pow(2, attempt - 1)));
            }
          }
        }

        if (!chunkSuccess) {
          performanceMonitor.recordDownloadFailed();
          throw (
            lastError ||
            new Error(`Failed to download chunk ${i} after ${maxRetries} attempts`)
          );
        }
      }

      // 4. Save material metadata to register in Offline Library
      const offlineMeta: OfflineMaterialMeta = {
        documentId: materialMeta.id,
        title: materialMeta.title,
        lecturerName: materialMeta.lecturerName,
        institutionName: materialMeta.institutionName,
        courseCode: materialMeta.courseCode,
        pageCount: materialMeta.pageCount,
        fileSizeBytes: materialMeta.fileSizeBytes,
        documentVersion: materialMeta.documentVersion,
        downloadedAt: new Date().toISOString(),
        lastReadPage: 1,
        totalChunks,
        licenseId: license.licenseId,
        keyHex: derivedKeyHex,
      };

      await offlineStorage.saveMaterialMeta(offlineMeta);

      this.activeControllers.delete(documentId);
      performanceMonitor.recordDownloadCompleted();

      this.emitProgress({
        documentId,
        status: "completed",
        bytesDownloaded: totalBytes,
        totalBytes,
        percent: 100,
        completedChunks: totalChunks,
        totalChunks,
      });
    } catch (err: unknown) {
      this.activeControllers.delete(documentId);
      if (abortController.signal.aborted) {
        return;
      }
      const message = err instanceof Error ? err.message : "Download interrupted";
      this.emitProgress({
        documentId,
        status: "failed",
        bytesDownloaded: 0,
        totalBytes: 0,
        percent: 0,
        completedChunks: 0,
        totalChunks: 0,
        error: message,
      });
      throw err;
    }
  }
}

export const resumableDownloadEngine = new ResumableDownloadEngine();

