import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StorageUploadResult {
  storageKey: string;
  fileSizeBytes: number;
  checksumSha256: string;
}

export interface StorageAdapter {
  uploadDocument(fileBuffer: Buffer, fileName: string): Promise<StorageUploadResult>;
  getDocumentBuffer(storageKey: string): Promise<Buffer>;
  deleteDocument(storageKey: string): Promise<void>;
}

/**
 * Local Disk Storage Adapter for development and testing.
 * Stores files outside public web directory with non-guessable hashed filenames.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), ".private_storage");
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch {
      // directory already exists
    }
  }

  async uploadDocument(fileBuffer: Buffer, fileName: string): Promise<StorageUploadResult> {
    await this.ensureDir();
    const checksumSha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const ext = path.extname(fileName) || ".pdf";
    const storageKey = `docs/${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const fullPath = path.join(this.baseDir, storageKey);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileBuffer);

    return {
      storageKey,
      fileSizeBytes: fileBuffer.length,
      checksumSha256,
    };
  }

  async getDocumentBuffer(storageKey: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, storageKey);
    return await fs.readFile(fullPath);
  }

  async deleteDocument(storageKey: string): Promise<void> {
    const fullPath = path.join(this.baseDir, storageKey);
    try {
      await fs.unlink(fullPath);
    } catch {
      // ignore if already deleted
    }
  }
}

let activeStorage: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!activeStorage) {
    activeStorage = new LocalStorageAdapter();
  }
  return activeStorage;
}

