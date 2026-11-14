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
import { validateUgandaPhoneNumber } from "./momo-adapter";

export interface MarzPayConfig {
  baseUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  authHeader?: string;
  webhookSecret?: string;
  mode?: "sandbox" | "production";
}

/**
 * Ensures a reference is a valid UUID format as required by the MarzPay API.
 */
export function ensureUuidReference(ref: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(ref)) {
    return ref;
  }
  // Generate deterministic v5 or random UUID for MarzPay
  return crypto.randomUUID();
}

/**
 * Formats a Uganda phone number into MarzPay's required E.164 format (+256...)
 */
export function formatMarzPayPhone(phone: string): string {
  const validation = validateUgandaPhoneNumber(phone);
  if (!validation.isValid || !validation.formatted) {
    throw new Error(validation.error || "Invalid Uganda phone number");
  }
  return `+${validation.formatted}`;
}

/**
 * MarzPay Uganda Mobile Money Provider implementation.
 * Supports direct MTN and Airtel Money collections and disbursements via MarzPay API v1.
 * Platform endpoint: https://wallet.wearemarz.com/api/v1
 */
export class MarzPayProvider implements UgandaPaymentProvider {
  network: UgandaTelecomNetwork;
  private baseUrl: string;
  private authHeader: string;
  private apiKey: string;
  private apiSecret: string;
  private webhookSecret: string;
  private mode: "sandbox" | "production";

  constructor(network: UgandaTelecomNetwork = "MTN", config?: MarzPayConfig) {
    this.network = network;
    this.baseUrl =
      config?.baseUrl ||
      process.env.MARZPAY_BASE_URL ||
      "https://wallet.wearemarz.com/api/v1";
    this.apiKey =
      config?.apiKey ||
      process.env.MARZPAY_API_KEY ||
      "marz_nTgOETQMEpnF92bt";
    this.apiSecret =
      config?.apiSecret ||
      process.env.MARZPAY_API_SECRET ||
      "qKuG6UReRG1JueziXzscJDskGrEMDRrQ";
    this.authHeader =
      config?.authHeader ||
      process.env.MARZPAY_AUTH_HEADER ||
      Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
    this.webhookSecret =
      config?.webhookSecret ||
      process.env.MARZPAY_WEBHOOK_SECRET ||
      this.apiSecret;
    this.mode =
      config?.mode ||
      ((process.env.PAYMENT_MODE as "sandbox" | "production") || "sandbox");
  }

  /**
   * Initiates a Mobile Money collection via MarzPay POST /collect-money
   */
  async initiateDeposit(req: DepositRequest): Promise<DepositResponse> {
    const phoneCheck = validateUgandaPhoneNumber(req.phoneNumber);
    if (!phoneCheck.isValid || !phoneCheck.formatted) {
      throw new Error(phoneCheck.error || "Invalid Uganda phone number");
    }

    if (!Number.isInteger(req.amountUGX) || req.amountUGX < 1000) {
      throw new Error("Minimum deposit amount is UGX 1,000 (must be exact integer)");
    }

    const formattedPhone = `+${phoneCheck.formatted}`;
    const marzReference = ensureUuidReference(req.reference);

    try {
      const response = await fetch(`${this.baseUrl}/collect-money`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${this.authHeader}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: req.amountUGX,
          phone_number: formattedPhone,
          country: "UG",
          reference: marzReference,
          description: `SomaUG Academic - Deposit for ${req.studentId}`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          (data?.errors ? JSON.stringify(data.errors) : `HTTP ${response.status} from MarzPay`);
        throw new Error(`MarzPay Collection Error: ${errorMsg}`);
      }

      const txUuid = data?.data?.transaction?.uuid || marzReference;
      const detectedProvider =
        (data?.data?.collection?.provider || "").toUpperCase() === "AIRTEL"
          ? "AIRTEL"
          : "MTN";
      this.network = detectedProvider;

      const instructions =
        this.mode === "sandbox"
          ? `MarzPay Sandbox: Payment prompt initiated for UGX ${req.amountUGX.toLocaleString()} to ${formattedPhone}.`
          : `A USSD push prompt for UGX ${req.amountUGX.toLocaleString()} has been sent to ${formattedPhone}. Enter your ${this.network} Mobile Money PIN to authorize.`;

      return {
        reference: req.reference,
        providerTransactionId: txUuid,
        status: "pending_authorization",
        instructions,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate MarzPay collection";
      throw new Error(message);
    }
  }

  /**
   * Queries transaction status via MarzPay GET /collect-money/{uuid}
   */
  async checkTransactionStatus(providerTxId: string): Promise<"pending" | "completed" | "failed"> {
    try {
      const response = await fetch(`${this.baseUrl}/collect-money/${providerTxId}`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${this.authHeader}`,
          Accept: "application/json",
        },
      });

      if (response.status === 404) {
        // In sandbox mode, transactions are self-contained or instant
        return this.mode === "sandbox" ? "completed" : "pending";
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return "pending";
      }

      const status = (
        data?.data?.transaction?.status ||
        data?.transaction?.status ||
        data?.status ||
        ""
      ).toLowerCase();

      if (status === "completed" || status === "success" || status === "sandbox") {
        return "completed";
      }
      if (status === "failed" || status === "cancelled" || status === "declined") {
        return "failed";
      }

      return "pending";
    } catch {
      return "pending";
    }
  }

  /**
   * Initiates a Mobile Money payout / disbursement via MarzPay POST /send-money
   */
  async initiatePayout(req: PayoutRequest): Promise<PayoutResponse> {
    const phoneCheck = validateUgandaPhoneNumber(req.destinationPhone);
    if (!phoneCheck.isValid || !phoneCheck.formatted) {
      return {
        payoutReference: req.payoutReference,
        status: "failed",
        failureReason: phoneCheck.error,
      };
    }

    if (!Number.isInteger(req.amountUGX) || req.amountUGX < 10000) {
      return {
        payoutReference: req.payoutReference,
        status: "failed",
        failureReason: "Amount is below minimum payout threshold of UGX 10,000",
      };
    }

    const formattedPhone = `+${phoneCheck.formatted}`;
    const marzReference = ensureUuidReference(req.payoutReference);

    try {
      const response = await fetch(`${this.baseUrl}/send-money`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${this.authHeader}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: req.amountUGX,
          phone_number: formattedPhone,
          country: "UG",
          reference: marzReference,
          description: `SomaUG Academic - Lecturer Payout ${req.lecturerId}`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // MarzPay requires API server IP whitelisting in Dashboard > IP Whitelist for disbursements
      if (response.status === 403 && data?.error_code === "IP_WHITELIST_REQUIRED") {
        if (this.mode === "sandbox") {
          console.warn(
            "[MarzPay] Outbound payout IP whitelist required by gateway. Sandbox simulation active."
          );
          return {
            payoutReference: req.payoutReference,
            providerTransactionId: `MARZ-SIM-${Date.now()}`,
            status: "processing",
          };
        }
        return {
          payoutReference: req.payoutReference,
          status: "failed",
          failureReason: "Gateway IP whitelist required. Add server IP in MarzPay Dashboard.",
        };
      }

      if (!response.ok) {
        return {
          payoutReference: req.payoutReference,
          status: "failed",
          failureReason: data?.message || `HTTP ${response.status} from MarzPay disbursement`,
        };
      }

      const txUuid = data?.data?.transaction?.uuid || marzReference;

      return {
        payoutReference: req.payoutReference,
        providerTransactionId: txUuid,
        status: "processing",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error during disbursement";
      return {
        payoutReference: req.payoutReference,
        status: "failed",
        failureReason: message,
      };
    }
  }

  /**
   * Verifies incoming webhook callback payload from MarzPay
   */
  async verifyWebhook(
    headers: Record<string, string>,
    body: string
  ): Promise<WebhookVerificationResult> {
    const signature =
      headers["x-marzpay-signature"] ||
      headers["x-signature"] ||
      headers["x-provider-signature"];

    if (this.mode === "production" && signature && this.webhookSecret) {
      const expected = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expected) {
        throw new Error("Invalid webhook signature: security verification failed");
      }
    }

    const parsed = JSON.parse(body);
    const tx = parsed.transaction || parsed.data?.transaction || parsed;
    const amountObj = tx.amount || parsed.amount;
    const rawAmount =
      typeof amountObj === "object" && amountObj !== null
        ? Number(amountObj.raw || amountObj.amount)
        : Number(parsed.amountUGX || parsed.amount || 0);

    const statusStr = (tx.status || parsed.status || "").toUpperCase();
    const isSuccess =
      statusStr === "COMPLETED" ||
      statusStr === "SUCCESS" ||
      statusStr === "SUCCESSFUL" ||
      statusStr === "SANDBOX" ||
      parsed.event_type === "collection.completed";

    const phone = tx.phone_number || parsed.phone_number || "";
    const phoneCheck = validateUgandaPhoneNumber(phone);
    const providerNetwork: UgandaTelecomNetwork = phoneCheck.network || this.network;

    return {
      isValid: true,
      provider: providerNetwork,
      eventId: parsed.eventId || tx.uuid || `EVT-${Date.now()}`,
      reference: tx.reference || parsed.reference || parsed.externalId || "",
      amountUGX: rawAmount,
      status: isSuccess ? "SUCCESSFUL" : "FAILED",
      timestamp: parsed.timestamp || new Date().toISOString(),
      rawPayload: parsed,
    };
  }
}

