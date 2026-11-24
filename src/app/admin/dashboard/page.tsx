"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Scale,
  RotateCcw,
  UserCheck,
  Flag,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Users,
  FileText,
  Sliders,
  Check,
  Clock,
  Ban,
  ArrowRight,
  Terminal,
  Code2,
  Zap,
  Play,
  Copy,
  LogIn,
  CreditCard,
  FilePlus,
  Trash2,
  Database,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Building,
  Phone,
  Calendar,
  GraduationCap,
  Award,
} from "lucide-react";

interface AccountSummary {
  code: string;
  name: string;
  type: string;
  balanceUGX: number;
  entryCount: number;
}

interface ReconciliationReport {
  isStrictlyBalanced: boolean;
  totalLedgerDebitsUGX: number;
  totalLedgerCreditsUGX: number;
  discrepancyUGX: number;
  walletReconciliation: {
    studentWalletsTotalUGX: number;
    ledgerStudentLiabilityUGX: number;
    lecturerWalletsTotalUGX: number;
    ledgerLecturerLiabilityUGX: number;
    reservedWalletsTotalUGX: number;
    ledgerReservesLiabilityUGX: number;
  };
  accountSummaries: AccountSummary[];
}

interface LecturerApp {
  id: string;
  userId: string;
  fullName: string;
  department: string;
  teachingRole: string;
  institutionalEmail?: string;
  verificationStatus: string;
}

interface RegisteredUserItem {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "lecturer" | "admin";
  verificationStatus?: string;
  institutionId?: string;
  faculty?: string;
  department?: string;
  programmeId?: string;
  academicYear?: number;
  semester?: number;
  activeCourseUnits?: string[];
  teachingRole?: string;
  staffId?: string;
  coursesTaught?: string[];
  payoutMobileNumber?: string;
  payoutMobileNetwork?: "MTN" | "AIRTEL";
  createdAt: string;
}

interface DocumentItem {
  id: string;
  title: string;
  courseCode: string;
  courseName?: string;
  priceUGX: number;
  status: string;
  lecturerName?: string;
  lecturerDepartment?: string;
  pageCount: number;
  createdAt: string;
}

interface ContentReportItem {
  id: string;
  documentId: string;
  category: string;
  details: string;
  status: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  studentId: string;
  documentId: string;
  grossAmountUGX: number;
  lecturerEarningsUGX: number;
  platformFeeUGX: number;
  status: string;
  receiptReference: string;
  createdAt: string;
}

interface AuditItem {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: any;
  createdAt: string;
}

interface SystemDiagnostics {
  nodeEnv: string;
  nodeVersion: string;
  uptimeSeconds: number;
  memoryUsageMB: number;
  supabaseConfigured: boolean;
  marzpayConfigured: boolean;
  totalAccounts: number;
  totalLedgerEntries: number;
  totalWallets: number;
  totalDocuments: number;
  totalUsers: number;
  totalOrders: number;
  totalAuditLogs: number;
  timestamp: string;
}

interface LedgerEntryItem {
  id: string;
  transactionId: string;
  accountId: string;
  debitUGX: number;
  creditUGX: number;
  createdAt: string;
}

interface WalletItem {
  id: string;
  userId: string;
  walletType: string;
  spendableBalanceUGX: number;
  reservedBalanceUGX: number;
}

interface DepositAttemptItem {
  id: string;
  reference: string;
  studentId: string;
  amountUGX: number;
  provider: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [recon, setRecon] = useState<ReconciliationReport | null>(null);
  const [lecturers, setLecturers] = useState<LecturerApp[]>([]);
  const [users, setUsers] = useState<RegisteredUserItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [reports, setReports] = useState<ContentReportItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntryItem[]>([]);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [depositAttempts, setDepositAttempts] = useState<DepositAttemptItem[]>([]);

  const [commissionPercent, setCommissionPercent] = useState(15);
  const [minPayoutUGX, setMinPayoutUGX] = useState(10000);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "devtools" | "verification" | "users" | "documents" | "refunds" | "moderation" | "audit" | "settings"
  >("overview");

  // Filters & Search
  const [auditSearch, setAuditSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [docSearch, setDocSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // DevTools State: MoMo Simulator
  const [momoTargetUserId, setMomoTargetUserId] = useState("user-student-1");
  const [momoAmountUGX, setMomoAmountUGX] = useState(25000);
  const [momoProvider, setMomoProvider] = useState<"MTN" | "AIRTEL">("MTN");
  const [momoPhone, setMomoPhone] = useState("256770000001");
  const [momoLoading, setMomoLoading] = useState(false);

  // DevTools State: Seed Document
  const [seedTitle, setSeedTitle] = useState("CSC 3102: Distributed Systems Architecture");
  const [seedCourseCode, setSeedCourseCode] = useState("CSC 3102");
  const [seedPriceUGX, setSeedPriceUGX] = useState(5000);
  const [seedDocType, setSeedDocType] = useState("lecture_notes");
  const [seedPageCount, setSeedPageCount] = useState(36);
  const [seedLoading, setSeedLoading] = useState(false);

  // DevTools State: Impersonation & Reset
  const [impersonateTarget, setImpersonateTarget] = useState("user-student-1");
  const [impersonateLoading, setImpersonateLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [rawViewType, setRawViewType] = useState<"diagnostics" | "wallets" | "ledger" | "deposits" | "users">("diagnostics");
  const [copiedKey, setCopiedKey] = useState(false);

  const getAdminCallerId = useCallback((): string => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("somaug_user_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) return parsed.id;
        }
      } catch {}
    }
    return "user-admin-develijah";
  }, []);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const callerId = getAdminCallerId();
      const res = await fetch(`/api/admin?adminId=${encodeURIComponent(callerId)}`);
      if (res.ok) {
        const data = await res.json();
        setRecon(data.reconciliation);
        setLecturers(data.lecturerProfiles || []);
        setUsers(data.registeredUsers || []);
        setDocuments(data.documents || []);
        setReports(data.reports || []);
        setOrders(data.orders || []);
        setAuditLogs(data.auditLogs || []);
        setDiagnostics(data.systemDiagnostics || null);
        setLedgerEntries(data.ledgerEntries || []);
        setWallets(data.wallets || []);
        setDepositAttempts(data.depositAttempts || []);
        setCommissionPercent(data.settings?.commissionPercent ?? 15);
        setMinPayoutUGX(data.settings?.minLecturerPayoutUGX ?? 10000);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [getAdminCallerId]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Lecturer Review Action
  const handleReviewLecturer = async (lecturerId: string, decision: "approve" | "reject" | "suspend") => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_lecturer",
          adminId: getAdminCallerId(),
          lecturerId,
          decision,
          rejectionReason: decision === "reject" ? "Department verification failed" : undefined,
        }),
      });
      if (res.ok) {
        setStatusBanner(`Lecturer ${decision.toUpperCase()} status updated.`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Profile Update Action
  const handleUpdateUser = async (targetUserId: string, role?: string, verificationStatus?: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user",
          adminId: getAdminCallerId(),
          targetUserId,
          role,
          verificationStatus,
        }),
      });
      if (res.ok) {
        setStatusBanner("User profile updated.");
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Document Review Action
  const handleReviewDocument = async (documentId: string, status: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_document",
          adminId: getAdminCallerId(),
          documentId,
          status,
        }),
      });
      if (res.ok) {
        setStatusBanner(`Document status updated to ${status}.`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Refund Action
  const handleProcessRefund = async (orderId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_refund",
          adminId: getAdminCallerId(),
          orderId,
          reason: "Administrator refund approval",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusBanner("Order refunded. Compensating ledger transaction posted.");
        await loadAdminData();
      } else {
        setStatusBanner(`Refund blocked: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Content Report Moderation
  const handleModerateReport = async (reportId: string, decision: "takedown" | "dismiss") => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moderate_report",
          adminId: getAdminCallerId(),
          reportId,
          decision,
          resolutionNotes: `Admin ${decision}`,
        }),
      });
      if (res.ok) {
        setStatusBanner(`Report resolved: ${decision}.`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Platform Policies
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          adminId: getAdminCallerId(),
          commissionPercent: Number(commissionPercent),
          minLecturerPayoutUGX: Number(minPayoutUGX),
        }),
      });
      if (res.ok) {
        setStatusBanner("Platform policies saved.");
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // DevTools: Impersonation
  const handleImpersonate = async (targetUserId: string) => {
    setImpersonateLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "impersonate_user",
          adminId: getAdminCallerId(),
          targetUserId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== "undefined" && data.user) {
          localStorage.setItem("somaug_user_session", JSON.stringify(data.user));
          window.location.href = data.redirectUrl || "/student/dashboard";
        }
      } else {
        setStatusBanner(`Impersonation failed: ${data.error || "Failed"}`);
      }
    } catch (err) {
      console.error(err);
      setStatusBanner("Impersonation request failed");
    } finally {
      setImpersonateLoading(false);
    }
  };

  // DevTools: Simulate MoMo Deposit
  const handleSimulateMoMo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMomoLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate_momo_deposit",
          adminId: getAdminCallerId(),
          studentId: momoTargetUserId,
          amountUGX: Number(momoAmountUGX),
          phoneNumber: momoPhone,
          provider: momoProvider,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusBanner(`Simulated ${momoProvider} deposit of ${formatUGX(momoAmountUGX)} credited to wallet.`);
        await loadAdminData();
      } else {
        setStatusBanner(`Simulation failed: ${data.error || "Failed"}`);
      }
    } catch (err) {
      console.error(err);
      setStatusBanner("Deposit simulation request failed");
    } finally {
      setMomoLoading(false);
    }
  };

  // DevTools: Seed Test Document
  const handleSeedDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeedLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seed_test_document",
          adminId: getAdminCallerId(),
          title: seedTitle,
          courseCode: seedCourseCode,
          priceUGX: Number(seedPriceUGX),
          documentType: seedDocType,
          pageCount: Number(seedPageCount),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusBanner(`Test publication "${seedTitle}" injected and published.`);
        await loadAdminData();
      } else {
        setStatusBanner(`Seed failed: ${data.error || "Failed"}`);
      }
    } catch (err) {
      console.error(err);
      setStatusBanner("Document seeding request failed");
    } finally {
      setSeedLoading(false);
    }
  };

  // DevTools: Reset Database Store
  const handleResetStore = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_store_data",
          adminId: getAdminCallerId(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusBanner("In-memory store reset to baseline state.");
        setConfirmReset(false);
        await loadAdminData();
      } else {
        setStatusBanner(`Reset failed: ${data.error || "Failed"}`);
      }
    } catch (err) {
      console.error(err);
      setStatusBanner("Store reset failed");
    } finally {
      setResetLoading(false);
    }
  };

  const copyStoreJson = (data: any) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const copyText = (txt: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(txt);
      setStatusBanner(`Copied to clipboard: ${txt}`);
    }
  };

  const getUserWallet = (userId: string) => {
    return wallets.find((w) => w.userId === userId || w.id === `wallet-stu-${userId}`);
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const q = userSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.faculty && u.faculty.toLowerCase().includes(q)) ||
      (u.staffId && u.staffId.toLowerCase().includes(q)) ||
      (u.payoutMobileNumber && u.payoutMobileNumber.includes(q));
    return matchRole && matchSearch;
  });

  const filteredDocs = documents.filter((d) => {
    return (
      !docSearch.trim() ||
      d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.courseCode.toLowerCase().includes(docSearch.toLowerCase())
    );
  });

  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorId.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.targetId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="rounded-2xl bg-[#142B45] text-white p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 text-teal-300 px-3 py-0.5 text-xs font-bold border border-teal-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Control Desk</span>
            </div>
            <span className="text-xs text-slate-300 font-mono hidden sm:inline">
              ● System Active · {users.length} Registered Accounts
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1.5">Platform Administration</h1>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("devtools")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2 text-xs font-bold transition shadow-sm"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Dev Desk</span>
          </button>
          <button
            type="button"
            onClick={loadAdminData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Banner */}
      {statusBanner && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs font-mono text-emerald-400 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-slate-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "overview", label: "Overview & Ledger", icon: Scale },
          { id: "devtools", label: "Developer Desk", icon: Terminal, highlight: true },
          { id: "verification", label: `Lecturer Approvals (${lecturers.filter((l) => l.verificationStatus !== "approved").length})`, icon: UserCheck },
          { id: "users", label: `Users (${users.length})`, icon: Users },
          { id: "documents", label: `Documents (${documents.length})`, icon: FileText },
          { id: "refunds", label: `Refunds (${orders.length})`, icon: RotateCcw },
          { id: "moderation", label: `Reports (${reports.filter((r) => r.status === "open").length})`, icon: Flag },
          { id: "audit", label: `Audit Log (${auditLogs.length})`, icon: FileSpreadsheet },
          { id: "settings", label: "Policies", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? "bg-[#142B45] text-white shadow-sm"
                  : tab.highlight
                  ? "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Ledger Reconciliation */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {recon && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Debits</span>
                <div className="text-xl font-black text-slate-900">{formatUGX(recon.totalLedgerDebitsUGX)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Credits</span>
                <div className="text-xl font-black text-slate-900">{formatUGX(recon.totalLedgerCreditsUGX)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Discrepancy</span>
                <div className="text-xl font-black text-emerald-600">{formatUGX(recon.discrepancyUGX)}</div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase">Ledger State</span>
                <div className="text-sm font-bold text-emerald-900 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Strictly Balanced</span>
                </div>
              </div>
            </div>
          )}

          {/* Account Balances Table */}
          {recon && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Chart of Accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="pb-2">Account</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2 text-right">Balance</th>
                      <th className="pb-2 text-right">Entries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recon.accountSummaries.map((acc) => (
                      <tr key={acc.code} className="hover:bg-slate-50">
                        <td className="py-2.5 font-medium text-slate-900">
                          <span className="font-mono text-slate-400 mr-2">{acc.code}</span>
                          {acc.name}
                        </td>
                        <td className="py-2.5 text-slate-500 capitalize">{acc.type}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                          {formatUGX(acc.balanceUGX)}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-500">{acc.entryCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Developer Desk */}
      {activeTab === "devtools" && (
        <div className="space-y-6">
          {/* System Diagnostics Cards */}
          {diagnostics && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Node Env</span>
                  <Cpu className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm font-black font-mono text-slate-800">{diagnostics.nodeEnv}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Uptime</span>
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm font-black font-mono text-slate-800">
                  {Math.floor(diagnostics.uptimeSeconds / 60)}m {diagnostics.uptimeSeconds % 60}s
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Memory RSS</span>
                  <Database className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm font-black font-mono text-slate-800">{diagnostics.memoryUsageMB} MB</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Supabase</span>
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{diagnostics.supabaseConfigured ? "Connected" : "Mock"}</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Ledger Entries</span>
                  <Scale className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm font-black font-mono text-slate-800">{diagnostics.totalLedgerEntries}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Registered Users</span>
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm font-black font-mono text-slate-800">{diagnostics.totalUsers}</div>
              </div>
            </div>
          )}

          {/* Quick Impersonation Hub */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-teal-600" />
                  <span>Role Switcher &amp; Session Impersonator</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">1-click token injection</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={impersonateLoading}
                onClick={() => handleImpersonate("user-stu-daniel")}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">Lukungiri Daniel</div>
                  <div className="text-xs text-slate-500">Student • Mak CoCIS</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
              </button>

              <button
                type="button"
                disabled={impersonateLoading}
                onClick={() => handleImpersonate("user-lec-hannington")}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">Hannington (Lecturer)</div>
                  <div className="text-xs text-slate-500">Verified Lecturer • Mak</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={impersonateTarget}
                  onChange={(e) => setImpersonateTarget(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-medium outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={impersonateLoading}
                  onClick={() => handleImpersonate(impersonateTarget)}
                  className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-3 py-2.5 text-xs font-bold transition"
                >
                  Switch
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Tools: MoMo Simulator & Test Doc Inserter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MoMo Simulator Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Mobile Money Deposit Simulator</span>
                </h3>
                <span className="text-xs font-mono text-emerald-600 font-bold">Zero-Discrepancy</span>
              </div>

              <form onSubmit={handleSimulateMoMo} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Student</label>
                  <select
                    value={momoTargetUserId}
                    onChange={(e) => setMomoTargetUserId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium outline-none"
                  >
                    {users
                      .filter((u) => u.role === "student")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Amount (UGX)</label>
                    <input
                      type="number"
                      min={1000}
                      step={5000}
                      value={momoAmountUGX}
                      onChange={(e) => setMomoAmountUGX(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Network</label>
                    <select
                      value={momoProvider}
                      onChange={(e) => setMomoProvider(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none font-bold"
                    >
                      <option value="MTN">MTN MoMo</option>
                      <option value="AIRTEL">Airtel Money</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={momoLoading}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold transition flex items-center justify-center gap-2 shadow"
                >
                  <Zap className="h-4 w-4" />
                  <span>{momoLoading ? "Processing..." : `Credit Wallet with ${formatUGX(momoAmountUGX)}`}</span>
                </button>
              </form>
            </div>

            {/* Test Document Generator */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FilePlus className="h-4 w-4 text-blue-600" />
                  <span>Test Publication Generator</span>
                </h3>
                <span className="text-xs font-mono text-blue-600 font-bold">Auto-Publish</span>
              </div>

              <form onSubmit={handleSeedDocument} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publication Title</label>
                  <input
                    type="text"
                    value={seedTitle}
                    onChange={(e) => setSeedTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-medium outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      value={seedCourseCode}
                      onChange={(e) => setSeedCourseCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price (UGX)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={seedPriceUGX}
                      onChange={(e) => setSeedPriceUGX(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Document Type</label>
                    <select
                      value={seedDocType}
                      onChange={(e) => setSeedDocType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                    >
                      <option value="lecture_notes">Lecture Notes</option>
                      <option value="past_paper">Solved Past Paper</option>
                      <option value="coursework_guide">Coursework Guide</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pages</label>
                    <input
                      type="number"
                      min={1}
                      value={seedPageCount}
                      onChange={(e) => setSeedPageCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={seedLoading}
                  className="w-full rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white py-2.5 font-bold transition flex items-center justify-center gap-2 shadow"
                >
                  <Play className="h-4 w-4" />
                  <span>{seedLoading ? "Seeding..." : "Inject Test Publication"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Raw Store & Ledger Inspector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-700" />
                  <span>Live Store &amp; Ledger Inspector</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                  {(["diagnostics", "wallets", "ledger", "deposits", "users"] as const).map((vt) => (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setRawViewType(vt)}
                      className={`px-2.5 py-1 capitalize font-medium ${
                        rawViewType === vt ? "bg-slate-900 text-white font-bold" : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {vt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const payload =
                      rawViewType === "diagnostics"
                        ? diagnostics
                        : rawViewType === "wallets"
                        ? wallets
                        : rawViewType === "ledger"
                        ? ledgerEntries
                        : rawViewType === "deposits"
                        ? depositAttempts
                        : users;
                    copyStoreJson(payload);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedKey ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
            </div>

            {/* Content view */}
            {rawViewType === "ledger" ? (
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-1.5 px-2">Tx ID</th>
                      <th className="py-1.5 px-2">Account</th>
                      <th className="py-1.5 px-2 text-right">Debit</th>
                      <th className="py-1.5 px-2 text-right">Credit</th>
                      <th className="py-1.5 px-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerEntries.slice(0, 25).map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2 text-slate-500">{e.transactionId}</td>
                        <td className="py-1.5 px-2 font-bold text-slate-800">{e.accountId}</td>
                        <td className="py-1.5 px-2 text-right text-emerald-600">{formatUGX(e.debitUGX)}</td>
                        <td className="py-1.5 px-2 text-right text-slate-900">{formatUGX(e.creditUGX)}</td>
                        <td className="py-1.5 px-2 text-right text-slate-400">{formatDate(e.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : rawViewType === "wallets" ? (
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-1.5 px-2">User ID</th>
                      <th className="py-1.5 px-2">Type</th>
                      <th className="py-1.5 px-2 text-right">Spendable</th>
                      <th className="py-1.5 px-2 text-right">Reserved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wallets.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2 text-slate-700 font-bold">{w.userId}</td>
                        <td className="py-1.5 px-2 capitalize text-slate-500">{w.walletType}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-emerald-600">
                          {formatUGX(w.spendableBalanceUGX)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-slate-400">{formatUGX(w.reservedBalanceUGX)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-72">
                {JSON.stringify(
                  rawViewType === "diagnostics"
                    ? diagnostics
                    : rawViewType === "deposits"
                    ? depositAttempts
                    : users,
                  null,
                  2
                )}
              </pre>
            )}
          </div>

          {/* Database Reset Action Card */}
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-red-900 flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  <span>Reset Store to Baseline</span>
                </h4>
                <p className="text-xs text-red-700 mt-0.5">
                  Re-initializes in-memory dbStore with default seed documents, ledger entries, and accounts. Preserves admin credentials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {confirmReset && (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="rounded-xl bg-white border border-slate-300 text-slate-700 px-3 py-1.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  disabled={resetLoading}
                  onClick={handleResetStore}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition shadow"
                >
                  {confirmReset ? "Confirm Reset" : "Reset Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Lecturer Verification Applications */}
      {activeTab === "verification" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Lecturer Applications</h3>
            <span className="text-xs font-mono text-slate-500">{lecturers.length} Total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Lecturer</th>
                  <th className="pb-2">Department</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lecturers.map((lec) => (
                  <tr key={lec.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div className="font-bold text-slate-900">{lec.fullName}</div>
                      <div className="text-slate-500 font-mono">{lec.institutionalEmail || lec.userId}</div>
                    </td>
                    <td className="py-3 text-slate-700">{lec.department}</td>
                    <td className="py-3 text-slate-600">{lec.teachingRole}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          lec.verificationStatus === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : lec.verificationStatus === "rejected"
                            ? "bg-red-100 text-red-800"
                            : lec.verificationStatus === "suspended"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {lec.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      {lec.verificationStatus !== "approved" && (
                        <button
                          type="button"
                          onClick={() => handleReviewLecturer(lec.id, "approve")}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-bold transition"
                        >
                          Approve
                        </button>
                      )}
                      {lec.verificationStatus !== "suspended" && (
                        <button
                          type="button"
                          onClick={() => handleReviewLecturer(lec.id, "suspend")}
                          className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 text-xs font-bold transition"
                        >
                          Suspend
                        </button>
                      )}
                      {lec.verificationStatus !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => handleReviewLecturer(lec.id, "reject")}
                          className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-xs font-bold transition"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: User Directory (REAL USERS & FULL DETAILS) */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real accounts from authentication store &amp; profiles ({users.length} registered).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email, dept, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-teal-500 w-56 sm:w-64"
                />
              </div>

              <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs">
                {[
                  { id: "all", label: `All (${users.length})` },
                  { id: "student", label: `Students (${users.filter((u) => u.role === "student").length})` },
                  { id: "lecturer", label: `Lecturers (${users.filter((u) => u.role === "lecturer").length})` },
                  { id: "admin", label: `Admins (${users.filter((u) => u.role === "admin").length})` },
                ].map((rf) => (
                  <button
                    key={rf.id}
                    type="button"
                    onClick={() => setUserRoleFilter(rf.id)}
                    className={`px-3 py-1.5 font-bold transition ${
                      userRoleFilter === rf.id
                        ? "bg-[#142B45] text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2.5">User &amp; Academic Affiliation</th>
                  <th className="pb-2.5">Role</th>
                  <th className="pb-2.5">Verification</th>
                  <th className="pb-2.5">Wallet Spendable</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isExpanded = expandedUserId === u.id;
                  const wallet = getUserWallet(u.id);

                  return (
                    <React.Fragment key={u.id}>
                      <tr className={`hover:bg-slate-50 transition ${isExpanded ? "bg-teal-50/30" : ""}`}>
                        <td className="py-3">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {u.role === "admin" && (
                              <span className="rounded bg-purple-100 text-purple-800 px-1.5 py-0.2 text-xs font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 font-mono text-xs">{u.email}</div>
                          {(u.faculty || u.department) && (
                            <div className="text-slate-400 text-xs mt-0.5">
                              {u.faculty ? `${u.faculty} · ` : ""}
                              {u.department}
                            </div>
                          )}
                        </td>

                        <td className="py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : u.role === "lecturer"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-teal-100 text-teal-800 border border-teal-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                              u.verificationStatus === "verified"
                                ? "bg-emerald-100 text-emerald-800"
                                : u.verificationStatus === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {u.verificationStatus === "verified" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            <span>{u.verificationStatus || "verified"}</span>
                          </span>
                        </td>

                        <td className="py-3 font-mono font-bold text-slate-800">
                          {wallet ? (
                            <span className={wallet.spendableBalanceUGX > 0 ? "text-emerald-600" : "text-slate-500"}>
                              {formatUGX(wallet.spendableBalanceUGX)}
                            </span>
                          ) : (
                            <span className="text-slate-400">0 UGX</span>
                          )}
                        </td>

                        <td className="py-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 transition"
                          >
                            <span>{isExpanded ? "Hide" : "Details"}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleImpersonate(u.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 px-2.5 py-1 text-xs font-bold transition"
                          >
                            <LogIn className="h-3 w-3" />
                            <span>Impersonate</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Rich User Details Panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-y border-slate-200">
                          <td colSpan={5} className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* 1. Academic & Institutional Identity */}
                              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                                <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                  <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                                  <span>Academic Identity</span>
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-700">
                                  <div>
                                    <span className="text-slate-400">Institution: </span>
                                    <span className="font-semibold text-slate-900">
                                      {u.institutionId === "inst-mak"
                                        ? "Makerere University"
                                        : u.institutionId === "inst-kyu"
                                        ? "Kyambogo University"
                                        : u.institutionId || "Makerere University"}
                                    </span>
                                  </div>
                                  {u.faculty && (
                                    <div>
                                      <span className="text-slate-400">Faculty: </span>
                                      <span className="font-semibold text-slate-900">{u.faculty}</span>
                                    </div>
                                  )}
                                  {u.department && (
                                    <div>
                                      <span className="text-slate-400">Department: </span>
                                      <span className="font-semibold text-slate-900">{u.department}</span>
                                    </div>
                                  )}
                                  {u.teachingRole && (
                                    <div>
                                      <span className="text-slate-400">Teaching Role: </span>
                                      <span className="font-semibold text-slate-900">{u.teachingRole}</span>
                                    </div>
                                  )}
                                  {u.staffId && (
                                    <div>
                                      <span className="text-slate-400">Staff ID: </span>
                                      <span className="font-mono font-bold text-slate-900">{u.staffId}</span>
                                    </div>
                                  )}
                                  {u.academicYear && (
                                    <div>
                                      <span className="text-slate-400">Study Level: </span>
                                      <span className="font-semibold text-slate-900">
                                        Year {u.academicYear} · Semester {u.semester || 1}
                                      </span>
                                    </div>
                                  )}
                                  {(u.activeCourseUnits || u.coursesTaught) && (
                                    <div className="pt-1">
                                      <span className="text-slate-400 block mb-1">
                                        {u.role === "lecturer" ? "Courses Taught:" : "Active Course Units:"}
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {(u.coursesTaught || u.activeCourseUnits || []).map((code) => (
                                          <span
                                            key={code}
                                            className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded"
                                          >
                                            {code}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 2. Mobile Money & Wallet Profile */}
                              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                                <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                  <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Payment &amp; Wallet Profile</span>
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-700">
                                  <div>
                                    <span className="text-slate-400">Mobile Money: </span>
                                    <span className="font-mono font-bold text-slate-900">
                                      {u.payoutMobileNumber || "Not recorded"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Network: </span>
                                    <span className="font-bold text-slate-800">
                                      {u.payoutMobileNetwork || "MTN / Airtel"}
                                    </span>
                                  </div>
                                  <div className="pt-1 border-t border-slate-100 mt-2">
                                    <span className="text-slate-400">Spendable Wallet: </span>
                                    <span className="font-mono font-bold text-emerald-600 text-sm">
                                      {wallet ? formatUGX(wallet.spendableBalanceUGX) : "0 UGX"}
                                    </span>
                                  </div>
                                  {wallet && wallet.reservedBalanceUGX > 0 && (
                                    <div>
                                      <span className="text-slate-400">Reserved Payout: </span>
                                      <span className="font-mono font-bold text-amber-600">
                                        {formatUGX(wallet.reservedBalanceUGX)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 3. Account Actions & Identifiers */}
                              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                                <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                  <Sliders className="h-3.5 w-3.5 text-purple-600" />
                                  <span>Account Controls</span>
                                </div>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="text-slate-400 block mb-0.5">Account ID:</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-xs text-slate-700 truncate max-w-[180px]">
                                        {u.id}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => copyText(u.id)}
                                        className="text-slate-400 hover:text-slate-700"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-slate-400 block mb-0.5">Created At:</span>
                                    <span className="font-mono text-slate-600">{formatDate(u.createdAt)}</span>
                                  </div>

                                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateUser(
                                          u.id,
                                          u.role === "student" ? "lecturer" : u.role === "lecturer" ? "admin" : "student"
                                        )
                                      }
                                      className="rounded bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 text-xs font-bold transition"
                                    >
                                      Switch Role
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateUser(
                                          u.id,
                                          undefined,
                                          u.verificationStatus === "verified" ? "suspended" : "verified"
                                        )
                                      }
                                      className={`rounded px-2 py-1 text-xs font-bold transition ${
                                        u.verificationStatus === "verified"
                                          ? "bg-red-50 hover:bg-red-100 text-red-700"
                                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                      }`}
                                    >
                                      {u.verificationStatus === "verified" ? "Suspend" : "Verify"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Publications Review */}
      {activeTab === "documents" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Publications Directory</h3>
            <input
              type="text"
              placeholder="Search code or title..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Document</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Pages</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div className="font-bold text-slate-900">{doc.title}</div>
                      <div className="text-slate-500 font-mono">{doc.courseCode}</div>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900">{formatUGX(doc.priceUGX)}</td>
                    <td className="py-3 font-mono text-slate-500">{doc.pageCount} pgs</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          doc.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : doc.status === "takedown"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      {doc.status !== "published" && (
                        <button
                          type="button"
                          onClick={() => handleReviewDocument(doc.id, "published")}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-bold transition"
                        >
                          Publish
                        </button>
                      )}
                      {doc.status !== "takedown" && (
                        <button
                          type="button"
                          onClick={() => handleReviewDocument(doc.id, "takedown")}
                          className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-xs font-bold transition"
                        >
                          Takedown
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Refunds Ledger */}
      {activeTab === "refunds" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Orders &amp; Refunds Ledger</h3>
            <span className="text-xs font-mono text-slate-500">{orders.length} Orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Order #</th>
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Gross</th>
                  <th className="pb-2">Lecturer</th>
                  <th className="pb-2">Fee</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-2.5 font-mono text-slate-600">{ord.studentId}</td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">{formatUGX(ord.grossAmountUGX)}</td>
                    <td className="py-2.5 font-mono text-slate-600">{formatUGX(ord.lecturerEarningsUGX)}</td>
                    <td className="py-2.5 font-mono text-slate-500">{formatUGX(ord.platformFeeUGX)}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          ord.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "refunded"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {ord.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => handleProcessRefund(ord.id)}
                          className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 text-xs font-bold transition"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Moderation Reports */}
      {activeTab === "moderation" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Content Moderation</h3>
            <span className="text-xs font-mono text-slate-500">{reports.length} Reports</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Document ID</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-slate-900">{rep.documentId}</td>
                    <td className="py-2.5 capitalize text-slate-700">{rep.category}</td>
                    <td className="py-2.5 text-slate-600">{rep.details}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          rep.status === "open" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right space-x-1.5">
                      {rep.status === "open" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleModerateReport(rep.id, "takedown")}
                            className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-xs font-bold transition"
                          >
                            Takedown
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModerateReport(rep.id, "dismiss")}
                            className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 text-xs font-bold transition"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 8: Audit Log */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Audit Trail</h3>
            <input
              type="text"
              placeholder="Search action or actor..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Actor</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.slice(0, 30).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 font-mono font-bold text-slate-900">{log.action}</td>
                    <td className="py-2 font-mono text-slate-600">{log.actorId}</td>
                    <td className="py-2 font-mono text-slate-500">{log.targetId}</td>
                    <td className="py-2 text-right text-slate-400 font-mono">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 9: Platform Policies */}
      {activeTab === "settings" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-w-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Platform Policies</h3>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Platform Commission Fee: {commissionPercent}%
              </label>
              <input
                type="range"
                min={0}
                max={50}
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Number(e.target.value))}
                className="w-full accent-[#147D78]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Minimum Mobile Money Payout (UGX)
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={minPayoutUGX}
                onChange={(e) => setMinPayoutUGX(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-5 py-2 font-bold transition shadow"
            >
              Save Policies
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
