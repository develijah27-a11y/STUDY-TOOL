export type UgandaTelecomNetwork = "MTN" | "AIRTEL";

export interface DepositRequest {
  studentId: string;
  phoneNumber: string; // e.g. "256771234567" or "256701234567"
  amountUGX: number; // Exact integer UGX
  reference: string; // Internal unique reference
}

export interface DepositResponse {
  reference: string;
  providerTransactionId: string;
  status: "pending_authorization" | "completed" | "failed";
  instructions: string;
}

export interface PayoutRequest {
  payoutReference: string;
  lecturerId: string;
  destinationPhone: string;
  destinationNetwork: UgandaTelecomNetwork;
  amountUGX: number;
}

export interface PayoutResponse {
  payoutReference: string;
  providerTransactionId?: string;
  status: "pending" | "processing" | "paid" | "failed";
  failureReason?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  provider: UgandaTelecomNetwork;
  eventId: string;
  reference: string;
  amountUGX: number;
  status: "SUCCESSFUL" | "FAILED";
  timestamp: string;
  rawPayload: Record<string, unknown>;
}

export interface UgandaPaymentProvider {
  network: UgandaTelecomNetwork;
  initiateDeposit(req: DepositRequest): Promise<DepositResponse>;
  checkTransactionStatus(providerTxId: string): Promise<"pending" | "completed" | "failed">;
  initiatePayout(req: PayoutRequest): Promise<PayoutResponse>;
  verifyWebhook(headers: Record<string, string>, body: string): Promise<WebhookVerificationResult>;
}

