"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
import {
  CheckCircle2,
  Building2,
  BookOpen,
  Wallet,
  Lock,
  ShieldAlert,
  Share2,
  Receipt,
  ArrowLeft,
  AlertCircle,
  Eye,
} from "lucide-react";

interface CatalogueDoc {
  id: string;
  title: string;
  description: string;
  institutionName: string;
  institutionShortCode: string;
  courseCode: string;
  courseName: string;
  documentType: string;
  priceUGX: number;
  pageCount: number;
  currentVersion: number;
  topics: string[];
  allowedPreviewPages: number[];
  lecturerName: string;
  lecturerDepartment: string;
  salesCount: number;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const docId = String(params?.id || "doc-csc2101-notes");

  const [doc, setDoc] = useState<CatalogueDoc | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("user-student-1");
  const [walletBalance, setWalletBalance] = useState<number>(25000);
  const [isEntitled, setIsEntitled] = useState(false);
  const [walletPin, setWalletPin] = useState("1234");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    orderNumber: string;
    receiptReference: string;
    grossAmountUGX: number;
    lecturerEarningsUGX: number;
    platformFeeUGX: number;
  } | null>(null);

  const [previewPageNum, setPreviewPageNum] = useState<number>(1);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewWatermark, setPreviewWatermark] = useState<string>("");
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      const catRes = await fetch("/api/catalogue");
      const catData = await catRes.json();
      const found = (catData.documents || []).find((d: CatalogueDoc) => d.id === docId);
      if (found) {
        setDoc(found);
        if (found.allowedPreviewPages?.length > 0) {
          setPreviewPageNum(found.allowedPreviewPages[0]);
        }
      }
    }
    loadDetails();
  }, [docId]);

  useEffect(() => {
    async function loadStudentWallet() {
      const res = await fetch(
        `/api/wallet?userId=${selectedStudentId}&targetUserId=${selectedStudentId}&walletType=student`
      );
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.wallet?.spendableBalanceUGX ?? 0);
        const entitled = (data.entitlements || []).some(
          (e: { documentId: string; isActive: boolean }) =>
            e.documentId === docId && e.isActive
        );
        setIsEntitled(entitled);
      }
    }
    loadStudentWallet();
  }, [selectedStudentId, docId]);

  useEffect(() => {
    async function loadPreviewPage() {
      if (!doc) return;
      const res = await fetch(
        `/api/reader?userId=${selectedStudentId}&documentId=${doc.id}&page=${previewPageNum}`
      );
      const data = await res.json();
      if (res.ok && data.authorized) {
        setPreviewContent(data.pageData?.bodyText || "");
        setPreviewWatermark(data.watermarkText || "");
      } else {
        setPreviewContent(data.error || "Page preview restricted by platform policy.");
        setPreviewWatermark("");
      }
    }
    loadPreviewPage();
  }, [doc, previewPageNum, selectedStudentId, isEntitled]);

  const handleAtomicPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc) return;
    setPurchasing(true);
    setPurchaseError(null);

    try {
      const idempotencyKey = `PUR-${selectedStudentId}-${doc.id}-V${doc.currentVersion}`;
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "purchase_document",
          studentId: selectedStudentId,
          documentId: doc.id,
          idempotencyKey,
          pin: walletPin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPurchaseError(
          data.error === "INSUFFICIENT_FUNDS"
            ? `Insufficient Wallet Balance! Required: ${formatUGX(
                doc.priceUGX
              )}, Available: ${formatUGX(walletBalance)}. Please deposit via MTN or Airtel Money first.`
            : data.error || "Transaction could not be completed"
        );
        return;
      }

      // Only update UI state after authoritative backend commit
      setWalletBalance(data.newStudentBalanceUGX ?? walletBalance);
      setIsEntitled(true);
      if (data.order) {
        setReceipt({
          orderNumber: data.order.orderNumber,
          receiptReference: data.order.receiptReference,
          grossAmountUGX: data.order.grossAmountUGX,
          lecturerEarningsUGX: data.order.lecturerEarningsUGX,
          platformFeeUGX: data.order.platformFeeUGX,
        });
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  if (!doc) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-sm text-slate-600">Loading publication details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Academic Catalogue
        </Link>

        <button
          type="button"
          onClick={handleCopyShareLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Share2 className="h-3.5 w-3.5 text-emerald-600" />
          {copiedShare ? "Link Copied for WhatsApp!" : "Share to Class WhatsApp Group"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Metadata & Server-Controlled Sample Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                <Building2 className="h-3.5 w-3.5 text-slate-600" />
                {doc.institutionName} ({doc.institutionShortCode})
              </span>
              <span className="rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">
                {doc.courseCode}: {doc.courseName}
              </span>
              <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
                Version {doc.currentVersion}.0 • {doc.pageCount} Pages
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">
              {doc.title}
            </h1>

            <p className="text-sm text-slate-700 leading-relaxed">{doc.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900">{doc.lecturerName}</span>
                  <span className="block text-slate-500">{doc.lecturerDepartment}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-700">
                  {doc.salesCount} Verified Student Purchases
                </span>
                <span className="block text-slate-400">
                  Original SHA-256 Checksum Verified
                </span>
              </div>
            </div>
          </div>

          {/* Server-Controlled Preview Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Server-Enforced Sample Page Preview
                </h2>
              </div>

              {doc.allowedPreviewPages.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 mr-1">Permitted Sample Pages:</span>
                  {doc.allowedPreviewPages.map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPreviewPageNum(pNum)}
                      className={`rounded px-2.5 py-1 text-xs font-bold ${
                        previewPageNum === pNum
                          ? "bg-[#0f2027] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Page {pNum}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="rounded-full bg-red-50 border border-red-200 px-3 py-0.5 text-xs font-semibold text-red-800">
                  1–2 Page Short Document Policy: No Page Preview
                </span>
              )}
            </div>

            {doc.allowedPreviewPages.length === 0 && !isEntitled ? (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 text-center space-y-2">
                <Lock className="h-6 w-6 text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  Preview Disabled by Platform Policy for 1–2 Page Reference Sheets
                </p>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  To protect concise 1–2 page cheat sheets from full disclosure before purchase,
                  complete descriptive metadata is shown above. Purchase with your student wallet
                  to unlock full reading access.
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg border border-slate-300 bg-slate-50 p-6 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-none">
                {previewWatermark && (
                  <div className="mb-3 rounded bg-amber-100/80 border border-amber-300 px-3 py-1.5 text-[11px] font-bold text-amber-900 text-center">
                    {previewWatermark}
                  </div>
                )}
                {previewContent}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Atomic Student Wallet Checkout Card */}
        <div className="space-y-6">
          <div className="rounded-xl border-2 border-slate-900 bg-white p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Authoritative Price
                </span>
                <div className="text-3xl font-extrabold text-slate-900">
                  {formatUGX(doc.priceUGX)}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-right">
                <span className="block text-[10px] font-bold uppercase text-emerald-700">
                  Lecturer Share (85%)
                </span>
                <span className="text-xs font-bold text-emerald-900">
                  {formatUGX(doc.priceUGX - Math.floor((doc.priceUGX * 15) / 100))}
                </span>
              </div>
            </div>

            {/* Active Student Selector for Testing Sufficient vs Insufficient Funds */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Active Student Session (Switch to test balance scenarios):
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setPurchaseError(null);
                  setReceipt(null);
                }}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="user-student-1">
                  Grace Namukasa (Balance: UGX 25,000 — Sufficient)
                </option>
                <option value="user-student-2">
                  Ivan Mugisha (Balance: UGX 3,000 — Test Insufficient)
                </option>
              </select>
            </div>

            {/* Wallet Balance Display */}
            <div className="rounded-lg bg-slate-100 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-semibold text-slate-700">
                  Spendable Wallet Balance:
                </span>
              </div>
              <span
                className={`text-sm font-extrabold ${
                  walletBalance >= doc.priceUGX ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {formatUGX(walletBalance)}
              </span>
            </div>

            {isEntitled ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Purchased &amp; Unlocked in Your Study Library</span>
                  </div>
                  <p>
                    You hold an active entitlement for Version {doc.currentVersion}.0 of this
                    publication. You will never be asked to pay again.
                  </p>
                </div>

                <Link
                  href={`/student/read/${doc.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Open Full Document in Protected Reader</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleAtomicPurchase} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm with 4-Digit Wallet PIN (Default: 1234):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tracking-widest"
                    required
                  />
                </div>

                {/* Consequence Summary Before Confirmation */}
                <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-[11px] text-amber-950 space-y-1">
                  <p className="font-bold">Transaction Consequence Summary:</p>
                  <p>• Immediate Wallet Debit: {formatUGX(doc.priceUGX)}</p>
                  <p>
                    • Remaining Wallet Balance:{" "}
                    {walletBalance >= doc.priceUGX
                      ? formatUGX(walletBalance - doc.priceUGX)
                      : "Insufficient Funds"}
                  </p>
                  <p>• Instant permanent access to v{doc.currentVersion}.0 in Study Library</p>
                </div>

                {purchaseError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="font-bold">{purchaseError}</p>
                      <Link
                        href="/student/wallet"
                        className="inline-block underline font-bold text-red-900"
                      >
                        Top up Student Wallet via MTN MoMo or Airtel Money →
                      </Link>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={purchasing}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f2027] px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span>
                    {purchasing
                      ? "Executing Atomic Ledger Transaction..."
                      : `Purchase with Wallet (${formatUGX(doc.priceUGX)})`}
                  </span>
                </button>
              </form>
            )}

            {/* Committed Server Receipt Display */}
            {receipt && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Receipt className="h-4 w-4 text-emerald-700" />
                  <span>Official Digital Purchase Receipt</span>
                </div>
                <div className="space-y-1 text-slate-700 font-mono text-[11px]">
                  <div>Receipt Ref: {receipt.receiptReference}</div>
                  <div>Order No: {receipt.orderNumber}</div>
                  <div>Total Paid: {formatUGX(receipt.grossAmountUGX)}</div>
                  <div>Lecturer Net Credit: {formatUGX(receipt.lecturerEarningsUGX)}</div>
                  <div>Platform Commission: {formatUGX(receipt.platformFeeUGX)}</div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Idempotency &amp; Double-Click Protected
              </span>
              <Link href="/student/wallet" className="font-bold text-slate-800 hover:underline">
                Deposit UGX
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

