/**
 * Cryptographic Document Encryption & Integrity Module for SomaUG Academic
 * Uses standard Web Crypto API (AES-GCM 256-bit with unique 12-byte IVs per chunk).
 * Provides end-to-end chunk encryption, integrity hashing (SHA-256), and decryption.
 *
 * NOTE: Encrypted chunks cannot be opened as ordinary PDFs. Decrypted buffers are
 * held strictly in volatile memory during active rendering and are never written
 * permanently to disk, IndexedDB, or CacheStorage.
 */

// Universal WebCrypto accessor across browser and Node.js environments
function getSubtleCrypto(): SubtleCrypto {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  // Fallback for Node.js test environment if needed
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require("crypto");
    if (nodeCrypto.webcrypto?.subtle) {
      return nodeCrypto.webcrypto.subtle;
    }
  } catch {
    // ignore
  }
  throw new Error("WebCrypto SubtleCrypto is not available in this environment");
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    return globalThis.crypto.getRandomValues(array);
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require("crypto");
    return nodeCrypto.randomFillSync(array);
  } catch {
    throw new Error("Cryptographically secure random number generator is unavailable");
  }
}

export interface EncryptedChunkPayload {
  chunkIndex: number;
  totalChunks: number;
  ivHex: string; // 12 bytes = 24 hex chars
  ciphertextBase64: string; // Encrypted data + 16-byte GCM authentication tag
  plaintextSha256: string; // Pre-encryption SHA-256 checksum
  encryptedSha256: string; // Post-encryption SHA-256 checksum
  version: number;
}

export class DocumentEncryptionService {
  public static readonly ALGORITHM = "AES-GCM";
  public static readonly KEY_LENGTH_BITS = 256;
  public static readonly IV_LENGTH_BYTES = 12; // 96-bit IV recommended for AES-GCM
  public static readonly DEFAULT_CHUNK_SIZE_BYTES = 512 * 1024; // 512 KB chunks

  /**
   * Generates a high-entropy 256-bit AES-GCM CryptoKey
   */
  public static async generateDocumentKey(): Promise<CryptoKey> {
    const subtle = getSubtleCrypto();
    return await subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH_BITS,
      },
      true, // extractable for server-side derivation / wrapping
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Derives a 256-bit AES-GCM key from a shared secret and salt using PBKDF2
   */
  public static async deriveDocumentKey(
    secret: string,
    saltHex: string,
    iterations = 100_000
  ): Promise<CryptoKey> {
    const subtle = getSubtleCrypto();
    const enc = new TextEncoder();
    const keyMaterial = await subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const salt = this.hexToBytes(saltHex);
    return await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH_BITS,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Exports a CryptoKey to raw hex string
   */
  public static async exportKeyToHex(key: CryptoKey): Promise<string> {
    const subtle = getSubtleCrypto();
    const raw = await subtle.exportKey("raw", key);
    return this.bytesToHex(new Uint8Array(raw));
  }

  /**
   * Imports a CryptoKey from raw hex string
   */
  public static async importKeyFromHex(
    hexKey: string,
    extractable = false
  ): Promise<CryptoKey> {
    const subtle = getSubtleCrypto();
    const raw = this.hexToBytes(hexKey);
    return await subtle.importKey(
      "raw",
      raw,
      { name: this.ALGORITHM, length: this.KEY_LENGTH_BITS },
      extractable,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Computes SHA-256 hex checksum of a byte buffer
   */
  public static async computeSha256(data: Uint8Array): Promise<string> {
    const subtle = getSubtleCrypto();
    const hashBuffer = await subtle.digest("SHA-256", data);
    return this.bytesToHex(new Uint8Array(hashBuffer));
  }

  /**
   * Encrypts a single chunk of document bytes using AES-GCM with a fresh random 12-byte IV.
   * NONCE REUSE PREVENTION: Generates a completely new cryptographically secure 12-byte IV
   * for every single chunk invocation.
   */
  public static async encryptChunk(
    chunkData: Uint8Array,
    key: CryptoKey,
    chunkIndex: number,
    totalChunks: number,
    version = 1
  ): Promise<EncryptedChunkPayload> {
    const subtle = getSubtleCrypto();

    // 1. Compute plaintext SHA-256 checksum
    const plaintextSha256 = await this.computeSha256(chunkData);

    // 2. Generate a fresh, unique 12-byte IV (never reused!)
    const iv = new Uint8Array(this.IV_LENGTH_BYTES);
    getRandomValues(iv);

    // 3. Encrypt chunk with AES-GCM
    const ciphertext = await subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv,
      },
      key,
      chunkData
    );

    const ciphertextBytes = new Uint8Array(ciphertext);

    // 4. Compute encrypted payload SHA-256 checksum
    const encryptedSha256 = await this.computeSha256(ciphertextBytes);

    return {
      chunkIndex,
      totalChunks,
      ivHex: this.bytesToHex(iv),
      ciphertextBase64: this.bytesToBase64(ciphertextBytes),
      plaintextSha256,
      encryptedSha256,
      version,
    };
  }

  /**
   * Decrypts an encrypted chunk payload.
   * Verifies post-encryption integrity and GCM authentication tag before returning bytes.
   */
  public static async decryptChunk(
    payload: EncryptedChunkPayload,
    key: CryptoKey
  ): Promise<Uint8Array> {
    const subtle = getSubtleCrypto();
    const ciphertextBytes = this.base64ToBytes(payload.ciphertextBase64);

    // 1. Verify encrypted checksum
    const computedEncHash = await this.computeSha256(ciphertextBytes);
    if (computedEncHash !== payload.encryptedSha256) {
      throw new Error(
        `INTEGRITY_ERROR: Encrypted chunk ${payload.chunkIndex} hash mismatch`
      );
    }

    // 2. Decrypt with AES-GCM using payload's specific IV
    const iv = this.hexToBytes(payload.ivHex);
    let plaintextBuffer: ArrayBuffer;
    try {
      plaintextBuffer = await subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv,
        },
        key,
        ciphertextBytes
      );
    } catch {
      throw new Error(
        `DECRYPTION_FAILED: Authentication tag verification failed for chunk ${payload.chunkIndex}`
      );
    }

    const plaintextBytes = new Uint8Array(plaintextBuffer);

    // 3. Verify plaintext SHA-256 integrity
    const computedPlainHash = await this.computeSha256(plaintextBytes);
    if (computedPlainHash !== payload.plaintextSha256) {
      throw new Error(
        `INTEGRITY_ERROR: Plaintext chunk ${payload.chunkIndex} checksum mismatch`
      );
    }

    return plaintextBytes;
  }

  /**
   * Splits a full document byte buffer into encrypted chunks
   */
  public static async splitAndEncryptDocument(
    documentBytes: Uint8Array,
    key: CryptoKey,
    version = 1,
    chunkSizeBytes = this.DEFAULT_CHUNK_SIZE_BYTES
  ): Promise<EncryptedChunkPayload[]> {
    const totalChunks = Math.ceil(documentBytes.length / chunkSizeBytes) || 1;
    const encryptedChunks: EncryptedChunkPayload[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSizeBytes;
      const end = Math.min(start + chunkSizeBytes, documentBytes.length);
      const chunkBytes = documentBytes.slice(start, end);

      const encChunk = await this.encryptChunk(
        chunkBytes,
        key,
        i,
        totalChunks,
        version
      );
      encryptedChunks.push(encChunk);
    }

    return encryptedChunks;
  }

  /**
   * Reassembles decrypted chunks in volatile memory.
   * NEVER store this output in persistent browser storage!
   */
  public static async decryptAndReassemble(
    chunks: EncryptedChunkPayload[],
    key: CryptoKey
  ): Promise<Uint8Array> {
    // Sort chunks by index to guarantee ordering
    const sorted = [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);

    const decryptedBuffers: Uint8Array[] = [];
    let totalLength = 0;

    for (const chunk of sorted) {
      const decrypted = await this.decryptChunk(chunk, key);
      decryptedBuffers.push(decrypted);
      totalLength += decrypted.length;
    }

    // Merge into single typed array in volatile memory
    const fullBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of decryptedBuffers) {
      fullBuffer.set(buf, offset);
      offset += buf.length;
    }

    return fullBuffer;
  }

  // --- Byte / Hex / Base64 Helpers ---
  public static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  public static hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) throw new Error("Invalid hex string length");
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  public static bytesToBase64(bytes: Uint8Array): string {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(bytes).toString("base64");
    }
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public static base64ToBytes(base64: string): Uint8Array {
    if (typeof Buffer !== "undefined") {
      const buf = Buffer.from(base64, "base64");
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
