"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Smartphone,
  BookOpen,
} from "lucide-react";

interface DepositItem {
  id: string;
  reference: string;
  phoneNumber: string;
  provider: "MTN" | "AIRTEL";
  amountUGX: number;
  status: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  documentId: string;
  grossAmountUGX: number;
  receiptReference: string;
  status: string;
  createdAt: string;
}

export default function StudentWalletPage() {
  const [selectedStudentId, setSelectedStudentId] = useState("user-student-1");
  const [spendableBalance, setSpendableBalance] = useState(25000);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);

  // Deposit Form
  const [depositPhone, setDepositPhone] = useState("0772112233");
  const [depositAmount, setDepositAmount] = useState(10000);
  const [depositMessage, setDepositMessage] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Withdrawal Form
  const [withdrawPhone, setWithdrawPhone] = useState("0772112233");
  const [withdrawAmount, setWithdrawAmount] = useState(5000);
  const [withdrawPin, setWithdrawPin] = useState("1234");
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const loadWalletData = useCallback(async () => {
    const res = await fetch(
      `/api/wallet?userId=${selectedStudentId}&targetUserId=${selectedStudentId}&walletType=student`
    );
    if (res.ok) {
      const data = await res.json();
      setSpendableBalance(data.wallet?.spendableBalanceUGX ?? 0);
      setReservedBalance(data.wallet?.reservedBalanceUGX ?? 0);
      setDeposits(data.deposits || []);
      setOrders(data.orders || []);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleInitiateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    setDepositMessage(null);

    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deposit_initiate",
        studentId: selectedStudentId,
        phoneNumber: depositPhone,
        amountUGX: Number(depositAmount),
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      setDepositError(data.error || "Failed to initiate deposit");
      return;
    }

    setDepositMessage(
      `${data.instructions} (Notice: Pending deposits are not spendable until provider webhook confirmation.)`
    );
    await loadWalletData();
  };

  const handleConfirmPendingWebhook = async (dep: DepositItem) => {
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deposit_confirm_webhook",
        eventId: `EVT-${dep.reference}`,
        reference: dep.reference,
        provider: dep.provider,
        status: "SUCCESSFUL",
        amountUGX: dep.amountUGX,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setDepositMessage(
        data.alreadyProcessed
          ? `Idempotency Verified: Duplicate webhook for ${dep.reference} was ignored (credited only once).`
          : `Webhook Confirmed! ${formatUGX(dep.amountUGX)} credited to your spendable balance.`
      );
      await loadWalletData();
    }
  };

  const handleStudentWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawMessage(null);

    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "student_withdraw",
        studentId: selectedStudentId,
        destinationPhone: withdrawPhone,
        amountUGX: Number(withdrawAmount),
        pin: withdrawPin,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setWithdrawError(data.error || "Withdrawal failed");
      return;
    }

    setWithdrawMessage(
      `Withdrawal reference ${data.withdrawalReference} initiated. ${formatUGX(
        withdrawAmount
      )} moved from spendable to reserved balance awaiting Mobile Money settlement.`
    );
    await loadWalletData();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Top Wallet Balance Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0f2027] to-[#203a43] text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
              <Wallet className="h-3.5 w-3.5" />
              <span>Double-Entry Student Wallet (UGX)</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {formatUGX(spendableBalance)}
            </h1>
            <p className="text-xs text-slate-300">
              Authoritative Spendable Balance • Reserved / In-Flight Withdrawals:{" "}
              <strong>{formatUGX(reservedBalance)}</strong>
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl p-4 space-y-2 min-w-[260px]">
            <label className="block text-xs font-bold text-amber-300">
              Switch Student Profile:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setDepositMessage(null);
                setWithdrawMessage(null);
              }}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-semibold text-white"
            >
              <option value="user-student-1">Grace Namukasa (Makerere BSSE)</option>
              <option value="user-student-2">Ivan Mugisha (MUBS Class Coordinator)</option>
            </select>
            <p className="text-[11px] text-slate-300">
              Default Sandbox PIN: <code className="text-amber-300 font-bold">1234</code>
            </p>
          </div>
        </div>
      </div>

      {/* Deposit & Withdrawal Action Forms */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* MTN MoMo & Airtel Money Deposit Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Deposit via MTN MoMo or Airtel Money
                </h2>
                <p className="text-xs text-slate-500">
                  Auto-detects MTN (077/078/076) and Airtel (070/075/074)
                </p>
              </div>
            </div>
            <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              Sandbox Mode
            </span>
          </div>

          <form onSubmit={handleInitiateDeposit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Money Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={depositPhone}
                    onChange={(e) => setDepositPhone(e.target.value)}
                    placeholder="0772112233 or 0701445566"
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deposit Amount (Min UGX 1,000)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[2000, 5000, 10000, 20000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  +{formatUGX(amt)}
                </button>
              ))}
            </div>

            {depositError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-semibold">
                {depositError}
              </div>
            )}

            {depositMessage && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium">
                {depositMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[#0f2027] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Initiate Mobile Money Deposit ({formatUGX(depositAmount)})
            </button>
          </form>

          {/* Pending Deposits Awaiting Provider Webhook Confirmation */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-slate-700">
              Recent Deposit Attempts &amp; Webhook Simulator:
            </h3>
            {deposits.length === 0 ? (
              <p className="text-xs text-slate-400">
                No deposit attempts initiated in this session yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">
                        {dep.provider} • {formatUGX(dep.amountUGX)}
                      </span>
                      <span className="block font-mono text-[10px] text-slate-500">
                        Ref: {dep.reference} • Status: {dep.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmPendingWebhook(dep)}
                      className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                    >
                      {dep.status === "completed"
                        ? "Test Duplicate Webhook"
                        : "Simulate Provider Webhook Approval"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Student Unused Funds Withdrawal Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Withdraw Unused Wallet Funds
                </h2>
                <p className="text-xs text-slate-500">
                  Reserves funds atomically &amp; reverses automatically if provider fails
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleStudentWithdraw} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Mobile Money Number
                </label>
                <input
                  type="text"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (UGX)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wallet Security PIN (Default: 1234)
              </label>
              <input
                type="password"
                value={withdrawPin}
                onChange={(e) => setWithdrawPin(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                required
              />
            </div>

            {withdrawError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-semibold">
                {withdrawError}
              </div>
            )}

            {withdrawMessage && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 font-medium">
                {withdrawMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg border-2 border-slate-900 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-50"
            >
              Request Wallet Withdrawal ({formatUGX(withdrawAmount)})
            </button>
          </form>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Financial Safety Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every withdrawal reserves your spendable balance via a double-entry ledger posting
              before calling the mobile money gateway. If a transfer fails, a compensating reversal
              automatically restores your spendable balance.
            </p>
          </div>
        </div>
      </div>

      {/* Purchase & Receipt History */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-amber-600" />
          <span>Committed Purchase Orders &amp; Official Receipts</span>
        </h2>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500">
            No document purchases recorded for this student account yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Receipt Ref</th>
                  <th className="py-2.5 px-3">Document ID</th>
                  <th className="py-2.5 px-3">Amount Paid</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">
                      {ord.receiptReference}
                    </td>
                    <td className="py-2.5 px-3">{ord.documentId}</td>
                    <td className="py-2.5 px-3 font-bold">{formatUGX(ord.grossAmountUGX)}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          ord.status === "completed"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {ord.status === "completed" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {ord.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{formatDate(ord.createdAt)}</td>
                    <td className="py-2.5 px-3">
                      <Link
                        href={`/student/read/${ord.documentId}`}
                        className="inline-flex items-center gap-1 font-bold text-[#0f2027] hover:underline"
                      >
                        <BookOpen className="h-3 w-3" />
                        Read
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

