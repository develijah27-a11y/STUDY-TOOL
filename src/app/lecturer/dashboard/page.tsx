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

export default function LecturerDashboardPage() {
  const [selectedLecturerUserId, setSelectedLecturerUserId] = useState("user-lecturer-1");
  const [walletBalance, setWalletBalance] = useState(17000);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);

  // Publish Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("course-csc2101");
  const [documentType, setDocumentType] = useState("lecture_notes");
  const [priceUGX, setPriceUGX] = useState(5000);
  const [pageCount, setPageCount] = useState(24);
  const [topics, setTopics] = useState("Algorithms, Exam Prep, Worked Examples");
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(true);
  const [publishResult, setPublishResult] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Payout Request State
  const [payoutAmount, setPayoutAmount] = useState(15000);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Collection Builder State
  const [colTitle, setColTitle] = useState("");
  const [colDesc, setColDesc] = useState("");
  const [createdCollectionCode, setCreatedCollectionCode] = useState<string | null>(null);

  const loadLecturerData = useCallback(async () => {
    const res = await fetch(
      `/api/wallet?userId=${selectedLecturerUserId}&targetUserId=${selectedLecturerUserId}&walletType=lecturer`
    );
    if (res.ok) {
      const data = await res.json();
      setWalletBalance(data.wallet?.spendableBalanceUGX ?? 0);
      setReservedBalance(data.wallet?.reservedBalanceUGX ?? 0);
      setPayouts(data.lecturerPayouts || []);
    }
  }, [selectedLecturerUserId]);

  useEffect(() => {
    loadLecturerData();
  }, [loadLecturerData]);

  const handlePublishDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishResult(null);

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
      `Published "${data.document.title}" (ID: ${data.document.id}). Server-enforced preview pages: [${
        data.document.allowedPreviewPages.join(", ") || "None (1-2 page policy)"
      }].`
    );
    setTitle("");
    setDescription("");
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);
    setPayoutMessage(null);

    const lecturerId =
      selectedLecturerUserId === "user-lecturer-1"
        ? "lec-1"
        : selectedLecturerUserId === "user-lecturer-2"
        ? "lec-2"
        : "lec-pending";

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
    await loadLecturerData();
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatedCollectionCode(null);

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
  };

  const platformCommission = Math.floor((priceUGX * 15) / 100);
  const netLecturerShare = priceUGX - platformCommission;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Lecturer Header & Verification Switcher */}
      <div className="rounded-2xl bg-[#0f2027] text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Lecturer Publishing &amp; Earnings Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Available Earnings: {formatUGX(walletBalance)}
            </h1>
            <p className="text-xs text-slate-300">
              Reserved for Consolidated Weekly Mobile Money Payout:{" "}
              <strong>{formatUGX(reservedBalance)}</strong> • Minimum Payout Threshold:{" "}
              <strong>UGX 10,000</strong>
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl p-4 space-y-2 min-w-[280px]">
            <label className="block text-xs font-bold text-amber-300">
              Active Lecturer Account (Test Verification Rules):
            </label>
            <select
              value={selectedLecturerUserId}
              onChange={(e) => {
                setSelectedLecturerUserId(e.target.value);
                setPublishError(null);
                setPublishResult(null);
                setPayoutError(null);
              }}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-semibold text-white"
            >
              <option value="user-lecturer-1">
                Assoc. Prof. David Okello (Verified — MAK)
              </option>
              <option value="user-lecturer-2">
                Dr. Sarah Nakato (Verified — MAK Law)
              </option>
              <option value="user-lecturer-pending">
                Eng. Peter Kato (Under Review — Test Blocked Publish)
              </option>
            </select>
            {selectedLecturerUserId === "user-lecturer-pending" && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Unverified: Server will block publishing &amp; payouts</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Multi-Step Document Publishing Workflow */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-amber-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Publish New Educational Material (Multi-Step Validated)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Validates PDF binary signature, checksum, pricing bounds, and server-side preview policy
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePublishDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Step A &amp; B: Publication Title &amp; Course Unit
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CSC 2101: Graph Algorithms & Dynamic Programming Lecture Notes"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Applicable Course Unit
                  </label>
                  <select
                    value={courseUnitId}
                    onChange={(e) => setCourseUnitId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    <option value="course-csc2101">CSC 2101: Data Structures &amp; Algorithms</option>
                    <option value="course-bsse3102">BSSE 3102: Distributed Systems</option>
                    <option value="course-law2105">LAW 2105: Constitutional Law</option>
                    <option value="course-acc1102">ACC 1102: Financial Accounting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Category
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    <option value="lecture_notes">Lecture Notes Compendium</option>
                    <option value="past_paper_solution">Solved Past Papers &amp; Marking Guide</option>
                    <option value="study_guide">Study Guide</option>
                    <option value="lab_manual">Laboratory Manual</option>
                    <option value="curriculum_summary">Quick Reference / Cheat Sheet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Academic Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe syllabus coverage, worked examples, and target year/semester..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs"
                  required
                />
              </div>

              {/* Step C & D: Pricing Split & Server Preview Policy Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Step C: Price in UGX
                  </label>
                  <input
                    type="number"
                    min={500}
                    max={100000}
                    step={500}
                    value={priceUGX}
                    onChange={(e) => setPriceUGX(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Step D: PDF Page Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={pageCount}
                    onChange={(e) => setPageCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Topics (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Live Earnings Split & Preview Policy Consequence Box */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-slate-900">
                  <span>Gross Price: {formatUGX(priceUGX)}</span>
                  <span className="text-emerald-700">
                    Your Net Credit (85%): {formatUGX(netLecturerShare)}
                  </span>
                  <span className="text-slate-500">
                    Platform Commission (15%): {formatUGX(platformCommission)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong>Server Preview Policy for {pageCount} page(s):</strong>{" "}
                  {pageCount <= 2
                    ? "1–2 pages: 0 sample preview pages exposed (metadata only)."
                    : pageCount <= 5
                    ? "3–5 pages: Preview disabled by default."
                    : pageCount <= 20
                    ? "6–20 pages: Up to 3 sample pages permitted."
                    : "Over 20 pages: Curated sample capped at max 5 pages / 20%."}
                </p>
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ownershipConfirmed}
                  onChange={(e) => setOwnershipConfirmed(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <span>
                  <strong>Step E (Copyright &amp; Academic Rights Declaration):</strong> I confirm
                  that I am the original author or authorized university lecturer for this material
                  and that it does not infringe third-party textbook copyrights.
                </span>
              </label>

              {publishError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-800">
                  {publishError}
                </div>
              )}

              {publishResult && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-900">
                  {publishResult}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#0f2027] px-4 py-3 text-xs font-bold text-white hover:bg-slate-800"
              >
                <FilePlus2 className="inline h-4 w-4 mr-1.5 text-amber-400" />
                Validate &amp; Publish to Academic Catalogue
              </button>
            </form>
          </div>

          {/* Lecturer Collection & WhatsApp QR Pack Generator */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Create Course-Resource Collection &amp; WhatsApp QR Code
                </h2>
                <p className="text-xs text-slate-500">
                  Bundle your publications into a single course link for students and class coordinators
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-3">
              <input
                type="text"
                value={colTitle}
                onChange={(e) => setColTitle(e.target.value)}
                placeholder="e.g. CSC 2101 Complete Mid-Semester Revision Bundle"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                required
              />
              <input
                type="text"
                value={colDesc}
                onChange={(e) => setColDesc(e.target.value)}
                placeholder="Collection description for WhatsApp class group..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <Share2 className="inline h-3.5 w-3.5 mr-1.5" />
                Generate Shareable Collection Link &amp; QR Code
              </button>
            </form>

            {createdCollectionCode && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs flex items-center justify-between">
                <span className="font-bold text-emerald-900">
                  Collection Created! Share Code: {createdCollectionCode}
                </span>
                <Link
                  href={`/collections/${createdCollectionCode}`}
                  className="rounded bg-[#0f2027] px-3 py-1.5 text-white font-bold"
                >
                  Open Collection &amp; View QR →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lecturer Consolidated Mobile Money Payouts */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Wallet className="h-5 w-5 text-amber-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Consolidated Mobile Money Payout
                </h2>
                <p className="text-xs text-slate-500">
                  Registered Destination: MTN MoMo (256774998877)
                </p>
              </div>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payout Amount (Min UGX 10,000)
                </label>
                <input
                  type="number"
                  min={10000}
                  step={1000}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
                  required
                />
              </div>

              {payoutError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-bold">
                  {payoutError}
                </div>
              )}

              {payoutMessage && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium">
                  {payoutMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                <Smartphone className="inline h-4 w-4 mr-1" />
                Request Consolidated Payout ({formatUGX(payoutAmount)})
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-700">Payout Requests &amp; Batches:</h3>
              {payouts.length === 0 ? (
                <p className="text-xs text-slate-400">No payouts requested yet.</p>
              ) : (
                <div className="space-y-2">
                  {payouts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{formatUGX(p.amountUGX)}</span>
                        <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          {p.status}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        Ref: {p.payoutReference} • {p.destinationNetwork} ({p.destinationPhone})
                      </div>
                      <div className="text-[10px] text-slate-400">{formatDate(p.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Payout Timeout &amp; Batch Isolation</span>
              </div>
              <p>
                A payout is marked <strong>Paid</strong> only after authoritative telecom
                confirmation. If a provider times out, the request stays in{" "}
                <code>processing</code> for reconciliation—never blindly sending a duplicate payout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

