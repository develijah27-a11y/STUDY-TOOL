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
  QrCode,
  KeyRound,
  Presentation,
  Send,
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
  accessCode: string;
  title: string;
  courseCode: string;
  institutionShortCode: string;
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

  // Multi-step publishing wizard step (1 to 3)
  const [publishStep, setPublishStep] = useState(1);
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
  const [lastPublishedDoc, setLastPublishedDoc] = useState<{
    id: string;
    accessCode: string;
    title: string;
    courseCode: string;
  } | null>(null);

  // Direct Sharing & Slide Modal State
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeSlideDoc, setActiveSlideDoc] = useState<PublishedDoc | null>(null);

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
          accessCode: d.accessCode || d.id,
          title: d.title,
          courseCode: d.courseCode,
          institutionShortCode: d.institutionShortCode || "MAK",
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
    setLastPublishedDoc(null);
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

      const published = data.document;
      setPublishResult(
        `Successfully published "${published.title}". Generated Document Access Code: ${
          published.accessCode || published.id
        }.`
      );
      setLastPublishedDoc({
        id: published.id,
        accessCode: published.accessCode || published.id,
        title: published.title,
        courseCode: courseUnitId.replace("course-", "").toUpperCase(),
      });
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

  const getDirectPlatformUrl = (accessCode: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/d/${accessCode}`;
    }
    return `https://somaug.ac.ug/d/${accessCode}`;
  };

  const handleShareToWhatsApp = (doc: { accessCode: string; title: string; courseCode: string; priceUGX?: number }) => {
    const directUrl = getDirectPlatformUrl(doc.accessCode);
    const priceText = doc.priceUGX ? `\n*Price:* ${formatUGX(doc.priceUGX)}` : "";
    const msg = `📚 *University Course Material*\n\n*Course:* ${doc.courseCode}\n*Document:* ${doc.title}${priceText}\n\n👉 *Open directly on SomaUG Academic:*\n${directUrl}\n\n💡 *Or enter Document Code:* *${doc.accessCode}* on the platform to read.`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyLink = (accessCode: string) => {
    const directUrl = getDirectPlatformUrl(accessCode);
    navigator.clipboard.writeText(directUrl);
    setCopiedItem(`link-${accessCode}`);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const handleCopyCode = (accessCode: string) => {
    navigator.clipboard.writeText(accessCode);
    setCopiedItem(`code-${accessCode}`);
    setTimeout(() => setCopiedItem(null), 2500);
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
      const msg = `Official Course Pack: ${url}\nInstant access via Student Wallet on SomaUG Academic.`;
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
              <span>Verified Academic Publisher &amp; Document Sharing Hub</span>
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

      {/* Immediate WhatsApp Share Card for newly published document */}
      {lastPublishedDoc && (
        <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-50/90 p-6 shadow-lg animate-in fade-in duration-300 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                  Publication Ready for Students
                </span>
                <h3 className="text-base font-extrabold text-emerald-950">
                  {lastPublishedDoc.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleShareToWhatsApp(lastPublishedDoc)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 text-xs font-black shadow-md transition"
            >
              <Send className="h-4 w-4" />
              <span>Share Link to Class WhatsApp</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="rounded-2xl bg-white border border-emerald-200 p-4 space-y-2">
              <span className="text-slate-500 font-bold block">Document Access Code:</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-slate-900">{lastPublishedDoc.accessCode}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(lastPublishedDoc.accessCode)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1 font-sans text-xs font-bold text-slate-800"
                >
                  {copiedItem === `code-${lastPublishedDoc.accessCode}` ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-emerald-200 p-4 space-y-2">
              <span className="text-slate-500 font-bold block">Direct Platform Link:</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 truncate max-w-[200px]">
                  {getDirectPlatformUrl(lastPublishedDoc.accessCode)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(lastPublishedDoc.accessCode)}
                  className="rounded-lg bg-emerald-100 hover:bg-emerald-200 px-3 py-1 font-sans text-xs font-bold text-emerald-900"
                >
                  {copiedItem === `link-${lastPublishedDoc.accessCode}` ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Document Publishing Wizard & My Published Materials with Direct Links */}
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
                    Publish Course Material &amp; Generate WhatsApp Access Link
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Produces a direct link and short code that brings students to the document on SomaUG
                  </p>
                </div>
              </div>

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
                3. Preview &amp; Publish
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
                        "Publishing & Generating Access Link..."
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Publish &amp; Generate WhatsApp Access Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Published PDFs with Direct Links, Codes, WhatsApp Share & Projector Slide */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  My Course PDFs &amp; Access Codes ({myDocuments.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Share direct links or short codes to WhatsApp class groups
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 block line-clamp-1">
                        {doc.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {doc.courseCode} • {doc.pageCount} pages • {doc.salesCount} students enrolled
                      </span>
                    </div>
                    <span className="font-black text-emerald-700 shrink-0">
                      {formatUGX(doc.priceUGX)}
                    </span>
                  </div>

                  {/* Document Access Code & Direct URL Box */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                        <KeyRound className="h-3 w-3 text-amber-600" />
                        Code:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {doc.accessCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(doc.accessCode)}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline"
                        >
                          {copiedItem === `code-${doc.accessCode}` ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-bold">Direct Link:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-emerald-800 text-[10px] truncate max-w-[130px]">
                          /d/{doc.accessCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(doc.accessCode)}
                          className="text-[10px] font-bold text-emerald-800 hover:underline"
                        >
                          {copiedItem === `link-${doc.accessCode}` ? "Copied" : "Copy Link"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Share to WhatsApp & Projector Slide View */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleShareToWhatsApp(doc)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold transition shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Share to WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSlideDoc(doc)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 px-3 py-2 text-xs font-bold transition shadow-sm"
                      title="Show Classroom Projector Slide & QR Code"
                    >
                      <Presentation className="h-3.5 w-3.5 text-amber-600" />
                      <span>Slide / QR</span>
                    </button>

                    <Link
                      href={`/catalogue/${doc.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white hover:bg-slate-100 p-2 text-slate-700"
                      title="View Document Details Page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Slide / QR Modal (For Projector or WhatsApp screenshot) */}
      {activeSlideDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B192C] border-2 border-amber-400 p-6 md:p-8 text-white shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Presentation className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                    Classroom Projector Slide • SomaUG Academic
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    {activeSlideDoc.courseCode}: Course Material Access
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlideDoc(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-6 text-center space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 uppercase">
                  {activeSlideDoc.institutionShortCode} Official Lecture Material
                </span>
                <h2 className="text-lg md:text-xl font-black text-white">
                  {activeSlideDoc.title}
                </h2>
              </div>

              {/* High-visibility Code Display */}
              <div className="bg-black/50 border border-amber-400/50 rounded-2xl p-4 space-y-1 max-w-xs mx-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                  Document Access Code
                </span>
                <div className="text-2xl md:text-3xl font-mono font-black text-amber-400 tracking-wider">
                  {activeSlideDoc.accessCode}
                </div>
              </div>

              {/* Direct Platform Link */}
              <div className="space-y-1 pt-2">
                <span className="text-xs text-slate-300 font-medium block">
                  Direct Platform Link (Tap in WhatsApp to open directly):
                </span>
                <div className="font-mono text-xs font-bold text-emerald-300 bg-white/5 py-2 px-3 rounded-xl border border-white/10 break-all">
                  {getDirectPlatformUrl(activeSlideDoc.accessCode)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleShareToWhatsApp(activeSlideDoc)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white transition shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>Send Direct Link to WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyLink(activeSlideDoc.accessCode)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-3 text-xs font-bold text-white transition"
              >
                <Copy className="h-4 w-4" />
                <span>
                  {copiedItem === `link-${activeSlideDoc.accessCode}`
                    ? "Link Copied!"
                    : "Copy Direct Link"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
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
