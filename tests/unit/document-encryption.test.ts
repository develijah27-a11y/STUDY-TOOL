import { describe, it, expect } from "vitest";
import { DocumentEncryptionService } from "../../src/lib/crypto/document-encryption";

describe("DocumentEncryptionService (AES-GCM Authenticated Encryption)", () => {
  it("generates a valid 256-bit AES-GCM CryptoKey and exports to 64-char hex", async () => {
    const key = await DocumentEncryptionService.generateDocumentKey();
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe("AES-GCM");

    const hex = await DocumentEncryptionService.exportKeyToHex(key);
    expect(hex).toHaveLength(64); // 32 bytes = 64 hex chars

    const reimported = await DocumentEncryptionService.importKeyFromHex(hex);
    expect(reimported).toBeDefined();
    expect(reimported.algorithm.name).toBe("AES-GCM");
  });

  it("derives deterministic 256-bit key from secret and salt", async () => {
    const secret = "somaug_master_secret_2026";
    const salt = "0123456789abcdef0123456789abcdef";

    const key1 = await DocumentEncryptionService.deriveDocumentKey(secret, salt);
    const key2 = await DocumentEncryptionService.deriveDocumentKey(secret, salt);

    const hex1 = await DocumentEncryptionService.exportKeyToHex(key1);
    const hex2 = await DocumentEncryptionService.exportKeyToHex(key2);

    expect(hex1).toBe(hex2);
  });

  it("encrypts and decrypts a chunk payload accurately with integrity validation", async () => {
    const key = await DocumentEncryptionService.generateDocumentKey();
    const originalText = "SomaUG Academic Lecture Notes — Makerere University CSC 2101";
    const chunkBytes = new TextEncoder().encode(originalText);

    const payload = await DocumentEncryptionService.encryptChunk(
      chunkBytes,
      key,
      0,
      1,
      1
    );

    expect(payload.chunkIndex).toBe(0);
    expect(payload.ivHex).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(payload.plaintextSha256).toBeDefined();
    expect(payload.encryptedSha256).toBeDefined();

    // Verify encrypted payload cannot be opened as plaintext
    expect(payload.ciphertextBase64).not.toContain(originalText);

    // Decrypt
    const decryptedBytes = await DocumentEncryptionService.decryptChunk(payload, key);
    const decryptedText = new TextDecoder().decode(decryptedBytes);
    expect(decryptedText).toBe(originalText);
  });

  it("never reuses nonces/IVs across consecutive chunk encryptions", async () => {
    const key = await DocumentEncryptionService.generateDocumentKey();
    const data = new TextEncoder().encode("Identical Chunk Data");

    const chunk1 = await DocumentEncryptionService.encryptChunk(data, key, 0, 2);
    const chunk2 = await DocumentEncryptionService.encryptChunk(data, key, 1, 2);

    // IVs must be completely distinct
    expect(chunk1.ivHex).not.toBe(chunk2.ivHex);
    // Ciphertexts must differ because IVs are distinct
    expect(chunk1.ciphertextBase64).not.toBe(chunk2.ciphertextBase64);
  });

  it("strictly rejects tampered ciphertext or modified authentication tag", async () => {
    const key = await DocumentEncryptionService.generateDocumentKey();
    const data = new TextEncoder().encode("Critical Exam Model Solutions");
    const payload = await DocumentEncryptionService.encryptChunk(data, key, 0, 1);

    // Tamper with ciphertext by corrupting bytes
    const tamperedPayload = {
      ...payload,
      ciphertextBase64: payload.ciphertextBase64.substring(0, payload.ciphertextBase64.length - 4) + "AAAA",
    };

    await expect(
      DocumentEncryptionService.decryptChunk(tamperedPayload, key)
    ).rejects.toThrow();
  });

  it("splits a larger document into multiple encrypted chunks and reassembles correctly", async () => {
    const key = await DocumentEncryptionService.generateDocumentKey();
    const docText = "Uganda Academic Repository ".repeat(100);
    const docBytes = new TextEncoder().encode(docText);

    // Split with small chunk size (128 bytes)
    const chunks = await DocumentEncryptionService.splitAndEncryptDocument(
      docBytes,
      key,
      1,
      128
    );

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[chunks.length - 1].chunkIndex).toBe(chunks.length - 1);

    // Reassemble in volatile memory
    const reassembledBytes = await DocumentEncryptionService.decryptAndReassemble(
      chunks,
      key
    );

    const reassembledText = new TextDecoder().decode(reassembledBytes);
    expect(reassembledText).toBe(docText);
  });
});

