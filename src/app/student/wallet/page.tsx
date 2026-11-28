"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Smartphone,
  BookOpen,
  AlertCircle,
  CreditCard,
  X,
  ChevronRight,
  ShieldCheck,
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

interface UnifiedTransaction {
  id: string;
  type: "deposit" | "purchase" | "withdrawal";
  reference: string;
  description: string;
  amountUGX: number;
  status: string;
  provider?: string;
  createdAt: string;
}

export default function StudentWalletPage() {
  const [selectedStudentId, setSelectedStudentId] = useState("user-student-1");
  const [studentName, setStudentName] = useState("Student");
  const [spendableBalance, setSpendableBalance] = useState(25000);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Active Action: "deposit" or "withdraw" or null
  const [activeAction, setActiveAction] = useState<"deposit" | "withdraw">("deposit");

  // Deposit State
  const [depositPhone, setDepositPhone] = useState("0772112233");
  const [depositAmount, setDepositAmount] = useState(10000);
  const [detectedProvider, setDetectedProvider] = useState<"MTN" | "AIRTEL">("MTN");
  const [depositMessage, setDepositMessage] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  // USSD Handset Prompt Modal
  const [activeUssdPrompt, setActiveUssdPrompt] = useState<{
    reference: string;
    phoneNumber: string;
    provider: "MTN" | "AIRTEL";
    amountUGX: number;
  } | null>(null);
  const [ussdPin, setUssdPin] = useState("1234");
  const [ussdProcessing, setUssdProcessing] = useState(false);

  // Withdrawal State
  const [withdrawPhone, setWithdrawPhone] = useState("0772112233");
  const [withdrawAmount, setWithdrawAmount] = useState(5000);
  const [withdrawPin, setWithdrawPin] = useState("1234");
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // Filter for transactions
  const [historyFilter, setHistoryFilter] = useState<"all" | "deposit" | "purchase">("all");

  // 1. Initialize user from session
  useEffect(() => {
    async function initUser() {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.id) {
            setSelectedStudentId(data.user.id);
            if (data.user.fullName) setStudentName(data.user.fullName);
            return;
          }
        }
      } catch {}

      try {
        const cached = localStorage.getItem("somaug_user_session");
        if (cached) {
          const u = JSON.parse(cached);
          if (u.id) setSelectedStudentId(u.id);
          if (u.fullName) setStudentName(u.fullName);
        }
      } catch {}
    }
    initUser();
  }, []);

  // 2. Detect provider from Ugandan mobile prefixes
  useEffect(() => {
    const clean = depositPhone.replace(/\s+/g, "");
    if (
      clean.startsWith("077") ||
      clean.startsWith("078") ||
      clean.startsWith("076") ||
      clean.startsWith("+25677") ||
      clean.startsWith("+25678")
    ) {
      setDetectedProvider("MTN");
    } else if (
      clean.startsWith("070") ||
      clean.startsWith("075") ||
      clean.startsWith("074") ||
      clean.startsWith("+25670") ||
      clean.startsWith("+25675")
    ) {
      setDetectedProvider("AIRTEL");
    }
  }, [depositPhone]);

  // 3. Load wallet data
  const loadWalletData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/wallet?userId=${selectedStudentId}&targetUserId=${selectedStudentId}&walletType=student`
      );
      if (res.ok) {
        const data = await res.json();
        setSpendableBalance(data.wallet?.spendableBalanceUGX ?? 0);
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

  // Deposit handler
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
        setDepositError(data.error || "Failed to initiate deposit.");
        return;
      }

      setActiveUssdPrompt({
        reference: data.deposit.reference,
        phoneNumber: depositPhone,
        provider: data.deposit.provider,
        amountUGX: Number(depositAmount),
      });

      setDepositMessage("Payment prompt sent to your phone. Approve to complete.");
      await loadWalletData();
    } catch {
      setDepositError("Network error. Please try again.");
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
        setDepositMessage(`${formatUGX(activeUssdPrompt.amountUGX)} added to wallet.`);
        setActiveUssdPrompt(null);
        await loadWalletData();
      } else {
        setDepositError(data.error || "Approval failed.");
      }
    } catch {
      setDepositError("Network error validating payment.");
    } finally {
      setUssdProcessing(false);
    }
  };

  // Withdraw handler
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
        setWithdrawError(data.error || "Withdrawal failed.");
        return;
      }

      setWithdrawMessage(`${formatUGX(withdrawAmount)} withdrawn successfully.`);
      await loadWalletData();
    } catch {
      setWithdrawError("Network error during withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };

  // Merge and sort transactions
  const unifiedTransactions = useMemo<UnifiedTransaction[]>(() => {
    const list: UnifiedTransaction[] = [];

    deposits.forEach((d) => {
      list.push({
        id: `dep-${d.id}`,
        type: "deposit",
        reference: d.reference,
        description: `${d.provider} Mobile Money Top Up`,
        amountUGX: d.amountUGX,
        status: d.status,
        provider: d.provider,
        createdAt: d.createdAt,
      });
    });

    orders.forEach((o) => {
      list.push({
        id: `ord-${o.id}`,
        type: "purchase",
        reference: o.orderNumber,
        description: "Course Notes Purchase",
        amountUGX: o.grossAmountUGX,
        status: o.status,
        createdAt: o.createdAt,
      });
    });

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [deposits, orders]);

  const filteredTransactions = useMemo(() => {
    return unifiedTransactions.filter((tx) => {
      if (historyFilter === "deposit") return tx.type === "deposit";
      if (historyFilter === "purchase") return tx.type === "purchase";
      return true;
    });
  }, [unifiedTransactions, historyFilter]);

  // Student card digits formatted like reference
  const cardDigits = useMemo(() => {
    const cleaned = selectedStudentId.replace(/\D/g, "");
    const lastFour = cleaned.slice(-4) || "8019";
    return `XXXX - ${lastFour}`;
  }, [selectedStudentId]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      {/* 1. Header: "Your Balance" & Big Number (Matching Reference) */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400">
            Your Balance
          </h2>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2">
            <span>{formatUGX(spendableBalance)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={loadWalletData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
          title="Refresh Balance"
          aria-label="Refresh Balance"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-sky-600" : ""}`} />
        </button>
      </div>

      {/* 2. Sleek Digital Card (Pixel-Matched to Reference Image in App Colours) */}
      <div className="relative rounded-3xl bg-sky-600 dark:bg-sky-700 text-white p-6 sm:p-7 shadow-lg overflow-hidden border border-sky-500/40">
        {/* Subtle Decorative Arc Overlay in bottom right corner (like in reference image) */}
        <div className="absolute -bottom-14 -right-14 w-52 h-52 rounded-full bg-sky-500/35 dark:bg-sky-400/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-44 sm:h-48">
          {/* Top Row: Card Balance & Brand Logo */}
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-xs font-medium text-sky-100/90 tracking-wide">
                Card Balance
              </span>
              <span className="block text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                {spendableBalance.toLocaleString()} UGX
              </span>
            </div>

            {/* Brand Logo styled cleanly like m°netta */}
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                Soma<span className="text-orange-400">UG</span>
              </span>
            </div>
          </div>

          {/* Middle Row: Card Identifier */}
          <div>
            <span className="text-sm sm:text-base font-mono tracking-widest text-sky-100 font-semibold">
              {cardDigits}
            </span>
          </div>

          {/* Bottom Row: Expiration Date & Active Status Badge */}
          <div className="flex items-end justify-between">
            <div>
              <span className="block text-[10px] sm:text-[11px] font-medium text-sky-200 uppercase tracking-wider">
                Expiration Date
              </span>
              <span className="block text-xs sm:text-sm font-bold text-white mt-0.5 font-mono">
                10/26
              </span>
            </div>

            {/* Active Status Badge matching reference image */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-white tracking-wide">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Switcher (Top Up vs Withdraw) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveAction("deposit")}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition shadow-xs ${
            activeAction === "deposit"
              ? "bg-orange-500 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          <ArrowDownLeft className="h-4 w-4" />
          <span>Top Up (MTN / Airtel)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAction("withdraw")}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition shadow-xs ${
            activeAction === "withdraw"
              ? "bg-sky-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>Withdraw</span>
        </button>
      </div>

      {/* 4. Concise Operation Form (Limited Words) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        {activeAction === "deposit" ? (
          <form onSubmit={handleInitiateDeposit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Mobile Money Top Up
              </span>
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                {detectedProvider} Prompt
              </span>
            </div>

            {depositMessage && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{depositMessage}</span>
              </div>
            )}

            {depositError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{depositError}</span>
              </div>
            )}

            {/* Quick Amount Chips */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Select Amount (UGX)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2000, 5000, 10000, 20000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      depositAmount === amt
                        ? "bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-700 dark:text-sky-300"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  placeholder="077XXXXXXX or 070XXXXXXX"
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Amount (UGX)
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs"
            >
              <Smartphone className="h-4 w-4" />
              <span>Send Mobile Money Prompt</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleStudentWithdraw} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Withdraw to Mobile Money
              </span>
              <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                Available: {formatUGX(spendableBalance)}
              </span>
            </div>

            {withdrawMessage && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{withdrawMessage}</span>
              </div>
            )}

            {withdrawError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Destination Phone
                </label>
                <input
                  type="tel"
                  required
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Amount (UGX)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={spendableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Wallet PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={withdrawPin}
                  onChange={(e) => setWithdrawPin(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={withdrawing || spendableBalance <= 0}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>{withdrawing ? "Processing..." : "Withdraw Funds"}</span>
            </button>
          </form>
        )}
      </div>

      {/* 5. Concise Transaction History */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Recent Transactions
          </h3>

          <div className="flex items-center gap-1">
            {(
              [
                { id: "all", label: "All" },
                { id: "deposit", label: "Top Ups" },
                { id: "purchase", label: "Purchases" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHistoryFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  historyFilter === tab.id
                    ? "bg-sky-500 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No transactions found yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.slice(0, 8).map((tx) => {
              const isDeposit = tx.type === "deposit";

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDeposit
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600"
                          : "bg-sky-50 dark:bg-sky-950/60 text-sky-600"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <BookOpen className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <span className="block font-bold text-slate-900 dark:text-white">
                        {tx.description}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString()} • Ref: {tx.reference}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`block font-bold font-mono ${
                        isDeposit
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {isDeposit ? `+${formatUGX(tx.amountUGX)}` : `-${formatUGX(tx.amountUGX)}`}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Handset Prompt Modal */}
      {activeUssdPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeUssdPrompt.provider} Mobile Money
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveUssdPrompt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 text-center py-2">
              <span className="text-xs text-slate-500">Amount to approve:</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {formatUGX(activeUssdPrompt.amountUGX)}
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {activeUssdPrompt.phoneNumber}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Enter Mobile Money PIN (Default: 1234):
              </label>
              <input
                type="password"
                maxLength={4}
                value={ussdPin}
                onChange={(e) => setUssdPin(e.target.value)}
                className="w-full h-11 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-mono tracking-widest outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveUssdPrompt(null)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveUssdPrompt}
                disabled={ussdProcessing}
                className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
              >
                {ussdProcessing ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
