"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  RefreshCw,
  Search,
  Filter,
  Check,
  Zap,
  TrendingUp,
  CreditCard,
  Lock,
  ChevronRight,
  ExternalLink,
  Info,
  DollarSign,
  PieChart,
  HelpCircle,
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
  orderItem?: OrderItem;
  depositItem?: DepositItem;
}

export default function StudentWalletPage() {
  const [selectedStudentId, setSelectedStudentId] = useState("user-student-1");
  const [studentName, setStudentName] = useState("Student");
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

  // View state & Filters
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [historyFilter, setHistoryFilter] = useState<"all" | "deposit" | "purchase" | "withdrawal">("all");
  const [historySearch, setHistorySearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<OrderItem | null>(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ date: string; balance: number } | null>(null);

  // 1. Initialize user from authoritative database session
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
    if (clean.startsWith("077") || clean.startsWith("078") || clean.startsWith("076") || clean.startsWith("+25677") || clean.startsWith("+25678")) {
      setDetectedProvider("MTN");
    } else if (clean.startsWith("070") || clean.startsWith("075") || clean.startsWith("074") || clean.startsWith("+25670") || clean.startsWith("+25675")) {
      setDetectedProvider("AIRTEL");
    }
  }, [depositPhone]);

  // 3. Load wallet data from authoritative backend
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

  // Unified chronological transaction list
  const unifiedTransactions: UnifiedTransaction[] = useMemo(() => {
    const txs: UnifiedTransaction[] = [
      ...deposits.map((d) => ({
        id: `dep-${d.id}`,
        type: "deposit" as const,
        reference: d.reference,
        description: `Mobile Money Deposit (${d.provider})`,
        amountUGX: d.amountUGX,
        status: d.status,
        provider: d.provider,
        createdAt: d.createdAt,
        depositItem: d,
      })),
      ...orders.map((o) => ({
        id: `ord-${o.id}`,
        type: "purchase" as const,
        reference: o.orderNumber,
        description: `Academic Document Purchase (${o.orderNumber})`,
        amountUGX: o.grossAmountUGX,
        status: o.status,
        createdAt: o.createdAt,
        orderItem: o,
      })),
    ];

    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deposits, orders]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return unifiedTransactions.filter((tx) => {
      const matchesType = historyFilter === "all" || tx.type === historyFilter;
      const search = historySearch.toLowerCase();
      const matchesSearch =
        !search ||
        tx.reference.toLowerCase().includes(search) ||
        tx.description.toLowerCase().includes(search) ||
        (tx.orderItem?.documentId && tx.orderItem.documentId.toLowerCase().includes(search));
      return matchesType && matchesSearch;
    });
  }, [unifiedTransactions, historyFilter, historySearch]);

  // Financial statistics
  const totalDeposited = useMemo(() => {
    return deposits
      .filter((d) => d.status === "completed" || d.status === "SUCCESSFUL")
      .reduce((acc, d) => acc + d.amountUGX, 0);
  }, [deposits]);

  const totalSpent = useMemo(() => {
    return orders
      .filter((o) => o.status === "completed")
      .reduce((acc, o) => acc + o.grossAmountUGX, 0);
  }, [orders]);

  // Balance Trend Data points (simulated chronological trajectory from actual orders/deposits)
  const chartPoints = useMemo(() => {
    const sorted = [...unifiedTransactions].reverse();
    let running = 0;
    const points: { date: string; balance: number }[] = [];

    // Initial baseline
    points.push({ date: "Start", balance: 0 });

    sorted.forEach((tx) => {
      if (tx.status === "completed" || tx.status === "SUCCESSFUL") {
        if (tx.type === "deposit") {
          running += tx.amountUGX;
        } else if (tx.type === "purchase" || tx.type === "withdrawal") {
          running = Math.max(0, running - tx.amountUGX);
        }
        const d = new Date(tx.createdAt);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        points.push({ date: label, balance: running });
      }
    });

    if (points.length === 1) {
      points.push({ date: "Today", balance: spendableBalance });
    } else {
      points[points.length - 1].balance = spendableBalance;
    }

    return points;
  }, [unifiedTransactions, spendableBalance]);

  // SVG dimensions for balance trend
  const svgWidth = 420;
  const svgHeight = 110;
  const maxBalance = Math.max(...chartPoints.map((p) => p.balance), 10000);
  const minBalance = 0;

  const pointsString = useMemo(() => {
    if (chartPoints.length < 2) return "";
    return chartPoints
      .map((p, i) => {
        const x = (i / (chartPoints.length - 1)) * (svgWidth - 24) + 12;
        const y = svgHeight - 16 - ((p.balance - minBalance) / (maxBalance - minBalance || 1)) * (svgHeight - 32);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [chartPoints, maxBalance, minBalance]);

  // Handlers
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

      setDepositMessage(
        `${data.instructions || "USSD prompt generated."} Please enter your Mobile Money PIN on your phone to approve.`
      );
      await loadWalletData();
    } catch {
      setDepositError("Network connection interrupted. Please try again.");
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
          `Payment Confirmed! ${formatUGX(activeUssdPrompt.amountUGX)} successfully credited to your wallet.`
        );
        setActiveUssdPrompt(null);
        await loadWalletData();
      } else {
        setDepositError(data.error || "Payment approval failed.");
      }
    } catch {
      setDepositError("Network error validating payment.");
    } finally {
      setUssdProcessing(false);
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
        setWithdrawError(data.error || "Withdrawal failed.");
        return;
      }

      setWithdrawMessage(
        `Withdrawal ref ${data.withdrawalReference} initiated. ${formatUGX(withdrawAmount)} moved to reserved balance awaiting settlement.`
      );
      await loadWalletData();
    } catch {
      setWithdrawError("Connection error while requesting withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Top Breadcrumb & Live Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/student/dashboard" className="hover:text-emerald-700 transition">
              Student Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Fintech Wallet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#153F35] tracking-tight">
            SomaUG Student Wallet
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NPSA 2020 Compliant</span>
          </div>

          <button
            type="button"
            onClick={loadWalletData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            <span>{loading ? "Syncing..." : "Sync Ledger"}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: WALLET BALANCE & AVAILABLE FUNDS (Clean, Light, Warm Ivory Focus) */}
      <div className="rounded-3xl border border-[#E3E9E4] bg-gradient-to-br from-[#FAF8F5] via-white to-[#F7F5EF] p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Visual Focus: Spendable Balance */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 border border-emerald-300/60 px-3.5 py-1 text-xs font-bold text-[#153F35]">
              <Wallet className="h-3.5 w-3.5 text-[#23836B]" />
              <span>Available Student Balance (UGX)</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cleared &amp; Ready for Purchases
              </span>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#153F35] tracking-tight font-mono">
                {formatUGX(spendableBalance)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200/90 px-3 py-1.5 text-slate-700 shadow-xs">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Reserved in Escrow: <strong className="font-mono text-slate-900">{formatUGX(reservedBalance)}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[#153F35]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Double-Entry Protected</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: QUICK ACTIONS (Based strictly on existing functionality) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Quick Wallet Actions
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                Account: {studentName.split(" ")[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("deposit");
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#23836B] hover:bg-[#1b6b57] text-white py-3 px-3 text-xs font-bold transition shadow-xs"
              >
                <ArrowDownLeft className="h-4 w-4 text-emerald-200" />
                <span>Add Money</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("withdraw");
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 py-3 px-3 text-xs font-bold transition"
              >
                <ArrowUpRight className="h-4 w-4 text-slate-600" />
                <span>Withdraw</span>
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
              <span className="font-medium">Need more notes?</span>
              <Link
                href="/catalogue"
                className="font-bold text-[#23836B] hover:text-[#153F35] inline-flex items-center gap-1"
              >
                <span>Browse Catalogue</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 & 4: BALANCE TREND CHART & SPENDING DISTRIBUTION (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 3: BALANCE TREND CHART */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#23836B]" />
                <h3 className="text-sm font-black text-slate-900">Balance Trend</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Chronological balance progression from real transaction history
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Live Trend
            </span>
          </div>

          {/* SVG Area Chart */}
          <div className="relative pt-2">
            <div className="h-32 w-full flex items-end">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#23836B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#23836B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="55" x2={svgWidth} y2="55" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2={svgWidth} y2="90" stroke="#F1F5F9" strokeWidth="1" />

                {/* Area fill */}
                {pointsString && (
                  <polygon
                    points={`12,${svgHeight - 16} ${pointsString} ${svgWidth - 12},${svgHeight - 16}`}
                    fill="url(#balanceGradient)"
                  />
                )}

                {/* Line path */}
                {pointsString && (
                  <polyline
                    fill="none"
                    stroke="#23836B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />
                )}

                {/* Data points */}
                {chartPoints.map((p, i) => {
                  const x = (i / (chartPoints.length - 1)) * (svgWidth - 24) + 12;
                  const y = svgHeight - 16 - ((p.balance - minBalance) / (maxBalance - minBalance || 1)) * (svgHeight - 32);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#FFFFFF"
                      stroke="#23836B"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-5 transition-all"
                      onMouseEnter={() => setHoveredDataPoint(p)}
                      onMouseLeave={() => setHoveredDataPoint(null)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip or Current State Indicator */}
            <div className="flex items-center justify-between pt-3 text-[11px] font-semibold text-slate-500 border-t border-slate-100">
              <span>{chartPoints[0]?.date || "Baseline"}</span>
              <span className="font-mono text-xs font-bold text-[#153F35]">
                {hoveredDataPoint
                  ? `${hoveredDataPoint.date}: ${formatUGX(hoveredDataPoint.balance)}`
                  : `Current: ${formatUGX(spendableBalance)}`}
              </span>
              <span>{chartPoints[chartPoints.length - 1]?.date || "Today"}</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: SPENDING OR TRANSACTION DISTRIBUTION */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[#23836B]" />
              <h3 className="text-sm font-black text-slate-900">Financial Distribution</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">Lifetime Ratio</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Proportion Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${totalDeposited + totalSpent > 0 ? (totalDeposited / (totalDeposited + totalSpent)) * 100 : 50}%`,
                  }}
                  className="bg-[#23836B] transition-all duration-500"
                  title="Deposits"
                />
                <div
                  style={{
                    width: `${totalDeposited + totalSpent > 0 ? (totalSpent / (totalDeposited + totalSpent)) * 100 : 50}%`,
                  }}
                  className="bg-blue-600 transition-all duration-500"
                  title="Purchases"
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#23836B]" />
                  <span>Deposits ({totalDeposited + totalSpent > 0 ? Math.round((totalDeposited / (totalDeposited + totalSpent)) * 100) : 0}%)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>Purchases ({totalDeposited + totalSpent > 0 ? Math.round((totalSpent / (totalDeposited + totalSpent)) * 100) : 0}%)</span>
                </span>
              </div>
            </div>

            {/* Distribution metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-slate-100 bg-[#FAF8F5] p-3 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">
                  Total Deposits
                </span>
                <span className="text-lg font-black text-[#153F35] font-mono block">
                  {formatUGX(totalDeposited)}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  {deposits.length} Mobile Money Credits
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">
                  Total Spent
                </span>
                <span className="text-lg font-black text-slate-900 font-mono block">
                  {formatUGX(totalSpent)}
                </span>
                <span className="text-[10px] text-blue-700 font-semibold block">
                  {orders.length} Unlocked Documents
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OPERATIONS WORKSPACE: DEPOSIT / WITHDRAW INTERACTION CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("deposit")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === "deposit"
                ? "bg-[#153F35] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-300" />
            <span>Deposit via Mobile Money</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("withdraw")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === "withdraw"
                ? "bg-[#153F35] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-amber-300" />
            <span>Withdraw Unused Funds</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "deposit" ? (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Carrier Selection Pill */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                    detectedProvider === "MTN"
                      ? "border-emerald-600 bg-emerald-50/40"
                      : "border-slate-200 bg-slate-50/50 opacity-60"
                  }`}
                  onClick={() => setDetectedProvider("MTN")}
                >
                  <span className="rounded-lg bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1">
                    MTN
                  </span>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">MTN MoMo</span>
                    <span className="text-[11px] text-slate-500 font-medium">077, 078, 076</span>
                  </div>
                </div>

                <div
                  className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                    detectedProvider === "AIRTEL"
                      ? "border-emerald-600 bg-emerald-50/40"
                      : "border-slate-200 bg-slate-50/50 opacity-60"
                  }`}
                  onClick={() => setDetectedProvider("AIRTEL")}
                >
                  <span className="rounded-lg bg-red-600 text-white font-black text-xs px-2.5 py-1">
                    Airtel
                  </span>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Airtel Money</span>
                    <span className="text-[11px] text-slate-500 font-medium">070, 075, 074</span>
                  </div>
                </div>
              </div>

              {/* Deposit Form */}
              <form onSubmit={handleInitiateDeposit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ugandan Mobile Money Number:
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={depositPhone}
                      onChange={(e) => setDepositPhone(e.target.value)}
                      placeholder="e.g. 0772112233"
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Deposit Amount (Min UGX 1,000):
                    </label>
                    <span className="text-xs font-black text-emerald-800 font-mono">
                      {formatUGX(depositAmount)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    required
                  />

                  {/* 1-Click Amount Chips */}
                  <div className="flex flex-wrap gap-2 pt-2.5">
                    {[2000, 5000, 10000, 20000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                          depositAmount === amt
                            ? "bg-[#23836B] text-white border-[#23836B] shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        +{formatUGX(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {depositError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{depositError}</span>
                  </div>
                )}

                {depositMessage && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{depositMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#153F35] hover:bg-[#183D32] text-white py-3 px-5 text-xs font-black transition shadow-sm active:scale-[0.99]"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>Initiate Deposit ({formatUGX(depositAmount)})</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-5">
              <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-3.5 text-xs text-blue-950 space-y-1">
                <span className="font-bold block">Safe Double-Entry Withdrawal Guarantee:</span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Funds move from Spendable to Reserved balance during processing. If the carrier fails to disburse, the reservation reverts automatically with zero loss.
                </p>
              </div>

              <form onSubmit={handleStudentWithdraw} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Destination Mobile Money Number:
                  </label>
                  <input
                    type="text"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    placeholder="0772112233"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Withdrawal Amount:
                    </label>
                    <span className="text-xs font-bold text-slate-500 font-mono">
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    required
                  />
                </div>

                {withdrawError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-semibold">
                    {withdrawError}
                  </div>
                )}

                {withdrawMessage && (
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 font-medium">
                    {withdrawMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawing || spendableBalance < withdrawAmount}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#153F35] hover:bg-[#183D32] disabled:opacity-50 text-white py-3 px-5 text-xs font-black transition shadow-sm"
                >
                  {withdrawing ? "Reserving Funds in Ledger..." : `Withdraw ${formatUGX(withdrawAmount)}`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: RECENT TRANSACTIONS (Compact Incoming/Outgoing Payment Badges) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Live incoming credits and outgoing purchases</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {unifiedTransactions.length} Total Events
          </span>
        </div>

        {unifiedTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No financial transactions recorded in this session.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unifiedTransactions.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                className="rounded-xl border border-slate-100 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] p-3.5 space-y-2.5 transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-black ${
                      tx.type === "deposit"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {tx.type === "deposit" ? "+" : "-"}
                    {tx.type === "deposit" ? "INFLOW" : "OUTFLOW"}
                  </span>
                  <span
                    className={`text-xs font-mono font-black ${
                      tx.type === "deposit" ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    {tx.type === "deposit" ? "+" : "-"}
                    {formatUGX(tx.amountUGX)}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">
                    {tx.description}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 block">
                    Ref: {tx.reference}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>{new Date(tx.createdAt).toLocaleDateString("en-UG")}</span>
                  <span className="font-bold uppercase text-emerald-700">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 6: COMPLETE TRANSACTION HISTORY (Searchable & Filterable Table) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Complete Transaction History</h3>
            <p className="text-xs text-slate-500">Audit-ready chronological double-entry statements</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filters */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              {(["all", "deposit", "purchase"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setHistoryFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition ${
                    historyFilter === tab
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab === "all" ? "All Activity" : `${tab}s`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by ref or description..."
                className="rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No matching transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3">Transaction Description</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount (UGX)</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString("en-UG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {tx.reference}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tx.type === "deposit"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-700 uppercase text-[11px]">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={tx.type === "deposit" ? "text-emerald-700" : "text-slate-900"}>
                        {tx.type === "deposit" ? "+" : "-"}
                        {formatUGX(tx.amountUGX)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {tx.orderItem ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(tx.orderItem || null)}
                          className="font-bold text-[#23836B] hover:underline"
                        >
                          View Voucher
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Confirmed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 7: WALLET SECURITY AND SUPPORT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#23836B]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Regulatory &amp; Consumer Protection
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            SomaUG Academic operates strictly within the guidelines of the <strong>Uganda National Payment Systems Act (NPSA 2020)</strong>. All user wallet balances represent 100% backed double-entry liabilities held in designated escrow clearing accounts. Unused funds can be withdrawn at any time.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Wallet Security PIN &amp; Gateway Support
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Your 4-digit Wallet PIN authorizes purchases and withdrawals. It is stored as an immutable cryptographic salted hash and never exposed. For support, contact <strong>support@somaug.ac.ug</strong>.
          </p>
        </div>
      </div>

      {/* SIMULATED USSD HANDSET PUSH MODAL */}
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
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
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

      {/* SELECTED RECEIPT VIEW MODAL */}
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

            <div className="rounded-xl bg-[#FAF8F5] p-4 space-y-2.5 font-mono text-xs text-slate-800 border border-slate-200">
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
                <span className="font-extrabold text-[#23836B] text-sm">
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
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#153F35] py-2.5 text-xs font-bold text-white hover:bg-[#183D32]"
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
