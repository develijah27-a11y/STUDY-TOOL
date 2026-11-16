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
  AlertCircle,
  Copy,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  Send,
  Zap,
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
  const [loading, setLoading] = useState(false);

  // Deposit Form State
  const [depositPhone, setDepositPhone] = useState("0772112233");
  const [depositAmount, setDepositAmount] = useState(10000);
  const [detectedProvider, setDetectedProvider] = useState<"MTN" | "AIRTEL">("MTN");
  const [depositMessage, setDepositMessage] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Simulated USSD Handset Prompt State
  const [activeUssdPrompt, setActiveUssdPrompt] = useState<{
    reference: string;
    phoneNumber: string;
    provider: "MTN" | "AIRTEL";
    amountUGX: number;
  } | null>(null);
  const [ussdPin, setUssdPin] = useState("1234");
  const [ussdProcessing, setUssdProcessing] = useState(false);

  // Withdrawal Form State
  const [withdrawPhone, setWithdrawPhone] = useState("0772112233");
  const [withdrawAmount, setWithdrawAmount] = useState(5000);
  const [withdrawPin, setWithdrawPin] = useState("1234");
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // Tab & History Filters
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [historySearch, setHistorySearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<OrderItem | null>(null);

  // Initialize user ID from session
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.id) setSelectedStudentId(u.id);
      }
    } catch { }
  }, []);

  // Detect provider from Ugandan mobile prefixes
  useEffect(() => {
    const clean = depositPhone.replace(/\s+/g, "");
    if (clean.startsWith("077") || clean.startsWith("078") || clean.startsWith("076")) {
      setDetectedProvider("MTN");
    } else if (clean.startsWith("070") || clean.startsWith("075") || clean.startsWith("074")) {
      setDetectedProvider("AIRTEL");
    }
  }, [depositPhone]);

  const loadWalletData = useCallback(async () => {
    setLoading(true);
    try {
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
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleInitiateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    setDepositMessage(null);

    try {
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

      // Trigger the interactive USSD prompt for realistic mobile money approval
      setActiveUssdPrompt({
        reference: data.deposit.reference,
        phoneNumber: depositPhone,
        provider: data.deposit.provider,
        amountUGX: Number(depositAmount),
      });

      setDepositMessage(
        `${data.instructions} Approve the simulated USSD prompt on your screen to complete instant crediting.`
      );
      await loadWalletData();
    } catch (err) {
      setDepositError("Network error occurred while connecting to Mobile Money gateway.");
    }
  };

  const handleApproveUssdPrompt = async () => {
    if (!activeUssdPrompt) return;
    setUssdProcessing(true);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deposit_confirm_webhook",
          eventId: `EVT-${activeUssdPrompt.reference}`,
          reference: activeUssdPrompt.reference,
          provider: activeUssdPrompt.provider,
          status: "SUCCESSFUL",
          amountUGX: activeUssdPrompt.amountUGX,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDepositMessage(
          `Payment Approved! ${formatUGX(activeUssdPrompt.amountUGX)} successfully credited to your spendable balance.`
        );
        setActiveUssdPrompt(null);
        await loadWalletData();
      } else {
        setDepositError(data.error || "Webhook simulation failed");
      }
    } catch (err) {
      setDepositError("Failed to simulate webhook approval");
    } finally {
      setUssdProcessing(false);
    }
  };

  const handleConfirmPendingWebhook = async (dep: DepositItem) => {
    try {
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
            ? `Idempotency Verified: Duplicate webhook for ${dep.reference} was ignored (credited once).`
            : `Webhook Confirmed! ${formatUGX(dep.amountUGX)} credited to spendable balance.`
        );
        await loadWalletData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawMessage(null);
    setWithdrawing(true);

    try {
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
        `Withdrawal ref ${data.withdrawalReference} initiated. ${formatUGX(
          withdrawAmount
        )} transferred to reserved balance awaiting MoMo payout settlement.`
      );
      await loadWalletData();
    } catch (err) {
      setWithdrawError("Connection error while requesting withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
    o.receiptReference.toLowerCase().includes(historySearch.toLowerCase()) ||
    o.documentId.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">

      {/* Regulatory & Payment Model Notice Banner */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Payment &amp; Wallet Notice:</span>
          <p className="leading-relaxed text-amber-900">
            Under Uganda&apos;s National Payment Systems Act 2020, SomaUG uses direct pay-per-document mobile money checkouts. If you have an existing balance below, you can use it to unlock documents or withdraw it back to your mobile money number anytime.
          </p>
        </div>
      </div>

      {/* Top Banner: Spendable & Reserved Balance Card */}
      <div className="rounded-3xl bg-[#142B45] text-white p-6 md:p-10 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#147D78]/30 border border-[#147D78]/50 px-3.5 py-1 text-xs font-extrabold text-teal-200">
              <Wallet className="h-3.5 w-3.5 text-[#E9B949]" />
              <span>Student Study Balance (UGX)</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Available Study Balance
              </span>
              <div className="text-4xl md:text-5xl font-black text-[#E9B949] tracking-tight">
                {formatUGX(spendableBalance)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                <Clock className="h-3.5 w-3.5 text-[#E9B949]" />
                <span>Reserved in Purchases: <strong>{formatUGX(reservedBalance)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Instant MoMo Withdrawals Available</span>
              </div>
            </div>
          </div>

          {/* Student Profile Switcher & Refresh Button */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#E9B949]">
                Active Student Account:
              </label>
              <button
                type="button"
                onClick={loadWalletData}
                disabled={loading}
                className="text-slate-300 hover:text-white transition"
                title="Refresh Balances"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {selectedStudentId === "user-student-1" || selectedStudentId === "user-student-2" ? (
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setDepositMessage(null);
                  setWithdrawMessage(null);
                }}
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-inner focus:ring-2 focus:ring-[#147D78]"
              >
                <option value="user-student-1">Grace Namukasa (Makerere BSSE)</option>
                <option value="user-student-2">Ivan Mugisha (MUBS Coordinator)</option>
              </select>
            ) : (
              <div className="w-full rounded-xl bg-slate-900/90 border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-white flex items-center justify-between">
                <span className="truncate">Active Wallet: {selectedStudentId}</span>
                <span className="text-emerald-400 text-xs font-mono ml-2 shrink-0">Verified</span>
              </div>
            )}

            <div className="text-xs text-slate-300 flex items-center justify-between">
              <span>Default PIN: <strong className="text-[#E9B949]">1234</strong></span>
              <Link href="/catalogue" className="text-[#E9B949] hover:underline font-bold">
                Browse Catalogue →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operations Grid: Deposit / Withdraw & Account Statements */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

        {/* Left Column (7 cols): Interactive Deposit & Withdraw Flow */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* Tab Header: Deposit vs Withdraw */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("deposit")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${activeTab === "deposit"
                  ? "bg-[#0B192C] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                <ArrowDownLeft className="h-4 w-4 text-amber-400" />
                <span>Deposit via Mobile Money</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("withdraw")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${activeTab === "withdraw"
                  ? "bg-[#0B192C] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                <ArrowUpRight className="h-4 w-4 text-blue-400" />
                <span>Withdraw Unused Funds</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === "deposit" && (
                <div className="space-y-6">
                  {/* Gateway Trust Pill */}
                  <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-2.5 text-xs text-slate-700 border border-slate-200">
                    <ShieldCheck className="h-4 w-4 text-[#147D78] shrink-0" />
                    <span>
                      Integrated with <strong>MarzPay Mobile Money Sandbox Gateway</strong>. Automatic USSD push to Ugandan handsets.
                    </span>
                  </div>

                  {/* High-Contrast Network Provider Text Badges */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 transition ${detectedProvider === "MTN"
                        ? "border-[#147D78] bg-teal-50/50"
                        : "border-slate-200 bg-slate-50 opacity-60"
                        }`}
                    >
                      <span className="rounded-lg bg-[#142B45] text-[#E9B949] font-black text-xs px-2.5 py-1">
                        MTN MoMo
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">MTN MoMo</span>
                        <span className="text-xs text-slate-500 font-medium">077, 078, 076</span>
                      </div>
                    </div>

                    <div
                      className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 transition ${detectedProvider === "AIRTEL"
                        ? "border-[#147D78] bg-teal-50/50"
                        : "border-slate-200 bg-slate-50 opacity-60"
                        }`}
                    >
                      <span className="rounded-lg bg-red-700 text-white font-black text-xs px-2.5 py-1">
                        Airtel Money
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">Airtel Money</span>
                        <span className="text-xs text-slate-500 font-medium">070, 075, 074</span>
                      </div>
                    </div>
                  </div>

                  {/* Deposit Form */}
                  <form onSubmit={handleInitiateDeposit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Registered Ugandan Phone Number:
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={depositPhone}
                          onChange={(e) => setDepositPhone(e.target.value)}
                          placeholder="e.g. 0772112233 or 0701445566"
                          className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Deposit Amount (Min UGX 1,000):
                        </label>
                        <span className="text-xs font-black text-amber-700">
                          {formatUGX(depositAmount)}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={1000}
                        step={500}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                        required
                      />

                      {/* Quick Select Amount Chips */}
                      <div className="flex flex-wrap gap-2 pt-2.5">
                        {[2000, 5000, 10000, 20000, 50000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(amt)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${depositAmount === amt
                              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                          >
                            +{formatUGX(amt)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {depositError && (
                      <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <span className="font-semibold">{depositError}</span>
                      </div>
                    )}

                    {depositMessage && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{depositMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-5 py-3.5 text-xs font-black text-white hover:bg-[#162942] active:scale-[0.99] transition shadow-md"
                    >
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>Initiate Mobile Money Deposit ({formatUGX(depositAmount)})</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "withdraw" && (
                <form onSubmit={handleStudentWithdraw} className="space-y-5">
                  <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 space-y-1">
                    <span className="font-bold block">Safe Double-Entry Withdrawal Guarantee:</span>
                    <p className="text-xs text-blue-800">
                      When requested, funds move from Spendable to Reserved balance. If the carrier fails to disburse, the reservation reverts automatically with zero loss.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Destination Mobile Money Number:
                    </label>
                    <input
                      type="text"
                      value={withdrawPhone}
                      onChange={(e) => setWithdrawPhone(e.target.value)}
                      placeholder="0772112233"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Withdrawal Amount:
                      </label>
                      <span className="text-xs font-bold text-slate-500">
                        Max Spendable: {formatUGX(spendableBalance)}
                      </span>
                    </div>
                    <input
                      type="number"
                      min={1000}
                      max={spendableBalance}
                      step={500}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Wallet Security PIN (Default: 1234):
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={withdrawPin}
                      onChange={(e) => setWithdrawPin(e.target.value)}
                      placeholder="• • • •"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono tracking-widest text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>

                  {withdrawError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 font-semibold">
                      {withdrawError}
                    </div>
                  )}

                  {withdrawMessage && (
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-900 font-medium">
                      {withdrawMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={withdrawing || spendableBalance < withdrawAmount}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3.5 text-xs font-black text-white hover:bg-blue-800 disabled:opacity-50 transition shadow-md"
                  >
                    {withdrawing ? "Reserving Funds in Ledger..." : `Withdraw ${formatUGX(withdrawAmount)}`}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Pending In-Flight Deposits / Webhook Verification List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>Recent Deposit Logs &amp; Webhook Verifications</span>
              </h3>
              <span className="text-xs text-slate-500">Live Status Sync</span>
            </div>

            {deposits.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No deposit transactions recorded in this session.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-black ${dep.provider === "MTN"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-red-100 text-red-900"
                            }`}
                        >
                          {dep.provider}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {formatUGX(dep.amountUGX)}
                        </span>
                      </div>
                      <span className="block font-mono text-xs text-slate-500 pt-0.5">
                        Ref: {dep.reference} • Status: <strong className="uppercase">{dep.status}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConfirmPendingWebhook(dep)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shrink-0"
                    >
                      {dep.status === "completed"
                        ? "Test Duplicate Idempotency"
                        : "Confirm Webhook"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Official Orders & Digital Receipts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-slate-700" />
                <h3 className="text-xs font-extrabold text-slate-900">
                  Document Purchase Receipts
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {orders.length} Purchases
              </span>
            </div>

            {/* Receipt Search Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search orders by ref or doc ID..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No document orders found.</p>
                <Link
                  href="/catalogue"
                  className="inline-block text-xs font-bold text-amber-700 underline"
                >
                  Explore Course Materials
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">
                        {formatUGX(ord.grossAmountUGX)}
                      </span>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        {ord.status}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-slate-500 space-y-0.5">
                      <div>Order: {ord.orderNumber}</div>
                      <div>Ref: {ord.receiptReference}</div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                      <Link
                        href={`/student/read/${ord.documentId}`}
                        className="font-bold text-slate-800 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>Open Reader</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(ord)}
                        className="font-bold text-amber-700 hover:underline"
                      >
                        Digital Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Handset USSD Push Modal */}
      {activeUssdPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-4 border-slate-700 p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-amber-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
                  {activeUssdPrompt.provider === "MTN" ? "MTN MoMo Push" : "Airtel Money Push"}
                </span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="rounded-2xl bg-black/50 border border-slate-800 p-4 space-y-3 font-mono text-xs">
              <p className="text-amber-300 leading-relaxed">
                Y&apos;ello! Do you approve the payment of{" "}
                <strong>{formatUGX(activeUssdPrompt.amountUGX)}</strong> to{" "}
                <strong>SomaUG Academic</strong> for document access?
              </p>
              <p className="text-xs text-slate-400">
                Fee: UGX 0. Ref: {activeUssdPrompt.reference.slice(0, 14)}...
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-300">
                Enter Mobile Money PIN (Default: 1234):
              </label>
              <input
                type="password"
                maxLength={4}
                value={ussdPin}
                onChange={(e) => setUssdPin(e.target.value)}
                placeholder="• • • •"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-center font-mono text-lg tracking-widest text-white outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveUssdPrompt(null)}
                className="flex-1 rounded-xl bg-slate-800 border border-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveUssdPrompt}
                disabled={ussdProcessing}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition shadow-lg"
              >
                {ussdProcessing ? "Approving..." : "Approve & Credit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Receipt View Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Official Purchase Voucher</h3>
                  <p className="text-xs text-slate-500">Double-entry verified academic receipt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 space-y-2.5 font-mono text-xs text-slate-800 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Order No:</span>
                <span className="font-bold">{selectedReceipt.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="font-bold">{selectedReceipt.receiptReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document ID:</span>
                <span>{selectedReceipt.documentId}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {formatUGX(selectedReceipt.grossAmountUGX)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ledger Status:</span>
                <span className="font-bold uppercase text-emerald-800">{selectedReceipt.status}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                href={`/student/read/${selectedReceipt.documentId}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B192C] py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Read Document</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
