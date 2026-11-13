import { CommissionPolicySnapshot } from "@/types/financial";

export interface CommissionPolicyConfig {
  platformPercentage: number; // default 15%
  minPriceUGX: number; // default 500
  maxPriceUGX: number; // default 100,000
}

export const DEFAULT_COMMISSION_POLICY: CommissionPolicyConfig = {
  platformPercentage: 15,
  minPriceUGX: 500,
  maxPriceUGX: 100000,
};

/**
 * Calculates financial distribution between Platform and Lecturer.
 * Guarantees exact integer arithmetic:
 * grossAmountUGX === platformCommissionUGX + lecturerNetUGX
 * No binary floating point inaccuracies or disappearing shillings.
 */
export function calculateCommissionSplit(
  grossAmountUGX: number,
  policy: CommissionPolicyConfig = DEFAULT_COMMISSION_POLICY
): CommissionPolicySnapshot {
  if (!Number.isInteger(grossAmountUGX) || grossAmountUGX < 0) {
    throw new Error(`Gross amount must be a positive integer in UGX, received: ${grossAmountUGX}`);
  }

  if (grossAmountUGX < policy.minPriceUGX) {
    throw new Error(`Price UGX ${grossAmountUGX} is below minimum allowed UGX ${policy.minPriceUGX}`);
  }

  if (grossAmountUGX > policy.maxPriceUGX) {
    throw new Error(`Price UGX ${grossAmountUGX} exceeds maximum allowed UGX ${policy.maxPriceUGX}`);
  }

  // Exact integer math: floor platform fee so lecturer gets any remainder integer shilling
  const platformCommissionUGX = Math.floor((grossAmountUGX * policy.platformPercentage) / 100);
  const lecturerNetUGX = grossAmountUGX - platformCommissionUGX;

  // Strict invariant verification
  if (platformCommissionUGX + lecturerNetUGX !== grossAmountUGX) {
    throw new Error("Financial invariant violation: split does not balance gross amount");
  }

  return {
    appliedPercentage: policy.platformPercentage,
    grossAmountUGX,
    platformCommissionUGX,
    lecturerNetUGX,
    vatOrTaxUGX: 0,
    effectiveDate: new Date().toISOString(),
  };
}

