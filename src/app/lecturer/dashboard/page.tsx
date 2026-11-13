"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  UploadCloud,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Layers,
  Smartphone,
  FilePlus2,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Clock,
  BookOpen,
  FileText,
  BadgePercent,
  Check,
  Info,
  DollarSign,
} from "lucide-react";

interface PayoutItem {
  id: string;
  payoutReference: string;
  destinationPhone: string;
  destinationNetwork: string;
  amountUGX: number;
  netPayoutUGX: number;
  status: string;
  failureReason?: string;
  createdAt: string;
}

interface PublishedDoc {
  id: string;
  title: string;
  courseCode: string;
  priceUGX: number;
  pageCount: number;
  salesCount: number;
  status: string;
}

export default function LecturerDashboardPage() {
  const [selectedLecturerUserId, setSelectedLecturerUserId] = useState("user-lecturer-1");
  const [walletBalance, setWalletBalance] = useState(17000);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [myDocuments, setMyDocuments] = useState<PublishedDoc[]>([]);

  // Multi-step publishing wizard step (1 to 4)
  const [publishStep, setPublishStep] = useState(1);
  const [fileName, setFileName] = useState("CSC_2101_Lecture_Compendium.pdf");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("course-csc2101");
  const [documentType, setDocumentType] = useState("lecture_notes");
  const [priceUGX, setPriceUGX] = useState(5000);
  const [pageCount, setPageCount] = useState(24);
  const [topics, setTopics] = useState("Graph Algorithms, Dynamic Programming, Complexity Analysis");
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Payout Request State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(15000);
  const [payoutPhone, setPayoutPhone] = useState("0772112233");
  const [payoutNetwork, setPayoutNetwork] = useState<"MTN" | "AIRTEL">("MTN");
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [requestingPayout, setRequestingPayout] = useState(false);

  // Collection Builder State
  const [colTitle, setColTitle] = useState("");
  const [colDesc, setColDesc] = useState("");
  const [createdCollectionCode, setCreatedCollectionCode] = useState<string | null>(null);
  const [copiedCollectionLink, setCopiedCollectionLink] = useState(false);

  const loadLecturerData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/wallet?userId=${selectedLecturerUserId}&targetUserId=${selectedLecturerUserId}&walletType=lecturer`
      );
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.wallet?.spendableBalanceUGX ?? 0);
        setReservedBalance(data.wallet?.reservedBalanceUGX ?? 0);
        setPayouts(data.lecturerPayouts || []);
      }

      // Load catalogue to filter documents owned by this lecturer
      const catRes = await fetch("/api/catalogue");
      if (catRes.ok) {
        const catData = await catRes.json();
        const docs = (catData.documents || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          courseCode: d.courseCode,
          priceUGX: d.priceUGX,
          pageCount: d.pageCount,
          salesCount: d.salesCount,
          status: "published",
        }));
        setMyDocuments(docs);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedLecturerUserId]);

  useEffect(() => {
    loadLecturerData();
  }, [loadLecturerData]);

  const handlePublishDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishResult(null);
    setPublishing(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish_document",
          userId: selectedLecturerUserId,
          title,
          description,
          institutionId: "inst-mak",
          courseUnitId,
          documentType,
          priceUGX: Number(priceUGX),
          pageCount: Number(pageCount),
          topics,
          ownershipConfirmed,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPublishError(data.error || "Publication failed");
        return;
      }

      setPublishResult(
        `Successfully published "${data.document.title}". Sample preview pages: [${
          data.document.allowedPreviewPages.join(", ") || "None (1-2 page short policy)"
        }]. Students can now discover and purchase.`
      );
      setTitle("");
      setDescription("");
      setPublishStep(1);
      await loadLecturerData();
    } catch (err) {
      setPublishError("Connection error while publishing material.");
    } finally {
      setPublishing(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);
    setPayoutMessage(null);
    setRequestingPayout(true);

    const lecturerId =
      selectedLecturerUserId === "user-lecturer-1"
        ? "lec-1"
        : selectedLecturerUserId === "user-lecturer-2"
        ? "lec-2"
        : "lec-pending";

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lecturer_payout",
          lecturerId,
          amountUGX: Number(payoutAmount),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPayoutError(data.error || "Payout request rejected");
        return;
      }

      setPayoutMessage(
        `Payout Request ${data.payoutItem.payoutReference} queued for ${formatUGX(
          payoutAmount
        )} to ${data.payoutItem.destinationNetwork} (${data.payoutItem.destinationPhone}).`
      );
      setShowPayoutModal(false);
      await loadLecturerData();
    } catch (err) {
      setPayoutError("Error contacting payout settlement service.");
    } finally {
      setRequestingPayout(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatedCollectionCode(null);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_collection",
          userId: selectedLecturerUserId,
          title: colTitle,
          description: colDesc,
          institutionId: "inst-mak",
          courseUnitId: "course-csc2101",
          documentIds: ["doc-csc2101-notes", "doc-csc2101-pastpapers"],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedCollectionCode(data.collection.shareCode);
        setColTitle("");
        setColDesc("");
      } else {
        setPublishError(data.error || "Could not create collection");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPackLink = (shareCode: string) => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const url = `${origin}/collections/${shareCode}`;
      const msg = `Official Course Pack for CSC 2101: ${url}\nInstant access via Student Wallet on SomaUG Academic.`;
      navigator.clipboard.writeText(msg);
      setCopiedCollectionLink(true);
      setTimeout(() => setCopiedCollectionLink(false), 2500);
    }
  };

  const platformCommission = Math.floor((priceUGX * 15) / 100);
  const netLecturerShare = priceUGX - platformCommission;
  const isPendingLecturer = selectedLecturerUserId === "user-lecturer-pending";

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      
      {/* Top Banner: Available Earnings & Verification Switcher */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 md:p-10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified Academic Publisher &amp; Earnings Hub</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Available Spendable Earnings (85% Net Split)
              </span>
              <div className="text-4xl md:text-5xl font-black text-amber-400 tracking-tight">
                {formatUGX(walletBalance)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>In-Transit Weekly Payouts: <strong>{formatUGX(reservedBalance)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Min Payout: <strong>UGX 10,000</strong></span>
              </div>
            </div>
          </div>

          {/* Account Switcher & Payout CTA */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-3 min-w-[280px]">
            <label className="block text-xs font-bold text-amber-300">
              Switch Lecturer Profile (Test Rules):
            </label>
            <select
              value={selectedLecturerUserId}
              onChange={(e) => {
                setSelectedLecturerUserId(e.target.value);
                setPublishError(null);
                setPublishResult(null);
                setPayoutError(null);
              }}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-inner focus:ring-2 focus:ring-amber-400"
            >
              <option value="user-lecturer-1">Assoc. Prof. David Okello (Verified — MAK)</option>
              <option value="user-lecturer-2">Dr. Sarah Nakato (Verified — MAK Law)</option>
              <option value="user-lecturer-pending">Eng. Peter Kato (Under Review — Blocked)</option>
            </select>

            {isPendingLecturer ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/20 p-2.5 rounded-xl border border-amber-400/30">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Profile Under Review: Publishing and Payouts blocked until verification.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                disabled={walletBalance < 10000}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 disabled:opacity-40 transition shadow-md"
              >
                <Smartphone className="h-4 w-4" />
                <span>Request Mobile Money Payout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Multi-step Publishing Wizard & Course Pack Sharing */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column (7 cols): Document Publishing Wizard */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Publish Course Material (Multi-Step Validated)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Strict SHA-256 integrity, 85/15 split preview, and server-enforced preview policy
                  </p>
                </div>
              </div>

              {/* Step Counter */}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-bold text-slate-700">
                Step {publishStep} of 3
              </span>
            </div>

            {/* Step Navigation Tabs */}
            <div className="flex border-b border-slate-100 pb-3 gap-2">
              <button
                type="button"
                onClick={() => setPublishStep(1)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition text-center ${
                  publishStep === 1
                    ? "bg-[#0B192C] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                1. File &amp; Course
              </button>
              <button
                type="button"
                onClick={() => setPublishStep(2)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition text-center ${
                  publishStep === 2
                    ? "bg-[#0B192C] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                2. Pricing &amp; Split
              </button>
              <button
                type="button"
                onClick={() => setPublishStep(3)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition text-center ${
                  publishStep === 3
                    ? "bg-[#0B192C] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                3. Preview &amp; Honor Code
              </button>
            </div>

            <form onSubmit={handlePublishDocument} className="space-y-5">
              
              {/* Step 1: File & Course Metadata */}
              {publishStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Publication Title:
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. CSC 2101: Graph Algorithms & Dynamic Programming Lecture Compendium"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Target Course Unit:
                      </label>
                      <select
                        value={courseUnitId}
                        onChange={(e) => setCourseUnitId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900"
                      >
                        <option value="course-csc2101">CSC 2101: Data Structures &amp; Algorithms</option>
                        <option value="course-bsse3102">BSSE 3102: Distributed Systems</option>
                        <option value="course-law2105">LAW 2105: Constitutional Law</option>
                        <option value="course-acc1102">ACC 1102: Financial Accounting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Document Category:
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900"
                      >
                        <option value="lecture_notes">Lecture Notes Compendium</option>
                        <option value="past_paper_solution">Past Paper Marking Guide &amp; Solutions</option>
                        <option value="study_guide">Comprehensive Study Guide</option>
                        <option value="lab_manual">Laboratory Experiment Manual</option>
                        <option value="curriculum_summary">Course Summary / Cheat Sheet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Syllabus Topics Covered (Comma-separated):
                    </label>
                    <input
                      type="text"
                      value={topics}
                      onChange={(e) => setTopics(e.target.value)}
                      placeholder="e.g. Trees, Graphs, Dijkstra's, Floyd-Warshall"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setPublishStep(2)}
                      disabled={!title.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B192C] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition shadow-sm"
                    >
                      <span>Continue to Pricing</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Pricing & Integer Commission Split */}
              {publishStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Document Price (Exact UGX):
                      </label>
                      <input
                        type="number"
                        min={1000}
                        max={100000}
                        step={500}
                        value={priceUGX}
                        onChange={(e) => setPriceUGX(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Page Count:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={pageCount}
                        onChange={(e) => setPageCount(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Real-time Exact Integer Split Preview */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <BadgePercent className="h-4 w-4 text-emerald-600" />
                      <span>Authoritative Integer Revenue Sharing Formula:</span>
                    </span>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                        <span className="text-[11px] font-bold text-emerald-800 block">
                          Your Net Share (85%)
                        </span>
                        <span className="text-lg font-black text-emerald-950">
                          {formatUGX(netLecturerShare)}
                        </span>
                        <span className="text-[10px] text-emerald-700 block pt-0.5">
                          Per student purchase
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-100 border border-slate-200 p-3">
                        <span className="text-[11px] font-bold text-slate-600 block">
                          Platform Fee (15%)
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {formatUGX(platformCommission)}
                        </span>
                        <span className="text-[10px] text-slate-500 block pt-0.5">
                          Servers, DRM, MoMo fees
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setPublishStep(1)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishStep(3)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B192C] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      <span>Continue to Policy &amp; Publish</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Server-side Preview Policy & Honor Code */}
              {publishStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                    <span className="font-extrabold text-slate-900 block">
                      Server-Enforced Sample Preview Rule:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {pageCount <= 2 ? (
                        <span className="font-bold text-amber-800">
                          1–2 Page Short Reference Policy: Preview disabled to prevent full disclosure before purchase.
                        </span>
                      ) : (
                        <span>
                          Standard Multi-Page Policy: Pages <strong>[1, 2]</strong> will be readable for free by students in the catalogue previewer. All subsequent pages ({pageCount - 2} pages) are locked behind student wallet purchase.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="ownership"
                      checked={ownershipConfirmed}
                      onChange={(e) => setOwnershipConfirmed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="ownership" className="text-xs text-amber-950 leading-relaxed">
                      <strong>Uganda Academic Copyright &amp; Honor Declaration:</strong> I certify that I authored or possess the verified intellectual property rights to publish this document. It does not infringe upon any university or 3rd-party copyright.
                    </label>
                  </div>

                  {publishError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 font-semibold">
                      {publishError}
                    </div>
                  )}

                  {publishResult && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 font-medium">
                      {publishResult}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setPublishStep(2)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={publishing || !ownershipConfirmed || isPendingLecturer}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-40 transition shadow-md"
                    >
                      {publishing ? (
                        "Publishing to Blockchain/DB..."
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Publish Publication Instantly</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): WhatsApp Course Pack Generator & QR Hub */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  WhatsApp Course Pack Generator
                </h3>
                <p className="text-[11px] text-slate-500">
                  Bundle documents into one shareable link for class WhatsApp groups
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Pack Name:
                </label>
                <input
                  type="text"
                  value={colTitle}
                  onChange={(e) => setColTitle(e.target.value)}
                  placeholder="e.g. CSC 2101 Semester 1 Complete Bundle"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Instructions for Class:
                </label>
                <textarea
                  rows={2}
                  value={colDesc}
                  onChange={(e) => setColDesc(e.target.value)}
                  placeholder="Official lecture notes and 2020-2025 past paper marking guides..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPendingLecturer}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 transition shadow-sm"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Generate WhatsApp Share Pack</span>
              </button>
            </form>

            {/* Generated Collection Result */}
            {createdCollectionCode && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950">Pack Generated!</span>
                  <span className="font-mono font-bold text-emerald-800 text-[11px]">
                    {createdCollectionCode}
                  </span>
                </div>

                <p className="text-[11px] text-slate-700">
                  Share code ready. Click below to copy pre-formatted WhatsApp announcement text with direct link:
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPackLink(createdCollectionCode)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-700 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copiedCollectionLink ? "Copied!" : "Copy WhatsApp Msg"}</span>
                  </button>

                  <Link
                    href={`/collections/${createdCollectionCode}`}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-50"
                  >
                    <span>View Pack</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Published Documents List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              My Published Publications ({myDocuments.length})
            </h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">
                      {doc.title}
                    </span>
                    <span className="font-black text-emerald-700">{formatUGX(doc.priceUGX)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{doc.courseCode} • {doc.pageCount} pages</span>
                    <span className="font-bold text-slate-700">{doc.salesCount} Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Request MoMo Payout</h3>
                  <p className="text-xs text-slate-500">Disbursed to your registered phone number</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payout Amount (Min UGX 10,000, Max {formatUGX(walletBalance)}):
                </label>
                <input
                  type="number"
                  min={10000}
                  max={walletBalance}
                  step={500}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Money Destination:
                </label>
                <input
                  type="text"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono font-bold text-slate-900"
                  required
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Withdrawal:</span>
                  <span className="font-bold text-slate-900">{formatUGX(payoutAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Disbursement Carrier Fee:</span>
                  <span className="font-bold text-slate-900">UGX 0 (Absorbed by SomaUG)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Net Disbursed to Handset:</span>
                  <span className="text-emerald-700">{formatUGX(payoutAmount)}</span>
                </div>
              </div>

              {payoutError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-semibold">
                  {payoutError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingPayout || walletBalance < payoutAmount}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 disabled:opacity-40 transition shadow-md"
                >
                  {requestingPayout ? "Queueing Payout..." : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
