import { describe, it, expect } from "vitest";
import { validateUgandaPhoneNumber, UgandaMoMoProvider } from "@/lib/payments/momo-adapter";

describe("Uganda Mobile Money Provider Adapter", () => {
  describe("Phone Number Validation", () => {
    it("recognizes MTN Uganda numbers with standard international prefix (25677...)", () => {
      const res = validateUgandaPhoneNumber("256772123456");
      expect(res.isValid).toBe(true);
      expect(res.network).toBe("MTN");
      expect(res.formatted).toBe("256772123456");
    });

    it("normalizes local 077... / 078... format to 25677...", () => {
      const res = validateUgandaPhoneNumber("0782123456");
      expect(res.isValid).toBe(true);
      expect(res.network).toBe("MTN");
      expect(res.formatted).toBe("256782123456");
    });

    it("recognizes Airtel Uganda numbers (070..., 075...)", () => {
      const res = validateUgandaPhoneNumber("0701987654");
      expect(res.isValid).toBe(true);
      expect(res.network).toBe("AIRTEL");
      expect(res.formatted).toBe("256701987654");
    });

    it("rejects unsupported telecom operators or invalid digit lengths", () => {
      const short = validateUgandaPhoneNumber("077123");
      expect(short.isValid).toBe(false);

      const invalidPrefix = validateUgandaPhoneNumber("0712123456");
      expect(invalidPrefix.isValid).toBe(false);
      expect(invalidPrefix.error).toContain("does not belong to a supported Uganda Mobile Money operator");
    });
  });

  describe("Deposit Initiation", () => {
    it("initiates a deposit with pending status and clear USSD instructions", async () => {
      const provider = new UgandaMoMoProvider("MTN", "sandbox");
      const res = await provider.initiateDeposit({
        studentId: "student-123",
        phoneNumber: "0772001122",
        amountUGX: 5000,
        reference: "DEP-TEST-001",
      });

      expect(res.reference).toBe("DEP-TEST-001");
      expect(res.status).toBe("pending_authorization");
      expect(res.instructions).toContain("MTN Mobile Money PIN");
      expect(res.providerTransactionId).toContain("MTN-DEP-");
    });

    it("rejects deposits below minimum UGX 1,000", async () => {
      const provider = new UgandaMoMoProvider("AIRTEL", "sandbox");
      await expect(
        provider.initiateDeposit({
          studentId: "student-123",
          phoneNumber: "0701001122",
          amountUGX: 500,
          reference: "DEP-TEST-002",
        })
      ).rejects.toThrow("Minimum deposit amount is UGX 1,000");
    });
  });

  describe("Payout Initiation", () => {
    it("rejects payouts below threshold of UGX 10,000", async () => {
      const provider = new UgandaMoMoProvider("MTN", "sandbox");
      const res = await provider.initiatePayout({
        payoutReference: "PAY-TEST-001",
        lecturerId: "lecturer-123",
        destinationPhone: "0772001122",
        destinationNetwork: "MTN",
        amountUGX: 5000,
      });

      expect(res.status).toBe("failed");
      expect(res.failureReason).toContain("below minimum payout threshold");
    });

    it("accepts valid payout above threshold and marks processing", async () => {
      const provider = new UgandaMoMoProvider("MTN", "sandbox");
      const res = await provider.initiatePayout({
        payoutReference: "PAY-TEST-002",
        lecturerId: "lecturer-123",
        destinationPhone: "0772001122",
        destinationNetwork: "MTN",
        amountUGX: 25000,
      });

      expect(res.status).toBe("processing");
      expect(res.providerTransactionId).toContain("MTN-PAY-");
    });
  });
});

