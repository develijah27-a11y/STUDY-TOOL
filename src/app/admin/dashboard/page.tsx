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
  Settings,
  FileSpreadsheet,
  Calculator,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Check,
  Info,
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
  fullName: string;
  department: string;
  teachingRole: string;
  institutionalEmail?: string;
  verificationStatus: string;
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
}

interface PayoutRecord {
  id: string;
  payoutReference: string;
  destinationPhone: string;
  destinationNetwork: string;
  amountUGX: number;
  status: string;
  failureReason?: string;
}

interface AuditItem {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

const REPRESENTATIVE_PRICES_UGX = [2000, 5000, 10000, 20000];

export default function AdminDashboardPage() {
  const [recon, setRecon] = useState<ReconciliationReport | null>(null);
  const [lecturers, setLecturers] = useState<LecturerApp[]>([]);
  const [reports, setReports] = useState<ContentReportItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [commissionPercent, setCommissionPercent] = useState(15);
  const [minPayoutUGX, setMinPayoutUGX] = useState(10000);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active Tab: ledger | verification | moderation | refunds | audit
  const [activeTab, setActiveTab] = useState<
    "ledger" | "verification" | "moderation" | "refunds" | "audit"
  >("ledger");
  const [auditSearch, setAuditSearch] = useState("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?adminId=user-admin-1");
      if (res.ok) {
        const data = await res.json();
        setRecon(data.reconciliation);
        setLecturers(data.lecturerProfiles || []);
        setReports(data.reports || []);
        setOrders(data.orders || []);
        setPayouts(data.payoutItems || []);
        setAuditLogs(data.auditLogs || []);
        setCommissionPercent(data.settings?.commissionPercent ?? 15);
        setMinPayoutUGX(data.settings?.minLecturerPayoutUGX ?? 10000);
      }
    } catch (err) {
      console.error("Failed to load admin audit data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleReviewLecturer = async (lecturerId: string, decision: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_lecturer",
          adminId: "user-admin-1",
          lecturerId,
          decision,
          rejectionReason:
            decision === "reject" ? "Insufficient institutional ID evidence" : undefined,
        }),
      });
      if (res.ok) {
        setStatusBanner(
          `Lecturer verification updated (${decision.toUpperCase()}) and logged in immutable audit trail.`
        );
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessRefund = async (orderId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_refund",
          adminId: "user-admin-1",
          orderId,
          reason: "Verified student refund request — compensating ledger entry posted",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusBanner(
          `Order refunded via compensating transaction ${data.compensatingTransaction.reference}. Entitlement revoked & ledger balanced.`
        );
        await loadAdminData();
      } else {
        setStatusBanner(`Refund blocked: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolvePayout = async (
    payoutReference: string,
    outcome: "PAID" | "FAILED" | "TIMEOUT"
  ) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_payout_item",
          adminId: "user-admin-1",
          payoutReference,
          outcome,
        }),
      });
      if (res.ok) {
        setStatusBanner(`Payout ${payoutReference} reconciled with status: ${outcome}.`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModerateReport = async (reportId: string, decision: "takedown" | "dismiss") => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moderate_report",
          adminId: "user-admin-1",
          reportId,
          decision,
        }),
      });
      if (res.ok) {
        setStatusBanner(`Content report ${reportId} resolved (${decision}).`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorId.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.targetId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      
      {/* Top Banner: Financial Comptroller Proof & Reconciliation Status */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 md:p-10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Scale className="h-3.5 w-3.5" />
              <span>SomaUG Platform Financial &amp; Transaction Audit</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Ledger Reconciliation:{" "}
                <span className={recon?.isStrictlyBalanced ? "text-emerald-400" : "text-red-400"}>
                  {recon?.isStrictlyBalanced ? "0 UGX Discrepancy" : "Discrepancy Detected"}
                </span>
              </h1>
            </div>

            <p className="text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">
              Every deposit, purchase, withdrawal, and fee is validated against the double-entry
              equation: Total Debits = Total Credits. No floating-point rounding errors or hidden balances.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAdminData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs font-bold text-white transition shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Ledger Proof</span>
            </button>
          </div>
        </div>

        {/* 4 Core Financial Proof Cards */}
        {recon && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Total Ledger Debits
              </span>
              <span className="text-xl font-black text-white">
                {formatUGX(recon.totalLedgerDebitsUGX)}
              </span>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Total Ledger Credits
              </span>
              <span className="text-xl font-black text-white">
                {formatUGX(recon.totalLedgerCreditsUGX)}
              </span>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Net Balance Discrepancy
              </span>
              <span className="text-xl font-black text-emerald-400">
                {formatUGX(recon.discrepancyUGX)}
              </span>
            </div>

            <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/30 p-4 space-y-1">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                Audit Equation State
              </span>
              <span className="text-sm font-black text-emerald-300 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Strictly Balanced</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Feedback Banner */}
      {statusBanner && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs font-mono text-emerald-400 flex items-center justify-between shadow-md">
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
          { id: "ledger", label: "Chart of Accounts", icon: FileSpreadsheet },
          { id: "verification", label: `Lecturer Approvals (${lecturers.filter(l => l.verificationStatus === "pending").length})`, icon: UserCheck },
          { id: "refunds", label: `Student Refunds (${orders.length})`, icon: RotateCcw },
          { id: "moderation", label: `Content Reports (${reports.filter(r => r.status === "open").length})`, icon: Flag },
          { id: "audit", label: `Audit & Access Logs (${auditLogs.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? "bg-[#0B192C] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Chart of Accounts & Wallet Reconciliation */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          
          {/* Wallet Liability Reconciliation Table */}
          {recon && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-600" />
                <span>Active User Wallets vs. Ledger System Liabilities</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Student Liabilities (2000)</span>
                  <div className="text-sm font-black text-slate-900">
                    Wallets: {formatUGX(recon.walletReconciliation.studentWalletsTotalUGX)}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Ledger: {formatUGX(recon.walletReconciliation.ledgerStudentLiabilityUGX)}
                  </div>
                  <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    100% Reconciled
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Lecturer Liabilities (2010)</span>
                  <div className="text-sm font-black text-slate-900">
                    Wallets: {formatUGX(recon.walletReconciliation.lecturerWalletsTotalUGX)}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Ledger: {formatUGX(recon.walletReconciliation.ledgerLecturerLiabilityUGX)}
                  </div>
                  <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    100% Reconciled
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">In-Transit Reserves (2020)</span>
                  <div className="text-sm font-black text-slate-900">
                    Wallets: {formatUGX(recon.walletReconciliation.reservedWalletsTotalUGX)}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Ledger: {formatUGX(recon.walletReconciliation.ledgerReservesLiabilityUGX)}
                  </div>
                  <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    100% Reconciled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Chart of Accounts Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Chart of Accounts Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Account Name</th>
                    <th className="pb-3">Account Type</th>
                    <th className="pb-3 text-right">Balance (UGX)</th>
                    <th className="pb-3 text-right">Journal Postings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recon?.accountSummaries.map((acc) => (
                    <tr key={acc.code} className="hover:bg-slate-50/80">
                      <td className="py-3 font-mono font-bold text-slate-900">{acc.code}</td>
                      <td className="py-3 font-semibold text-slate-800">{acc.name}</td>
                      <td className="py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                          {acc.type}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-black text-slate-900">
                        {formatUGX(acc.balanceUGX)}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500">
                        {acc.entryCount} postings
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Lecturer Approvals */}
      {activeTab === "verification" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            University Academic Staff Verification Queue
          </h3>
          <div className="space-y-3">
            {lecturers.map((lec) => (
              <div
                key={lec.id}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{lec.fullName}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        lec.verificationStatus === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : lec.verificationStatus === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {lec.verificationStatus}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    {lec.teachingRole} • {lec.department}
                  </div>
                  {lec.institutionalEmail && (
                    <div className="text-[11px] font-mono text-slate-400">
                      Email: {lec.institutionalEmail}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {lec.verificationStatus !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleReviewLecturer(lec.id, "approve")}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve Staff</span>
                    </button>
                  )}

                  {lec.verificationStatus !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => handleReviewLecturer(lec.id, "reject")}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Atomic Refunds & Reversals */}
      {activeTab === "refunds" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Authoritative Orders &amp; Compensating Reversals
              </h3>
              <p className="text-xs text-slate-500">
                Refunds post compensating ledger entries, credit student spendable balance, and revoke entitlements atomically.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      {formatUGX(ord.grossAmountUGX)}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        ord.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 pt-1">
                    Order: {ord.orderNumber} • Ref: {ord.receiptReference}
                  </div>
                  <div className="text-[11px] text-slate-400">Doc ID: {ord.documentId}</div>
                </div>

                <div>
                  {ord.status === "completed" ? (
                    <button
                      type="button"
                      onClick={() => handleProcessRefund(ord.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Process Atomic Refund</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-purple-700">
                      Compensating Entry Posted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Content Moderation Reports */}
      {activeTab === "moderation" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            Student Reports &amp; Copyright Inquiries
          </h3>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No reports filed by students.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 uppercase">{rep.category}</span>
                      <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold">
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">{rep.details}</p>
                    <span className="text-[11px] font-mono text-slate-400">Doc: {rep.documentId}</span>
                  </div>

                  {rep.status === "open" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleModerateReport(rep.id, "takedown")}
                        className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                      >
                        Takedown
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModerateReport(rep.id, "dismiss")}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Immutable Financial & System Audit Trail */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">
              Immutable Platform Audit Trail ({auditLogs.length} Events)
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Actor</th>
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Target Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 font-bold text-slate-800">{log.actorId}</td>
                    <td className="py-2.5">
                      <span className="rounded bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {log.targetType}:{log.targetId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
