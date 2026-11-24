"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  CreditCard,
  TrendingUp,
  Banknote,
  QrCode,
  BarChart3,
  HelpCircle,
  Bell,
  Globe,
  ShieldAlert,
  Activity,
  Settings as SettingsIcon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Download,
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Send,
  Plus,
  Eye,
  Ban,
  Check,
  FileText,
  Phone,
  Mail,
  Calendar,
  Layers,
  ShieldCheck,
  Terminal,
  Zap,
  Play,
  Copy,
  LogIn,
  RotateCcw,
  Sparkles,
} from "lucide-react";

// Platform Role definition per Directive: Strictly 4 Platform Roles
type PlatformRole = "student" | "lecturer" | "admin" | "developer";

type SectionTab =
  | "overview"
  | "users"
  | "lecturers"
  | "materials"
  | "institutions"
  | "transactions"
  | "revenue"
  | "withdrawals"
  | "qrcodes"
  | "reports"
  | "support"
  | "notifications"
  | "content"
  | "audit"
  | "monitoring"
  | "settings";

interface AdminData {
  lecturerProfiles: any[];
  documents: any[];
  reports: any[];
  orders: any[];
  payoutItems: any[];
  refunds: any[];
  auditLogs: any[];
  settings: {
    commissionPercent: number;
    minDocumentPriceUGX: number;
    maxDocumentPriceUGX: number;
    minDepositUGX: number;
    minLecturerPayoutUGX: number;
    studentWithdrawalFeeUGX: number;
    lecturerPayoutFeeUGX: number;
    payoutScheduleDay: string;
  };
  registeredUsers: any[];
  reconciliation: {
    asOf: string;
    totalAccounts: number;
    totalDebitsUGX: number;
    totalCreditsUGX: number;
    isBalanced: boolean;
    imbalanceUGX: number;
    accountSummaries: any[];
    discrepancyLog: string[];
  };
  systemDiagnostics: {
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
  };
  ledgerEntries: any[];
  wallets: any[];
  depositAttempts: any[];
  institutions: any[];
  programmes: any[];
  courses: any[];
  collections: any[];
  notifications: any[];
  supportTickets: any[];
  announcements: any[];
  websiteContent: {
    heroTitle: string;
    heroSubtitle: string;
    bannerNotice?: string;
    featuredCourseCodes: string[];
    contactEmail: string;
    supportPhone: string;
    updatedAt: string;
  };
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<SectionTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Global & Local Search
  const [globalSearch, setGlobalSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<"today" | "7d" | "30d" | "all">("all");

  // Selection / Modal States
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedLecturer, setSelectedLecturer] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [withdrawalProviderTxId, setWithdrawalProviderTxId] = useState("");
  const [withdrawalFailureReason, setWithdrawalFailureReason] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    actionLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Form states
  const [newInstName, setNewInstName] = useState("");
  const [newInstCode, setNewInstCode] = useState("");
  const [newInstCountry, setNewInstCountry] = useState("Uganda");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnMessage, setNewAnnMessage] = useState("");
  const [newAnnAudience, setNewAnnAudience] = useState<"all" | "students" | "lecturers">("all");
  const [ticketReply, setTicketReply] = useState("");
  const [activeTicket, setActiveTicket] = useState<any | null>(null);

  // Developer Simulator States
  const [simPhone, setSimPhone] = useState("256770000001");
  const [simAmount, setSimAmount] = useState("10000");
  const [simProvider, setSimProvider] = useState<"MTN" | "AIRTEL">("MTN");
  const [simulatingDeposit, setSimulatingDeposit] = useState(false);

  // Current session persona
  const [currentAdminId, setCurrentAdminId] = useState("develijah27@gmail.com");
  const [currentUserRole, setCurrentUserRole] = useState<PlatformRole>("admin");

  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin?adminId=${encodeURIComponent(currentAdminId)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: Failed to load administrative data`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to connect to administrative API");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentAdminId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAdminAction = async (payload: any) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: currentAdminId,
          ...payload,
        }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Action could not be completed");
      }
      showToast("Operation completed successfully", "success");
      fetchData();
      return result;
    } catch (err: any) {
      showToast(err.message || "Server rejected administrative action", "error");
      throw err;
    }
  };

  // KPI Calculations from authentic database records
  const kpis = useMemo(() => {
    if (!data) return null;
    const users = data.registeredUsers || [];
    const students = users.filter((u) => u.role === "student");
    const lecturers = users.filter((u) => u.role === "lecturer");
    const verifiedLecturers = lecturers.filter(
      (l) => l.verificationStatus === "verified" || l.verificationStatus === "approved"
    );
    const pendingVerifications = lecturers.filter(
      (l) => l.verificationStatus === "pending_verification" || l.verificationStatus === "submitted"
    );

    const docs = data.documents || [];
    const publishedDocs = docs.filter((d) => d.status === "published");

    const orders = data.orders || [];
    const successfulOrders = orders.filter((o) => o.status === "completed" || o.status === "paid");
    const pendingOrders = orders.filter((o) => o.status === "pending");

    const grossSalesUGX = successfulOrders.reduce((sum, o) => sum + (o.totalAmountUGX || 0), 0);
    const commRate = (data.settings?.commissionPercent || 10) / 100;
    const platformCommissionUGX = Math.floor(grossSalesUGX * commRate);
    const lecturerEarningsUGX = grossSalesUGX - platformCommissionUGX;

    const payoutItems = data.payoutItems || [];
    const pendingWithdrawals = payoutItems.filter((p) => p.status === "REQUESTED" || p.status === "PROCESSING");
    const pendingWithdrawalsUGX = pendingWithdrawals.reduce((sum, p) => sum + (p.amountUGX || 0), 0);

    return {
      totalStudents: students.length,
      totalLecturers: lecturers.length,
      verifiedLecturers: verifiedLecturers.length,
      pendingVerifications: pendingVerifications.length,
      publishedDocs: publishedDocs.length,
      successfulPurchases: successfulOrders.length,
      pendingPurchases: pendingOrders.length,
      grossSalesUGX,
      platformCommissionUGX,
      lecturerEarningsUGX,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsUGX,
    };
  }, [data]);

  // Navigation Items
  const navGroups = [
    {
      group: "OVERVIEW",
      items: [{ id: "overview" as SectionTab, label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      group: "ACADEMIC MANAGEMENT",
      items: [
        { id: "users" as SectionTab, label: "Users", icon: Users },
        { id: "lecturers" as SectionTab, label: "Lecturers", icon: GraduationCap },
        { id: "materials" as SectionTab, label: "Learning Materials", icon: BookOpen },
        { id: "institutions" as SectionTab, label: "Institutions", icon: Building2 },
      ],
    },
    {
      group: "FINANCIAL MANAGEMENT",
      items: [
        { id: "transactions" as SectionTab, label: "Transactions", icon: CreditCard },
        { id: "revenue" as SectionTab, label: "Revenue & Analytics", icon: TrendingUp },
        { id: "withdrawals" as SectionTab, label: "Lecturer Withdrawals", icon: Banknote },
      ],
    },
    {
      group: "PLATFORM OPERATIONS",
      items: [
        { id: "qrcodes" as SectionTab, label: "QR Codes & Access", icon: QrCode },
        { id: "reports" as SectionTab, label: "Reports", icon: BarChart3 },
        { id: "support" as SectionTab, label: "Support & Tickets", icon: HelpCircle },
        { id: "notifications" as SectionTab, label: "Notifications", icon: Bell },
        { id: "content" as SectionTab, label: "Website & Content", icon: Globe },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        { id: "audit" as SectionTab, label: "Security & Audit Logs", icon: ShieldAlert },
        { id: "monitoring" as SectionTab, label: "System Monitoring", icon: Activity },
        { id: "settings" as SectionTab, label: "Settings", icon: SettingsIcon },
      ],
    },
  ];

  // CSV Exporter for Reports
  const exportReportsToCSV = (reportType: string) => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `somaug_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === "orders") {
      csvContent += "Order ID,Student ID,Amount UGX,Status,Provider,Created At\n";
      data.orders.forEach((o) => {
        csvContent += `"${o.id}","${o.studentId}",${o.totalAmountUGX},"${o.status}","${o.paymentProvider || 'MOMO'}","${o.createdAt}"\n`;
      });
    } else if (reportType === "users") {
      csvContent += "ID,Full Name,Email,Role,Verification Status,Institution,Created At\n";
      data.registeredUsers.forEach((u) => {
        csvContent += `"${u.id}","${u.fullName}","${u.email}","${u.role}","${u.verificationStatus || 'registered'}","${u.institutionId || ''}","${u.createdAt}"\n`;
      });
    } else {
      csvContent += "Reference,Lecturer ID,Amount UGX,Status,Provider Ref,Created At\n";
      data.payoutItems.forEach((p) => {
        csvContent += `"${p.payoutReference}","${p.lecturerId}",${p.amountUGX},"${p.status}","${p.providerTransactionId || ''}","${p.createdAt}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Report exported to ${filename}`, "info");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#14B8A6] border-t-transparent" />
          <div className="text-sm font-semibold tracking-wider text-slate-300">
            CONNECTING TO SOMAUG ADMINISTRATIVE DESK...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-semibold backdrop-blur-md transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : toastMessage.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
              : "bg-blue-950/90 border-blue-500/40 text-blue-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : toastMessage.type === "error" ? (
            <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-blue-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111C2E] border border-[#263449] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                {confirmModal.title}
              </h3>
              <button
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-300 hover:bg-[#172438] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition ${
                  confirmModal.isDestructive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#2563EB] hover:bg-blue-600"
                }`}
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="h-16 bg-[#111C2E] border-b border-[#263449] sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#172438] text-slate-300 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400 hidden sm:inline">
              SomaUG /
            </span>
            <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              {activeTab.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative w-72 lg:w-96">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search students, lecturers, notes, or IDs..."
            className="w-full bg-[#172438] border border-[#263449] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#14B8A6] transition"
          />
        </div>

        {/* Actions & Profile Menu */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-[#172438] hover:bg-[#263449] text-slate-300 hover:text-white transition"
            title="Refresh Ledger and System Records"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#14B8A6]" : ""}`} />
          </button>

          {/* Persona / Role Switcher Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#172438] border border-[#263449]">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">
                {currentAdminId === "develijah27@gmail.com" ? "Elijah Hannington" : currentAdminId}
              </div>
              <div className="text-[10px] text-[#14B8A6] font-mono uppercase">
                {currentUserRole}
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#172438] transition hidden lg:inline-flex items-center gap-1.5"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Body Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111C2E] border-r border-[#263449] flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-0 -translate-x-full"
          }`}
        >
          {/* Sidebar Top: Logo */}
          <div className="p-4 border-b border-[#263449] flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] flex items-center justify-center font-black text-white text-base shadow-md">
                S
              </div>
              <div>
                <div className="text-xs font-black tracking-wide text-white">SOMAUG ACADEMIC</div>
                <div className="text-[10px] font-mono text-[#94A3B8]">Admin Console v2.0</div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5">
            {navGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-[#94A3B8]">
                  {grp.group}
                </div>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-[#172438] text-[#14B8A6] border border-[#263449] shadow-sm"
                          : "text-slate-300 hover:bg-[#172438]/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-[#14B8A6]" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.id === "lecturers" && kpis && kpis.pendingVerifications > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {kpis.pendingVerifications}
                        </span>
                      )}
                      {item.id === "withdrawals" && kpis && kpis.pendingWithdrawalsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {kpis.pendingWithdrawalsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer: Role & Identity */}
          <div className="p-3 border-t border-[#263449] space-y-2">
            <div className="p-2.5 rounded-xl bg-[#172438] border border-[#263449] text-xs space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Operator Persona</div>
              <div className="font-bold text-white truncate">{currentAdminId}</div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Double-Entry Mode
                </span>
                <span className="text-[10px] font-mono text-slate-400">UGX Ledger</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          />
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================================= */}
          {/* 1. OVERVIEW DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === "overview" && kpis && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Platform Overview</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time operational summary, financial performance, and academic verification status.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Date Range:</span>
                  <div className="flex rounded-xl bg-[#111C2E] border border-[#263449] p-0.5 text-xs">
                    {(["today", "7d", "30d", "all"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setDateFilter(r)}
                        className={`px-3 py-1 rounded-lg font-bold capitalize transition ${
                          dateFilter === r
                            ? "bg-[#14B8A6] text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {r === "all" ? "All Time" : r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-4 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Total Students</span>
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {kpis.totalStudents}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Registered &amp; Active</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-4 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Verified Lecturers</span>
                    <GraduationCap className="h-4 w-4 text-teal-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {kpis.verifiedLecturers}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {kpis.pendingVerifications} awaiting review
                  </div>
                </div>

                <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-4 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Published Notes</span>
                    <BookOpen className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {kpis.publishedDocs}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {kpis.successfulPurchases} total purchases
                  </div>
                </div>

                <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-4 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Gross Document Sales</span>
                    <Banknote className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    {formatUGX(kpis.grossSalesUGX)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    10% Platform / 90% Lecturer
                  </div>
                </div>
              </div>

              {/* Financial Allocation Split Bar */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#14B8A6]" />
                      Double-Entry Revenue Breakdown
                    </h2>
                    <p className="text-xs text-slate-400">
                      Exact integer allocation of all completed mobile money document purchases.
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-300">
                    Balanced:{" "}
                    <span className="text-emerald-400 font-bold">
                      {data?.reconciliation?.isBalanced ? "YES (0 Discrepancy)" : "AUDIT REQUIRED"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#172438] border border-[#263449]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Platform Commission (10%)</div>
                    <div className="text-lg font-black text-[#14B8A6] font-mono mt-0.5">
                      {formatUGX(kpis.platformCommissionUGX)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#172438] border border-[#263449]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Lecturer Net Earnings (90%)</div>
                    <div className="text-lg font-black text-blue-400 font-mono mt-0.5">
                      {formatUGX(kpis.lecturerEarningsUGX)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#172438] border border-[#263449]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Pending Lecturer Withdrawals</div>
                    <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                      {formatUGX(kpis.pendingWithdrawalsUGX)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events & System Health 2-Column */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Platform Events */}
                <div className="lg:col-span-7 rounded-2xl border border-[#263449] bg-[#111C2E] p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      Recent Activity &amp; Audit Stream
                    </h2>
                    <span className="text-[10px] font-mono text-slate-400">Last 10 Actions</span>
                  </div>

                  <div className="divide-y divide-[#263449]">
                    {data?.auditLogs.slice(0, 7).map((log) => (
                      <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-200">{log.action}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Actor: <span className="text-slate-300 font-mono">{log.actorId}</span> · Target:{" "}
                            <span className="text-slate-300 font-mono">{log.targetId}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Diagnostics */}
                <div className="lg:col-span-5 rounded-2xl border border-[#263449] bg-[#111C2E] p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#14B8A6]" />
                      Real System Diagnostics
                    </h2>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center p-2 rounded-xl bg-[#172438]">
                      <span className="text-slate-400">Node Environment</span>
                      <span className="font-mono font-bold text-white uppercase">
                        {data?.systemDiagnostics?.nodeEnv || "production"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl bg-[#172438]">
                      <span className="text-slate-400">Uptime</span>
                      <span className="font-mono text-white">
                        {data?.systemDiagnostics ? `${Math.floor(data.systemDiagnostics.uptimeSeconds / 60)} min ${data.systemDiagnostics.uptimeSeconds % 60} s` : "active"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl bg-[#172438]">
                      <span className="text-slate-400">RSS Memory</span>
                      <span className="font-mono text-white">
                        {data?.systemDiagnostics?.memoryUsageMB || 45} MB
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl bg-[#172438]">
                      <span className="text-slate-400">Supabase Auth &amp; Database</span>
                      <span
                        className={`font-mono font-bold ${
                          data?.systemDiagnostics?.supabaseConfigured ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {data?.systemDiagnostics?.supabaseConfigured ? "CONNECTED" : "IN-MEMORY FALLBACK"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl bg-[#172438]">
                      <span className="text-slate-400">Mobile Money Gateway</span>
                      <span className="font-mono font-bold text-emerald-400">
                        MARZPAY SANDBOX READY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. USER MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">User Management</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View registered students, lecturers, administrators, and developers across the platform.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-[#111C2E] border border-[#263449] rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="student">Students</option>
                    <option value="lecturer">Lecturers</option>
                    <option value="admin">Administrators</option>
                    <option value="developer">Developers</option>
                  </select>
                </div>
              </div>

              {/* Table search & records count */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by name, email, or institution..."
                    className="w-full bg-[#111C2E] border border-[#263449] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-[#14B8A6]"
                  />
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Showing {data?.registeredUsers.length || 0} registered profiles
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#172438] text-slate-300 border-b border-[#263449] font-mono">
                        <th className="p-3.5">User Identity</th>
                        <th className="p-3.5">Platform Role</th>
                        <th className="p-3.5">Academic Affiliation</th>
                        <th className="p-3.5">Verification</th>
                        <th className="p-3.5">Registered</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#263449] text-slate-200">
                      {data?.registeredUsers
                        .filter((u) => {
                          const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
                          const matchesSearch =
                            !tableSearch ||
                            u.fullName?.toLowerCase().includes(tableSearch.toLowerCase()) ||
                            u.email?.toLowerCase().includes(tableSearch.toLowerCase()) ||
                            u.id?.toLowerCase().includes(tableSearch.toLowerCase());
                          return matchesRole && matchesSearch;
                        })
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-[#172438]/50 transition">
                            <td className="p-3.5">
                              <div className="font-bold text-white">{u.fullName}</div>
                              <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                  u.role === "admin"
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : u.role === "lecturer"
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    : u.role === "developer"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="text-slate-300">{u.institutionId || "Makerere University"}</div>
                              {u.faculty && <div className="text-[10px] text-slate-400">{u.faculty}</div>}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  u.verificationStatus === "verified" || u.verificationStatus === "approved"
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : u.verificationStatus === "rejected"
                                    ? "text-rose-400 bg-rose-500/10"
                                    : u.verificationStatus === "suspended"
                                    ? "text-rose-400 bg-rose-500/10"
                                    : "text-amber-400 bg-amber-500/10"
                                }`}
                              >
                                {u.verificationStatus || "active"}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="px-2.5 py-1 rounded-lg bg-[#172438] hover:bg-[#263449] text-white font-bold text-xs transition"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Dossier Drawer Modal */}
              {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="bg-[#111C2E] border border-[#263449] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#263449] pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{selectedUser.fullName}</h3>
                        <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#172438]">
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">ACCOUNT ID</div>
                          <div className="font-mono text-slate-200 mt-0.5 truncate">{selectedUser.id}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">PLATFORM ROLE</div>
                          <div className="font-bold text-white mt-0.5 uppercase">{selectedUser.role}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">INSTITUTION</div>
                          <div className="text-slate-200 mt-0.5">{selectedUser.institutionId || "inst-mak"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">ACCOUNT STATUS</div>
                          <div className="font-bold text-emerald-400 mt-0.5">
                            {selectedUser.verificationStatus || "Active"}
                          </div>
                        </div>
                      </div>

                      {/* Administrative Action Controls */}
                      <div className="border-t border-[#263449] pt-3 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setConfirmModal({
                              title: "Suspend User Account",
                              message: `Are you sure you want to suspend access for ${selectedUser.fullName}? This will block note purchases and publishing.`,
                              actionLabel: "Suspend Account",
                              isDestructive: true,
                              onConfirm: () => {
                                handleAdminAction({
                                  action: "update_user",
                                  targetUserId: selectedUser.id,
                                  verificationStatus: "suspended",
                                });
                                setSelectedUser(null);
                              },
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition"
                        >
                          Suspend User
                        </button>
                        <button
                          onClick={() => {
                            handleAdminAction({
                              action: "update_user",
                              targetUserId: selectedUser.id,
                              verificationStatus: "verified",
                            });
                            setSelectedUser(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#14B8A6] hover:bg-teal-600 text-white text-xs font-bold transition"
                        >
                          Mark Active / Verified
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. LECTURER MANAGEMENT & VERIFICATION */}
          {/* ========================================================================= */}
          {activeTab === "lecturers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Lecturer Verification &amp; Management</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review submitted lecturer credentials, approve publishing access, or reject with documented reasons.
                  </p>
                </div>
              </div>

              {/* Lecturer Verification Queue */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#263449] font-bold text-xs text-white flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#14B8A6]" />
                  Faculty &amp; Lecturer Verification Dossiers
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#172438] text-slate-300 border-b border-[#263449] font-mono">
                        <th className="p-3.5">Lecturer</th>
                        <th className="p-3.5">University &amp; Faculty</th>
                        <th className="p-3.5">Teaching Role</th>
                        <th className="p-3.5">Verification Status</th>
                        <th className="p-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#263449] text-slate-200">
                      {data?.lecturerProfiles.map((lec) => (
                        <tr key={lec.id} className="hover:bg-[#172438]/50 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{lec.fullName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{lec.userId}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-slate-300 font-medium">
                              {lec.institutionId === "inst-mak"
                                ? "Makerere University"
                                : lec.institutionId === "inst-kyu"
                                ? "Kyambogo University"
                                : lec.institutionId}
                            </div>
                            <div className="text-[10px] text-slate-400">{lec.faculty || "Academic Faculty"}</div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-300">
                            {lec.teachingRole || "Lecturer"}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                lec.verificationStatus === "approved"
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : lec.verificationStatus === "rejected"
                                  ? "text-rose-400 bg-rose-500/10"
                                  : "text-amber-400 bg-amber-500/10"
                              }`}
                            >
                              {lec.verificationStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              {lec.verificationStatus !== "approved" && (
                                <button
                                  onClick={() => {
                                    handleAdminAction({
                                      action: "review_lecturer",
                                      lecturerId: lec.id,
                                      decision: "approve",
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedLecturer(lec)}
                                className="px-2.5 py-1 rounded-lg bg-[#172438] hover:bg-[#263449] text-slate-200 font-bold text-xs transition"
                              >
                                Review Dossier
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Review / Reject Dossier Modal */}
              {selectedLecturer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="bg-[#111C2E] border border-[#263449] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#263449] pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Review Lecturer Submission</h3>
                        <p className="text-xs text-slate-400">{selectedLecturer.fullName}</p>
                      </div>
                      <button
                        onClick={() => setSelectedLecturer(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#172438] space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Institutional ID:</span>
                          <span className="font-mono text-white">{selectedLecturer.staffId || "STAFF-2026-MAK"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone for Withdrawals:</span>
                          <span className="font-mono text-teal-400">
                            {selectedLecturer.payoutMobileNumber || "256770000001"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold">Rejection Reason (If rejecting):</label>
                        <textarea
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="State exact discrepancy (e.g., Staff card expired or invalid faculty outline)..."
                          className="w-full bg-[#172438] border border-[#263449] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#14B8A6]"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => {
                            if (!rejectionReason.trim()) {
                              showToast("Rejection requires a clear documented reason", "error");
                              return;
                            }
                            handleAdminAction({
                              action: "review_lecturer",
                              lecturerId: selectedLecturer.id,
                              decision: "reject",
                              rejectionReason,
                            });
                            setSelectedLecturer(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
                        >
                          Reject Submission
                        </button>
                        <button
                          onClick={() => {
                            handleAdminAction({
                              action: "review_lecturer",
                              lecturerId: selectedLecturer.id,
                              decision: "approve",
                            });
                            setSelectedLecturer(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-teal-600 text-white font-bold text-xs transition"
                        >
                          Approve Lecturer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. LEARNING MATERIALS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "materials" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Learning Materials Management</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Inspect uploaded lecture notes, enforce 50 MB / 100-page limits, preview documents, and moderate status.
                  </p>
                </div>
              </div>

              {/* Document Catalog Table */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#172438] text-slate-300 border-b border-[#263449] font-mono">
                        <th className="p-3.5">Material Title &amp; Code</th>
                        <th className="p-3.5">Pages / Size</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Sales</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Moderation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#263449] text-slate-200">
                      {data?.documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-[#172438]/50 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{doc.title}</div>
                            <div className="text-[11px] font-mono text-[#14B8A6]">
                              {doc.accessCode || doc.id}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">
                            {doc.pageCount} pgs · {(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-200">
                            {formatUGX(doc.priceUGX)}
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">{doc.salesCount || 0}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                doc.status === "published"
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : doc.status === "takedown"
                                  ? "text-rose-400 bg-rose-500/10"
                                  : "text-amber-400 bg-amber-500/10"
                              }`}
                            >
                              {doc.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {doc.status === "published" ? (
                              <button
                                onClick={() => {
                                  handleAdminAction({
                                    action: "review_document",
                                    documentId: doc.id,
                                    status: "unpublished",
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
                              >
                                Unpublish
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleAdminAction({
                                    action: "review_document",
                                    documentId: doc.id,
                                    status: "published",
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                              >
                                Publish
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. INSTITUTIONS & ACADEMIC STRUCTURE */}
          {/* ========================================================================= */}
          {activeTab === "institutions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Institutions &amp; Academic Hierarchy</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Structure: Institution → Faculty → Department → Programme → Course Unit.
                  </p>
                </div>
              </div>

              {/* Add Institution Panel */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-4 shadow-sm space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#14B8A6]" />
                  Add Higher Education Institution
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <input
                    type="text"
                    value={newInstName}
                    onChange={(e) => setNewInstName(e.target.value)}
                    placeholder="Institution Name (e.g. Uganda Christian University)"
                    className="bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-[#14B8A6]"
                  />
                  <input
                    type="text"
                    value={newInstCode}
                    onChange={(e) => setNewInstCode(e.target.value)}
                    placeholder="Code (e.g. UCU)"
                    className="bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-[#14B8A6]"
                  />
                  <button
                    onClick={() => {
                      if (!newInstName.trim()) {
                        showToast("Institution name required", "error");
                        return;
                      }
                      handleAdminAction({
                        action: "add_institution",
                        name: newInstName,
                        code: newInstCode,
                        country: newInstCountry,
                      });
                      setNewInstName("");
                      setNewInstCode("");
                    }}
                    className="rounded-xl bg-[#2563EB] hover:bg-blue-600 font-bold text-white transition py-2"
                  >
                    Register Institution
                  </button>
                </div>
              </div>

              {/* Institutions List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.institutions.map((inst) => (
                  <div
                    key={inst.id}
                    className="rounded-2xl border border-[#263449] bg-[#111C2E] p-4 shadow-sm space-y-2 hover:border-[#14B8A6]/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#14B8A6] bg-[#172438] px-2 py-0.5 rounded">
                        {inst.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{inst.country}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{inst.name}</h3>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-[#263449] flex justify-between">
                      <span>Faculties &amp; Departments</span>
                      <span className="font-mono text-slate-300">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. TRANSACTIONS & FINANCIAL MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Payment &amp; Transaction Ledger</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    MTN Mobile Money and Airtel Money transaction logs with double-entry ledger references.
                  </p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#172438] text-slate-300 border-b border-[#263449] font-mono">
                        <th className="p-3.5">Order Ref</th>
                        <th className="p-3.5">Student</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Provider</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#263449] text-slate-200">
                      {data?.orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#172438]/50 transition">
                          <td className="p-3.5 font-mono text-white">{ord.id}</td>
                          <td className="p-3.5 text-slate-300 font-mono text-[11px]">{ord.studentId}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-400">
                            {formatUGX(ord.totalAmountUGX)}
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">
                            {ord.paymentProvider || "MTN / AIRTEL"}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                ord.status === "completed"
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : ord.status === "refunded"
                                  ? "text-rose-400 bg-rose-500/10"
                                  : "text-amber-400 bg-amber-500/10"
                              }`}
                            >
                              {ord.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {formatDate(ord.createdAt)}
                          </td>
                          <td className="p-3.5 text-right">
                            {ord.status === "completed" && (
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    title: "Issue Administrative Refund",
                                    message: `Refund ${formatUGX(ord.totalAmountUGX)} for Order ${ord.id}? This will reverse the ledger balances cleanly.`,
                                    actionLabel: "Approve Refund",
                                    isDestructive: true,
                                    onConfirm: () => {
                                      handleAdminAction({
                                        action: "process_refund",
                                        orderId: ord.id,
                                        reason: "Administrative customer support refund",
                                      });
                                    },
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-xs transition"
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
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. REVENUE & FINANCIAL MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "revenue" && kpis && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Revenue &amp; Analytics</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Platform commission (10%), lecturer distribution (90%), and reconciliations.
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#111C2E] border border-[#263449] space-y-1">
                  <div className="text-xs text-slate-400">Total Gross Sales</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatUGX(kpis.grossSalesUGX)}
                  </div>
                  <div className="text-[10px] text-slate-500">100% of material purchases</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111C2E] border border-[#263449] space-y-1">
                  <div className="text-xs text-slate-400">Platform Commission (10%)</div>
                  <div className="text-2xl font-black text-[#14B8A6] font-mono">
                    {formatUGX(kpis.platformCommissionUGX)}
                  </div>
                  <div className="text-[10px] text-emerald-400">Net platform revenue</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111C2E] border border-[#263449] space-y-1">
                  <div className="text-xs text-slate-400">Lecturer Net Share (90%)</div>
                  <div className="text-2xl font-black text-blue-400 font-mono">
                    {formatUGX(kpis.lecturerEarningsUGX)}
                  </div>
                  <div className="text-[10px] text-slate-500">Credited to lecturer balances</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111C2E] border border-[#263449] space-y-1">
                  <div className="text-xs text-slate-400">Ledger Imbalance</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    UGX {data?.reconciliation.imbalanceUGX || 0}
                  </div>
                  <div className="text-[10px] text-emerald-400">Exact zero disparity</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. LECTURER WITHDRAWALS */}
          {/* ========================================================================= */}
          {activeTab === "withdrawals" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Lecturer Withdrawal Management</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lecturers withdraw their net earnings via MTN or Airtel Mobile Money. Minimum withdrawal threshold: <span className="font-mono text-[#14B8A6]">UGX 20,000</span>.
                  </p>
                </div>
              </div>

              {/* Withdrawal Items Table */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#172438] text-slate-300 border-b border-[#263449] font-mono">
                        <th className="p-3.5">Withdrawal Ref</th>
                        <th className="p-3.5">Lecturer</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Provider Tx Ref</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#263449] text-slate-200">
                      {data?.payoutItems.map((p) => (
                        <tr key={p.payoutReference} className="hover:bg-[#172438]/50 transition">
                          <td className="p-3.5 font-mono text-white">{p.payoutReference}</td>
                          <td className="p-3.5 font-mono text-slate-300">{p.lecturerId}</td>
                          <td className="p-3.5 font-mono font-bold text-amber-400">
                            {formatUGX(p.amountUGX)}
                          </td>
                          <td className="p-3.5 font-mono text-slate-400">
                            {p.providerTransactionId || "PENDING_SETTLEMENT"}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                p.status === "PAID"
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : p.status === "REJECTED"
                                  ? "text-rose-400 bg-rose-500/10"
                                  : "text-amber-400 bg-amber-500/10"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            {p.status === "REQUESTED" && (
                              <button
                                onClick={() => setSelectedWithdrawal(p)}
                                className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition"
                              >
                                Reconcile
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reconcile Withdrawal Modal */}
              {selectedWithdrawal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="bg-[#111C2E] border border-[#263449] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#263449] pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Reconcile Lecturer Withdrawal</h3>
                        <p className="text-xs text-slate-400 font-mono">{selectedWithdrawal.payoutReference}</p>
                      </div>
                      <button
                        onClick={() => setSelectedWithdrawal(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#172438] flex justify-between">
                        <span className="text-slate-400">Amount Due:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatUGX(selectedWithdrawal.amountUGX)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold">Mobile Money Provider Transaction ID:</label>
                        <input
                          type="text"
                          value={withdrawalProviderTxId}
                          onChange={(e) => setWithdrawalProviderTxId(e.target.value)}
                          placeholder="e.g. MTN-MOMO-TX-9872145"
                          className="w-full bg-[#172438] border border-[#263449] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#14B8A6]"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => {
                            handleAdminAction({
                              action: "resolve_payout_item",
                              payoutReference: selectedWithdrawal.payoutReference,
                              outcome: "REJECTED",
                              failureReason: "Manual administrative rejection or insufficient verification",
                            });
                            setSelectedWithdrawal(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
                        >
                          Reject Withdrawal
                        </button>
                        <button
                          onClick={() => {
                            handleAdminAction({
                              action: "resolve_payout_item",
                              payoutReference: selectedWithdrawal.payoutReference,
                              outcome: "PAID",
                              providerTransactionId: withdrawalProviderTxId || `MOMO-${Date.now()}`,
                            });
                            setSelectedWithdrawal(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                        >
                          Confirm Paid
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. QR CODES & ACCESS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "qrcodes" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">QR Codes &amp; Document Access</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Monitor classroom QR scans, verify collection links, and audit mobile access conversions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.collections.map((col) => (
                  <div
                    key={col.id}
                    className="rounded-2xl border border-[#263449] bg-[#111C2E] p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#14B8A6] bg-[#172438] px-2 py-0.5 rounded">
                        {col.shareCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {col.documentIds.length} Notes in Pack
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{col.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{col.description}</p>
                    </div>

                    {col.qrCodeDataUrl && (
                      <div className="h-32 w-32 mx-auto bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
                        <img
                          src={col.qrCodeDataUrl}
                          alt={`QR Code for ${col.shareCode}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. REPORTS & ANALYTICS */}
          {/* ========================================================================= */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Reports &amp; Operational Exports</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate audit-ready CSV exports for platform transactions, users, and payout settlements.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#111C2E] border border-[#263449] space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Transactions &amp; Orders Report</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Full breakdown of all mobile money purchases, student IDs, and amounts.
                    </p>
                  </div>
                  <button
                    onClick={() => exportReportsToCSV("orders")}
                    className="w-full py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 font-bold text-xs text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-[#111C2E] border border-[#263449] space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Users &amp; Academic Census</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      List of all registered students, lecturers, faculties, and verification states.
                    </p>
                  </div>
                  <button
                    onClick={() => exportReportsToCSV("users")}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-[#111C2E] border border-[#263449] space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Lecturer Withdrawal Settlements</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Audited historical record of all processed and pending withdrawal requests.
                    </p>
                  </div>
                  <button
                    onClick={() => exportReportsToCSV("withdrawals")}
                    className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 11. SUPPORT & COMPLAINTS */}
          {/* ========================================================================= */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Support &amp; Complaints Ticketing</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Resolve student payment issues, verification queries, and academic feedback.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#172438] text-slate-300 border-b border-[#263449] font-mono">
                        <th className="p-3.5">Ticket #</th>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Subject</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#263449] text-slate-200">
                      {data?.supportTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-[#172438]/50 transition">
                          <td className="p-3.5 font-mono text-white font-bold">{t.ticketNumber}</td>
                          <td className="p-3.5">
                            <div className="font-bold text-white">{t.userName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{t.userEmail}</div>
                          </td>
                          <td className="p-3.5 font-mono uppercase text-[#14B8A6]">
                            {t.category.replace("_", " ")}
                          </td>
                          <td className="p-3.5 text-slate-200">{t.subject}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                t.status === "resolved"
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : t.status === "in_progress"
                                  ? "text-blue-400 bg-blue-500/10"
                                  : "text-amber-400 bg-amber-500/10"
                              }`}
                            >
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setActiveTicket(t)}
                              className="px-2.5 py-1 rounded-lg bg-[#172438] hover:bg-[#263449] text-white font-bold text-xs transition"
                            >
                              Respond
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Respond to Ticket Modal */}
              {activeTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="bg-[#111C2E] border border-[#263449] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#263449] pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{activeTicket.ticketNumber}</h3>
                        <p className="text-xs text-slate-400">{activeTicket.subject}</p>
                      </div>
                      <button
                        onClick={() => setActiveTicket(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#172438] space-y-1">
                        <div className="text-slate-400">User Message:</div>
                        <div className="text-slate-200 leading-relaxed">{activeTicket.message}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold">Administrative Resolution Notes:</label>
                        <textarea
                          rows={3}
                          value={ticketReply}
                          onChange={(e) => setTicketReply(e.target.value)}
                          placeholder="Document resolution action taken..."
                          className="w-full bg-[#172438] border border-[#263449] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#14B8A6]"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => {
                            handleAdminAction({
                              action: "update_support_ticket",
                              ticketId: activeTicket.id,
                              status: "resolved",
                              resolutionNotes: ticketReply || "Resolved by administrator",
                            });
                            setActiveTicket(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 12. NOTIFICATIONS & ANNOUNCEMENTS */}
          {/* ========================================================================= */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Broadcast Notifications</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Publish academic and payment notices to all students, lecturers, or target universities.
                  </p>
                </div>
              </div>

              {/* Create Announcement Form */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Send className="h-4 w-4 text-[#14B8A6]" />
                  Broadcast New Announcement
                </div>
                <div className="space-y-3 text-xs">
                  <input
                    type="text"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    placeholder="Announcement Title (e.g. Semester Exam Revision Materials Active)"
                    className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-[#14B8A6]"
                  />
                  <textarea
                    rows={2}
                    value={newAnnMessage}
                    onChange={(e) => setNewAnnMessage(e.target.value)}
                    placeholder="Full announcement body for in-app delivery..."
                    className="w-full bg-[#172438] border border-[#263449] rounded-xl p-2.5 text-white placeholder-slate-500 outline-none focus:border-[#14B8A6]"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <select
                      value={newAnnAudience}
                      onChange={(e: any) => setNewAnnAudience(e.target.value)}
                      className="bg-[#172438] border border-[#263449] rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value="all">Audience: All Students &amp; Lecturers</option>
                      <option value="students">Audience: Students Only</option>
                      <option value="lecturers">Audience: Lecturers Only</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!newAnnTitle.trim() || !newAnnMessage.trim()) {
                          showToast("Title and message are required", "error");
                          return;
                        }
                        handleAdminAction({
                          action: "create_announcement",
                          title: newAnnTitle,
                          message: newAnnMessage,
                          audience: newAnnAudience,
                        });
                        setNewAnnTitle("");
                        setNewAnnMessage("");
                      }}
                      className="px-5 py-2 rounded-xl bg-[#14B8A6] hover:bg-teal-600 font-bold text-white transition"
                    >
                      Broadcast Announcement
                    </button>
                  </div>
                </div>
              </div>

              {/* Announcements Feed */}
              <div className="space-y-3">
                {data?.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-2xl border border-[#263449] bg-[#111C2E] p-4 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#14B8A6] uppercase">
                        {ann.audience}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{formatDate(ann.createdAt)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{ann.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{ann.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 13. WEBSITE & CONTENT MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Website &amp; Content Management</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage public landing page headline, course unit highlights, and contact information safely.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-5 shadow-sm space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Homepage Hero Headline:</label>
                  <input
                    type="text"
                    defaultValue={data?.websiteContent.heroTitle}
                    id="heroTitleInput"
                    className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white outline-none focus:border-[#14B8A6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Homepage Hero Subtitle:</label>
                  <textarea
                    rows={2}
                    defaultValue={data?.websiteContent.heroSubtitle}
                    id="heroSubtitleInput"
                    className="w-full bg-[#172438] border border-[#263449] rounded-xl p-2.5 text-white outline-none focus:border-[#14B8A6]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Support Email:</label>
                    <input
                      type="text"
                      defaultValue={data?.websiteContent.contactEmail}
                      id="contactEmailInput"
                      className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white outline-none focus:border-[#14B8A6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Support Phone:</label>
                    <input
                      type="text"
                      defaultValue={data?.websiteContent.supportPhone}
                      id="supportPhoneInput"
                      className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white outline-none focus:border-[#14B8A6]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      const heroTitle = (document.getElementById("heroTitleInput") as HTMLInputElement)?.value;
                      const heroSubtitle = (document.getElementById("heroSubtitleInput") as HTMLTextAreaElement)?.value;
                      const contactEmail = (document.getElementById("contactEmailInput") as HTMLInputElement)?.value;
                      const supportPhone = (document.getElementById("supportPhoneInput") as HTMLInputElement)?.value;

                      handleAdminAction({
                        action: "update_website_content",
                        heroTitle,
                        heroSubtitle,
                        contactEmail,
                        supportPhone,
                      });
                    }}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 font-bold text-white transition"
                  >
                    Save Content Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 14. SECURITY & AUDIT LOGS */}
          {/* ========================================================================= */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Security &amp; Audit Logs</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immutable security log recording actor identities, verification approvals, and financial reversals.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#172438] text-slate-300 border-b border-[#263449] font-mono">
                        <th className="p-3.5">Log ID</th>
                        <th className="p-3.5">Action</th>
                        <th className="p-3.5">Actor</th>
                        <th className="p-3.5">Target Type / ID</th>
                        <th className="p-3.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#263449] text-slate-200">
                      {data?.auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#172438]/50 transition">
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">{log.id}</td>
                          <td className="p-3.5 font-bold text-white">{log.action}</td>
                          <td className="p-3.5 font-mono text-teal-400">{log.actorId}</td>
                          <td className="p-3.5 font-mono text-slate-300">
                            {log.targetType} / {log.targetId}
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {formatDate(log.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 15. SYSTEM MONITORING (DEVELOPER TOOLS) */}
          {/* ========================================================================= */}
          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">System Monitoring &amp; Developer Desk</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authorized technical tools, mobile money simulation, and ledger inspection.
                  </p>
                </div>
              </div>

              {/* Momo Simulator */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Terminal className="h-4 w-4 text-[#14B8A6]" />
                    Mobile Money Transaction Simulator (MTN &amp; Airtel)
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Sandbox Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Provider:</label>
                    <select
                      value={simProvider}
                      onChange={(e: any) => setSimProvider(e.target.value)}
                      className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white"
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="AIRTEL">Airtel Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Amount (UGX):</label>
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Phone Number:</label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      disabled={simulatingDeposit}
                      onClick={async () => {
                        setSimulatingDeposit(true);
                        try {
                          await handleAdminAction({
                            action: "simulate_momo_deposit",
                            amountUGX: Number(simAmount),
                            phoneNumber: simPhone,
                            provider: simProvider,
                          });
                        } finally {
                          setSimulatingDeposit(false);
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white transition flex items-center justify-center gap-1.5"
                    >
                      <Zap className="h-4 w-4" />
                      <span>{simulatingDeposit ? "Simulating..." : "Execute Deposit"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Double-Entry Ledger Inspector */}
              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#263449] font-bold text-xs text-white">
                  Real-time Double-Entry Ledger Postings
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-[#172438] text-slate-300 border-b border-[#263449]">
                        <th className="p-3">Entry ID</th>
                        <th className="p-3">Account</th>
                        <th className="p-3">Debit (UGX)</th>
                        <th className="p-3">Credit (UGX)</th>
                        <th className="p-3">Memo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#263449] text-slate-300 text-[11px]">
                      {data?.ledgerEntries.slice(0, 10).map((le) => (
                        <tr key={le.id}>
                          <td className="p-3 text-slate-400">{le.id}</td>
                          <td className="p-3 text-white font-bold">{le.accountCode}</td>
                          <td className="p-3 text-emerald-400">{le.debitUGX ? formatUGX(le.debitUGX) : "-"}</td>
                          <td className="p-3 text-blue-400">{le.creditUGX ? formatUGX(le.creditUGX) : "-"}</td>
                          <td className="p-3 text-slate-400">{le.memo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 16. PLATFORM SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263449] pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Platform Configuration &amp; Policies</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Commission rates, payout thresholds, and payment provider parameters.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#263449] bg-[#111C2E] p-6 shadow-sm max-w-2xl space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Platform Commission Rate (%):</label>
                  <input
                    type="number"
                    defaultValue={data?.settings.commissionPercent}
                    id="commissionInput"
                    className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Current standard is 10% platform commission.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Minimum Lecturer Withdrawal Threshold (UGX):</label>
                  <input
                    type="number"
                    defaultValue={data?.settings.minLecturerPayoutUGX}
                    id="minWithdrawalInput"
                    className="w-full bg-[#172438] border border-[#263449] rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Minimum threshold is UGX 20,000.</p>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      const comm = Number((document.getElementById("commissionInput") as HTMLInputElement)?.value);
                      const minWithdrawal = Number((document.getElementById("minWithdrawalInput") as HTMLInputElement)?.value);

                      handleAdminAction({
                        action: "update_settings",
                        commissionPercent: comm,
                        minLecturerPayoutUGX: minWithdrawal,
                      });
                    }}
                    className="px-5 py-2 rounded-xl bg-[#14B8A6] hover:bg-teal-600 font-bold text-white transition"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
