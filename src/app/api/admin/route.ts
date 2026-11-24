import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";
import { WalletAndLedgerService } from "@/lib/financial/wallet-service";
import { AuthorizationGuard, UserAuthContext } from "@/lib/auth/roles";
import { getAllUsers, updateUserVerification, UserVerificationStatus, findUserById, createSessionToken } from "@/lib/auth/user-store";
import { createAdminClient } from "@/lib/supabase/server";

function verifyAdminCaller(callerId: string): { allowed: boolean; context: UserAuthContext } {
  let roles = dbStore.userRoles.get(callerId) || [];
  let profile = dbStore.profiles.find((p) => p.id === callerId);
  
  if (roles.length === 0) {
    const reg = getAllUsers().find((u) => u.id === callerId || u.email === callerId);
    if (reg && (reg.role === "admin" || reg.role === "developer")) {
      roles = [reg.role];
      if (!profile) {
        profile = {
          id: reg.id,
          email: reg.email,
          fullName: reg.fullName,
          phoneNumber: "",
          createdAt: reg.createdAt,
          updatedAt: reg.createdAt,
        };
      }
    }
  }

  const context: UserAuthContext = {
    userId: callerId,
    email: profile?.email || "",
    roles,
  };
  return {
    allowed: AuthorizationGuard.hasAdminOrDevAccess(context),
    context,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callerId = searchParams.get("adminId") || "user-admin-develijah";
  const check = verifyAdminCaller(callerId);

  if (!check.allowed) {
    return NextResponse.json(
      { error: "FORBIDDEN: Administrator privileges required" },
      { status: 403 }
    );
  }

  const reconciliation = WalletAndLedgerService.generateReconciliationReport();

  const localUsers = getAllUsers();
  const allUsersMap = new Map<string, any>();
  for (const u of localUsers) {
    allUsersMap.set(u.email.toLowerCase(), { ...u });
  }

  try {
    const adminSupabase = createAdminClient();
    const { data: userList } = await adminSupabase.auth.admin.listUsers();
    if (userList?.users) {
      for (const sbUser of userList.users) {
        const email = sbUser.email?.toLowerCase();
        if (!email) continue;
        const meta = sbUser.user_metadata || {};
        const existing = allUsersMap.get(email);
        const merged = {
          id: existing?.id || sbUser.id,
          email: sbUser.email || "",
          fullName: meta.full_name || meta.name || existing?.fullName || email.split("@")[0],
          role: (meta.role as any) || existing?.role || "student",
          verificationStatus:
            meta.verification_status ||
            existing?.verificationStatus ||
            (meta.role === "admin" ? "verified" : "registered"),
          institutionId: meta.institution_id || meta.institutionId || existing?.institutionId || "inst-mak",
          faculty: meta.faculty || existing?.faculty,
          department: meta.department || existing?.department,
          programmeId: meta.programme_id || meta.programmeId || existing?.programmeId,
          academicYear: meta.academic_year || meta.academicYear || existing?.academicYear,
          semester: meta.semester || existing?.semester,
          teachingRole: meta.teaching_role || meta.teachingRole || existing?.teachingRole,
          staffId: meta.staff_id || meta.staffId || existing?.staffId,
          payoutMobileNumber: meta.payout_mobile_number || meta.payoutMobileNumber || existing?.payoutMobileNumber,
          payoutMobileNetwork: meta.payout_mobile_network || meta.payoutMobileNetwork || existing?.payoutMobileNetwork,
          createdAt: sbUser.created_at || existing?.createdAt || new Date().toISOString(),
        };
        allUsersMap.set(email, merged);
      }
    }
  } catch (err) {
    console.warn("Supabase user fetch note:", err);
  }

  const mergedUsers = Array.from(allUsersMap.values());

  const systemDiagnostics = {
    nodeEnv: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    uptimeSeconds: Math.round(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    marzpayConfigured: Boolean(process.env.MARZPAY_API_KEY || process.env.MARZPAY_SANDBOX === "true"),
    totalAccounts: dbStore.ledgerAccounts.length,
    totalLedgerEntries: dbStore.ledgerEntries.length,
    totalWallets: dbStore.walletAccounts.length,
    totalDocuments: dbStore.documents.length,
    totalUsers: mergedUsers.length,
    totalOrders: dbStore.orders.length,
    totalAuditLogs: dbStore.auditLogs.length,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    lecturerProfiles: dbStore.lecturerProfiles,
    documents: dbStore.documents,
    reports: dbStore.reports,
    orders: dbStore.orders,
    payoutItems: dbStore.payoutItems,
    refunds: dbStore.refunds,
    auditLogs: dbStore.auditLogs,
    settings: dbStore.settings,
    registeredUsers: mergedUsers,
    reconciliation,
    systemDiagnostics,
    ledgerEntries: dbStore.ledgerEntries.slice(0, 100),
    wallets: dbStore.walletAccounts,
    depositAttempts: dbStore.depositAttempts.slice(0, 100),
    institutions: dbStore.institutions,
    programmes: dbStore.programmes,
    courses: dbStore.courses,
    collections: dbStore.collections,
    notifications: dbStore.notifications,
    supportTickets: dbStore.supportTickets,
    announcements: dbStore.announcements,
    websiteContent: dbStore.websiteContent,
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

    const financialActions = ["process_refund", "resolve_payout_item", "update_settings"];
    if (financialActions.includes(action) && !check.context.roles.includes("admin")) {
      return NextResponse.json(
        { error: "FORBIDDEN: Financial operations and policy updates require explicit Administrator privileges." },
        { status: 403 }
      );
    }

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

    if (action === "simulate_momo_deposit") {
      const { studentId, amountUGX, phoneNumber, provider } = body;
      const amt = Math.max(1000, Number(amountUGX) || 10000);
      const prov = provider === "AIRTEL" ? "AIRTEL" : "MTN";
      const phone = phoneNumber || (prov === "AIRTEL" ? "256750000001" : "256770000001");
      const targetStudent = studentId || "user-student-1";

      const initRes = await WalletAndLedgerService.initiateDeposit({
        studentId: targetStudent,
        amountUGX: amt,
        phoneNumber: phone,
      });

      if (!initRes.success || !initRes.deposit) {
        return NextResponse.json({ error: initRes.error || "Deposit initiation failed" }, { status: 400 });
      }

      const confirmRes = WalletAndLedgerService.confirmDepositWebhook({
        eventId: `evt-dev-${Date.now()}`,
        reference: initRes.deposit.reference,
        provider: initRes.deposit.provider as "MTN" | "AIRTEL",
        status: "SUCCESSFUL",
        amountUGX: amt,
      });

      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: "DEV_SIMULATE_MOMO_DEPOSIT",
        targetType: "wallet",
        targetId: targetStudent,
        metadata: { amountUGX: amt, provider: initRes.deposit.provider, phone },
        createdAt: now,
      });

      return NextResponse.json({
        success: confirmRes.success,
        alreadyProcessed: confirmRes.alreadyProcessed,
        newBalanceUGX: confirmRes.newBalanceUGX,
        deposit: initRes.deposit,
      });
    }

    if (action === "seed_test_document") {
      const title = body.title || "CSC 3102: Distributed Systems Architecture";
      const courseCode = body.courseCode || "CSC 3102";
      const priceUGX = Math.max(0, Number(body.priceUGX) || 5000);
      const docId = `doc-dev-${Date.now()}`;
      const newDoc = {
        id: docId,
        accessCode: `${courseCode.replace(/\s+/g, "")}-${Date.now().toString().slice(-4)}`,
        lecturerId: "lec-1",
        title,
        description: body.description || "Generated developer test study document for checkout & reader verification.",
        institutionId: "inst-mak",
        programmeId: "prog-bsse",
        courseUnitId: "course-csc2101",
        documentType: (body.documentType as any) || "lecture_notes",
        priceUGX,
        pageCount: Number(body.pageCount) || 32,
        fileSizeBytes: 1845000,
        currentVersion: 1,
        status: "published",
        topics: ["Distributed Systems", "Consensus", "Raft", "P2P"],
        allowedPreviewPages: [1, 2, 3],
        storageKey: `docs/dev-${docId}.pdf`,
        checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        viewsCount: 1,
        salesCount: 0,
        ratingAverage: 5.0,
        createdAt: now,
        updatedAt: now,
      };

      dbStore.documents.unshift(newDoc as any);
      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: "DEV_SEED_TEST_DOCUMENT",
        targetType: "document",
        targetId: docId,
        metadata: { title, courseCode, priceUGX },
        createdAt: now,
      });

      return NextResponse.json({ success: true, document: newDoc });
    }

    if (action === "impersonate_user") {
      const targetUser = findUserById(body.targetUserId) || getAllUsers().find((u) => u.email === body.email || u.id === body.targetUserId);
      if (!targetUser) {
        return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
      }

      const token = createSessionToken(targetUser);
      const redirectUrl =
        targetUser.role === "admin"
          ? "/admin/dashboard"
          : targetUser.role === "lecturer"
          ? "/lecturer/dashboard"
          : "/student/dashboard";

      const response = NextResponse.json({
        success: true,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          fullName: targetUser.fullName,
          role: targetUser.role,
          roles: [targetUser.role],
        },
        token,
        redirectUrl,
      });

      response.cookies.set({
        name: "somaug_session",
        value: token,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    if (action === "add_institution") {
      const { name, code, type, country, logoUrl } = body;
      if (!name) return NextResponse.json({ error: "INSTITUTION_NAME_REQUIRED" }, { status: 400 });
      const newInst = {
        id: `inst-${Date.now()}`,
        name: name.trim(),
        code: (code || name.slice(0, 4)).toUpperCase().trim(),
        type: type || "public_university",
        country: country || "Uganda",
        logoUrl: logoUrl || "",
        createdAt: now,
      };
      dbStore.institutions.push(newInst as any);
      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: "ADD_INSTITUTION",
        targetType: "institution",
        targetId: newInst.id,
        metadata: { name: newInst.name, code: newInst.code },
        createdAt: now,
      });
      return NextResponse.json({ success: true, institution: newInst });
    }

    if (action === "add_course") {
      const { code, title, programmeId, semester, academicYear } = body;
      if (!code || !title) return NextResponse.json({ error: "COURSE_CODE_AND_TITLE_REQUIRED" }, { status: 400 });
      const newCourse = {
        id: `course-${Date.now()}`,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        programmeId: programmeId || "prog-bsse",
        semester: Number(semester) || 1,
        academicYear: Number(academicYear) || 1,
        creditUnits: 4,
        createdAt: now,
      };
      dbStore.courses.push(newCourse as any);
      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: "ADD_COURSE",
        targetType: "course_unit",
        targetId: newCourse.id,
        metadata: { code: newCourse.code, title: newCourse.title },
        createdAt: now,
      });
      return NextResponse.json({ success: true, course: newCourse });
    }

    if (action === "create_announcement") {
      const { title, message, audience, priority, type } = body;
      if (!title || !message) return NextResponse.json({ error: "TITLE_AND_MESSAGE_REQUIRED" }, { status: 400 });
      const newAnn = {
        id: `ann-${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        audience: audience || "all",
        priority: priority || "normal",
        type: type || "platform",
        publishedBy: callerId,
        createdAt: now,
      };
      dbStore.announcements.unshift(newAnn as any);
      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: "CREATE_ANNOUNCEMENT",
        targetType: "announcement",
        targetId: newAnn.id,
        metadata: { title: newAnn.title, audience: newAnn.audience },
        createdAt: now,
      });
      return NextResponse.json({ success: true, announcement: newAnn });
    }

    if (action === "update_support_ticket") {
      const { ticketId, status, resolutionNotes, assignedAdmin } = body;
      const ticket = dbStore.supportTickets.find((t) => t.id === ticketId);
      if (!ticket) return NextResponse.json({ error: "TICKET_NOT_FOUND" }, { status: 404 });
      if (status) ticket.status = status;
      if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
      if (assignedAdmin) ticket.assignedAdmin = assignedAdmin;
      ticket.updatedAt = now;
      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: `SUPPORT_TICKET_${ticket.status.toUpperCase()}`,
        targetType: "support_ticket",
        targetId: ticket.id,
        metadata: { status: ticket.status, resolutionNotes },
        createdAt: now,
      });
      return NextResponse.json({ success: true, ticket });
    }

    if (action === "update_website_content") {
      const { heroTitle, heroSubtitle, contactEmail, supportPhone } = body;
      if (heroTitle) dbStore.websiteContent.heroTitle = heroTitle;
      if (heroSubtitle) dbStore.websiteContent.heroSubtitle = heroSubtitle;
      if (contactEmail) dbStore.websiteContent.contactEmail = contactEmail;
      if (supportPhone) dbStore.websiteContent.supportPhone = supportPhone;
      dbStore.websiteContent.updatedAt = now;
      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: "UPDATE_WEBSITE_CONTENT",
        targetType: "website_content",
        targetId: "homepage",
        metadata: { heroTitle, contactEmail },
        createdAt: now,
      });
      return NextResponse.json({ success: true, websiteContent: dbStore.websiteContent });
    }

    if (action === "reset_store_data") {
      dbStore.resetAndSeed();
      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: callerId,
        action: "DEV_RESET_DATABASE_STORE",
        targetType: "system",
        targetId: "in_memory_store",
        metadata: { callerId },
        createdAt: now,
      });

      return NextResponse.json({ success: true, message: "Store reset to initial baseline state." });
    }

    return NextResponse.json({ error: "UNKNOWN_ADMIN_ACTION" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Admin server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

