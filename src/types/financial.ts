/**
 * Financial Ledger & Wallet types for Uganda Academic Document Marketplace
 *
 * Implements strict Double-Entry Bookkeeping:
 * - Every transaction balances: Total Debits == Total Credits
 * - All amounts are exact integer UGX (Ugandan Shillings) - never binary float
 * - Immutable ledger entries with linked compensating transactions for reversals/refunds
 */

export type AccountType =
  | "asset" // e.g., Provider Clearing Account (MTN/Airtel cash held)
  | "liability" // e.g., Student Wallet Balance, Lecturer Payable Balance
  | "equity" // Platform capital/reserves
  | "revenue" // Platform Commission Revenue
  | "expense"; // Gateway fees, bad debts, payout transmission costs

export type TransactionType =
  | "deposit" // Student deposits UGX into wallet via MTN/Airtel
  | "purchase" // Student purchases document: debits student wallet, credits lecturer wallet & platform commission
  | "lecturer_payout" // Lecturer withdraws earnings to MTN/Airtel MoMo
  | "student_withdrawal" // Student withdraws unused deposit
  | "refund" // Reversal of document purchase
  | "fee_adjustment"; // Operational fee correction

export type TransactionStatus =
  | "pending"
  | "posted"
  | "failed"
  | "reversed";

export interface WalletAccount {
  id: string;
  userId: string;
  walletType: "student" | "lecturer";
  currency: "UGX";
  ledgerAccountId: string;
  spendableBalanceUGX: number; // Reconciled from posted ledger entries
  reservedBalanceUGX: number; // Held for pending payouts/withdrawals
  pinHash?: string; // Hashed PIN for transaction confirmation
  pinAttempts: number;
  isLocked: boolean;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerAccount {
  id: string;
  code: string; // e.g. "1010-PROVIDER-CLEARING", "2010-STUDENT-WALLETS", "2020-LECTURER-PAYABLES", "4010-COMMISSION-REVENUE"
  name: string;
  type: AccountType;
  currency: "UGX";
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface LedgerTransaction {
  id: string;
  reference: string; // Unique idempotency reference (e.g. "TX-DEP-20261106-938210")
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  metadata?: Record<string, unknown>;
  postedAt?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  debitUGX: number; // Positive integer or 0
  creditUGX: number; // Positive integer or 0
  entrySequence: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-UGX-202611-0041"
  studentId: string;
  documentId: string;
  documentVersion: number;
  grossAmountUGX: number;
  platformFeeUGX: number;
  platformFeePercent: number; // Snapshot of policy, e.g. 15
  lecturerEarningsUGX: number;
  status: "pending" | "completed" | "refunded" | "failed";
  ledgerTransactionId: string;
  receiptReference: string;
  createdAt: string;
}

export interface Entitlement {
  id: string;
  studentId: string;
  documentId: string;
  documentVersion: number;
  orderId: string;
  grantedAt: string;
  isActive: boolean;
  revocationReason?: string;
}

export interface DepositAttempt {
  id: string;
  studentId: string;
  reference: string;
  phoneNumber: string; // Uganda format: e.g., "256770123456"
  provider: "MTN" | "AIRTEL";
  amountUGX: number;
  status: "initiated" | "pending_authorization" | "completed" | "failed" | "expired";
  providerTransactionId?: string;
  failureReason?: string;
  ledgerTransactionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PayoutBatch {
  id: string;
  batchReference: string; // e.g. "PAYOUT-BATCH-2026-W44"
  scheduledDate: string;
  totalAmountUGX: number;
  totalLecturers: number;
  status: "draft" | "processing" | "completed" | "partially_failed" | "reconciled";
  executedBy?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PayoutItem {
  id: string;
  batchId?: string;
  lecturerId: string;
  payoutReference: string;
  destinationPhone: string;
  destinationNetwork: "MTN" | "AIRTEL";
  amountUGX: number;
  feeUGX: number;
  netPayoutUGX: number;
  status: "pending" | "processing" | "paid" | "failed" | "reversed";
  providerTransactionId?: string;
  failureReason?: string;
  ledgerTransactionId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface RefundRecord {
  id: string;
  orderId: string;
  studentId: string;
  lecturerId: string;
  amountUGX: number;
  reason: string;
  status: "requested" | "approved" | "completed" | "rejected";
  reviewedBy?: string;
  compensatingTransactionId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CommissionPolicySnapshot {
  appliedPercentage: number; // e.g. 15%
  grossAmountUGX: number;
  platformCommissionUGX: number;
  lecturerNetUGX: number;
  vatOrTaxUGX: number;
  effectiveDate: string;
}

