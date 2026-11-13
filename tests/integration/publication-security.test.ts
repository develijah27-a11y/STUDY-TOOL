import { describe, it, expect, beforeEach } from "vitest";
import { dbStore } from "@/lib/db/in-memory-store";
import { PublishingAndDeliveryService } from "@/lib/documents/publishing-service";
import { WalletAndLedgerService } from "@/lib/financial/wallet-service";
import { UserAuthContext } from "@/lib/auth/roles";

describe("Mandatory Integration Tests: Publication Security, Previews, Versions & Permissions (Part XVII §43 & §45)", () => {
  beforeEach(() => {
    dbStore.resetAndSeed();
  });

  const studentAuth: UserAuthContext = {
    userId: "user-student-1",
    email: "namukasa.grace@students.mak.ac.ug",
    roles: ["student"],
  };

  const coordinatorAuth: UserAuthContext = {
    userId: "user-student-2",
    email: "mugisha.ivan@students.mubs.ac.ug",
    roles: ["student"], // Class coordinator is an ordinary student
  };

  const pendingLecturerAuth: UserAuthContext = {
    userId: "user-lecturer-pending",
    email: "kato.peter@kyu.ac.ug",
    roles: ["lecturer"],
    lecturerProfile: {
      id: "lec-pending",
      verificationStatus: "under_review",
      institutionId: "inst-kyu",
    },
  };

  const approvedLecturer1Auth: UserAuthContext = {
    userId: "user-lecturer-1",
    email: "prof.okello@cis.mak.ac.ug",
    roles: ["lecturer"],
    lecturerProfile: {
      id: "lec-1",
      verificationStatus: "approved",
      institutionId: "inst-mak",
    },
  };

  const approvedLecturer2Auth: UserAuthContext = {
    userId: "user-lecturer-2",
    email: "dr.nakato@law.mak.ac.ug",
    roles: ["lecturer"],
    lecturerProfile: {
      id: "lec-2",
      verificationStatus: "approved",
      institutionId: "inst-mak",
    },
  };

  it("1. Non-purchaser can only view permitted sample preview pages and is strictly blocked from protected pages", () => {
    // Document 'doc-csc2101-notes' has 48 pages and allowedPreviewPages = [1, 2, 3]
    const page1Res = PublishingAndDeliveryService.getAuthorizedPageContent({
      userId: "user-student-1",
      documentId: "doc-csc2101-notes",
      pageNumber: 1,
    });
    expect(page1Res.authorized).toBe(true);
    expect(page1Res.accessMode).toBe("permitted_preview");

    // Page 4 is NOT in allowedPreviewPages -> must be denied for non-purchaser
    const page4Res = PublishingAndDeliveryService.getAuthorizedPageContent({
      userId: "user-student-1",
      documentId: "doc-csc2101-notes",
      pageNumber: 4,
    });
    expect(page4Res.authorized).toBe(false);
    expect(page4Res.error).toContain("ACCESS_DENIED");
  });

  it("2. Short 1–2 page documents never expose any preview pages to non-purchasers", () => {
    // 'doc-short-2page-summary' has 2 pages -> allowedPreviewPages = []
    const page1Short = PublishingAndDeliveryService.getAuthorizedPageContent({
      userId: "user-student-1",
      documentId: "doc-short-2page-summary",
      pageNumber: 1,
    });
    expect(page1Short.authorized).toBe(false);
    expect(page1Short.error).toContain("ACCESS_DENIED");
  });

  it("3. Entitled student can access all pages with personalized watermark after purchase", () => {
    WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-1",
      documentId: "doc-csc2101-notes",
      idempotencyKey: "IDEMP-READER-TEST",
    });

    const page25Res = PublishingAndDeliveryService.getAuthorizedPageContent({
      userId: "user-student-1",
      documentId: "doc-csc2101-notes",
      pageNumber: 25,
    });
    expect(page25Res.authorized).toBe(true);
    expect(page25Res.accessMode).toBe("entitled_full_access");
    expect(page25Res.watermarkText).toContain("Grace Namukasa");
    expect(page25Res.watermarkText).toContain("REC-UGX-");
  });

  it("4. Unverified lecturer and student cannot publish materials", () => {
    const validPdfBuffer = Buffer.from("%PDF-1.7 mock academic content");

    const studentAttempt = PublishingAndDeliveryService.publishDocument({
      authContext: studentAuth,
      title: "Unauthorized Notes",
      description: "Should fail",
      institutionId: "inst-mak",
      courseUnitId: "course-csc2101",
      documentType: "lecture_notes",
      priceUGX: 3000,
      pageCount: 12,
      fileBuffer: validPdfBuffer,
      fileName: "notes.pdf",
      topics: ["Test"],
      ownershipConfirmed: true,
    });
    expect(studentAttempt.success).toBe(false);
    expect(studentAttempt.error).toContain("UNAUTHORIZED_PUBLISHER");

    const pendingAttempt = PublishingAndDeliveryService.publishDocument({
      authContext: pendingLecturerAuth,
      title: "Pending Lecturer Notes",
      description: "Should fail until verified",
      institutionId: "inst-kyu",
      courseUnitId: "course-civ2201",
      documentType: "lecture_notes",
      priceUGX: 4000,
      pageCount: 15,
      fileBuffer: validPdfBuffer,
      fileName: "civ.pdf",
      topics: ["Structures"],
      ownershipConfirmed: true,
    });
    expect(pendingAttempt.success).toBe(false);
    expect(pendingAttempt.error).toContain("UNAUTHORIZED_PUBLISHER");
  });

  it("5. Class coordinator (student) cannot create or manage a lecturer collection", async () => {
    const res = await PublishingAndDeliveryService.createCollection({
      authContext: coordinatorAuth,
      title: "Coordinator Unofficial Pack",
      description: "Should be blocked",
      institutionId: "inst-mubs",
      documentIds: ["doc-csc2101-notes"],
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("FORBIDDEN");
  });

  it("6. Lecturer cannot update another lecturer's document by changing documentId (IDOR protection)", () => {
    const validPdfBuffer = Buffer.from("%PDF-1.7 updated content");

    // Lecturer 2 attempts to upload a new version to Lecturer 1's document ('doc-csc2101-notes')
    const crossUpdate = PublishingAndDeliveryService.uploadNewVersion({
      authContext: approvedLecturer2Auth,
      documentId: "doc-csc2101-notes",
      changeSummary: "Unauthorized takeover attempt",
      pageCount: 50,
      fileBuffer: validPdfBuffer,
      fileName: "hack.pdf",
    });

    expect(crossUpdate.success).toBe(false);
    expect(crossUpdate.error).toContain("FORBIDDEN");
  });

  it("7. Publication version updates preserve historical purchase records and version references", () => {
    // Student 1 buys v2 of 'doc-csc2101-notes'
    const purchase = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-1",
      documentId: "doc-csc2101-notes",
      idempotencyKey: "IDEMP-VER-HIST",
    });
    expect(purchase.order?.documentVersion).toBe(2);

    // Lecturer 1 uploads v3 of 'doc-csc2101-notes'
    const validPdfBuffer = Buffer.from("%PDF-1.7 version 3 content");
    const v3Update = PublishingAndDeliveryService.uploadNewVersion({
      authContext: approvedLecturer1Auth,
      documentId: "doc-csc2101-notes",
      changeSummary: "Added 2026 final exam solutions",
      pageCount: 54,
      fileBuffer: validPdfBuffer,
      fileName: "csc2101-v3.pdf",
    });

    expect(v3Update.success).toBe(true);
    expect(v3Update.document?.currentVersion).toBe(3);

    // Verify historical order still records version 2 and original price
    const historicalOrder = dbStore.orders.find((o) => o.id === purchase.order?.id);
    expect(historicalOrder?.documentVersion).toBe(2);
    expect(historicalOrder?.grossAmountUGX).toBe(5000);
  });

  it("8. Wallet PIN rate limiting locks the wallet after 5 consecutive failed attempts", () => {
    for (let i = 1; i <= 4; i++) {
      const attempt = WalletAndLedgerService.verifyWalletPin("user-student-1", "student", "9999");
      expect(attempt.verified).toBe(false);
      expect(attempt.remainingAttempts).toBe(5 - i);
    }

    // 5th failed attempt locks wallet
    const fifth = WalletAndLedgerService.verifyWalletPin("user-student-1", "student", "9999");
    expect(fifth.verified).toBe(false);
    expect(fifth.error).toContain("WALLET_LOCKED");

    // Even with correct PIN afterwards, locked wallet rejects transactions
    const afterLock = WalletAndLedgerService.verifyWalletPin("user-student-1", "student", "1234");
    expect(afterLock.verified).toBe(false);
    expect(afterLock.error).toContain("WALLET_LOCKED");
  });
});

