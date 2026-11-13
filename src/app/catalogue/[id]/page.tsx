"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
import {
  CheckCircle2,
  Building2,
  BookOpen,
  Wallet,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Share2,
  Receipt,
  ArrowLeft,
  AlertCircle,
  Eye,
  Sparkles,
  Download,
  Copy,
  ExternalLink,
  ChevronRight,
  FileText,
  BadgePercent,
  Smartphone,
  Info,
  Clock,
  Printer,
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

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  lecture_notes: "Lecture Notes",
  past_paper_solution: "Past Paper Solution",
  study_guide: "Study Guide",
  lab_manual: "Lab Manual",
  curriculum_summary: "Summary / Cheat Sheet",
  textbook_supplement: "Textbook Supplement",
  assignment_guide: "Assignment Guide",
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = String(params?.id || "doc-csc2101-notes");

  const [doc, setDoc] = useState<CatalogueDoc | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("user-student-1");
  const [walletBalance, setWalletBalance] = useState<number>(25000);
  const [isEntitled, setIsEntitled] = useState(false);
  const [walletPin, setWalletPin] = useState("1234");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [receipt, setReceipt] = useState<{
    orderNumber: string;
    receiptReference: string;
    grossAmountUGX: number;
    lecturerEarningsUGX: number;
    platformFeeUGX: number;
    purchasedAt: string;
  } | null>(null);

  const [previewPageNum, setPreviewPageNum] = useState<number>(1);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewWatermark, setPreviewWatermark] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "syllabus" | "integrity">("preview");
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      try {
        const catRes = await fetch("/api/catalogue");
        const catData = await catRes.json();
        const found = (catData.documents || []).find((d: CatalogueDoc) => d.id === docId);
        if (found) {
          setDoc(found);
          if (found.allowedPreviewPages?.length > 0) {
            setPreviewPageNum(found.allowedPreviewPages[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load document details:", err);
      }
    }
    loadDetails();
  }, [docId]);

  useEffect(() => {
    async function loadStudentWallet() {
      try {
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
      } catch (err) {
        console.error("Failed to load student wallet:", err);
      }
    }
    loadStudentWallet();
  }, [selectedStudentId, docId]);

  useEffect(() => {
    async function loadPreviewPage() {
      if (!doc) return;
      setPreviewLoading(true);
      try {
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
      } catch (err) {
        setPreviewContent("Failed to load page preview. Please try again.");
      } finally {
        setPreviewLoading(false);
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

      setWalletBalance(data.newStudentBalanceUGX ?? walletBalance);
      setIsEntitled(true);
      if (data.order) {
        setReceipt({
          orderNumber: data.order.orderNumber,
          receiptReference: data.order.receiptReference,
          grossAmountUGX: data.order.grossAmountUGX,
          lecturerEarningsUGX: data.order.lecturerEarningsUGX,
          platformFeeUGX: data.order.platformFeeUGX,
          purchasedAt: new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        });
      }
      setShowCheckoutModal(false);
    } catch (err) {
      setPurchaseError("Network connection interrupted. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const text = `Check out "${doc?.title}" (${doc?.courseCode}) on SomaUG Academic: ${url}`;
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleCopyReceipt = () => {
    if (!receipt || !doc) return;
    const text = `SomaUG Academic Receipt\nRef: ${receipt.receiptReference}\nOrder: ${receipt.orderNumber}\nDocument: ${doc.title}\nAmount: ${formatUGX(receipt.grossAmountUGX)}\nLecturer Share: ${formatUGX(receipt.lecturerEarningsUGX)}\nStatus: COMPLETED (Verified Double-Entry)`;
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  if (!doc) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-600">Loading publication details from database...</p>
      </div>
    );
  }

  const platformFee = Math.floor((doc.priceUGX * 15) / 100);
  const lecturerNet = doc.priceUGX - platformFee;
  const hasSufficientFunds = walletBalance >= doc.priceUGX;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Breadcrumb Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/catalogue" className="hover:text-slate-900 transition flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Catalogue</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-700 font-bold">{doc.institutionShortCode}</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 font-extrabold truncate max-w-[200px] sm:max-w-xs">{doc.courseCode}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{copiedShare ? "Link & Text Copied!" : "Share to WhatsApp Group"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Metadata, Lecturer Credentials & Multi-tab Reader Preview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Document Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#0B192C] px-3 py-1 text-xs font-bold text-white shadow-sm">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                {doc.institutionName} ({doc.institutionShortCode})
              </span>
              <span className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
                {doc.courseCode}: {doc.courseName}
              </span>
              <span className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-900">
                {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
              </span>
              <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
                v{doc.currentVersion}.0 • {doc.pageCount} Pages
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {doc.title}
            </h1>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {doc.description}
            </p>

            {/* Author Credentials & Peer Verification */}
            <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-base shadow-sm">
                  {doc.lecturerName.split(" ").slice(-1)[0]?.slice(0, 2) || "LC"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900">{doc.lecturerName}</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Verified Academic
                    </span>
                  </div>
                  <span className="block text-xs text-slate-500 font-medium">{doc.lecturerDepartment}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-center sm:justify-end gap-1 text-xs font-extrabold text-slate-900">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>{doc.salesCount} Verified Student Readers</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Authoritative University Compendium
                </span>
              </div>
            </div>
          </div>

          {/* Tabbed Interactive Section: Sample Preview vs Syllabus vs Integrity Check */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
                  activeTab === "preview"
                    ? "bg-white text-slate-900 border-t-2 border-amber-500 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Eye className="h-3.5 w-3.5 text-amber-600" />
                <span>Sample Page Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("syllabus")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
                  activeTab === "syllabus"
                    ? "bg-white text-slate-900 border-t-2 border-amber-500 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span>Topics &amp; Syllabus Coverage</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("integrity")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
                  activeTab === "integrity"
                    ? "bg-white text-slate-900 border-t-2 border-amber-500 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Digital Rights &amp; Integrity</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === "preview" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Select Allowed Sample Page:
                      </span>
                    </div>

                    {doc.allowedPreviewPages.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {doc.allowedPreviewPages.map((pNum) => (
                          <button
                            key={pNum}
                            type="button"
                            onClick={() => setPreviewPageNum(pNum)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                              previewPageNum === pNum
                                ? "bg-[#0B192C] text-white shadow-sm"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            Page {pNum}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-bold text-amber-900">
                        Short Reference Policy: No Free Sample Page
                      </span>
                    )}
                  </div>

                  {doc.allowedPreviewPages.length === 0 && !isEntitled ? (
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-8 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                        <Lock className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Sample Preview Restricted by Platform Policy (1–2 Page Summary)
                      </h3>
                      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                        To preserve the academic value of concise 1–2 page reference cheat sheets,
                        full body text is unlocked upon one-click purchase with your student wallet.
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl border border-slate-300 bg-slate-50 p-6 md:p-8 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-none shadow-inner min-h-[220px]">
                      {previewWatermark && (
                        <div className="mb-4 rounded-lg bg-amber-100/90 border border-amber-300 px-4 py-2 text-xs font-bold text-amber-950 text-center flex items-center justify-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                          <span>{previewWatermark}</span>
                        </div>
                      )}
                      
                      {previewLoading ? (
                        <div className="py-12 text-center text-slate-500 font-sans">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent mb-2"></div>
                          <p className="text-xs">Fetching verified sample page text...</p>
                        </div>
                      ) : (
                        previewContent
                      )}

                      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                        <span>Showing Page {previewPageNum} of {doc.pageCount}</span>
                        <span>Official SomaUG Academic Watermark Active</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "syllabus" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Target Syllabus Topics Included in this Document
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(doc.topics || []).map((topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{topic}</span>
                          <span className="text-[11px] text-slate-500">
                            Covered with worked examples and exam tips
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "integrity" && (
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span>Double-Entry Digital Rights Enforcement</span>
                  </div>
                  <p>
                    Every document published on SomaUG Academic has its cryptographic SHA-256 hash
                    recorded in the immutable database ledger. When purchased, your active student
                    entitlement is recorded atomically in our PostgreSQL database with row-level security.
                  </p>
                  <div className="rounded-xl bg-slate-100 p-4 font-mono text-[11px] space-y-1">
                    <div>• Document ID: {doc.id}</div>
                    <div>• Verified Institution: {doc.institutionName}</div>
                    <div>• Anti-Piracy Watermarking: Dynamic Student Identity + Timestamp</div>
                    <div>• Access Mode: Infinite cloud reads across any mobile or desktop browser</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout & Wallet Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-[#0B192C] bg-white p-6 shadow-lg space-y-6 sticky top-24">
            
            {/* Price Header with 85/15 Commission Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Marketplace Price
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatUGX(doc.priceUGX)}
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  Instant Unlock
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <BadgePercent className="h-3.5 w-3.5 text-emerald-600" />
                    Lecturer Share (85%):
                  </span>
                  <span className="font-bold text-emerald-900">{formatUGX(lecturerNet)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>SomaUG Platform Infrastructure (15%):</span>
                  <span>{formatUGX(platformFee)}</span>
                </div>
              </div>
            </div>

            {/* Active Student Switcher (Testing & Sandbox) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Student Account:
                </label>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                  Demo Switcher
                </span>
              </div>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setPurchaseError(null);
                  setReceipt(null);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-amber-500"
              >
                <option value="user-student-1">Grace Namukasa (Sufficient Balance)</option>
                <option value="user-student-2">Ivan Mugisha (Low Balance Demo)</option>
              </select>
            </div>

            {/* Wallet Balance Status */}
            <div className="rounded-xl bg-gradient-to-r from-slate-900 to-[#162942] text-white p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Wallet className="h-3.5 w-3.5 text-amber-400" />
                  Your Wallet Balance:
                </span>
                <span className={`font-black text-sm ${hasSufficientFunds ? "text-emerald-400" : "text-amber-400"}`}>
                  {formatUGX(walletBalance)}
                </span>
              </div>

              {!hasSufficientFunds && (
                <p className="text-[11px] text-amber-300 font-medium">
                  Short by {formatUGX(doc.priceUGX - walletBalance)}. Top up with MTN MoMo or Airtel Money.
                </p>
              )}
            </div>

            {/* Primary Action Button or Entitlement Status */}
            {isEntitled ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-sm text-emerald-950">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Unlocked &amp; Ready in Library</span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    You hold an active, verified entitlement for v{doc.currentVersion}.0. All {doc.pageCount} pages are ready to read.
                  </p>
                </div>

                <Link
                  href={`/student/read/${doc.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Open Full Study Reader ({doc.pageCount} Pages)</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {hasSufficientFunds ? (
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-4 py-3.5 text-sm font-black text-white shadow-lg hover:bg-[#162942] active:scale-[0.99] transition"
                  >
                    <Lock className="h-4 w-4 text-amber-400" />
                    <span>Purchase with Wallet ({formatUGX(doc.priceUGX)})</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/student/wallet"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-black text-slate-950 shadow-md hover:bg-amber-400 active:scale-[0.99] transition"
                    >
                      <Smartphone className="h-4 w-4 text-slate-950" />
                      <span>Deposit via MTN / Airtel Money</span>
                    </Link>
                    <p className="text-center text-[11px] text-slate-500 font-medium">
                      Takes ~15 seconds to credit via USSD prompt
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Official Digital Purchase Receipt */}
            {receipt && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                    <Receipt className="h-4 w-4 text-emerald-700" />
                    <span>Official Transaction Receipt</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyReceipt}
                    className="text-[10px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedReceipt ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="space-y-1 font-mono text-[11px] text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ref:</span>
                    <span className="font-bold text-slate-900">{receipt.receiptReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order:</span>
                    <span className="font-bold text-slate-900">{receipt.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-extrabold text-emerald-800">{formatUGX(receipt.grossAmountUGX)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time:</span>
                    <span>{receipt.purchasedAt}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-800 font-bold">Ledger Status: Authoritative</span>
                  <Link
                    href={`/student/read/${doc.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-900 hover:underline"
                  >
                    <span>Read Now</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Atomic Double-Entry Guarantee
              </span>
              <Link href="/student/wallet" className="font-bold text-slate-800 hover:underline">
                Deposit UGX
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout PIN Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Authorize Purchase</h3>
                  <p className="text-xs text-slate-500">Confirm with your 4-digit Wallet PIN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCheckoutModal(false);
                  setPurchaseError(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{doc.title}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Unit Price (Exact UGX):</span>
                <span className="font-extrabold text-slate-900">{formatUGX(doc.priceUGX)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Wallet Balance After Purchase:</span>
                <span className="font-extrabold text-emerald-700">
                  {formatUGX(walletBalance - doc.priceUGX)}
                </span>
              </div>
            </div>

            <form onSubmit={handleAtomicPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter 4-Digit Wallet PIN (Sandbox Default: 1234)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={walletPin}
                  onChange={(e) => setWalletPin(e.target.value)}
                  placeholder="• • • •"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg font-mono tracking-widest text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  autoFocus
                  required
                />
              </div>

              {purchaseError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="font-semibold">{purchaseError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchasing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B192C] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition shadow-md"
                >
                  {purchasing ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Committing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Confirm &amp; Unlock</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
