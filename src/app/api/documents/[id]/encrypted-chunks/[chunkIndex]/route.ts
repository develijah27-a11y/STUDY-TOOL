import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbStore } from "@/lib/db/in-memory-store";
import { DocumentEncryptionService } from "@/lib/crypto/document-encryption";

const DOWNLOAD_TOKEN_SECRET =
  process.env.DOWNLOAD_TOKEN_SECRET || "somaug_download_token_secret_2026";

function verifyDownloadToken(
  token: string,
  documentId: string
): { valid: boolean; studentId?: string; error?: string } {
  if (!token) return { valid: false, error: "MISSING_DOWNLOAD_TOKEN" };

  const parts = token.split(":");
  if (parts.length !== 5) {
    return { valid: false, error: "INVALID_TOKEN_FORMAT" };
  }

  const [studentId, tokenDocId, deviceInstallationId, expiresAtStr, signature] = parts;

  if (tokenDocId !== documentId) {
    return { valid: false, error: "DOCUMENT_ID_MISMATCH" };
  }

  const expiresAt = Number(expiresAtStr);
  if (Date.now() > expiresAt) {
    return { valid: false, error: "DOWNLOAD_TOKEN_EXPIRED" };
  }

  const expectedSignature = crypto
    .createHmac("sha256", DOWNLOAD_TOKEN_SECRET)
    .update(`${studentId}:${tokenDocId}:${deviceInstallationId}:${expiresAtStr}`)
    .digest("hex");

  if (signature !== expectedSignature) {
    return { valid: false, error: "INVALID_TOKEN_SIGNATURE" };
  }

  return { valid: true, studentId };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; chunkIndex: string } }
) {
  try {
    const documentId = params.id;
    const chunkIndex = Number(params.chunkIndex);

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";

    const tokenVerification = verifyDownloadToken(token, documentId);
    if (!tokenVerification.valid) {
      return NextResponse.json(
        { error: tokenVerification.error || "UNAUTHORIZED_DOWNLOAD" },
        { status: 403 }
      );
    }

    const doc = dbStore.documents.find((d) => d.id === documentId);
    if (!doc) {
      return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    }

    const chunkSizeBytes = 512 * 1024;
    const totalChunks = Math.max(1, Math.ceil(doc.fileSizeBytes / chunkSizeBytes));

    if (isNaN(chunkIndex) || chunkIndex < 0 || chunkIndex >= totalChunks) {
      return NextResponse.json({ error: "INVALID_CHUNK_INDEX" }, { status: 400 });
    }

    // 1. Derive Document Key (matching download-auth)
    const saltHex = crypto
      .createHash("sha256")
      .update(`${doc.id}-${doc.currentVersion}-academic-salt`)
      .digest("hex");
    const docKey = await DocumentEncryptionService.deriveDocumentKey(
      DOWNLOAD_TOKEN_SECRET,
      saltHex
    );

    // 2. Generate academic binary chunk payload
    // Synthetic high-entropy chunk representation of the document pages
    const isLast = chunkIndex === totalChunks - 1;
    const sizeBytes = isLast ? doc.fileSizeBytes - chunkIndex * chunkSizeBytes : chunkSizeBytes;

    // Build reproducible content buffer for this chunk
    const rawContent = Buffer.alloc(Math.max(64, Math.min(sizeBytes, 1024 * 16)));
    rawContent.write(
      `SOMAUG-ACADEMIC-CHUNK-V${doc.currentVersion}:${doc.id}:idx=${chunkIndex}:total=${totalChunks}\n`
    );

    // 3. Encrypt Chunk using AES-GCM with fresh 12-byte IV (never reused)
    const chunkPayload = await DocumentEncryptionService.encryptChunk(
      new Uint8Array(rawContent),
      docKey,
      chunkIndex,
      totalChunks,
      doc.currentVersion
    );

    return NextResponse.json(chunkPayload, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Chunk-Index": String(chunkIndex),
        "X-Total-Chunks": String(totalChunks),
        "X-Plaintext-Sha256": chunkPayload.plaintextSha256,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error serving chunk";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
