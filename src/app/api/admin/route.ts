import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";
import { WalletAndLedgerService } from "@/lib/financial/wallet-service";
import { AuthorizationGuard, UserAuthContext } from "@/lib/auth/roles";
import { getAllUsers, updateUserVerification, UserVerificationStatus } from "@/lib/auth/user-store";

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
    documents: dbStore.documents,
    reports: dbStore.reports,
    orders: dbStore.orders,
    payoutItems: dbStore.payoutItems,
    refunds: dbStore.refunds,
    auditLogs: dbStore.auditLogs,
    settings: dbStore.settings,
    registeredUsers: getAllUsers(),
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
      const lec = dbStore.lecturerProfiles.find((l) => l.id === body.lecturerId || l.userId === body.userId);
      const targetUserId = body.userId || (lec ? lec.userId : body.lecturerId);

      let newStatus: UserVerificationStatus = "pending_verification";
      if (body.decision === "approve" || body.decision === "verified") {
        newStatus = "verified";
      } else if (body.decision === "reject" || body.decision === "rejected") {
        newStatus = "rejected";
      } else if (body.decision === "suspend" || body.decision === "suspended") {
        newStatus = "suspended";
      }

      if (lec) {
        lec.verificationStatus =
          newStatus === "verified"
            ? "approved"
            : newStatus === "rejected"
            ? "rejected"
            : newStatus === "suspended"
            ? "suspended"
            : "under_review";
        lec.rejectionReason = body.rejectionReason || undefined;
        lec.reviewedBy = callerId;
        lec.reviewedAt = now;
        lec.updatedAt = now;
      }

      if (targetUserId) {
        updateUserVerification(targetUserId, newStatus);
      }

      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: `LECTURER_VERIFICATION_${newStatus.toUpperCase()}`,
        targetType: "lecturer_profile",
        targetId: targetUserId,
        metadata: { decision: body.decision, reason: body.rejectionReason, newStatus },
        createdAt: now,
      });

      return NextResponse.json({ success: true, newStatus, lecturerProfile: lec });
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

    if (action === "update_user") {
      const { targetUserId, role, verificationStatus } = body;
      const targetUser = getAllUsers().find((u) => u.id === targetUserId || u.email === body.email);
      if (targetUser) {
        if (role) {
          targetUser.role = role;
          dbStore.userRoles.set(targetUser.id, [role]);
        }
        if (verificationStatus) {
          updateUserVerification(targetUser.id, verificationStatus);
        }
        dbStore.auditLogs.unshift({
          id: `aud-${Date.now()}`,
          actorId: callerId,
          action: "UPDATE_USER_PROFILE",
          targetType: "user",
          targetId: targetUser.id,
          metadata: { role, verificationStatus },
          createdAt: now,
        });
        return NextResponse.json({ success: true, user: targetUser });
      }
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    if (action === "review_document") {
      const { documentId, status } = body;
      const doc = dbStore.documents.find((d) => d.id === documentId);
      if (doc) {
        doc.status = status;
        doc.updatedAt = now;
        dbStore.auditLogs.unshift({
          id: `aud-${Date.now()}`,
          actorId: callerId,
          action: `DOCUMENT_STATUS_${status.toUpperCase()}`,
          targetType: "document",
          targetId: doc.id,
          metadata: { newStatus: status },
          createdAt: now,
        });
        return NextResponse.json({ success: true, document: doc });
      }
      return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ error: "UNKNOWN_ADMIN_ACTION" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Admin server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

