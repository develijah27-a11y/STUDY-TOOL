import { describe, it, expect } from "vitest";
import { DoubleEntryLedgerEngine } from "@/lib/financial/ledger-service";

describe("Double-Entry Ledger Engine", () => {
  it("validates a balanced purchase transaction (Total Debits == Total Credits)", () => {
    // Student debited 5000 UGX
    // Lecturer credited 4250 UGX
    // Commission credited 750 UGX
    const entries = [
      { debitUGX: 5000, creditUGX: 0 },
      { debitUGX: 0, creditUGX: 4250 },
      { debitUGX: 0, creditUGX: 750 },
    ];

    const result = DoubleEntryLedgerEngine.validatePostingBalance(entries);
    expect(result.isValid).toBe(true);
    expect(result.totalDebits).toBe(5000);
    expect(result.totalCredits).toBe(5000);
    expect(result.error).toBeUndefined();
  });

  it("strictly rejects unbalanced transactions", () => {
    const unbalanced = [
      { debitUGX: 5000, creditUGX: 0 },
      { debitUGX: 0, creditUGX: 4000 }, // Missing 1000 UGX credit
    ];

    const result = DoubleEntryLedgerEngine.validatePostingBalance(unbalanced);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Ledger does not balance");
  });

  it("strictly rejects single-entry transactions", () => {
    const singleEntry = [{ debitUGX: 5000, creditUGX: 0 }];
    const result = DoubleEntryLedgerEngine.validatePostingBalance(singleEntry);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("at least two entries");
  });

  it("strictly rejects zero-value transactions", () => {
    const zeroEntries = [
      { debitUGX: 0, creditUGX: 0 },
      { debitUGX: 0, creditUGX: 0 },
    ];
    const result = DoubleEntryLedgerEngine.validatePostingBalance(zeroEntries);
    expect(result.isValid).toBe(false);
  });

  it("strictly rejects simultaneous debit and credit on same line item", () => {
    const invalidEntry = [
      { debitUGX: 5000, creditUGX: 5000 },
      { debitUGX: 0, creditUGX: 5000 },
    ];
    const result = DoubleEntryLedgerEngine.validatePostingBalance(invalidEntry);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("cannot have both debit and credit positive");
  });

  it("computes authoritative balance correctly for Liability accounts (Credits - Debits)", () => {
    // Student deposits 20,000 (credit to liability)
    // Student spends 5,000 (debit to liability)
    // Student spends 3,000 (debit to liability)
    const entries = [
      { debitUGX: 0, creditUGX: 20000 },
      { debitUGX: 5000, creditUGX: 0 },
      { debitUGX: 3000, creditUGX: 0 },
    ];

    const balance = DoubleEntryLedgerEngine.computeAuthoritativeBalance("liability", entries);
    expect(balance).toBe(12000);
  });

  it("computes authoritative balance correctly for Asset accounts (Debits - Credits)", () => {
    // Clearing account receives 50,000 in MoMo cash (debit to asset)
    // Clearing account pays out 30,000 in lecturer withdrawals (credit to asset)
    const entries = [
      { debitUGX: 50000, creditUGX: 0 },
      { debitUGX: 0, creditUGX: 30000 },
    ];

    const balance = DoubleEntryLedgerEngine.computeAuthoritativeBalance("asset", entries);
    expect(balance).toBe(20000);
  });
});

