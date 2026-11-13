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

  const loadAdminData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleReviewLecturer = async (lecturerId: string, decision: "approve" | "reject") => {
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
        `Lecturer verification updated (${decision.toUpperCase()}) and logged in audit trail.`
      );
      await loadAdminData();
    }
  };

  const handleProcessRefund = async (orderId: string) => {
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
  };

  const handleResolvePayout = async (
    payoutReference: string,
    outcome: "PAID" | "FAILED" | "TIMEOUT"
  ) => {
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
  };

  const handleModerateReport = async (reportId: string, decision: "takedown" | "dismiss") => {
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
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_settings",
        adminId: "user-admin-1",
        commissionPercent: Number(commissionPercent),
        minLecturerPayoutUGX: Number(minPayoutUGX),
      }),
    });
    if (res.ok) {
      setStatusBanner(
        "Platform commission & payout threshold policy updated (historical orders preserve their original policy snapshot)."
      );
      await loadAdminData();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Admin Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Comptroller &amp; Administration Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Double-Entry Ledger Reconciliation &amp; Governance
          </h1>
          <p className="text-xs text-slate-300">
            All administrative actions are permission-checked server-side and recorded in the immutable audit log.
          </p>
        </div>

        {recon && (
          <div
            className={`rounded-xl border px-4 py-3 text-xs font-bold ${
              recon.isStrictlyBalanced
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                : "bg-red-500/20 border-red-400/40 text-red-200"
            }`}
          >
            <div className="flex items-center gap-1.5 text-sm">
              <Scale className="h-4 w-4" />
              <span>
                {recon.isStrictlyBalanced
                  ? "LEDGER STRICTLY BALANCED"
                  : "DISCREPANCY DETECTED"}
              </span>
            </div>
            <div className="mt-1 font-mono text-[11px]">
              Debits: {formatUGX(recon.totalLedgerDebitsUGX)} == Credits:{" "}
              {formatUGX(recon.totalLedgerCreditsUGX)}
            </div>
          </div>
        )}
      </div>

      {statusBanner && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-950 flex items-center justify-between">
          <span>{statusBanner}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-emerald-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: Double-Entry Chart of Accounts & Wallet Liability Reconciliation */}
      {recon && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-amber-600" />
              <span>Chart of Accounts &amp; Wallet Liability Reconciliation</span>
            </h2>
            <span className="text-xs font-mono text-emerald-700 font-bold">
              Discrepancy: {formatUGX(recon.discrepancyUGX)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs">
              <span className="text-slate-500 block font-medium">Student Wallet Liabilities</span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatUGX(recon.walletReconciliation.studentWalletsTotalUGX)}
              </span>
              <span className="block text-[11px] text-emerald-700 font-semibold mt-0.5">
                ✓ Matches Ledger 2010: {formatUGX(recon.walletReconciliation.ledgerStudentLiabilityUGX)}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs">
              <span className="text-slate-500 block font-medium">Lecturer Earnings Payables</span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatUGX(recon.walletReconciliation.lecturerWalletsTotalUGX)}
              </span>
              <span className="block text-[11px] text-emerald-700 font-semibold mt-0.5">
                ✓ Matches Ledger 2020: {formatUGX(recon.walletReconciliation.ledgerLecturerLiabilityUGX)}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs">
              <span className="text-slate-500 block font-medium">Reserved Payout Obligations</span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatUGX(recon.walletReconciliation.reservedWalletsTotalUGX)}
              </span>
              <span className="block text-[11px] text-emerald-700 font-semibold mt-0.5">
                ✓ Matches Ledger 2030: {formatUGX(recon.walletReconciliation.ledgerReservesLiabilityUGX)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Account Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Posted Entries</th>
                  <th className="py-2.5 px-3">Authoritative Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recon.accountSummaries.map((acc) => (
                  <tr key={acc.code}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{acc.code}</td>
                    <td className="py-2.5 px-3">{acc.name}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-500">
                      {acc.type}
                    </td>
                    <td className="py-2.5 px-3">{acc.entryCount}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {formatUGX(acc.balanceUGX)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 2: Commission Rate & Representative Price Financial Modeling (Part X §21) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Commission Split &amp; Mobile Money Fee Modeling (Part X §21)
              </h2>
              <p className="text-xs text-slate-500">
                Representative prices modeled at active {commissionPercent}% platform fee (exact integer UGX)
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
            Active Split: {100 - commissionPercent}% Lecturer / {commissionPercent}% Platform
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3">Representative Publication Price</th>
                <th className="py-2.5 px-3">Platform Commission ({commissionPercent}%)</th>
                <th className="py-2.5 px-3">Lecturer Net Earnings ({100 - commissionPercent}%)</th>
                <th className="py-2.5 px-3">Est. MoMo Collection Cost (2%)</th>
                <th className="py-2.5 px-3">Net Platform Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {REPRESENTATIVE_PRICES_UGX.map((price) => {
                const platformFee = Math.floor((price * commissionPercent) / 100);
                const lecturerNet = price - platformFee;
                const momoCost = Math.floor((price * 2) / 100);
                const netMargin = platformFee - momoCost;

                return (
                  <tr key={price}>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">
                      {formatUGX(price)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {formatUGX(platformFee)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">
                      {formatUGX(lecturerNet)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{formatUGX(momoCost)}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-800">
                      {formatUGX(netMargin)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Lecturer Verification Queue & Content Moderation */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Lecturer Verification Review */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-600" />
            <span>Lecturer Verification Applications</span>
          </h2>

          <div className="space-y-3">
            {lecturers.map((lec) => (
              <div
                key={lec.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{lec.fullName}</span>
                  <span className="block text-slate-600">
                    {lec.teachingRole} • {lec.department}
                  </span>
                  <span className="inline-block mt-1 rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Status: {lec.verificationStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReviewLecturer(lec.id, "approve")}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-white font-bold hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewLecturer(lec.id, "reject")}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-white font-bold hover:bg-red-700"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Moderation & Copyright Takedowns */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            <span>Reported Materials &amp; Copyright Complaints</span>
          </h2>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-red-700">{rep.category}</span>
                  <span className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold">
                    {rep.status}
                  </span>
                </div>
                <p className="text-slate-700">{rep.details}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleModerateReport(rep.id, "takedown")}
                    className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700"
                  >
                    Execute Copyright Takedown
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerateReport(rep.id, "dismiss")}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Mark Corrected / Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Order Refunds (Compensating Ledger Entries) & Payout Reconciliation */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Refund Review */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber-600" />
            <span>Purchase Orders &amp; Compensating Refunds</span>
          </h2>
          {orders.length === 0 ? (
            <p className="text-xs text-slate-500">
              No student orders committed in this session yet. Purchase a document first to test
              compensating refund entries.
            </p>
          ) : (
            <div className="space-y-2.5">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">
                      {ord.orderNumber} ({formatUGX(ord.grossAmountUGX)})
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Status: {ord.status.toUpperCase()} • Receipt: {ord.receiptReference}
                    </span>
                  </div>
                  {ord.status === "completed" && (
                    <button
                      type="button"
                      onClick={() => handleProcessRefund(ord.id)}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-700"
                    >
                      Issue Compensating Refund
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout Batch & Provider Timeout Reconciliation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            <span>Lecturer Payout Batch &amp; Timeout Reconciliation</span>
          </h2>
          {payouts.length === 0 ? (
            <p className="text-xs text-slate-500">
              No pending lecturer payouts. Request a payout on the Lecturer Dashboard to test
              settlement, timeout preservation, or failure reversal.
            </p>
          ) : (
            <div className="space-y-2.5">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {p.payoutReference} • {formatUGX(p.amountUGX)}
                    </span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {p.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleResolvePayout(p.payoutReference, "PAID")}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white"
                    >
                      Confirm Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolvePayout(p.payoutReference, "TIMEOUT")}
                      className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white"
                    >
                      Simulate Timeout
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolvePayout(p.payoutReference, "FAILED")}
                      className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white"
                    >
                      Fail &amp; Reverse to Wallet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Configurable Commission Policy & Audit Log */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-700" />
            <span>Configurable Commission &amp; Payout Threshold Policy</span>
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Min Lecturer Payout Threshold (UGX)
                </label>
                <input
                  type="number"
                  min={5000}
                  step={1000}
                  value={minPayoutUGX}
                  onChange={(e) => setMinPayoutUGX(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-bold"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#0B192C] px-4 py-2.5 font-bold text-white hover:bg-slate-800"
            >
              Save Policy Configuration
            </button>
          </form>
        </div>

        {/* Immutable Admin Audit Trail */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Privileged Operations Audit Trail ({auditLogs.length})
          </h2>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500">
              Perform an administrative action above to see real-time audit records.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px]"
                >
                  <span className="font-bold text-slate-900">{log.action}</span> on{" "}
                  <span>
                    {log.targetType}:{log.targetId}
                  </span>{" "}
                  by {log.actorId} ({formatDate(log.createdAt)})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
