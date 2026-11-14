import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";
import { WalletAndLedgerService } from "@/lib/financial/wallet-service";
import { AuthorizationGuard, UserAuthContext } from "@/lib/auth/roles";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callerId = searchParams.get("userId") || "user-student-1";
  const targetUserId = searchParams.get("targetUserId") || callerId;
  const walletType = (searchParams.get("walletType") || "student") as "student" | "lecturer";

  // Auto-register role in dbStore for dynamic users
  if (!dbStore.userRoles.has(callerId)) {
    dbStore.userRoles.set(callerId, [walletType]);
  }

  const callerRoles = dbStore.userRoles.get(callerId) || [walletType];
  const callerContext: UserAuthContext = {
    userId: callerId,
    email: dbStore.profiles.find((p) => p.id === callerId)?.email || "",
    roles: callerRoles,
  };

  // Enforce strict wallet ownership boundary
  if (!AuthorizationGuard.canAccessWallet(callerContext, targetUserId)) {
    return NextResponse.json(
      { error: "FORBIDDEN: You cannot inspect another user's wallet or financial records" },
      { status: 403 }
    );
  }

  let wallet = dbStore.walletAccounts.find(
    (w) => w.userId === targetUserId && w.walletType === walletType
  );

  // Auto-provision wallet account if not yet created
  if (!wallet) {
    wallet = {
      id: `wal-${targetUserId}`,
      userId: targetUserId,
      walletType,
      currency: "UGX",
      ledgerAccountId: walletType === "lecturer" ? "acc-2020-lecturer-payables" : "acc-2010-student-wallets",
      spendableBalanceUGX: 0,
      reservedBalanceUGX: 0,
      pinHash: "pin_hashed_1234",
      pinAttempts: 0,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbStore.walletAccounts.push(wallet);
  }
  const orders = dbStore.orders.filter((o) => o.studentId === targetUserId);
  const entitlements = dbStore.entitlements.filter(
    (e) => e.studentId === targetUserId && e.isActive
  );
  const deposits = dbStore.depositAttempts.filter((d) => d.studentId === targetUserId);

  const lecturerProfile = dbStore.lecturerProfiles.find((l) => l.userId === targetUserId);
  const lecturerPayouts = lecturerProfile
    ? dbStore.payoutItems.filter((p) => p.lecturerId === lecturerProfile.id)
    : [];

  return NextResponse.json({
    wallet,
    orders,
    entitlements,
    deposits,
    lecturerPayouts,
    settings: dbStore.settings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "deposit_initiate") {
      const res = await WalletAndLedgerService.initiateDeposit({
        studentId: body.studentId || "user-student-1",
        phoneNumber: body.phoneNumber,
        amountUGX: Number(body.amountUGX),
        reference: body.reference,
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "deposit_confirm_webhook") {
      const res = WalletAndLedgerService.confirmDepositWebhook({
        eventId: body.eventId || `EVT-${Date.now()}`,
        reference: body.reference,
        provider: body.provider || "MTN",
        status: body.status || "SUCCESSFUL",
        amountUGX: Number(body.amountUGX),
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "purchase_document") {
      const res = WalletAndLedgerService.purchaseDocumentWithWallet({
        studentId: body.studentId || "user-student-1",
        documentId: body.documentId,
        idempotencyKey: body.idempotencyKey,
        pin: body.pin,
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "student_withdraw") {
      const res = WalletAndLedgerService.initiateStudentWithdrawal({
        studentId: body.studentId || "user-student-1",
        destinationPhone: body.destinationPhone,
        amountUGX: Number(body.amountUGX),
        idempotencyKey: body.idempotencyKey || `WD-${Date.now()}`,
        pin: body.pin,
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "lecturer_payout") {
      const res = WalletAndLedgerService.requestLecturerPayout({
        lecturerId: body.lecturerId || "lec-1",
        amountUGX: Number(body.amountUGX),
        idempotencyKey: body.idempotencyKey || `PAY-${Date.now()}`,
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    return NextResponse.json({ error: "UNKNOWN_WALLET_ACTION" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected wallet server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

