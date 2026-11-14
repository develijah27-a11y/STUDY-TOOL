import { UgandaPaymentProvider, UgandaTelecomNetwork } from "./provider-interface";
import { UgandaMoMoProvider } from "./momo-adapter";
import { MarzPayProvider } from "./marzpay-adapter";

export type PaymentGatewayType = "marzpay" | "simulated" | "mtn_airtel_direct";

/**
 * Returns the configured Uganda Mobile Money payment provider.
 * Automatically chooses MarzPay when MARZPAY_API_KEY / UGANDA_PAYMENT_GATEWAY is configured,
 * or falls back to simulated/direct provider in test and local environments.
 */
export function getPaymentProvider(
  network: UgandaTelecomNetwork = "MTN"
): UgandaPaymentProvider {
  const gateway = (process.env.UGANDA_PAYMENT_GATEWAY || "").toLowerCase();
  const hasMarzKey = Boolean(
    process.env.MARZPAY_API_KEY || process.env.MARZPAY_AUTH_HEADER
  );

  // If gateway is explicitly marzpay or MarzPay credentials exist and gateway is not explicitly simulated
  if (gateway === "marzpay" || (hasMarzKey && gateway !== "simulated")) {
    return new MarzPayProvider(network);
  }

  const mode = (process.env.PAYMENT_MODE as "sandbox" | "production") || "sandbox";
  return new UgandaMoMoProvider(network, mode);
}

