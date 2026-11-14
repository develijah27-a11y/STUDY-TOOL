import { NextRequest, NextResponse } from "next/server";
import { MarzPayProvider } from "@/lib/payments/marzpay-adapter";
import { WalletAndLedgerService } from "@/lib/financial/wallet-service";
import { dbStore } from "@/lib/db/in-memory-store";

/**
 * Handles incoming webhooks from MarzPay for Mobile Money collections and disbursements.
 * POST /api/wallet/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersList: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersList[key.toLowerCase()] = value;
    });

    const marzProvider = new MarzPayProvider("MTN");
    const verification = await marzProvider.verifyWebhook(headersList, rawBody);

    if (!verification.isValid) {
      return NextResponse.json(
        { error: "INVALID_WEBHOOK_SIGNATURE" },
        { status: 401 }
      );
    }

    // Try finding the internal deposit attempt by reference or providerTransactionId
    const deposit = dbStore.depositAttempts.find(
      (d) =>
        d.reference === verification.reference ||
        d.providerTransactionId === verification.eventId ||
        d.providerTransactionId === verification.reference
    );

    const targetReference = deposit ? deposit.reference : verification.reference;

    // Confirm deposit and post double-entry ledger entries
    const result = WalletAndLedgerService.confirmDepositWebhook({
      eventId: verification.eventId,
      reference: targetReference,
      provider: verification.provider,
      status: verification.status,
      amountUGX: verification.amountUGX,
      failureReason: verification.status === "FAILED" ? "Reported failed by MarzPay gateway" : undefined,
    });

    return NextResponse.json(
      {
        received: true,
        reference: targetReference,
        status: verification.status,
        result,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing error";
    console.error("[MarzPay Webhook Error]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

