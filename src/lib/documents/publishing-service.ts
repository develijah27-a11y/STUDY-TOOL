import crypto from "crypto";
import QRCode from "qrcode";
import { dbStore } from "@/lib/db/in-memory-store";
import { AuthorizationGuard, UserAuthContext } from "@/lib/auth/roles";
import { evaluatePreviewPolicy } from "./preview-policy";
import { Document, DocumentType, DocumentVersion, Collection } from "@/types/domain";

export const MAX_PDF_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_PDF_PAGE_COUNT = 100;

export class PublishingAndDeliveryService {
  /**
   * Validates PDF binary buffer on the server (never trusts client MIME or extension alone).
   */
  static validatePdfUpload(params: {
    fileBuffer: Buffer;
    fileName: string;
    reportedPageCount: number;
  }): {
    valid: boolean;
    checksumSha256?: string;
    error?: string;
  } {
    const { fileBuffer, reportedPageCount } = params;

    if (!fileBuffer || fileBuffer.length === 0) {
      return { valid: false, error: "EMPTY_FILE_BUFFER" };
    }

    if (fileBuffer.length > MAX_PDF_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File exceeds maximum allowed size of 50 MB (received ${(
          fileBuffer.length /
          (1024 * 1024)
        ).toFixed(2)} MB)`,
      };
    }

    // Verify PDF magic header (%PDF-)
    const magicHeader = fileBuffer.subarray(0, 5).toString("utf-8");
    if (magicHeader !== "%PDF-") {
      return {
        valid: false,
        error: "INVALID_PDF_SIGNATURE: Uploaded file is not a valid PDF document",
      };
    }

    if (
      !Number.isInteger(reportedPageCount) ||
      reportedPageCount < 1 ||
      reportedPageCount > MAX_PDF_PAGE_COUNT
    ) {
      return {
        valid: false,
        error: `Page count must be between 1 and ${MAX_PDF_PAGE_COUNT} pages`,
      };
    }

    const checksumSha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    return {
      valid: true,
      checksumSha256,
    };
  }

  /**
   * Publishes a new academic document after enforcing lecturer authorization,
   * PDF integrity, pricing limits, and server-side preview policy.
   */
  static publishDocument(params: {
    authContext: UserAuthContext;
    title: string;
    description: string;
    institutionId: string;
    programmeId?: string;
    courseUnitId: string;
    documentType: DocumentType;
    priceUGX: number;
    pageCount: number;
    fileBuffer: Buffer;
    fileName: string;
    topics: string[];
    suggestedPreviewPages?: number[];
    ownershipConfirmed: boolean;
  }): {
    success: boolean;
    document?: Document;
    error?: string;
  } {
    const { authContext } = params;

    // 1. Authorization Guard: Only approved lecturers or admins can publish
    if (!AuthorizationGuard.canPublish(authContext)) {
      return {
        success: false,
        error: "UNAUTHORIZED_PUBLISHER: Only verified lecturers may publish academic materials",
      };
    }

    if (!params.ownershipConfirmed) {
      return {
        success: false,
        error: "COPYRIGHT_DECLARATION_REQUIRED: You must confirm ownership or distribution rights",
      };
    }

    // 2. Validate Price on Server
    if (
      !Number.isInteger(params.priceUGX) ||
      params.priceUGX < dbStore.settings.minDocumentPriceUGX ||
      params.priceUGX > dbStore.settings.maxDocumentPriceUGX
    ) {
      return {
        success: false,
        error: `Price must be an integer between UGX ${dbStore.settings.minDocumentPriceUGX.toLocaleString()} and UGX ${dbStore.settings.maxDocumentPriceUGX.toLocaleString()}`,
      };
    }

    // 3. Validate PDF Upload
    const pdfCheck = this.validatePdfUpload({
      fileBuffer: params.fileBuffer,
      fileName: params.fileName,
      reportedPageCount: params.pageCount,
    });
    if (!pdfCheck.valid || !pdfCheck.checksumSha256) {
      return { success: false, error: pdfCheck.error };
    }

    // 4. Enforce Preview Policy on Server
    const previewPolicy = evaluatePreviewPolicy(
      params.pageCount,
      params.suggestedPreviewPages
    );

    const lecturerId = authContext.lecturerProfile?.id || "lec-1";
    const now = new Date().toISOString();
    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const storageKey = `docs/${docId}-v1.pdf`;

    const newDoc: Document = {
      id: docId,
      lecturerId,
      title: params.title.trim(),
      description: params.description.trim(),
      institutionId: params.institutionId,
      programmeId: params.programmeId,
      courseUnitId: params.courseUnitId,
      documentType: params.documentType,
      priceUGX: params.priceUGX,
      pageCount: params.pageCount,
      fileSizeBytes: params.fileBuffer.length,
      currentVersion: 1,
      status: "published",
      topics: params.topics,
      allowedPreviewPages: previewPolicy.allowedPageNumbers,
      storageKey,
      checksumSha256: pdfCheck.checksumSha256,
      viewsCount: 0,
      salesCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const versionRecord: DocumentVersion = {
      id: `ver-${docId}-1`,
      documentId: docId,
      versionNumber: 1,
      changeSummary: "Initial publication release",
      storageKey,
      pageCount: params.pageCount,
      fileSizeBytes: params.fileBuffer.length,
      checksumSha256: pdfCheck.checksumSha256,
      isCurrent: true,
      uploadedAt: now,
    };

    dbStore.documents.unshift(newDoc);
    dbStore.documentVersions.push(versionRecord);

    return {
      success: true,
      document: newDoc,
    };
  }

  /**
   * Uploads a new version of an existing document (Step F: Version Management).
   * Preserves historical orders, receipts, and version references.
   */
  static uploadNewVersion(params: {
    authContext: UserAuthContext;
    documentId: string;
    changeSummary: string;
    pageCount: number;
    fileBuffer: Buffer;
    fileName: string;
    suggestedPreviewPages?: number[];
  }): {
    success: boolean;
    document?: Document;
    version?: DocumentVersion;
    error?: string;
  } {
    const doc = dbStore.documents.find((d) => d.id === params.documentId);
    if (!doc) return { success: false, error: "DOCUMENT_NOT_FOUND" };

    if (!AuthorizationGuard.canManageDocument(params.authContext, doc.lecturerId)) {
      return {
        success: false,
        error: "FORBIDDEN: You cannot modify another lecturer's publication",
      };
    }

    const pdfCheck = this.validatePdfUpload({
      fileBuffer: params.fileBuffer,
      fileName: params.fileName,
      reportedPageCount: params.pageCount,
    });
    if (!pdfCheck.valid || !pdfCheck.checksumSha256) {
      return { success: false, error: pdfCheck.error };
    }

    const nextVersion = doc.currentVersion + 1;
    const storageKey = `docs/${doc.id}-v${nextVersion}.pdf`;
    const now = new Date().toISOString();

    const previewPolicy = evaluatePreviewPolicy(
      params.pageCount,
      params.suggestedPreviewPages
    );

    // Mark previous versions as not current (while keeping them intact for historical records)
    dbStore.documentVersions
      .filter((v) => v.documentId === doc.id)
      .forEach((v) => {
        v.isCurrent = false;
      });

    const newVer: DocumentVersion = {
      id: `ver-${doc.id}-${nextVersion}`,
      documentId: doc.id,
      versionNumber: nextVersion,
      changeSummary: params.changeSummary,
      storageKey,
      pageCount: params.pageCount,
      fileSizeBytes: params.fileBuffer.length,
      checksumSha256: pdfCheck.checksumSha256,
      isCurrent: true,
      uploadedAt: now,
    };

    dbStore.documentVersions.push(newVer);

    doc.currentVersion = nextVersion;
    doc.pageCount = params.pageCount;
    doc.fileSizeBytes = params.fileBuffer.length;
    doc.storageKey = storageKey;
    doc.checksumSha256 = pdfCheck.checksumSha256;
    doc.allowedPreviewPages = previewPolicy.allowedPageNumbers;
    doc.updatedAt = now;

    return {
      success: true,
      document: doc,
      version: newVer,
    };
  }

  /**
   * Creates or updates a Lecturer Course-Resource Collection (Part VII Section 13).
   * Strictly blocks students and class coordinators from creating or modifying collections.
   */
  static async createCollection(params: {
    authContext: UserAuthContext;
    title: string;
    description: string;
    institutionId: string;
    courseUnitId?: string;
    documentIds: string[];
  }): Promise<{
    success: boolean;
    collection?: Collection;
    error?: string;
  }> {
    if (!AuthorizationGuard.canPublish(params.authContext)) {
      return {
        success: false,
        error: "FORBIDDEN: Only verified lecturers may create course collections",
      };
    }

    const lecturerId = params.authContext.lecturerProfile?.id;
    if (!lecturerId) {
      return { success: false, error: "LECTURER_PROFILE_MISSING" };
    }

    const shareCode = `COL-${Date.now().toString().slice(-5)}-${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;

    const shareUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/collections/${shareCode}`;

    let qrCodeDataUrl = "";
    try {
      qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 240,
        margin: 2,
      });
    } catch {
      qrCodeDataUrl = "";
    }

    const now = new Date().toISOString();
    const collection: Collection = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lecturerId,
      title: params.title.trim(),
      description: params.description.trim(),
      institutionId: params.institutionId,
      courseUnitId: params.courseUnitId,
      isPublished: true,
      shareCode,
      qrCodeDataUrl,
      documentIds: params.documentIds,
      createdAt: now,
      updatedAt: now,
    };

    dbStore.collections.unshift(collection);
    return {
      success: true,
      collection,
    };
  }

  /**
   * Protected Page Delivery & Entitlement Verification (Part XII Section 25 & 26).
   * Verifies server-side whether the caller is allowed to read a specific page of a document.
   * Never exposes unrestricted URLs to the original PDF.
   */
  static getAuthorizedPageContent(params: {
    userId?: string;
    documentId: string;
    pageNumber: number;
  }): {
    authorized: boolean;
    accessMode?: "entitled_full_access" | "permitted_preview" | "lecturer_owner";
    watermarkText?: string;
    pageData?: {
      documentId: string;
      title: string;
      pageNumber: number;
      totalPages: number;
      version: number;
      bodyText: string;
      storageKey: string;
    };
    error?: string;
  } {
    const doc = dbStore.documents.find((d) => d.id === params.documentId);
    if (!doc || doc.status !== "published") {
      return { authorized: false, error: "DOCUMENT_NOT_FOUND" };
    }

    if (params.pageNumber < 1 || params.pageNumber > doc.pageCount) {
      return { authorized: false, error: "INVALID_PAGE_NUMBER" };
    }

    // 1. Check if caller is the owning Lecturer
    if (params.userId) {
      const lec = dbStore.lecturerProfiles.find((l) => l.userId === params.userId);
      if (lec && lec.id === doc.lecturerId) {
        return {
          authorized: true,
          accessMode: "lecturer_owner",
          watermarkText: `AUTHOR COPY — ${lec.fullName} (${doc.title})`,
          pageData: this.buildRenderedPagePayload(doc, params.pageNumber),
        };
      }
    }

    // 2. Check if caller is a Student with an active Purchase Entitlement
    if (params.userId) {
      const entitlement = dbStore.entitlements.find(
        (e) =>
          e.studentId === params.userId &&
          e.documentId === doc.id &&
          e.isActive === true
      );

      if (entitlement) {
        const studentProfile = dbStore.profiles.find((p) => p.id === params.userId);
        const order = dbStore.orders.find((o) => o.id === entitlement.orderId);
        const watermarkText = `Licensed to ${
          studentProfile?.fullName || params.userId
        } (${studentProfile?.email || "verified student"}) • Receipt: ${
          order?.receiptReference || entitlement.id
        } • Personal Academic Use Only`;

        return {
          authorized: true,
          accessMode: "entitled_full_access",
          watermarkText,
          pageData: this.buildRenderedPagePayload(
            doc,
            params.pageNumber,
            entitlement.documentVersion
          ),
        };
      }
    }

    // 3. Otherwise, check if the requested page is in the server-enforced allowedPreviewPages list
    if (doc.allowedPreviewPages.includes(params.pageNumber)) {
      return {
        authorized: true,
        accessMode: "permitted_preview",
        watermarkText: `SAMPLE PREVIEW PAGE ${params.pageNumber} OF ${doc.pageCount} • PURCHASE FULL DOCUMENT FOR UGX ${doc.priceUGX.toLocaleString()}`,
        pageData: this.buildRenderedPagePayload(doc, params.pageNumber),
      };
    }

    return {
      authorized: false,
      error: `ACCESS_DENIED: Page ${params.pageNumber} is protected. Purchase this publication (UGX ${doc.priceUGX.toLocaleString()}) to unlock all ${doc.pageCount} pages.`,
    };
  }

  private static buildRenderedPagePayload(
    doc: Document,
    pageNumber: number,
    version?: number
  ) {
    const course = dbStore.courses.find((c) => c.id === doc.courseUnitId);
    const inst = dbStore.institutions.find((i) => i.id === doc.institutionId);
    const lec = dbStore.lecturerProfiles.find((l) => l.id === doc.lecturerId);

    return {
      documentId: doc.id,
      title: doc.title,
      pageNumber,
      totalPages: doc.pageCount,
      version: version || doc.currentVersion,
      storageKey: doc.storageKey,
      bodyText: [
        `[${inst?.name || "University"} — ${course?.code || "Course"}: ${course?.name || ""}]`,
        `Author: ${lec?.fullName || "Verified Lecturer"} (${lec?.department || ""})`,
        `Document Version: v${version || doc.currentVersion} • Page ${pageNumber} of ${doc.pageCount}`,
        `--------------------------------------------------------------------------------`,
        `Section ${pageNumber}.1 — Core Theoretical Principles & Ugandan Curriculum Context`,
        `This protected academic page presents rigorous analytical formulations, worked proofs, and examination-oriented examples tailored for ${course?.code || "university"} students.`,
        `Topics covered on this page: ${doc.topics.join(", ")}.`,
        `Key Formulation (${pageNumber}.A): Ensure all assumptions are explicitly stated during university final examinations and coursework assessments.`,
      ].join("\n\n"),
    };
  }
}

