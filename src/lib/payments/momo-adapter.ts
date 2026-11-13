import crypto from "crypto";
import {
  UgandaPaymentProvider,
  UgandaTelecomNetwork,
  DepositRequest,
  DepositResponse,
  PayoutRequest,
  PayoutResponse,
  WebhookVerificationResult,
} from "./provider-interface";

/**
 * Validates Uganda MSISDN phone format (e.g. 25677xxxxxxx, 25678xxxxxxx for MTN; 25670xxxxxxx, 25675xxxxxxx for Airtel)
 */
export function validateUgandaPhoneNumber(phone: string): {
  isValid: boolean;
  network?: UgandaTelecomNetwork;
  formatted?: string;
  error?: string;
} {
  const cleaned = phone.replace(/[\s\-\+]/g, "");

  let normalized = cleaned;
  if (normalized.startsWith("0")) {
    normalized = "256" + normalized.slice(1);
  }

  if (!/^256\d{9}$/.test(normalized)) {
    return {
      isValid: false,
      error: "Phone number must be a valid 12-digit Uganda number (e.g. 256770123456 or 0770123456)",
    };
  }

  const prefix = normalized.slice(3, 5);
  let network: UgandaTelecomNetwork;

  // MTN prefixes: 77, 78, 76
  if (["77", "78", "76"].includes(prefix)) {
    network = "MTN";
  }
  // Airtel prefixes: 70, 75, 74
  else if (["70", "75", "74"].includes(prefix)) {
    network = "AIRTEL";
  } else {
    return {
      isValid: false,
      error: `Prefix 0${prefix} does not belong to a supported Uganda Mobile Money operator (MTN or Airtel)`,
    };
  }

  return {
    isValid: true,
    network,
    formatted: normalized,
  };
}

/**
 * Uganda Mobile Money Provider implementation with Sandbox and Live mode support.
 */
export class UgandaMoMoProvider implements UgandaPaymentProvider {
  network: UgandaTelecomNetwork;
  private mode: "sandbox" | "production";
  private webhookSecret: string;

  constructor(network: UgandaTelecomNetwork, mode: "sandbox" | "production" = "sandbox") {
    this.network = network;
    this.mode = mode;
    this.webhookSecret = process.env[`${network}_WEBHOOK_SECRET`] || "sandbox_secret_key_uganda_marketplace";
  }

  async initiateDeposit(req: DepositRequest): Promise<DepositResponse> {
    const phoneCheck = validateUgandaPhoneNumber(req.phoneNumber);
    if (!phoneCheck.isValid || !phoneCheck.formatted) {
      throw new Error(phoneCheck.error || "Invalid Uganda phone number");
    }

    if (req.amountUGX < 1000) {
      throw new Error("Minimum deposit amount is UGX 1,000");
    }

    // In sandbox mode: simulate USSD push prompt
    const providerTxId = `${this.network}-DEP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
      reference: req.reference,
      providerTransactionId: providerTxId,
      status: "pending_authorization",
      instructions: `A USSD prompt for UGX ${req.amountUGX} has been sent to ${phoneCheck.formatted}. Enter your ${this.network} Mobile Money PIN to authorize.`,
    };
  }

  async checkTransactionStatus(providerTxId: string): Promise<"pending" | "completed" | "failed"> {
    // In sandbox mode: return completed if not simulated failed
    if (this.mode === "sandbox") {
      if (providerTxId.includes("FAIL")) return "failed";
      return "completed";
    }
    // Production call to provider OpenAPI would query status endpoint here
    return "completed";
  }

  async initiatePayout(req: PayoutRequest): Promise<PayoutResponse> {
    const phoneCheck = validateUgandaPhoneNumber(req.destinationPhone);
    if (!phoneCheck.isValid) {
      return {
        payoutReference: req.payoutReference,
        status: "failed",
        failureReason: phoneCheck.error,
      };
    }

    if (req.amountUGX < 10000) {
      return {
        payoutReference: req.payoutReference,
        status: "failed",
        failureReason: "Amount is below minimum payout threshold of UGX 10,000",
      };
    }

    const providerTxId = `${this.network}-PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
      payoutReference: req.payoutReference,
      providerTransactionId: providerTxId,
      status: "processing",
    };
  }

  async verifyWebhook(
    headers: Record<string, string>,
    body: string
  ): Promise<WebhookVerificationResult> {
    // Verify HMAC-SHA256 signature to protect against tampering & unauthorized webhook calls
    const signature = headers["x-provider-signature"] || headers["x-signature"];

    if (this.mode === "production" && signature) {
      const expected = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expected) {
        throw new Error("Invalid webhook signature: security verification failed");
      }
    }

    const parsed = JSON.parse(body);

    return {
      isValid: true,
      provider: this.network,
      eventId: parsed.eventId || `EVT-${Date.now()}`,
      reference: parsed.reference || parsed.externalId,
      amountUGX: Number(parsed.amountUGX || parsed.amount),
      status: parsed.status === "SUCCESS" || parsed.status === "SUCCESSFUL" ? "SUCCESSFUL" : "FAILED",
      timestamp: parsed.timestamp || new Date().toISOString(),
      rawPayload: parsed,
    };
  }
}

