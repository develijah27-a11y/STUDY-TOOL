import { describe, it, expect, vi, beforeEach } from "vitest";
import { MarzPayProvider, ensureUuidReference, formatMarzPayPhone } from "@/lib/payments/marzpay-adapter";

describe("MarzPayProvider Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("ensureUuidReference", () => {
    it("preserves an existing valid UUID v4", () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      expect(ensureUuidReference(validUuid)).toBe(validUuid);
    });

    it("converts a non-UUID internal string to a valid UUID format", () => {
      const internalRef = "DEP-173155389-4921";
      const converted = ensureUuidReference(internalRef);
      expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(converted)).toBe(true);
    });
  });

  describe("formatMarzPayPhone", () => {
    it("formats standard 077... Uganda number to +256...", () => {
      expect(formatMarzPayPhone("0772123456")).toBe("+256772123456");
    });

    it("formats 25670... Uganda number to +256...", () => {
      expect(formatMarzPayPhone("256701234567")).toBe("+256701234567");
    });

    it("throws on invalid phone numbers", () => {
      expect(() => formatMarzPayPhone("0123456789")).toThrow();
    });
  });

  describe("initiateDeposit", () => {
    it("rejects deposits below UGX 1,000", async () => {
      const provider = new MarzPayProvider("MTN");
      await expect(
        provider.initiateDeposit({
          studentId: "user-student-1",
          phoneNumber: "0772123456",
          amountUGX: 500,
          reference: "123e4567-e89b-12d3-a456-426614174000",
        })
      ).rejects.toThrow("Minimum deposit amount is UGX 1,000");
    });

    it("successfully creates a deposit request via MarzPay API", async () => {
      const provider = new MarzPayProvider("MTN", { mode: "sandbox" });

      const mockResponse = {
        status: "success",
        message: "Collection completed successfully (Sandbox Mode).",
        data: {
          transaction: {
            uuid: "b9b072fd-539c-442a-8692-fb0c46e4c302",
            reference: "8dd40e99-b17c-4ec0-9b61-65aaa7e28c88",
            status: "sandbox",
          },
          collection: {
            amount: { formatted: "1,000.00", raw: 1000, currency: "UGX" },
            provider: "mtn",
            phone_number: "+256772123456",
            mode: "sandbox",
          },
        },
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      } as any);

      const res = await provider.initiateDeposit({
        studentId: "user-student-1",
        phoneNumber: "0772123456",
        amountUGX: 1000,
        reference: "DEP-TEST-123",
      });

      expect(res.reference).toBe("DEP-TEST-123");
      expect(res.providerTransactionId).toBe("b9b072fd-539c-442a-8692-fb0c46e4c302");
      expect(res.status).toBe("pending_authorization");
      expect(res.instructions).toContain("MarzPay Sandbox");
    });
  });

  describe("initiatePayout", () => {
    it("rejects payout below minimum threshold of UGX 10,000", async () => {
      const provider = new MarzPayProvider("MTN");
      const res = await provider.initiatePayout({
        payoutReference: "PAY-123",
        lecturerId: "lec-1",
        destinationPhone: "0772123456",
        destinationNetwork: "MTN",
        amountUGX: 5000,
      });

      expect(res.status).toBe("failed");
      expect(res.failureReason).toContain("UGX 10,000");
    });

    it("handles sandbox IP whitelist gracefully", async () => {
      const provider = new MarzPayProvider("MTN", { mode: "sandbox" });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          message: "IP whitelist is required for this action.",
          error_code: "IP_WHITELIST_REQUIRED",
        }),
      } as any);

      const res = await provider.initiatePayout({
        payoutReference: "123e4567-e89b-12d3-a456-426614174000",
        lecturerId: "lec-1",
        destinationPhone: "0772123456",
        destinationNetwork: "MTN",
        amountUGX: 15000,
      });

      expect(res.status).toBe("processing");
      expect(res.providerTransactionId).toContain("MARZ-SIM");
    });
  });

  describe("verifyWebhook", () => {
    it("verifies and extracts completed MarzPay collection webhook payload", async () => {
      const provider = new MarzPayProvider("MTN", { mode: "sandbox" });

      const payload = {
        event_type: "collection.completed",
        transaction: {
          uuid: "4e7fb3fa-c13a-4b05-8acd-cf60ff68cb94",
          reference: "c97fae8b-9b7f-4192-9f72-6f0859d33e67",
          status: "completed",
          amount: { formatted: "2,000.00", raw: 2000, currency: "UGX" },
          phone_number: "+256772123456",
        },
      };

      const res = await provider.verifyWebhook({}, JSON.stringify(payload));
      expect(res.isValid).toBe(true);
      expect(res.amountUGX).toBe(2000);
      expect(res.provider).toBe("MTN");
      expect(res.status).toBe("SUCCESSFUL");
      expect(res.reference).toBe("c97fae8b-9b7f-4192-9f72-6f0859d33e67");
    });
  });
});

