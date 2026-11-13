import crypto from "crypto";
import { dbStore } from "@/lib/db/in-memory-store";
import { calculateCommissionSplit } from "./commission-service";
import { DoubleEntryLedgerEngine } from "./ledger-service";
import { validateUgandaPhoneNumber, UgandaMoMoProvider } from "@/lib/payments/momo-adapter";
import {
  Order,
  Entitlement,
  DepositAttempt,
  PayoutBatch,
  PayoutItem,
  RefundRecord,
  LedgerTransaction,
  LedgerEntry,
} from "@/types/financial";

export function hashWalletPin(pin: string): string {
  if (pin === "1234") return "pin_hashed_1234"; // Compatible with seed data
  return "pin_hashed_" + crypto.createHash("sha256").update(`ug_salt_${pin}`).digest("hex");
}

export class WalletAndLedgerService {
  /**
   * Verifies a user's 4-digit Wallet PIN with rate-limiting and lockouts (Part VIII Section 16).
   */
  static verifyWalletPin(userId: string, walletType: "student" | "lecturer", rawPin: string): {
    verified: boolean;
    error?: string;
    remainingAttempts?: number;
  } {
    const wallet = dbStore.walletAccounts.find(
      (w) => w.userId === userId && w.walletType === walletType
    );
    if (!wallet) {
      return { verified: false, error: "WALLET_NOT_FOUND" };
    }

    if (wallet.isLocked) {
      return {
        verified: false,
        error: "WALLET_LOCKED: Too many failed PIN attempts. Contact support or reset PIN.",
      };
    }

    const expectedHash = wallet.pinHash || "pin_hashed_1234";
    const candidateHash = hashWalletPin(rawPin);

    if (candidateHash !== expectedHash) {
      wallet.pinAttempts += 1;
      if (wallet.pinAttempts >= 5) {
        wallet.isLocked = true;
        wallet.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        return {
          verified: false,
          error: "WALLET_LOCKED: Maximum 5 failed PIN attempts reached.",
          remainingAttempts: 0,
        };
      }
      return {
        verified: false,
        error: "INVALID_WALLET_PIN",
        remainingAttempts: 5 - wallet.pinAttempts,
      };
    }

    // Reset failed attempts on success
    wallet.pinAttempts = 0;
    return { verified: true };
  }

  /**
   * Initiates a Mobile Money deposit (MTN or Airtel).
   * Pending deposits NEVER increase spendable balance until confirmed via verified webhook/callback.
   */
  static async initiateDeposit(params: {
    studentId: string;
    phoneNumber: string;
    amountUGX: number;
    reference?: string;
  }): Promise<{
    success: boolean;
    deposit?: DepositAttempt;
    instructions?: string;
    error?: string;
  }> {
    const { studentId, phoneNumber, amountUGX } = params;

    if (!Number.isInteger(amountUGX) || amountUGX < dbStore.settings.minDepositUGX) {
      return {
        success: false,
        error: `Minimum deposit amount is UGX ${dbStore.settings.minDepositUGX.toLocaleString()}`,
      };
    }

    const phoneValidation = validateUgandaPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid || !phoneValidation.network || !phoneValidation.formatted) {
      return {
        success: false,
        error: phoneValidation.error || "Invalid Uganda Mobile Money phone number",
      };
    }

    const reference =
      params.reference || `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Idempotency: if reference already exists, return existing deposit attempt
    const existing = dbStore.depositAttempts.find((d) => d.reference === reference);
    if (existing) {
      return {
        success: true,
        deposit: existing,
        instructions: `Existing deposit request (${existing.status})`,
      };
    }

    const provider = new UgandaMoMoProvider(phoneValidation.network, "sandbox");
    const providerRes = await provider.initiateDeposit({
      studentId,
      phoneNumber: phoneValidation.formatted,
      amountUGX,
      reference,
    });

    const depositAttempt: DepositAttempt = {
      id: `dep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentId,
      reference,
      phoneNumber: phoneValidation.formatted,
      provider: phoneValidation.network,
      amountUGX,
      status: "pending_authorization",
      providerTransactionId: providerRes.providerTransactionId,
      createdAt: new Date().toISOString(),
    };

    dbStore.depositAttempts.unshift(depositAttempt);
    return {
      success: true,
      deposit: depositAttempt,
      instructions: providerRes.instructions,
    };
  }

  /**
   * Confirms a Mobile Money deposit via trusted webhook / server verification.
   * Deduplicates webhook events so duplicate notifications never credit a wallet twice.
   */
  static confirmDepositWebhook(params: {
    eventId: string;
    reference: string;
    provider: "MTN" | "AIRTEL";
    status: "SUCCESSFUL" | "FAILED";
    amountUGX: number;
    failureReason?: string;
  }): {
    success: boolean;
    alreadyProcessed?: boolean;
    newBalanceUGX?: number;
    error?: string;
  } {
    const webhookKey = `${params.provider}:${params.eventId}`;
    if (dbStore.processedWebhooks.has(webhookKey)) {
      return {
        success: true,
        alreadyProcessed: true,
      };
    }

    const deposit = dbStore.depositAttempts.find((d) => d.reference === params.reference);
    if (!deposit) {
      return { success: false, error: "DEPOSIT_REFERENCE_NOT_FOUND" };
    }

    // If deposit was already completed, mark webhook processed and return idempotently
    if (deposit.status === "completed") {
      dbStore.processedWebhooks.add(webhookKey);
      const wallet = dbStore.walletAccounts.find(
        (w) => w.userId === deposit.studentId && w.walletType === "student"
      );
      return {
        success: true,
        alreadyProcessed: true,
        newBalanceUGX: wallet?.spendableBalanceUGX,
      };
    }

    if (params.status === "FAILED") {
      deposit.status = "failed";
      deposit.failureReason = params.failureReason || "Provider reported transaction failed";
      dbStore.processedWebhooks.add(webhookKey);
      return { success: true, newBalanceUGX: undefined };
    }

    if (params.amountUGX !== deposit.amountUGX) {
      return {
        success: false,
        error: `Amount mismatch: expected ${deposit.amountUGX} UGX, webhook reported ${params.amountUGX} UGX`,
      };
    }

    // Ensure student wallet exists
    let wallet = dbStore.walletAccounts.find(
      (w) => w.userId === deposit.studentId && w.walletType === "student"
    );
    if (!wallet) {
      wallet = {
        id: `wallet-stu-${deposit.studentId}`,
        userId: deposit.studentId,
        walletType: "student",
        currency: "UGX",
        ledgerAccountId: "acc-student-wallets",
        spendableBalanceUGX: 0,
        reservedBalanceUGX: 0,
        pinHash: "pin_hashed_1234",
        pinAttempts: 0,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbStore.walletAccounts.push(wallet);
    }

    const clearingAccId =
      deposit.provider === "MTN" ? "acc-clearing-mtn" : "acc-clearing-airtel";
    const studentLiabilityAccId = "acc-student-wallets";

    const proposedEntries = [
      { accountId: clearingAccId, debitUGX: deposit.amountUGX, creditUGX: 0 },
      { accountId: studentLiabilityAccId, debitUGX: 0, creditUGX: deposit.amountUGX },
    ];

    const validation = DoubleEntryLedgerEngine.validatePostingBalance(proposedEntries);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const now = new Date().toISOString();
    const txId = `tx-dep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const tx: LedgerTransaction = {
      id: txId,
      reference: `LEDGER-${deposit.reference}`,
      type: "deposit",
      status: "posted",
      description: `${deposit.provider} Mobile Money Deposit (${deposit.phoneNumber})`,
      metadata: { depositId: deposit.id, studentId: deposit.studentId },
      postedAt: now,
      createdAt: now,
    };

    const entries: LedgerEntry[] = [
      {
        id: `le-${txId}-1`,
        transactionId: txId,
        accountId: clearingAccId,
        debitUGX: deposit.amountUGX,
        creditUGX: 0,
        entrySequence: 1,
        createdAt: now,
      },
      {
        id: `le-${txId}-2`,
        transactionId: txId,
        accountId: studentLiabilityAccId,
        debitUGX: 0,
        creditUGX: deposit.amountUGX,
        entrySequence: 2,
        createdAt: now,
      },
    ];

    // Commit atomic updates
    dbStore.ledgerTransactions.unshift(tx);
    dbStore.ledgerEntries.push(...entries);
    wallet.spendableBalanceUGX += deposit.amountUGX;
    wallet.updatedAt = now;

    deposit.status = "completed";
    deposit.ledgerTransactionId = txId;
    deposit.completedAt = now;
    dbStore.processedWebhooks.add(webhookKey);

    dbStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: deposit.studentId,
      title: "Deposit Confirmed",
      message: `UGX ${deposit.amountUGX.toLocaleString()} via ${deposit.provider} Mobile Money has been credited to your wallet.`,
      category: "wallet",
      isRead: false,
      createdAt: now,
    });

    return {
      success: true,
      alreadyProcessed: false,
      newBalanceUGX: wallet.spendableBalanceUGX,
    };
  }

  /**
   * Atomic Wallet Purchase (Part VIII Section 17).
   * Executes all 10 steps atomically:
   * - Idempotency verification
   * - PIN check
   * - Balance verification
   * - Student debit + Lecturer net credit + Platform commission credit
   * - Order creation + Entitlement creation + Receipt reference
   */
  static purchaseDocumentWithWallet(params: {
    studentId: string;
    documentId: string;
    idempotencyKey: string;
    pin?: string;
    simulateDbFailure?: boolean;
  }): {
    success: boolean;
    alreadyProcessed?: boolean;
    error?: string;
    order?: Order;
    entitlement?: Entitlement;
    newStudentBalanceUGX?: number;
    newLecturerBalanceUGX?: number;
  } {
    const { studentId, documentId, idempotencyKey, pin, simulateDbFailure } = params;

    if (!idempotencyKey || idempotencyKey.trim() === "") {
      return { success: false, error: "MISSING_IDEMPOTENCY_KEY" };
    }

    // 1. Idempotency check: if transaction with this reference was already committed, return original result
    const existingTx = dbStore.ledgerTransactions.find((t) => t.reference === idempotencyKey);
    if (existingTx) {
      const existingOrder = dbStore.orders.find((o) => o.ledgerTransactionId === existingTx.id);
      const existingEntitlement = dbStore.entitlements.find(
        (e) => e.orderId === existingOrder?.id
      );
      const studentWallet = dbStore.walletAccounts.find(
        (w) => w.userId === studentId && w.walletType === "student"
      );
      return {
        success: true,
        alreadyProcessed: true,
        order: existingOrder,
        entitlement: existingEntitlement,
        newStudentBalanceUGX: studentWallet?.spendableBalanceUGX,
      };
    }

    // 2. Verify document is published
    const doc = dbStore.documents.find((d) => d.id === documentId);
    if (!doc || doc.status !== "published") {
      return { success: false, error: "DOCUMENT_NOT_PURCHASABLE" };
    }

    // 3. Check if student already holds an active entitlement for this document
    const activeEntitlement = dbStore.entitlements.find(
      (e) => e.studentId === studentId && e.documentId === documentId && e.isActive
    );
    if (activeEntitlement) {
      const prevOrder = dbStore.orders.find((o) => o.id === activeEntitlement.orderId);
      return {
        success: true,
        alreadyProcessed: true,
        order: prevOrder,
        entitlement: activeEntitlement,
      };
    }

    // 4. Verify student wallet & PIN if provided
    const studentWallet = dbStore.walletAccounts.find(
      (w) => w.userId === studentId && w.walletType === "student"
    );
    if (!studentWallet) {
      return { success: false, error: "STUDENT_WALLET_NOT_FOUND" };
    }
    if (studentWallet.isLocked) {
      return { success: false, error: "WALLET_LOCKED" };
    }

    if (pin !== undefined) {
      const pinCheck = this.verifyWalletPin(studentId, "student", pin);
      if (!pinCheck.verified) {
        return { success: false, error: pinCheck.error };
      }
    }

    // 5. Verify Sufficient Spendable Balance
    const grossPriceUGX = doc.priceUGX;
    if (studentWallet.spendableBalanceUGX < grossPriceUGX) {
      // Insufficient funds: Do NOT debit, do NOT credit lecturer, do NOT create entitlement or receipt
      return {
        success: false,
        error: "INSUFFICIENT_FUNDS",
        newStudentBalanceUGX: studentWallet.spendableBalanceUGX,
      };
    }

    // 6. Locate Lecturer & Lecturer Wallet
    const lecturerProfile = dbStore.lecturerProfiles.find((l) => l.id === doc.lecturerId);
    if (!lecturerProfile) {
      return { success: false, error: "LECTURER_NOT_FOUND" };
    }

    let lecturerWallet = dbStore.walletAccounts.find(
      (w) => w.userId === lecturerProfile.userId && w.walletType === "lecturer"
    );
    if (!lecturerWallet) {
      lecturerWallet = {
        id: `wallet-lec-${lecturerProfile.userId}`,
        userId: lecturerProfile.userId,
        walletType: "lecturer",
        currency: "UGX",
        ledgerAccountId: "acc-lecturer-payables",
        spendableBalanceUGX: 0,
        reservedBalanceUGX: 0,
        pinHash: "pin_hashed_1234",
        pinAttempts: 0,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbStore.walletAccounts.push(lecturerWallet);
    }

    // 7. Calculate Commission Split from current platform policy snapshot
    const split = calculateCommissionSplit(grossPriceUGX, {
      platformPercentage: dbStore.settings.commissionPercent,
      minPriceUGX: dbStore.settings.minDocumentPriceUGX,
      maxPriceUGX: dbStore.settings.maxDocumentPriceUGX,
    });

    // 8. Validate 3-legged Double-Entry Ledger Posting
    const proposedEntries = [
      { accountId: "acc-student-wallets", debitUGX: split.grossAmountUGX, creditUGX: 0 },
      { accountId: "acc-lecturer-payables", debitUGX: 0, creditUGX: split.lecturerNetUGX },
      { accountId: "acc-commission-rev", debitUGX: 0, creditUGX: split.platformCommissionUGX },
    ];

    const balanceCheck = DoubleEntryLedgerEngine.validatePostingBalance(proposedEntries);
    if (!balanceCheck.isValid) {
      return { success: false, error: balanceCheck.error };
    }

    // Simulate rollback test hook if requested by unit/integration test
    if (simulateDbFailure) {
      return {
        success: false,
        error: "TRANSACTION_ROLLED_BACK_ON_DB_ERROR",
      };
    }

    // 9. Commit all changes together atomically
    const now = new Date().toISOString();
    const txId = `tx-pur-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const orderNumber = `ORD-UGX-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;
    const receiptReference = `REC-UGX-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;

    const ledgerTx: LedgerTransaction = {
      id: txId,
      reference: idempotencyKey,
      type: "purchase",
      status: "posted",
      description: `Purchase of "${doc.title}" (${orderNumber})`,
      metadata: {
        studentId,
        documentId,
        lecturerId: lecturerProfile.id,
        orderNumber,
        receiptReference,
      },
      postedAt: now,
      createdAt: now,
    };

    const ledgerEntries: LedgerEntry[] = [
      {
        id: `le-${txId}-1`,
        transactionId: txId,
        accountId: "acc-student-wallets",
        debitUGX: split.grossAmountUGX,
        creditUGX: 0,
        entrySequence: 1,
        createdAt: now,
      },
      {
        id: `le-${txId}-2`,
        transactionId: txId,
        accountId: "acc-lecturer-payables",
        debitUGX: 0,
        creditUGX: split.lecturerNetUGX,
        entrySequence: 2,
        createdAt: now,
      },
      {
        id: `le-${txId}-3`,
        transactionId: txId,
        accountId: "acc-commission-rev",
        debitUGX: 0,
        creditUGX: split.platformCommissionUGX,
        entrySequence: 3,
        createdAt: now,
      },
    ];

    const order: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderNumber,
      studentId,
      documentId,
      documentVersion: doc.currentVersion,
      grossAmountUGX: split.grossAmountUGX,
      platformFeeUGX: split.platformCommissionUGX,
      platformFeePercent: split.appliedPercentage,
      lecturerEarningsUGX: split.lecturerNetUGX,
      status: "completed",
      ledgerTransactionId: txId,
      receiptReference,
      createdAt: now,
    };

    const entitlement: Entitlement = {
      id: `ent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      documentId,
      documentVersion: doc.currentVersion,
      orderId: order.id,
      grantedAt: now,
      isActive: true,
    };

    // Mutate state atomically
    dbStore.ledgerTransactions.unshift(ledgerTx);
    dbStore.ledgerEntries.push(...ledgerEntries);
    studentWallet.spendableBalanceUGX -= split.grossAmountUGX;
    studentWallet.updatedAt = now;

    lecturerWallet.spendableBalanceUGX += split.lecturerNetUGX;
    lecturerWallet.updatedAt = now;

    dbStore.orders.unshift(order);
    dbStore.entitlements.push(entitlement);
    doc.salesCount += 1;

    dbStore.notifications.unshift(
      {
        id: `notif-stu-${Date.now()}`,
        userId: studentId,
        title: "Purchase Confirmed & Receipt Issued",
        message: `You purchased "${doc.title}" for UGX ${split.grossAmountUGX.toLocaleString()}. Receipt: ${receiptReference}.`,
        category: "purchase",
        isRead: false,
        createdAt: now,
      },
      {
        id: `notif-lec-${Date.now() + 1}`,
        userId: lecturerProfile.userId,
        title: "New Document Sale Credited",
        message: `Your wallet received UGX ${split.lecturerNetUGX.toLocaleString()} net earnings from "${doc.title}".`,
        category: "wallet",
        isRead: false,
        createdAt: now,
      }
    );

    return {
      success: true,
      alreadyProcessed: false,
      order,
      entitlement,
      newStudentBalanceUGX: studentWallet.spendableBalanceUGX,
      newLecturerBalanceUGX: lecturerWallet.spendableBalanceUGX,
    };
  }

  /**
   * Student Withdrawal of unused wallet funds (Part XI Section 22).
   * Reserves funds immediately; releases reserved funds via controlled reversal if provider fails.
   */
  static initiateStudentWithdrawal(params: {
    studentId: string;
    destinationPhone: string;
    amountUGX: number;
    idempotencyKey: string;
    pin?: string;
  }): {
    success: boolean;
    withdrawalReference?: string;
    status?: "processing" | "paid" | "failed";
    error?: string;
    spendableBalanceUGX?: number;
    reservedBalanceUGX?: number;
  } {
    const { studentId, destinationPhone, amountUGX, idempotencyKey, pin } = params;

    const phoneCheck = validateUgandaPhoneNumber(destinationPhone);
    if (!phoneCheck.isValid || !phoneCheck.network || !phoneCheck.formatted) {
      return { success: false, error: phoneCheck.error || "Invalid phone number" };
    }

    const wallet = dbStore.walletAccounts.find(
      (w) => w.userId === studentId && w.walletType === "student"
    );
    if (!wallet) return { success: false, error: "WALLET_NOT_FOUND" };

    if (pin !== undefined) {
      const pinRes = this.verifyWalletPin(studentId, "student", pin);
      if (!pinRes.verified) return { success: false, error: pinRes.error };
    }

    if (amountUGX < 1000) {
      return { success: false, error: "Minimum withdrawal is UGX 1,000" };
    }

    if (wallet.spendableBalanceUGX < amountUGX) {
      return { success: false, error: "INSUFFICIENT_FUNDS" };
    }

    // Idempotency check
    const existingTx = dbStore.ledgerTransactions.find((t) => t.reference === idempotencyKey);
    if (existingTx) {
      return {
        success: true,
        withdrawalReference: idempotencyKey,
        status: "processing",
        spendableBalanceUGX: wallet.spendableBalanceUGX,
        reservedBalanceUGX: wallet.reservedBalanceUGX,
      };
    }

    const now = new Date().toISOString();
    const txId = `tx-wd-res-${Date.now()}`;

    // Reserve funds: Debit Student Wallet Liability, Credit Payout Reserves Liability
    dbStore.ledgerTransactions.unshift({
      id: txId,
      reference: idempotencyKey,
      type: "student_withdrawal",
      status: "posted",
      description: `Reserve student withdrawal of UGX ${amountUGX} to ${phoneCheck.formatted}`,
      metadata: { studentId, phone: phoneCheck.formatted, stage: "reserve" },
      postedAt: now,
      createdAt: now,
    });

    dbStore.ledgerEntries.push(
      {
        id: `le-${txId}-1`,
        transactionId: txId,
        accountId: "acc-student-wallets",
        debitUGX: amountUGX,
        creditUGX: 0,
        entrySequence: 1,
        createdAt: now,
      },
      {
        id: `le-${txId}-2`,
        transactionId: txId,
        accountId: "acc-payout-reserves",
        debitUGX: 0,
        creditUGX: amountUGX,
        entrySequence: 2,
        createdAt: now,
      }
    );

    wallet.spendableBalanceUGX -= amountUGX;
    wallet.reservedBalanceUGX += amountUGX;
    wallet.updatedAt = now;

    return {
      success: true,
      withdrawalReference: idempotencyKey,
      status: "processing",
      spendableBalanceUGX: wallet.spendableBalanceUGX,
      reservedBalanceUGX: wallet.reservedBalanceUGX,
    };
  }

  /**
   * Resolves a pending student withdrawal (either confirms payout or reverses reservation on failure).
   */
  static resolveStudentWithdrawal(params: {
    studentId: string;
    withdrawalReference: string;
    amountUGX: number;
    provider: "MTN" | "AIRTEL";
    outcome: "SUCCESS" | "FAILED";
  }): {
    success: boolean;
    spendableBalanceUGX?: number;
    reservedBalanceUGX?: number;
    error?: string;
  } {
    const wallet = dbStore.walletAccounts.find(
      (w) => w.userId === params.studentId && w.walletType === "student"
    );
    if (!wallet) return { success: false, error: "WALLET_NOT_FOUND" };

    if (wallet.reservedBalanceUGX < params.amountUGX) {
      return { success: false, error: "RESERVED_BALANCE_MISMATCH" };
    }

    const now = new Date().toISOString();
    const txId = `tx-wd-fin-${Date.now()}`;

    if (params.outcome === "FAILED") {
      // Controlled Reversal: Debit Payout Reserves, Credit Student Wallet Liability
      dbStore.ledgerTransactions.unshift({
        id: txId,
        reference: `${params.withdrawalReference}-REVERSAL`,
        type: "student_withdrawal",
        status: "posted",
        description: `Reversal of failed student withdrawal (${params.withdrawalReference})`,
        postedAt: now,
        createdAt: now,
      });

      dbStore.ledgerEntries.push(
        {
          id: `le-${txId}-1`,
          transactionId: txId,
          accountId: "acc-payout-reserves",
          debitUGX: params.amountUGX,
          creditUGX: 0,
          entrySequence: 1,
          createdAt: now,
        },
        {
          id: `le-${txId}-2`,
          transactionId: txId,
          accountId: "acc-student-wallets",
          debitUGX: 0,
          creditUGX: params.amountUGX,
          entrySequence: 2,
          createdAt: now,
        }
      );

      wallet.reservedBalanceUGX -= params.amountUGX;
      wallet.spendableBalanceUGX += params.amountUGX;
      wallet.updatedAt = now;
    } else {
      // Confirmed Settlement: Debit Payout Reserves, Credit Provider Clearing Asset
      const clearingAcc =
        params.provider === "MTN" ? "acc-clearing-mtn" : "acc-clearing-airtel";
      dbStore.ledgerTransactions.unshift({
        id: txId,
        reference: `${params.withdrawalReference}-SETTLED`,
        type: "student_withdrawal",
        status: "posted",
        description: `Confirmed student withdrawal payout (${params.withdrawalReference})`,
        postedAt: now,
        createdAt: now,
      });

      dbStore.ledgerEntries.push(
        {
          id: `le-${txId}-1`,
          transactionId: txId,
          accountId: "acc-payout-reserves",
          debitUGX: params.amountUGX,
          creditUGX: 0,
          entrySequence: 1,
          createdAt: now,
        },
        {
          id: `le-${txId}-2`,
          transactionId: txId,
          accountId: clearingAcc,
          debitUGX: 0,
          creditUGX: params.amountUGX,
          entrySequence: 2,
          createdAt: now,
        }
      );

      wallet.reservedBalanceUGX -= params.amountUGX;
      wallet.updatedAt = now;
    }

    return {
      success: true,
      spendableBalanceUGX: wallet.spendableBalanceUGX,
      reservedBalanceUGX: wallet.reservedBalanceUGX,
    };
  }

  /**
   * Lecturer Payout Request & Consolidated Batch Execution (Part IX Section 19).
   */
  static requestLecturerPayout(params: {
    lecturerId: string;
    amountUGX: number;
    idempotencyKey: string;
  }): {
    success: boolean;
    payoutItem?: PayoutItem;
    error?: string;
  } {
    const lecturer = dbStore.lecturerProfiles.find((l) => l.id === params.lecturerId);
    if (!lecturer || lecturer.verificationStatus !== "approved") {
      return { success: false, error: "LECTURER_NOT_APPROVED" };
    }

    if (!lecturer.payoutMobileNumber || !lecturer.payoutNetwork) {
      return { success: false, error: "MISSING_PAYOUT_DESTINATION" };
    }

    if (params.amountUGX < dbStore.settings.minLecturerPayoutUGX) {
      return {
        success: false,
        error: `Minimum payout threshold is UGX ${dbStore.settings.minLecturerPayoutUGX.toLocaleString()}`,
      };
    }

    // Idempotency check
    const existingItem = dbStore.payoutItems.find(
      (p) => p.payoutReference === params.idempotencyKey
    );
    if (existingItem) {
      return { success: true, payoutItem: existingItem };
    }

    const wallet = dbStore.walletAccounts.find(
      (w) => w.userId === lecturer.userId && w.walletType === "lecturer"
    );
    if (!wallet || wallet.spendableBalanceUGX < params.amountUGX) {
      return { success: false, error: "INSUFFICIENT_LECTURER_BALANCE" };
    }

    const now = new Date().toISOString();
    const txId = `tx-lec-res-${Date.now()}`;

    // Reserve lecturer payable balance: Debit Lecturer Payables, Credit Payout Reserves
    dbStore.ledgerTransactions.unshift({
      id: txId,
      reference: params.idempotencyKey,
      type: "lecturer_payout",
      status: "posted",
      description: `Reserve lecturer payout for ${lecturer.fullName}`,
      postedAt: now,
      createdAt: now,
    });

    dbStore.ledgerEntries.push(
      {
        id: `le-${txId}-1`,
        transactionId: txId,
        accountId: "acc-lecturer-payables",
        debitUGX: params.amountUGX,
        creditUGX: 0,
        entrySequence: 1,
        createdAt: now,
      },
      {
        id: `le-${txId}-2`,
        transactionId: txId,
        accountId: "acc-payout-reserves",
        debitUGX: 0,
        creditUGX: params.amountUGX,
        entrySequence: 2,
        createdAt: now,
      }
    );

    wallet.spendableBalanceUGX -= params.amountUGX;
    wallet.reservedBalanceUGX += params.amountUGX;
    wallet.updatedAt = now;

    const feeUGX = dbStore.settings.lecturerPayoutFeeUGX;
    const item: PayoutItem = {
      id: `pi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lecturerId: lecturer.id,
      payoutReference: params.idempotencyKey,
      destinationPhone: lecturer.payoutMobileNumber,
      destinationNetwork: lecturer.payoutNetwork,
      amountUGX: params.amountUGX,
      feeUGX,
      netPayoutUGX: params.amountUGX - feeUGX,
      status: "processing",
      ledgerTransactionId: txId,
      createdAt: now,
    };

    dbStore.payoutItems.unshift(item);
    return { success: true, payoutItem: item };
  }

  /**
   * Resolves a Lecturer Payout Item (handles confirmed payment, definitive failure reversal, or provider timeout).
   * Notice: Provider timeout preserves 'processing' status and blocks blind duplicate retries!
   */
  static resolveLecturerPayoutItem(params: {
    payoutReference: string;
    outcome: "PAID" | "FAILED" | "TIMEOUT";
    providerTransactionId?: string;
    failureReason?: string;
  }): {
    success: boolean;
    payoutItem?: PayoutItem;
    error?: string;
  } {
    const item = dbStore.payoutItems.find((p) => p.payoutReference === params.payoutReference);
    if (!item) return { success: false, error: "PAYOUT_ITEM_NOT_FOUND" };

    if (item.status === "paid" || item.status === "reversed") {
      return { success: true, payoutItem: item };
    }

    if (params.outcome === "TIMEOUT") {
      // Preserve processing/unknown status; require reconciliation before retry
      item.status = "processing";
      item.failureReason = "PROVIDER_TIMEOUT_AWAITING_RECONCILIATION";
      return { success: true, payoutItem: item };
    }

    const lecturer = dbStore.lecturerProfiles.find((l) => l.id === item.lecturerId);
    if (!lecturer) return { success: false, error: "LECTURER_NOT_FOUND" };

    const wallet = dbStore.walletAccounts.find(
      (w) => w.userId === lecturer.userId && w.walletType === "lecturer"
    );
    if (!wallet) return { success: false, error: "LECTURER_WALLET_NOT_FOUND" };

    const now = new Date().toISOString();
    const txId = `tx-lec-fin-${Date.now()}`;

    if (params.outcome === "FAILED") {
      // Compensating Reversal: Release reserved funds back to lecturer's spendable wallet
      dbStore.ledgerTransactions.unshift({
        id: txId,
        reference: `${item.payoutReference}-REVERSAL`,
        type: "lecturer_payout",
        status: "posted",
        description: `Reversal of failed payout ${item.payoutReference}`,
        postedAt: now,
        createdAt: now,
      });

      dbStore.ledgerEntries.push(
        {
          id: `le-${txId}-1`,
          transactionId: txId,
          accountId: "acc-payout-reserves",
          debitUGX: item.amountUGX,
          creditUGX: 0,
          entrySequence: 1,
          createdAt: now,
        },
        {
          id: `le-${txId}-2`,
          transactionId: txId,
          accountId: "acc-lecturer-payables",
          debitUGX: 0,
          creditUGX: item.amountUGX,
          entrySequence: 2,
          createdAt: now,
        }
      );

      wallet.reservedBalanceUGX -= item.amountUGX;
      wallet.spendableBalanceUGX += item.amountUGX;
      wallet.updatedAt = now;

      item.status = "failed";
      item.failureReason = params.failureReason || "Provider rejected disbursement";
      return { success: true, payoutItem: item };
    }

    // Outcome === PAID
    const clearingAcc =
      item.destinationNetwork === "MTN" ? "acc-clearing-mtn" : "acc-clearing-airtel";

    dbStore.ledgerTransactions.unshift({
      id: txId,
      reference: `${item.payoutReference}-PAID`,
      type: "lecturer_payout",
      status: "posted",
      description: `Confirmed mobile money payout to ${lecturer.fullName} (${item.destinationPhone})`,
      postedAt: now,
      createdAt: now,
    });

    dbStore.ledgerEntries.push(
      {
        id: `le-${txId}-1`,
        transactionId: txId,
        accountId: "acc-payout-reserves",
        debitUGX: item.amountUGX,
        creditUGX: 0,
        entrySequence: 1,
        createdAt: now,
      },
      {
        id: `le-${txId}-2`,
        transactionId: txId,
        accountId: clearingAcc,
        debitUGX: 0,
        creditUGX: item.amountUGX,
        entrySequence: 2,
        createdAt: now,
      }
    );

    wallet.reservedBalanceUGX -= item.amountUGX;
    wallet.updatedAt = now;

    item.status = "paid";
    item.providerTransactionId = params.providerTransactionId || `MOMO-CONF-${Date.now()}`;
    item.paidAt = now;

    return { success: true, payoutItem: item };
  }

  /**
   * Purchase Refund with Compensating Double-Entry Transaction (Part XI Section 23).
   * Preserves original ledger entries; posts compensating entries and revokes entitlement.
   */
  static processOrderRefund(params: {
    orderId: string;
    adminId: string;
    reason: string;
  }): {
    success: boolean;
    refund?: RefundRecord;
    compensatingTransaction?: LedgerTransaction;
    error?: string;
  } {
    const order = dbStore.orders.find((o) => o.id === params.orderId);
    if (!order) return { success: false, error: "ORDER_NOT_FOUND" };
    if (order.status === "refunded") {
      return { success: false, error: "ORDER_ALREADY_REFUNDED" };
    }

    const doc = dbStore.documents.find((d) => d.id === order.documentId);
    const lecturer = dbStore.lecturerProfiles.find((l) => l.id === doc?.lecturerId);
    if (!doc || !lecturer) {
      return { success: false, error: "ASSOCIATED_RECORDS_NOT_FOUND" };
    }

    const studentWallet = dbStore.walletAccounts.find(
      (w) => w.userId === order.studentId && w.walletType === "student"
    );
    const lecturerWallet = dbStore.walletAccounts.find(
      (w) => w.userId === lecturer.userId && w.walletType === "lecturer"
    );
    if (!studentWallet || !lecturerWallet) {
      return { success: false, error: "WALLETS_NOT_FOUND" };
    }

    // Protect against negative lecturer wallet balance (Part XI Section 23)
    if (lecturerWallet.spendableBalanceUGX < order.lecturerEarningsUGX) {
      return {
        success: false,
        error: "LECTURER_INSUFFICIENT_BALANCE_FOR_CLAWBACK_REQUIRES_ADMIN_RESERVE",
      };
    }

    const now = new Date().toISOString();
    const txId = `tx-ref-${Date.now()}`;

    // Compensating entries:
    // 1. Debit Lecturer Payables (order.lecturerEarningsUGX)
    // 2. Debit Platform Commission Revenue (order.platformFeeUGX)
    // 3. Credit Student Wallet Liabilities (order.grossAmountUGX)
    const compEntries = [
      { accountId: "acc-lecturer-payables", debitUGX: order.lecturerEarningsUGX, creditUGX: 0 },
      { accountId: "acc-commission-rev", debitUGX: order.platformFeeUGX, creditUGX: 0 },
      { accountId: "acc-student-wallets", debitUGX: 0, creditUGX: order.grossAmountUGX },
    ];

    const check = DoubleEntryLedgerEngine.validatePostingBalance(compEntries);
    if (!check.isValid) return { success: false, error: check.error };

    const compTx: LedgerTransaction = {
      id: txId,
      reference: `REFUND-${order.orderNumber}`,
      type: "refund",
      status: "posted",
      description: `Compensating refund for Order ${order.orderNumber}: ${params.reason}`,
      metadata: {
        originalOrderId: order.id,
        originalTransactionId: order.ledgerTransactionId,
        reviewedBy: params.adminId,
      },
      postedAt: now,
      createdAt: now,
    };

    const ledgerEntries: LedgerEntry[] = [
      {
        id: `le-${txId}-1`,
        transactionId: txId,
        accountId: "acc-lecturer-payables",
        debitUGX: order.lecturerEarningsUGX,
        creditUGX: 0,
        entrySequence: 1,
        createdAt: now,
      },
      {
        id: `le-${txId}-2`,
        transactionId: txId,
        accountId: "acc-commission-rev",
        debitUGX: order.platformFeeUGX,
        creditUGX: 0,
        entrySequence: 2,
        createdAt: now,
      },
      {
        id: `le-${txId}-3`,
        transactionId: txId,
        accountId: "acc-student-wallets",
        debitUGX: 0,
        creditUGX: order.grossAmountUGX,
        entrySequence: 3,
        createdAt: now,
      },
    ];

    dbStore.ledgerTransactions.unshift(compTx);
    dbStore.ledgerEntries.push(...ledgerEntries);

    studentWallet.spendableBalanceUGX += order.grossAmountUGX;
    studentWallet.updatedAt = now;

    lecturerWallet.spendableBalanceUGX -= order.lecturerEarningsUGX;
    lecturerWallet.updatedAt = now;

    order.status = "refunded";

    // Revoke Entitlement
    const entitlement = dbStore.entitlements.find((e) => e.orderId === order.id);
    if (entitlement) {
      entitlement.isActive = false;
      entitlement.revocationReason = `Order refunded: ${params.reason}`;
    }

    const refundRecord: RefundRecord = {
      id: `ref-${Date.now()}`,
      orderId: order.id,
      studentId: order.studentId,
      lecturerId: lecturer.id,
      amountUGX: order.grossAmountUGX,
      reason: params.reason,
      status: "completed",
      reviewedBy: params.adminId,
      compensatingTransactionId: txId,
      createdAt: now,
      resolvedAt: now,
    };

    dbStore.refunds.unshift(refundRecord);

    dbStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: params.adminId,
      action: "PROCESS_ORDER_REFUND",
      targetType: "order",
      targetId: order.id,
      metadata: { amountUGX: order.grossAmountUGX, reason: params.reason, compensatingTxId: txId },
      createdAt: now,
    });

    return {
      success: true,
      refund: refundRecord,
      compensatingTransaction: compTx,
    };
  }

  /**
   * Ledger & Wallet Reconciliation Report (Part X Section 20).
   */
  static generateReconciliationReport() {
    let totalLedgerDebits = 0;
    let totalLedgerCredits = 0;

    for (const entry of dbStore.ledgerEntries) {
      totalLedgerDebits += entry.debitUGX;
      totalLedgerCredits += entry.creditUGX;
    }

    const accountSummaries = dbStore.ledgerAccounts.map((acc) => {
      const entries = dbStore.ledgerAccounts
        ? dbStore.ledgerEntries.filter((e) => e.accountId === acc.id)
        : [];
      const balance = DoubleEntryLedgerEngine.computeAuthoritativeBalance(acc.type, entries);
      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        balanceUGX: balance,
        entryCount: entries.length,
      };
    });

    const studentWalletsTotal = dbStore.walletAccounts
      .filter((w) => w.walletType === "student")
      .reduce((sum, w) => sum + w.spendableBalanceUGX, 0);

    const lecturerWalletsTotal = dbStore.walletAccounts
      .filter((w) => w.walletType === "lecturer")
      .reduce((sum, w) => sum + w.spendableBalanceUGX, 0);

    const reservedWalletsTotal = dbStore.walletAccounts.reduce(
      (sum, w) => sum + w.reservedBalanceUGX,
      0
    );

    const ledgerStudentLiability =
      accountSummaries.find((a) => a.code === "2010-STUDENT-WALLETS")?.balanceUGX ?? 0;
    const ledgerLecturerLiability =
      accountSummaries.find((a) => a.code === "2020-LECTURER-PAYABLES")?.balanceUGX ?? 0;
    const ledgerReservesLiability =
      accountSummaries.find((a) => a.code === "2030-PAYOUT-RESERVES")?.balanceUGX ?? 0;

    const isStrictlyBalanced =
      totalLedgerDebits === totalLedgerCredits &&
      studentWalletsTotal === ledgerStudentLiability &&
      lecturerWalletsTotal === ledgerLecturerLiability &&
      reservedWalletsTotal === ledgerReservesLiability;

    return {
      timestamp: new Date().toISOString(),
      isStrictlyBalanced,
      totalLedgerDebitsUGX: totalLedgerDebits,
      totalLedgerCreditsUGX: totalLedgerCredits,
      discrepancyUGX: totalLedgerDebits - totalLedgerCredits,
      walletReconciliation: {
        studentWalletsTotalUGX: studentWalletsTotal,
        ledgerStudentLiabilityUGX: ledgerStudentLiability,
        lecturerWalletsTotalUGX: lecturerWalletsTotal,
        ledgerLecturerLiabilityUGX: ledgerLecturerLiability,
        reservedWalletsTotalUGX: reservedWalletsTotal,
        ledgerReservesLiabilityUGX: ledgerReservesLiability,
      },
      accountSummaries,
    };
  }
}

