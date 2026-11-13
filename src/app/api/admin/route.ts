import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";
import { WalletAndLedgerService } from "@/lib/financial/wallet-service";
import { AuthorizationGuard, UserAuthContext } from "@/lib/auth/roles";

function verifyAdminCaller(callerId: string): { allowed: boolean; context: UserAuthContext } {
  const roles = dbStore.userRoles.get(callerId) || [];
  const profile = dbStore.profiles.find((p) => p.id === callerId);
  const context: UserAuthContext = {
    userId: callerId,
    email: profile?.email || "",
    roles,
  };
  return {
    allowed: AuthorizationGuard.isAdmin(context),
    context,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callerId = searchParams.get("adminId") || "user-admin-1";
  const check = verifyAdminCaller(callerId);

  if (!check.allowed) {
    return NextResponse.json(
      { error: "FORBIDDEN: Administrator privileges required" },
      { status: 403 }
    );
  }

  const reconciliation = WalletAndLedgerService.generateReconciliationReport();

  return NextResponse.json({
    lecturerProfiles: dbStore.lecturerProfiles,
    reports: dbStore.reports,
    orders: dbStore.orders,
    payoutItems: dbStore.payoutItems,
    refunds: dbStore.refunds,
    auditLogs: dbStore.auditLogs,
    settings: dbStore.settings,
    reconciliation,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callerId = body.adminId || "user-admin-1";
    const check = verifyAdminCaller(callerId);

    if (!check.allowed) {
      return NextResponse.json(
        { error: "FORBIDDEN: Unauthorized administrator action" },
        { status: 403 }
      );
    }

    const { action } = body;
    const now = new Date().toISOString();

    if (action === "review_lecturer") {
      const lec = dbStore.lecturerProfiles.find((l) => l.id === body.lecturerId);
      if (!lec) return NextResponse.json({ error: "LECTURER_NOT_FOUND" }, { status: 404 });

      lec.verificationStatus = body.decision === "approve" ? "approved" : "rejected";
      lec.rejectionReason = body.rejectionReason || undefined;
      lec.reviewedBy = callerId;
      lec.reviewedAt = now;
      lec.updatedAt = now;

      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: `LECTURER_VERIFICATION_${lec.verificationStatus.toUpperCase()}`,
        targetType: "lecturer_profile",
        targetId: lec.id,
        metadata: { decision: body.decision, reason: body.rejectionReason },
        createdAt: now,
      });

      return NextResponse.json({ success: true, lecturerProfile: lec });
    }

    if (action === "process_refund") {
      const res = WalletAndLedgerService.processOrderRefund({
        orderId: body.orderId,
        adminId: callerId,
        reason: body.reason || "Administrative refund approval",
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "resolve_payout_item") {
      const res = WalletAndLedgerService.resolveLecturerPayoutItem({
        payoutReference: body.payoutReference,
        outcome: body.outcome || "PAID",
        providerTransactionId: body.providerTransactionId,
        failureReason: body.failureReason,
      });

      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: `PAYOUT_RECONCILE_${body.outcome}`,
        targetType: "payout_item",
        targetId: body.payoutReference,
        metadata: { outcome: body.outcome },
        createdAt: now,
      });

      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "moderate_report") {
      const rep = dbStore.reports.find((r) => r.id === body.reportId);
      if (!rep) return NextResponse.json({ error: "REPORT_NOT_FOUND" }, { status: 404 });

      rep.status = body.decision === "takedown" ? "resolved_takedown" : "dismissed";
      rep.resolutionNotes = body.resolutionNotes || "";
      rep.resolvedAt = now;

      if (body.decision === "takedown") {
        const doc = dbStore.documents.find((d) => d.id === rep.documentId);
        if (doc) {
          doc.status = "takedown";
          doc.updatedAt = now;
        }
      }

      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: `CONTENT_REPORT_${rep.status.toUpperCase()}`,
        targetType: "report",
        targetId: rep.id,
        metadata: { documentId: rep.documentId, decision: body.decision },
        createdAt: now,
      });

      return NextResponse.json({ success: true, report: rep });
    }

    if (action === "update_settings") {
      if (typeof body.commissionPercent === "number") {
        dbStore.settings.commissionPercent = Math.max(0, Math.min(50, Math.round(body.commissionPercent)));
      }
      if (typeof body.minLecturerPayoutUGX === "number") {
        dbStore.settings.minLecturerPayoutUGX = Math.max(1000, Math.round(body.minLecturerPayoutUGX));
      }

      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: "UPDATE_PLATFORM_SETTINGS",
        targetType: "settings",
        targetId: "commission_policy",
        metadata: { ...dbStore.settings },
        createdAt: now,
      });

      return NextResponse.json({ success: true, settings: dbStore.settings });
    }

    return NextResponse.json({ error: "UNKNOWN_ADMIN_ACTION" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Admin server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

