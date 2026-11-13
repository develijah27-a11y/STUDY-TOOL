import {
  LedgerAccount,
  LedgerTransaction,
  LedgerEntry,
  TransactionType,
  AccountType,
} from "@/types/financial";

export interface LedgerPostingInstruction {
  reference: string;
  type: TransactionType;
  description: string;
  metadata?: Record<string, unknown>;
  entries: Array<{
    accountId: string;
    debitUGX: number;
    creditUGX: number;
  }>;
}

export interface PostingResult {
  transaction: LedgerTransaction;
  entries: LedgerEntry[];
  totalDebitsUGX: number;
  totalCreditsUGX: number;
}

export class DoubleEntryLedgerEngine {
  /**
   * Validates and verifies that a proposed posting is strictly balanced:
   * Total Debits === Total Credits > 0
   */
  static validatePostingBalance(entries: Array<{ debitUGX: number; creditUGX: number }>): {
    isValid: boolean;
    totalDebits: number;
    totalCredits: number;
    error?: string;
  } {
    let totalDebits = 0;
    let totalCredits = 0;

    if (!entries || entries.length < 2) {
      return {
        isValid: false,
        totalDebits: 0,
        totalCredits: 0,
        error: "A valid double-entry transaction must have at least two entries (one debit, one credit)",
      };
    }

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!Number.isInteger(e.debitUGX) || e.debitUGX < 0) {
        return { isValid: false, totalDebits, totalCredits, error: `Invalid non-integer or negative debit at index ${i}` };
      }
      if (!Number.isInteger(e.creditUGX) || e.creditUGX < 0) {
        return { isValid: false, totalDebits, totalCredits, error: `Invalid non-integer or negative credit at index ${i}` };
      }
      if (e.debitUGX > 0 && e.creditUGX > 0) {
        return { isValid: false, totalDebits, totalCredits, error: `Entry at index ${i} cannot have both debit and credit positive` };
      }
      if (e.debitUGX === 0 && e.creditUGX === 0) {
        return { isValid: false, totalDebits, totalCredits, error: `Entry at index ${i} must have either debit or credit positive` };
      }

      totalDebits += e.debitUGX;
      totalCredits += e.creditUGX;
    }

    if (totalDebits !== totalCredits) {
      return {
        isValid: false,
        totalDebits,
        totalCredits,
        error: `Ledger does not balance! Total Debits: ${totalDebits} UGX != Total Credits: ${totalCredits} UGX`,
      };
    }

    if (totalDebits === 0) {
      return { isValid: false, totalDebits: 0, totalCredits: 0, error: "Zero value transactions are not permitted" };
    }

    return { isValid: true, totalDebits, totalCredits };
  }

  /**
   * Computes authoritative balance for an account from its posted ledger entries.
   * In accounting:
   * - Asset / Expense accounts increase with Debit (+ Debit - Credit)
   * - Liability / Equity / Revenue accounts increase with Credit (+ Credit - Debit)
   */
  static computeAuthoritativeBalance(
    accountType: AccountType,
    entries: Array<{ debitUGX: number; creditUGX: number }>
  ): number {
    let balance = 0;
    for (const e of entries) {
      if (accountType === "asset" || accountType === "expense") {
        balance += (e.debitUGX - e.creditUGX);
      } else {
        // liability, equity, revenue
        balance += (e.creditUGX - e.debitUGX);
      }
    }
    return balance;
  }
}

