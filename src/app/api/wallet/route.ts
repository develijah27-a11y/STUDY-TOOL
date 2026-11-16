import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbStore } from "@/lib/db/in-memory-store";
import { WalletAndLedgerService } from "@/lib/financial/wallet-service";
import { AuthorizationGuard, UserAuthContext } from "@/lib/auth/roles";
import { verifyUserCredentials, findUserById } from "@/lib/auth/user-store";

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin.trim()).digest("hex");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callerId = searchParams.get("userId") || "user-student-1";
  const targetUserId = searchParams.get("targetUserId") || callerId;
  const walletType = (searchParams.get("walletType") || "student") as "student" | "lecturer";
  const queryType = searchParams.get("type"); // "balance" | "transactions" | "full"
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));

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
      pinHash: hashPin("1234"),
      pinAttempts: 0,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbStore.walletAccounts.push(wallet);
  }

  // 1. Fast Balance-Only Query (Sub-5ms response for real-time header/balance updates)
  if (queryType === "balance") {
    // Calculate summary statistics for lecturer
    const lecturerProfile = dbStore.lecturerProfiles.find((l) => l.userId === targetUserId);
    const lecturerPayouts = lecturerProfile
      ? dbStore.payoutItems.filter((p) => p.lecturerId === lecturerProfile.id)
      : [];

    const totalWithdrawnUGX = lecturerPayouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amountUGX, 0);

    const pendingPayoutsUGX = lecturerPayouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + p.amountUGX, 0);

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        walletRef: wallet.id,
        userId: wallet.userId,
        walletType: wallet.walletType,
        currency: wallet.currency,
        spendableBalanceUGX: wallet.spendableBalanceUGX,
        reservedBalanceUGX: wallet.reservedBalanceUGX,
        totalWithdrawnUGX,
        pendingPayoutsUGX,
        hasPin: Boolean(wallet.pinHash),
        isLocked: wallet.isLocked,
        updatedAt: wallet.updatedAt,
      },
    });
  }

  // 2. Paginated Transactions Query
  if (queryType === "transactions") {
    const orders = dbStore.orders.filter((o) => o.studentId === targetUserId);
    const deposits = dbStore.depositAttempts.filter((d) => d.studentId === targetUserId);
    const lecturerProfile = dbStore.lecturerProfiles.find((l) => l.userId === targetUserId);
    const lecturerPayouts = lecturerProfile
      ? dbStore.payoutItems.filter((p) => p.lecturerId === lecturerProfile.id)
      : [];

    // Unified transaction stream
    const allTxns: Array<{
      id: string;
      type: "PURCHASE" | "DEPOSIT" | "PAYOUT_WITHDRAWAL";
      reference: string;
      amountUGX: number;
      status: string;
      provider?: string;
      description?: string;
      createdAt: string;
    }> = [
      ...deposits.map((d) => ({
        id: d.id,
        type: "DEPOSIT" as const,
        reference: d.reference,
        amountUGX: d.amountUGX,
        status: d.status,
        provider: d.provider,
        description: `Mobile Money Deposit (${d.provider})`,
        createdAt: d.createdAt,
      })),
      ...orders.map((o) => ({
        id: o.id,
        type: "PURCHASE" as const,
        reference: o.orderNumber,
        amountUGX: o.grossAmountUGX,
        status: o.status,
        description: `Study Material Purchase (#${o.orderNumber})`,
        createdAt: o.createdAt,
      })),
      ...lecturerPayouts.map((p) => ({
        id: p.id,
        type: "PAYOUT_WITHDRAWAL" as const,
        reference: p.payoutReference,
        amountUGX: p.amountUGX,
        status: p.status,
        provider: p.destinationPhone.startsWith("077") || p.destinationPhone.startsWith("078") ? "MTN" : "AIRTEL",
        description: `Mobile Money Withdrawal to ${p.destinationPhone}`,
        createdAt: p.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = allTxns.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = allTxns.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      transactions: paginated,
    });
  }

  // 3. Full / Default Query (Backwards compatible)
  const orders = dbStore.orders.filter((o) => o.studentId === targetUserId);
  const entitlements = dbStore.entitlements.filter(
    (e) => e.studentId === targetUserId && e.isActive
  );
  const deposits = dbStore.depositAttempts.filter((d) => d.studentId === targetUserId);

  const lecturerProfile = dbStore.lecturerProfiles.find((l) => l.userId === targetUserId);
  const lecturerPayouts = lecturerProfile
    ? dbStore.payoutItems.filter((p) => p.lecturerId === lecturerProfile.id)
    : [];

  const totalWithdrawnUGX = lecturerPayouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountUGX, 0);

  const pendingPayoutsUGX = lecturerPayouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amountUGX, 0);

  return NextResponse.json({
    wallet: {
      ...wallet,
      walletRef: wallet.id,
      totalWithdrawnUGX,
      pendingPayoutsUGX,
      hasPin: Boolean(wallet.pinHash),
    },
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

    // PIN Management Actions
    if (action === "set_pin") {
      const { userId, newPin, currentPassword } = body;
      if (!newPin || !/^\d{4}$/.test(String(newPin))) {
        return NextResponse.json(
          { error: "PIN must be exactly 4 digits." },
          { status: 400 }
        );
      }

      // If user is setting a new PIN, verify account password if provided
      const user = findUserById(userId);
      if (user && currentPassword) {
        const verified = verifyUserCredentials(user.email, currentPassword);
        if (!verified) {
          return NextResponse.json(
            { error: "Incorrect account password." },
            { status: 401 }
          );
        }
      }

      const wallet = dbStore.walletAccounts.find((w) => w.userId === userId);
      if (wallet) {
        wallet.pinHash = hashPin(String(newPin));
        wallet.pinAttempts = 0;
        wallet.isLocked = false;
        wallet.updatedAt = new Date().toISOString();
      }

      return NextResponse.json({
        success: true,
        message: "4-digit security PIN set successfully.",
      });
    }

    if (action === "verify_pin") {
      const { userId, pin } = body;
      const wallet = dbStore.walletAccounts.find((w) => w.userId === userId);
      if (!wallet) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
      }

      if (wallet.isLocked) {
        return NextResponse.json(
          { error: "Wallet is locked due to too many incorrect PIN attempts. Contact support or reset PIN." },
          { status: 423 }
        );
      }

      const hashedInput = hashPin(String(pin || ""));
      if (wallet.pinHash && wallet.pinHash === hashedInput) {
        wallet.pinAttempts = 0;
        return NextResponse.json({ success: true, verified: true });
      }

      // Failed attempt
      wallet.pinAttempts = (wallet.pinAttempts || 0) + 1;
      if (wallet.pinAttempts >= 5) {
        wallet.isLocked = true;
        return NextResponse.json(
          { error: "PIN locked after 5 failed attempts. Please reset your PIN." },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: `Incorrect PIN. ${5 - wallet.pinAttempts} attempts remaining before lock.`,
          attemptsRemaining: 5 - wallet.pinAttempts,
        },
        { status: 400 }
      );
    }

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
