/**
 * IndexedDB Offline Storage Manager for SomaUG Academic
 * Stores encrypted document chunks, offline licenses, reading progress, and material metadata.
 *
 * NOTE: Original decrypted PDFs are NEVER stored here. Only authenticated AES-GCM
 * encrypted chunks and signed offline licenses reside in IndexedDB.
 */

import { EncryptedChunkPayload } from "@/lib/crypto/document-encryption";
import { OfflineLicense } from "@/lib/offline/offline-license";

export interface OfflineMaterialMeta {
  documentId: string;
  title: string;
  lecturerName: string;
  institutionName: string;
  courseCode: string;
  pageCount: number;
  fileSizeBytes: number;
  documentVersion: number;
  downloadedAt: string;
  lastReadPage: number;
  totalChunks: number;
  licenseId: string;
  keyHex: string; // Wrapped / derived decryption key for this material
}

export interface ReadingProgressRecord {
  documentId: string;
  lastReadPage: number;
  totalPages: number;
  updatedAt: string;
}

export interface StorageEstimateResult {
  usedBytes: number;
  quotaBytes?: number;
  percentageUsed: number;
  offlineDocumentsCount: number;
  persistent: boolean;
}

const DB_NAME = "SomaUG_OfflineStore_v1";
const DB_VERSION = 1;

class OfflineStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return Promise.reject(new Error("IndexedDB is not supported in this environment"));
    }

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("offline_materials")) {
          db.createObjectStore("offline_materials", { keyPath: "documentId" });
        }

        if (!db.objectStoreNames.contains("encrypted_chunks")) {
          // Key path is composite: documentId + "_" + chunkIndex
          const chunkStore = db.createObjectStore("encrypted_chunks", { keyPath: "id" });
          chunkStore.createIndex("by_document", "documentId", { unique: false });
        }

        if (!db.objectStoreNames.contains("offline_licenses")) {
          db.createObjectStore("offline_licenses", { keyPath: "documentId" });
        }

        if (!db.objectStoreNames.contains("reading_progress")) {
          db.createObjectStore("reading_progress", { keyPath: "documentId" });
        }

        if (!db.objectStoreNames.contains("download_sessions")) {
          db.createObjectStore("download_sessions", { keyPath: "documentId" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Chunks ---
  public async saveChunk(
    documentId: string,
    chunkIndex: number,
    payload: EncryptedChunkPayload
  ): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("encrypted_chunks", "readwrite");
      const store = tx.objectStore("encrypted_chunks");
      const id = `${documentId}_chunk_${chunkIndex}`;
      store.put({
        id,
        documentId,
        chunkIndex,
        payload,
        savedAt: Date.now(),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getChunksForDocument(documentId: string): Promise<EncryptedChunkPayload[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("encrypted_chunks", "readonly");
      const store = tx.objectStore("encrypted_chunks");
      const index = store.index("by_document");
      const request = index.getAll(IDBKeyRange.only(documentId));

      request.onsuccess = () => {
        const records = request.result || [];
        records.sort((a, b) => a.chunkIndex - b.chunkIndex);
        resolve(records.map((r) => r.payload));
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getCompletedChunkIndices(documentId: string): Promise<number[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("encrypted_chunks", "readonly");
      const store = tx.objectStore("encrypted_chunks");
      const index = store.index("by_document");
      const request = index.getAll(IDBKeyRange.only(documentId));

      request.onsuccess = () => {
        const records = request.result || [];
        resolve(records.map((r) => r.chunkIndex));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- Material Metadata ---
  public async saveMaterialMeta(meta: OfflineMaterialMeta): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("offline_materials", "readwrite");
      const store = tx.objectStore("offline_materials");
      store.put(meta);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getMaterialMeta(documentId: string): Promise<OfflineMaterialMeta | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("offline_materials", "readonly");
      const store = tx.objectStore("offline_materials");
      const request = store.get(documentId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllOfflineMaterials(): Promise<OfflineMaterialMeta[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("offline_materials", "readonly");
      const store = tx.objectStore("offline_materials");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Licenses ---
  public async saveLicense(license: OfflineLicense): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("offline_licenses", "readwrite");
      const store = tx.objectStore("offline_licenses");
      store.put(license);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getLicense(documentId: string): Promise<OfflineLicense | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("offline_licenses", "readonly");
      const store = tx.objectStore("offline_licenses");
      const request = store.get(documentId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Reading Progress ---
  public async saveReadingProgress(
    documentId: string,
    lastReadPage: number,
    totalPages: number
  ): Promise<void> {
    const db = await this.getDB();
    const now = new Date().toISOString();

    // Update both reading_progress and offline_materials
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["reading_progress", "offline_materials"], "readwrite");
      const progStore = tx.objectStore("reading_progress");
      progStore.put({ documentId, lastReadPage, totalPages, updatedAt: now });

      const matStore = tx.objectStore("offline_materials");
      const getReq = matStore.get(documentId);
      getReq.onsuccess = () => {
        if (getReq.result) {
          getReq.result.lastReadPage = lastReadPage;
          matStore.put(getReq.result);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getReadingProgress(documentId: string): Promise<ReadingProgressRecord | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("reading_progress", "readonly");
      const store = tx.objectStore("reading_progress");
      const request = store.get(documentId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Deletion (Does NOT delete purchase entitlement!) ---
  public async deleteOfflineMaterial(documentId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        ["offline_materials", "encrypted_chunks", "offline_licenses", "download_sessions"],
        "readwrite"
      );

      tx.objectStore("offline_materials").delete(documentId);
      tx.objectStore("offline_licenses").delete(documentId);
      tx.objectStore("download_sessions").delete(documentId);

      // Delete all chunks for this document
      const chunkStore = tx.objectStore("encrypted_chunks");
      const index = chunkStore.index("by_document");
      const request = index.getAllKeys(IDBKeyRange.only(documentId));
      request.onsuccess = () => {
        const keys = request.result;
        for (const key of keys) {
          chunkStore.delete(key);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async clearAllOfflineData(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        ["offline_materials", "encrypted_chunks", "offline_licenses", "download_sessions"],
        "readwrite"
      );
      tx.objectStore("offline_materials").clear();
      tx.objectStore("encrypted_chunks").clear();
      tx.objectStore("offline_licenses").clear();
      tx.objectStore("download_sessions").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Storage Accounting ---
  public async getStorageEstimate(): Promise<StorageEstimateResult> {
    let usedBytes = 0;
    let quotaBytes: number | undefined;
    let persistent = false;

    // 1. Calculate actual size from offline materials
    const materials = await this.getAllOfflineMaterials();
    for (const m of materials) {
      usedBytes += m.fileSizeBytes;
    }

    // 2. Query browser StorageManager API if supported
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      try {
        const est = await navigator.storage.estimate();
        if (typeof est.quota === "number") quotaBytes = est.quota;
        if (typeof est.usage === "number" && est.usage > usedBytes) {
          usedBytes = est.usage;
        }
      } catch {
        // storage estimate unsupported
      }

      if (navigator.storage.persisted) {
        try {
          persistent = await navigator.storage.persisted();
        } catch {
          // ignore
        }
      }
    }

    const percentageUsed = quotaBytes && quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;

    return {
      usedBytes,
      quotaBytes,
      percentageUsed: Number(percentageUsed.toFixed(2)),
      offlineDocumentsCount: materials.length,
      persistent,
    };
  }

  public async requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator !== "undefined" && navigator.storage?.persist) {
      try {
        return await navigator.storage.persist();
      } catch {
        return false;
      }
    }
    return false;
  }

  // --- Offline Study Annotations, Notes & Bookmarks ---

  public async getAnnotations(documentId: string): Promise<StudyAnnotation[]> {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`somaug_annotations_${documentId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  public async saveAnnotation(annotation: StudyAnnotation): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const existing = await this.getAnnotations(annotation.documentId);
      const filtered = existing.filter((a) => a.id !== annotation.id);
      filtered.push(annotation);
      localStorage.setItem(`somaug_annotations_${annotation.documentId}`, JSON.stringify(filtered));
    } catch {}
  }

  public async deleteAnnotation(id: string, documentId: string): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const existing = await this.getAnnotations(documentId);
      const filtered = existing.filter((a) => a.id !== id);
      localStorage.setItem(`somaug_annotations_${documentId}`, JSON.stringify(filtered));
    } catch {}
  }
}

export interface StudyAnnotation {
  id: string;
  documentId: string;
  pageNumber: number;
  type: "bookmark" | "note" | "highlight";
  content?: string;
  color?: string;
  createdAt: string;
}

export const offlineStorage = new OfflineStorageManager();

