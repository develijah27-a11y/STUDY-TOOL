import { describe, it, expect } from "vitest";
import { calculateCommissionSplit, DEFAULT_COMMISSION_POLICY } from "@/lib/financial/commission-service";

describe("Commission Service (Exact Integer UGX Calculations)", () => {
  it("correctly splits standard representative price: UGX 2,000 at 15%", () => {
    const split = calculateCommissionSplit(2000, DEFAULT_COMMISSION_POLICY);
    expect(split.grossAmountUGX).toBe(2000);
    expect(split.platformCommissionUGX).toBe(300); // 15% of 2000 = 300
    expect(split.lecturerNetUGX).toBe(1700); // 85% of 2000 = 1700
    expect(split.platformCommissionUGX + split.lecturerNetUGX).toBe(2000);
  });

  it("correctly splits representative price: UGX 5,000 at 15%", () => {
    const split = calculateCommissionSplit(5000, DEFAULT_COMMISSION_POLICY);
    expect(split.grossAmountUGX).toBe(5000);
    expect(split.platformCommissionUGX).toBe(750);
    expect(split.lecturerNetUGX).toBe(4250);
    expect(split.platformCommissionUGX + split.lecturerNetUGX).toBe(5000);
  });

  it("correctly splits representative price: UGX 10,000 at 15%", () => {
    const split = calculateCommissionSplit(10000, DEFAULT_COMMISSION_POLICY);
    expect(split.grossAmountUGX).toBe(10000);
    expect(split.platformCommissionUGX).toBe(1500);
    expect(split.lecturerNetUGX).toBe(8500);
    expect(split.platformCommissionUGX + split.lecturerNetUGX).toBe(10000);
  });

  it("correctly splits representative price: UGX 20,000 at 15%", () => {
    const split = calculateCommissionSplit(20000, DEFAULT_COMMISSION_POLICY);
    expect(split.grossAmountUGX).toBe(20000);
    expect(split.platformCommissionUGX).toBe(3000);
    expect(split.lecturerNetUGX).toBe(17000);
    expect(split.platformCommissionUGX + split.lecturerNetUGX).toBe(20000);
  });

  it("handles odd prices with floor rounding without losing shillings", () => {
    // 15% of 3333 is 499.95 -> 499 platform, 2834 lecturer
    const split = calculateCommissionSplit(3333, DEFAULT_COMMISSION_POLICY);
    expect(split.platformCommissionUGX).toBe(499);
    expect(split.lecturerNetUGX).toBe(2834);
    expect(split.platformCommissionUGX + split.lecturerNetUGX).toBe(3333);
  });

  it("rejects prices below minimum UGX 500", () => {
    expect(() => calculateCommissionSplit(400, DEFAULT_COMMISSION_POLICY)).toThrow(
      "below minimum allowed"
    );
  });

  it("rejects prices above maximum UGX 100,000", () => {
    expect(() => calculateCommissionSplit(150000, DEFAULT_COMMISSION_POLICY)).toThrow(
      "exceeds maximum allowed"
    );
  });

  it("rejects non-integer amounts", () => {
    expect(() => calculateCommissionSplit(2500.5, DEFAULT_COMMISSION_POLICY)).toThrow(
      "must be a positive integer"
    );
  });
});

