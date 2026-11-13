import { describe, it, expect, beforeEach } from "vitest";
import { dbStore } from "@/lib/db/in-memory-store";
import { WalletAndLedgerService } from "@/lib/financial/wallet-service";

describe("Mandatory Integration Tests: Wallet, Ledger, Purchases, Payouts & Refunds (Part XVII §44 & §46)", () => {
  beforeEach(() => {
    dbStore.resetAndSeed();
  });

  it("1. Purchase with sufficient balance posts exactly once, credits lecturer net earnings & platform commission, and grants entitlement", () => {
    // Student 1 starts with 25,000 UGX
    // Lecturer 1 starts with 17,000 UGX
    // Document 'doc-csc2101-notes' costs 5,000 UGX (15% fee = 750 UGX, 85% net = 4,250 UGX)
    const res = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-1",
      documentId: "doc-csc2101-notes",
      idempotencyKey: "IDEMP-PURCHASE-001",
      pin: "1234",
    });

    expect(res.success).toBe(true);
    expect(res.alreadyProcessed).toBe(false);
    expect(res.newStudentBalanceUGX).toBe(20000); // 25,000 - 5,000
    expect(res.newLecturerBalanceUGX).toBe(21250); // 17,000 + 4,250

    // Verify receipt & order match authoritative split
    expect(res.order?.grossAmountUGX).toBe(5000);
    expect(res.order?.platformFeeUGX).toBe(750);
    expect(res.order?.lecturerEarningsUGX).toBe(4250);
    expect(res.order?.receiptReference).toMatch(/^REC-UGX-/);

    // Verify entitlement is active
    expect(res.entitlement?.isActive).toBe(true);
    expect(res.entitlement?.documentVersion).toBe(2);

    // Verify ledger strictly balances
    const recon = WalletAndLedgerService.generateReconciliationReport();
    expect(recon.isStrictlyBalanced).toBe(true);
    expect(recon.discrepancyUGX).toBe(0);
  });

  it("2. Insufficient-balance purchase creates NO debit, NO lecturer earnings credit, NO commission, and NO entitlement", () => {
    // Student 2 starts with 3,000 UGX
    // Document 'doc-law2105-constitution' costs 10,000 UGX
    const initialOrdersCount = dbStore.orders.length;
    const initialEntitlementsCount = dbStore.entitlements.length;
    const initialEntriesCount = dbStore.ledgerEntries.length;

    const res = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-2",
      documentId: "doc-law2105-constitution",
      idempotencyKey: "IDEMP-INSUFF-001",
      pin: "1234",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("INSUFFICIENT_FUNDS");
    expect(res.newStudentBalanceUGX).toBe(3000); // Unchanged

    // Confirm zero side effects
    expect(dbStore.orders.length).toBe(initialOrdersCount);
    expect(dbStore.entitlements.length).toBe(initialEntitlementsCount);
    expect(dbStore.ledgerEntries.length).toBe(initialEntriesCount);

    const lecturer2Wallet = dbStore.walletAccounts.find((w) => w.userId === "user-lecturer-2");
    expect(lecturer2Wallet?.spendableBalanceUGX).toBe(8500); // Unchanged
  });

  it("3. Double-click or network retry with same idempotency key returns original outcome without double charging", () => {
    const firstAttempt = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-1",
      documentId: "doc-csc2101-pastpapers", // 3,500 UGX
      idempotencyKey: "IDEMP-DOUBLE-CLICK-99",
      pin: "1234",
    });

    expect(firstAttempt.success).toBe(true);
    expect(firstAttempt.newStudentBalanceUGX).toBe(21500); // 25,000 - 3,500

    // Second attempt with identical idempotency key
    const secondAttempt = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-1",
      documentId: "doc-csc2101-pastpapers",
      idempotencyKey: "IDEMP-DOUBLE-CLICK-99",
      pin: "1234",
    });

    expect(secondAttempt.success).toBe(true);
    expect(secondAttempt.alreadyProcessed).toBe(true);
    expect(secondAttempt.order?.id).toBe(firstAttempt.order?.id);
    expect(secondAttempt.order?.receiptReference).toBe(firstAttempt.order?.receiptReference);
    expect(secondAttempt.newStudentBalanceUGX).toBe(21500); // NOT debited a second time!
  });

  it("4. Sequential purchases cannot overspend student wallet", () => {
    // Student 2 has 3,000 UGX. Buys 2,000 UGX cheat sheet -> succeeds (1,000 UGX left)
    const p1 = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-2",
      documentId: "doc-short-2page-summary", // 2,000 UGX
      idempotencyKey: "IDEMP-SEQ-1",
    });
    expect(p1.success).toBe(true);
    expect(p1.newStudentBalanceUGX).toBe(1000);

    // Next tries to buy 3,500 UGX past papers -> must fail
    const p2 = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-2",
      documentId: "doc-csc2101-pastpapers", // 3,500 UGX
      idempotencyKey: "IDEMP-SEQ-2",
    });
    expect(p2.success).toBe(false);
    expect(p2.error).toBe("INSUFFICIENT_FUNDS");
    expect(p2.newStudentBalanceUGX).toBe(1000);
  });

  it("5. Database failure rolls back the transaction cleanly", () => {
    const res = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-1",
      documentId: "doc-csc2101-notes",
      idempotencyKey: "IDEMP-DB-FAIL",
      simulateDbFailure: true,
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("TRANSACTION_ROLLED_BACK_ON_DB_ERROR");

    const studentWallet = dbStore.walletAccounts.find((w) => w.userId === "user-student-1");
    expect(studentWallet?.spendableBalanceUGX).toBe(25000);
  });

  it("6. Commission snapshot is preserved on historical orders even if platform commission setting changes later", () => {
    // Purchase at 15% commission
    const p1 = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-1",
      documentId: "doc-law2105-constitution", // 10,000 UGX
      idempotencyKey: "IDEMP-SNAPSHOT-1",
    });
    expect(p1.order?.platformFeePercent).toBe(15);
    expect(p1.order?.platformFeeUGX).toBe(1500);
    expect(p1.order?.lecturerEarningsUGX).toBe(8500);

    // Admin updates commission policy to 20%
    dbStore.settings.commissionPercent = 20;

    // Historical order must remain untouched at 15% (1,500 UGX)
    const savedOrder = dbStore.orders.find((o) => o.id === p1.order?.id);
    expect(savedOrder?.platformFeePercent).toBe(15);
    expect(savedOrder?.platformFeeUGX).toBe(1500);
  });

  it("7. Pending deposits are NOT spendable, and duplicate webhooks NEVER credit a deposit twice", async () => {
    // Student 2 starts with 3,000 UGX and initiates a 15,000 UGX deposit
    const initRes = await WalletAndLedgerService.initiateDeposit({
      studentId: "user-student-2",
      phoneNumber: "0772123456",
      amountUGX: 15000,
      reference: "DEP-UNIQUE-101",
    });

    expect(initRes.success).toBe(true);
    expect(initRes.deposit?.status).toBe("pending_authorization");

    // While pending, student 2 balance is still 3,000 UGX (cannot buy 10,000 UGX document)
    const prematurePurchase = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-2",
      documentId: "doc-law2105-constitution",
      idempotencyKey: "IDEMP-PREMATURE",
    });
    expect(prematurePurchase.success).toBe(false);
    expect(prematurePurchase.error).toBe("INSUFFICIENT_FUNDS");

    // Webhook 1 confirms deposit
    const wh1 = WalletAndLedgerService.confirmDepositWebhook({
      eventId: "EVT-MTN-9001",
      reference: "DEP-UNIQUE-101",
      provider: "MTN",
      status: "SUCCESSFUL",
      amountUGX: 15000,
    });
    expect(wh1.success).toBe(true);
    expect(wh1.alreadyProcessed).toBe(false);
    expect(wh1.newBalanceUGX).toBe(18000); // 3,000 + 15,000

    // Duplicate Webhook (same eventId OR same deposit reference) arrives
    const wh2 = WalletAndLedgerService.confirmDepositWebhook({
      eventId: "EVT-MTN-9001",
      reference: "DEP-UNIQUE-101",
      provider: "MTN",
      status: "SUCCESSFUL",
      amountUGX: 15000,
    });
    expect(wh2.success).toBe(true);
    expect(wh2.alreadyProcessed).toBe(true);

    const wh3DifferentEventSameRef = WalletAndLedgerService.confirmDepositWebhook({
      eventId: "EVT-MTN-9002",
      reference: "DEP-UNIQUE-101",
      provider: "MTN",
      status: "SUCCESSFUL",
      amountUGX: 15000,
    });
    expect(wh3DifferentEventSameRef.alreadyProcessed).toBe(true);
    expect(wh3DifferentEventSameRef.newBalanceUGX).toBe(18000); // Still 18,000 UGX!
  });

  it("8. Failed student withdrawal releases reserved funds back to spendable balance accurately", () => {
    // Student 1 has 25,000 UGX. Requests 10,000 UGX withdrawal
    const wd = WalletAndLedgerService.initiateStudentWithdrawal({
      studentId: "user-student-1",
      destinationPhone: "0772112233",
      amountUGX: 10000,
      idempotencyKey: "WD-STU-001",
      pin: "1234",
    });

    expect(wd.success).toBe(true);
    expect(wd.spendableBalanceUGX).toBe(15000);
    expect(wd.reservedBalanceUGX).toBe(10000);

    // Provider fails withdrawal -> controlled reversal releases 10,000 UGX back to spendable
    const resolved = WalletAndLedgerService.resolveStudentWithdrawal({
      studentId: "user-student-1",
      withdrawalReference: "WD-STU-001",
      amountUGX: 10000,
      provider: "MTN",
      outcome: "FAILED",
    });

    expect(resolved.success).toBe(true);
    expect(resolved.spendableBalanceUGX).toBe(25000);
    expect(resolved.reservedBalanceUGX).toBe(0);

    const recon = WalletAndLedgerService.generateReconciliationReport();
    expect(recon.isStrictlyBalanced).toBe(true);
  });

  it("9. Provider timeout on lecturer payout preserves processing status and prevents duplicate payout", () => {
    // Lecturer 1 has 17,000 UGX. Requests 15,000 UGX payout
    const req = WalletAndLedgerService.requestLecturerPayout({
      lecturerId: "lec-1",
      amountUGX: 15000,
      idempotencyKey: "PAYOUT-LEC1-W44",
    });
    expect(req.success).toBe(true);
    expect(req.payoutItem?.status).toBe("processing");

    // Provider times out
    const timeoutRes = WalletAndLedgerService.resolveLecturerPayoutItem({
      payoutReference: "PAYOUT-LEC1-W44",
      outcome: "TIMEOUT",
    });
    expect(timeoutRes.payoutItem?.status).toBe("processing");
    expect(timeoutRes.payoutItem?.failureReason).toBe("PROVIDER_TIMEOUT_AWAITING_RECONCILIATION");

    // Retrying with same idempotency key does NOT create a second payout or deduct again
    const retry = WalletAndLedgerService.requestLecturerPayout({
      lecturerId: "lec-1",
      amountUGX: 15000,
      idempotencyKey: "PAYOUT-LEC1-W44",
    });
    expect(retry.payoutItem?.id).toBe(req.payoutItem?.id);

    const lecWallet = dbStore.walletAccounts.find((w) => w.userId === "user-lecturer-1");
    expect(lecWallet?.spendableBalanceUGX).toBe(2000);
    expect(lecWallet?.reservedBalanceUGX).toBe(15000);
  });

  it("10. Refunds create compensating double-entry ledger entries, restore student balance, and revoke entitlement", () => {
    const purchase = WalletAndLedgerService.purchaseDocumentWithWallet({
      studentId: "user-student-1",
      documentId: "doc-csc2101-notes", // 5,000 UGX
      idempotencyKey: "IDEMP-FOR-REFUND",
    });
    expect(purchase.success).toBe(true);
    expect(purchase.newStudentBalanceUGX).toBe(20000);
    expect(purchase.newLecturerBalanceUGX).toBe(21250);

    const orderId = purchase.order!.id;

    // Admin processes refund
    const refundRes = WalletAndLedgerService.processOrderRefund({
      orderId,
      adminId: "user-admin-1",
      reason: "Accidental purchase of wrong course unit verified by support",
    });

    expect(refundRes.success).toBe(true);
    expect(refundRes.refund?.status).toBe("completed");
    expect(refundRes.compensatingTransaction?.type).toBe("refund");

    // Student balance restored to 25,000 UGX; Lecturer balance returned to 17,000 UGX
    const stuWallet = dbStore.walletAccounts.find((w) => w.userId === "user-student-1");
    const lecWallet = dbStore.walletAccounts.find((w) => w.userId === "user-lecturer-1");
    expect(stuWallet?.spendableBalanceUGX).toBe(25000);
    expect(lecWallet?.spendableBalanceUGX).toBe(17000);

    // Entitlement revoked
    const ent = dbStore.entitlements.find((e) => e.orderId === orderId);
    expect(ent?.isActive).toBe(false);

    // Ledger remains 100% balanced
    const recon = WalletAndLedgerService.generateReconciliationReport();
    expect(recon.isStrictlyBalanced).toBe(true);
  });
});

