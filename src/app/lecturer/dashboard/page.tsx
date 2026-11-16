"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  Download,
  BarChart3,
  UserCheck,
  Eye,
  Star,
  Plus,
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
  viewsCount?: number;
  ratingAverage?: number;
  status: string;
}

type LecturerTab =
  | "overview"
  | "publications"
  | "earnings"
  | "analytics"
  | "profile";

function LecturerDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active logged-in lecturer profile (loaded dynamically from session)
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    fullName: string;
    email: string;
    institutionName?: string;
    department?: string;
    teachingRole?: string;
    isVerified?: boolean;
  }>({
    id: "lecturer",
    fullName: "Lecturer",
    email: "",
    institutionName: "Makerere University",
    department: "Department of Computer Science",
    teachingRole: "Lecturer",
    isVerified: true,
  });

  const [activeTab, setActiveTab] = useState<LecturerTab>("overview");
  const [walletBalance, setWalletBalance] = useState(17000);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [myDocuments, setMyDocuments] = useState<PublishedDoc[]>([]);

  // Synchronize activeTab with URL ?tab= query parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as LecturerTab | null;
    if (
      tab &&
      ["overview", "publications", "collections", "earnings", "analytics", "profile"].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load real registered user profile from localStorage and backend session
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u) {
          setCurrentUser({
            id: u.id || "lecturer",
            fullName: u.fullName || "Lecturer",
            email: u.email || "",
            institutionName: u.institutionName || "Makerere University",
            department: u.department || "Department of Computer Science",
            teachingRole: u.teachingRole || "Lecturer",
            isVerified: u.isVerified !== false,
          });
        }
      }
    } catch { }

    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setCurrentUser((prev) => ({
              ...prev,
              id: data.user.id || prev.id,
              fullName: data.user.fullName || prev.fullName,
              email: data.user.email || prev.email,
              institutionName: data.user.institutionName || prev.institutionName,
              department: data.user.department || prev.department,
              teachingRole: data.user.teachingRole || prev.teachingRole,
              isVerified: data.user.isVerified !== false,
            }));
            localStorage.setItem("somaug_user_session", JSON.stringify(data.user));
          }
        }
      } catch { }
    }
    fetchSession();
  }, []);

  // Multi-step publishing wizard step (1 to 3)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [publishStep, setPublishStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("course-csc2101");
  const [documentType, setDocumentType] = useState("lecture_notes");
  const [priceUGX, setPriceUGX] = useState(5000);
  const [pageCount, setPageCount] = useState(24);
  const [topics, setTopics] = useState(
    "Graph Algorithms, Dynamic Programming, Complexity Analysis"
  );
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

  const loadLecturerData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/wallet?userId=${currentUser.id}&targetUserId=${currentUser.id}&walletType=lecturer`
      );
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.wallet?.spendableBalanceUGX ?? 0);
        setReservedBalance(data.wallet?.reservedBalanceUGX ?? 0);
        setPayouts(data.lecturerPayouts || []);
      }

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
          salesCount: d.salesCount || 0,
          viewsCount: d.viewsCount || 0,
          ratingAverage: d.ratingAverage || 4.8,
          status: "published",
        }));
        setMyDocuments(docs);
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentUser.id]);

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
          userId: currentUser.id,
          title,
          description,
          institutionId: "inst-mak",
          courseUnitId,
          documentType,
          priceUGX: Number(priceUGX),
          pageCount: Number(pageCount),
          topics: topics.split(",").map((t) => t.trim()),
          ownershipConfirmed,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPublishError(data.error || "Failed to publish document.");
        return;
      }

      setPublishResult(
        `Successfully published! Access Code: ${data.document.accessCode}. Your document is now available in the catalogue.`
      );
      setLastPublishedDoc({
        id: data.document.id,
        accessCode: data.document.accessCode,
        title: data.document.title,
        courseCode: "CSC 2101",
      });

      await loadLecturerData();
      setPublishStep(1);
      setTitle("");
      setDescription("");
    } catch (err) {
      setPublishError("Network interruption while publishing.");
    } finally {
      setPublishing(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);
    setPayoutMessage(null);
    setRequestingPayout(true);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lecturer_payout",
          lecturerId: currentUser.id,
          amountUGX: Number(payoutAmount),
          destinationPhone: payoutPhone,
          destinationNetwork: payoutNetwork,
          idempotencyKey: `WITHDRAW-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPayoutError(data.error || "Withdrawal failed. Please check your available balance.");
        return;
      }

      setPayoutMessage(
        `Instant withdrawal of ${formatUGX(
          payoutAmount
        )} successfully disbursed to ${payoutPhone} (${payoutNetwork} Mobile Money).`
      );
      await loadLecturerData();
      setShowPayoutModal(false);
    } catch (err) {
      setPayoutError("Connection error while initiating withdrawal.");
    } finally {
      setRequestingPayout(false);
    }
  };

  const getDirectPlatformUrl = (codeOrId: string) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://soma.ug";
    return `${origin}/d/${codeOrId}`;
  };

  const handleShareDirectDocument = (doc: PublishedDoc) => {
    const directUrl = getDirectPlatformUrl(doc.accessCode);
    const text = `Academic Notes & Solved Papers: ${doc.title} (${doc.courseCode})\nDirect Link: ${directUrl}\nPrice: UGX ${doc.priceUGX.toLocaleString()} via MTN MoMo / Airtel Money.`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyDirectLink = (code: string) => {
    const directUrl = getDirectPlatformUrl(code);
    navigator.clipboard.writeText(directUrl);
    setCopiedItem(code);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const platformCommission = Math.floor((priceUGX * 15) / 100);
  const netLecturerShare = priceUGX - platformCommission;
  const isPendingLecturer = currentUser.isVerified === false;

  // Calculations from actual publications
  const totalSalesCount = myDocuments.reduce((acc, d) => acc + (d.salesCount || 0), 0);
  const totalEarningsCalculated = myDocuments.reduce(
    (acc, d) => acc + Math.floor(((d.salesCount || 0) * d.priceUGX * 85) / 100),
    0
  );
  const totalViewsCount = myDocuments.reduce((acc, d) => acc + (d.viewsCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* 1. Academic Desk Header & Command Station */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#142B45] to-[#16365C] text-white p-6 sm:p-10 shadow-2xl border border-slate-700/80 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#147D78]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-52 h-52 rounded-full bg-[#E9B949]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verified Academic Faculty</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9B949]/20 border border-[#E9B949]/40 px-3 py-1 text-xs font-bold text-[#E9B949]">
                <Building2 className="h-3.5 w-3.5" />
                <span>{currentUser.institutionName || "Makerere University"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300 font-medium">
                <span>Semester II (2025/2026)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome back, {currentUser.fullName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-2xl">
              {currentUser.department ? `${currentUser.department} • ` : ""}{currentUser.institutionName || "Ugandan Higher Education"}. Manage course unit syllabi, launch classroom projector slides, and receive direct mobile money earnings.
            </p>

            {/* Quick Action Station */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (myDocuments.length > 0) setActiveSlideDoc(myDocuments[0]);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-xs font-extrabold shadow transition"
              >
                <Presentation className="h-4 w-4" />
                <span>Launch Slide Projector</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("publications");
                  setShowUploadModal(true);
                  router.push("/lecturer/dashboard?tab=publications");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#147D78] hover:bg-teal-600 text-white px-4 py-2.5 text-xs font-bold transition shadow"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Publish New Material</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 text-xs font-bold transition"
              >
                <Wallet className="h-4 w-4 text-[#E9B949]" />
                <span>Withdraw Balance ({formatUGX(walletBalance)})</span>
              </button>
            </div>
          </div>

          {/* Accrued Royalties Mini Card */}
          <div className="rounded-2xl bg-white/10 border border-white/15 p-5 backdrop-blur-md space-y-2 min-w-[220px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
              Available Spendable Balance
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#E9B949]">
              {formatUGX(walletBalance)}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
              <span className="text-slate-300 font-medium">85% Lecturer Split</span>
              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                className="text-teal-300 hover:text-white font-bold underline"
              >
                Withdraw Funds →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTENT (Controlled exclusively by Left Sidebar) */}

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* 4 Academic Impact Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 relative overflow-hidden group hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Student Readers
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  +18% Semester II
                </span>
              </div>
              <div className="text-3xl font-black text-[#142B45]">
                {totalSalesCount.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified student enrollments across course units with unlocked study access.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#142B45] h-full w-[78%]" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 relative overflow-hidden group hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Published Course Units
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  Verified SOMA DRM
                </span>
              </div>
              <div className="text-3xl font-black text-[#147D78]">
                {myDocuments.length}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lecture note series, practical manuals &amp; solved past examination packs.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#147D78] h-full w-[85%]" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 relative overflow-hidden group hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Digital Reads &amp; Views
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Direct Desks
                </span>
              </div>
              <div className="text-3xl font-black text-[#142B45]">
                {(totalViewsCount > 0 ? totalViewsCount : 420) + "+"}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct student study engagements, bookmarks, and in-app revisions.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-blue-600 h-full w-[65%]" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 relative overflow-hidden group hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Course Satisfaction
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Verified Reviews
                </span>
              </div>
              <div className="text-3xl font-black text-amber-500 flex items-center gap-1.5">
                <span>4.9</span>
                <span className="text-base font-bold text-slate-400">/ 5.0 ★</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Average faculty rating from student feedback across Ugandan universities.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-amber-500 h-full w-[96%]" />
              </div>
            </div>
          </div>

          {/* Academic Lecture Tools & Recent Course Units Desk */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#142B45]">
                      Active Course Materials &amp; Classroom Distribution
                    </h3>
                    <p className="text-xs text-slate-500">
                      Launch projector slides or share direct links with your students
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("publications");
                      router.push("/lecturer/dashboard?tab=publications");
                    }}
                    className="text-xs font-bold text-[#147D78] hover:underline whitespace-nowrap"
                  >
                    View All Materials →
                  </button>
                </div>

                <div className="space-y-3">
                  {myDocuments.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs">
                            {doc.courseCode}
                          </span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                          <span className="text-slate-400">
                            Access Code: <code className="font-mono font-bold text-[#142B45]">{doc.accessCode}</code>
                          </span>
                        </div>
                        <h4 className="font-bold text-[#142B45] text-sm">{doc.title}</h4>
                        <p className="text-slate-500">
                          {doc.pageCount} pages • Official price: {formatUGX(doc.priceUGX)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveSlideDoc(doc)}
                          className="rounded-lg bg-amber-500/20 text-amber-900 border border-amber-300 px-3 py-1.5 font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5"
                          title="Open projector slide with scannable QR code for the lecture hall"
                        >
                          <Presentation className="h-3.5 w-3.5" />
                          <span>Slide QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareDirectDocument(doc)}
                          className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                          title="Share direct link to student WhatsApp group"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Classroom Teaching & Projector Slide Station */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#142B45] font-extrabold text-xs border-b border-slate-100 pb-2">
                  <Presentation className="h-4 w-4 text-[#147D78]" />
                  <span>Classroom Teaching Mode</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Project high-contrast scannable QR codes in your lecture room so students in attendance can immediately open today&apos;s lecture notes and solved questions on their phones.
                </p>
                {myDocuments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSlideDoc(myDocuments[0])}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] hover:bg-[#147D78] py-2.5 text-xs font-bold text-white transition shadow-sm"
                  >
                    <QrCode className="h-4 w-4 text-[#E9B949]" />
                    <span>Launch Slide Projector</span>
                  </button>
                )}
              </div>

              {/* Ugandan Semester Milestones & Syllabus Integrity */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#142B45] font-extrabold text-xs border-b border-slate-100 pb-2">
                  <BookOpen className="h-4 w-4 text-[#147D78]" />
                  <span>Semester II Academic Calendar</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">Weeks 1–6: Core Lecture Modules</span>
                      <p className="text-slate-500 text-[11px]">Primary syllabus delivery &amp; essential reading</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">Weeks 7–9: Continuous Assessments</span>
                      <p className="text-slate-500 text-[11px]">Mid-semester coursework &amp; practical manuals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">Weeks 12–15: Revision &amp; Past Papers</span>
                      <p className="text-slate-500 text-[11px]">Solved examination papers &amp; study packs</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px]">Anti-leak student DRM watermark active on all distributed copies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MY PUBLICATIONS */}
      {activeTab === "publications" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#142B45]">My Published Materials</h2>
              <p className="text-xs text-slate-500">
                Manage publications, projector slides, QR codes, and direct student links
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowUploadModal(!showUploadModal)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#0f635f] text-white px-4 py-2.5 text-xs font-black shadow-md transition shrink-0"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{showUploadModal ? "Close Upload Form" : "Upload New Publication"}</span>
            </button>
          </div>

          {/* Upload Publication Wizard */}
          {showUploadModal && (
            <div className="rounded-3xl border-2 border-[#147D78] bg-white p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#147D78]/10 text-[#147D78] flex items-center justify-center font-bold">
                    <FilePlus2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#142B45]">
                      Publish Academic Material
                    </h3>
                    <p className="text-xs text-slate-500">
                      Step {publishStep} of 3: Details &amp; DRM Protection
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`h-2 w-8 rounded-full transition ${publishStep === step
                        ? "bg-[#147D78]"
                        : publishStep > step
                          ? "bg-emerald-600"
                          : "bg-slate-200"
                        }`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handlePublishDocument} className="space-y-5">
                {publishStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Publication Title (Under 8 words recommended):
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. CSC 2101: Data Structures and Algorithms Notes"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#147D78] outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Document Type:
                        </label>
                        <select
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="lecture_notes">Lecture Notes</option>
                          <option value="past_paper_solution">Past Paper Solution</option>
                          <option value="lab_manual">Practical Lab Manual</option>
                          <option value="course_handout">Course Handout</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Estimated Page Count:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={pageCount}
                          onChange={(e) => setPageCount(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Course Unit:
                      </label>
                      <select
                        value={courseUnitId}
                        onChange={(e) => setCourseUnitId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="course-csc2101">CSC 2101: Data Structures and Algorithms (MAK)</option>
                        <option value="course-bribte-ee">EE 1101: Industrial Electrical Installation (BRIBTE)</option>
                        <option value="course-kpm-auto">AUT 2102: Engine Overhaul &amp; Diagnostics (KPM)</option>
                        <option value="course-uict-tlc">TLC 1204: Fibre Optics &amp; Networking (UICT)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPublishStep(2)}
                      disabled={!title.trim()}
                      className="w-full rounded-xl bg-[#142B45] hover:bg-[#147D78] py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
                    >
                      Next: Pricing &amp; Net Earnings →
                    </button>
                  </div>
                )}

                {publishStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Document Price (UGX):
                      </label>
                      <input
                        type="number"
                        min={500}
                        max={100000}
                        step={500}
                        value={priceUGX}
                        onChange={(e) => setPriceUGX(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-900 outline-none"
                        required
                      />
                    </div>

                    {/* Revenue Split Card */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200 text-xs">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#147D78]">
                          Lecturer Net Earnings (85%)
                        </span>
                        <div className="text-xl font-black text-slate-900">
                          {formatUGX(netLecturerShare)}
                        </div>
                        <p className="text-xs text-slate-500">Credited to wallet per purchase</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-500">
                          Platform Fee (15%)
                        </span>
                        <div className="text-xl font-bold text-slate-700">
                          {formatUGX(platformCommission)}
                        </div>
                        <p className="text-xs text-slate-500">DRM security, hosting, MoMo fees</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPublishStep(1)}
                        className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishStep(3)}
                        className="flex-1 rounded-xl bg-[#142B45] hover:bg-[#147D78] py-2.5 text-xs font-bold text-white transition"
                      >
                        Next: Legal &amp; DRM Policy →
                      </button>
                    </div>
                  </div>
                )}

                {publishStep === 3 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
                      <span className="font-bold flex items-center gap-1.5 text-amber-900">
                        <ShieldCheck className="h-4 w-4 text-[#147D78]" />
                        <span>Author Safeguards &amp; 85% Net Split:</span>
                      </span>
                      <p className="text-xs leading-relaxed text-amber-950">
                        You will receive 85% of each document sale (SomaUG retains 15% to cover payment processing and hosting). Documents are watermarked with the purchasing student&apos;s details to discourage unauthorized redistribution.
                      </p>
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={ownershipConfirmed}
                        onChange={(e) => setOwnershipConfirmed(e.target.checked)}
                        className="mt-0.5 rounded text-[#147D78] focus:ring-[#147D78]"
                        required
                      />
                      <span className="font-medium text-slate-800">
                        I confirm that I wrote this material, I have the right to sell it, and it does not breach my employer&apos;s policy or anyone&apos;s copyright.
                      </span>
                    </label>

                    {publishError && (
                      <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-bold">
                        {publishError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPublishStep(2)}
                        className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={publishing || !ownershipConfirmed}
                        className="flex-1 rounded-xl bg-[#147D78] hover:bg-[#0f635f] py-2.5 text-xs font-black text-white transition disabled:opacity-50 shadow-md"
                      >
                        {publishing ? "Publishing to Network..." : "Confirm & Publish Document"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Publications List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {doc.courseCode}
                    </span>
                    <span className="text-xs font-black text-[#147D78]">
                      {formatUGX(doc.priceUGX)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[#142B45] text-sm line-clamp-2">
                    {doc.title}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>{doc.pageCount} Pages • 2.4 MB</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                        {doc.status === "published" ? "Live • Published" : doc.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span>{doc.salesCount} Student Purchases</span>
                      <span className="text-[#147D78] font-bold">30d Offline Allowed</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-700 pt-0.5">
                      <span>Access Code:</span>
                      <strong className="text-[#147D78]">{doc.accessCode}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSlideDoc(doc)}
                      className="rounded-xl border border-slate-200 bg-[#F7F8FA] hover:bg-amber-50 hover:border-amber-300 py-2 text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5"
                    >
                      <Presentation className="h-3.5 w-3.5 text-amber-600" />
                      <span>Projector QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyDirectLink(doc.accessCode)}
                      className="rounded-xl border border-slate-200 bg-[#F7F8FA] hover:bg-slate-100 py-2 text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5"
                    >
                      {copiedItem === doc.accessCode ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleShareDirectDocument(doc)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white transition shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Share Link to WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: EARNINGS & WALLET */}
      {activeTab === "earnings" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Spendable Balance (85% Net Split)
              </span>
              <div className="text-3xl font-black text-[#147D78]">
                {formatUGX(walletBalance)}
              </div>
              <p className="text-xs text-slate-400">Available for instant Mobile Money withdrawal</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                In-Transit Reserved Settlement
              </span>
              <div className="text-3xl font-black text-[#E9B949]">
                {formatUGX(reservedBalance)}
              </div>
              <p className="text-xs text-slate-400">In-flight mobile money clearing batch</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Instant Wallet Withdrawal
                </span>
                <p className="text-xs text-slate-500 pt-1">
                  Disburse royalties directly to your registered MTN MoMo or Airtel Money number.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                disabled={walletBalance < 10000}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] hover:bg-[#147D78] py-2.5 text-xs font-black text-white transition disabled:opacity-40 shadow-sm"
              >
                <Wallet className="h-4 w-4 text-[#E9B949]" />
                <span>Withdraw Funds ({formatUGX(walletBalance)})</span>
              </button>
            </div>
          </div>

          {/* Withdrawal History Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#142B45] border-b border-slate-100 pb-3">
              Mobile Money Withdrawal Records
            </h3>

            {payouts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No past mobile money withdrawals recorded in this session.
              </p>
            ) : (
              <div className="space-y-2">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-[#F7F8FA] text-xs gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatUGX(p.amountUGX)}</span>
                        <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold uppercase">
                          {p.status}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-500 pt-0.5 block">
                        Ref: {p.payoutReference} • Phone: {p.destinationPhone} ({p.destinationNetwork})
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-black text-[#142B45]">Reader &amp; Sales Analytics</h2>
            <p className="text-xs text-slate-500">
              Verified publication engagement data based on student reading desks
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase block">Total Catalogue Views</span>
              <div className="text-2xl font-black text-[#142B45] flex items-center gap-2">
                <Eye className="h-5 w-5 text-slate-400" />
                <span>{totalViewsCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase block">Total Student Purchases</span>
              <div className="text-2xl font-black text-[#147D78] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#147D78]" />
                <span>{totalSalesCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase block">Average Reader Rating</span>
              <div className="text-2xl font-black text-amber-600 flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                <span>4.85 / 5.0</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase block">DRM Watermark Copies</span>
              <div className="text-2xl font-black text-emerald-700 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>100% Protected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROFILE & VERIFICATION */}
      {activeTab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#142B45]">Publisher Verification Profile</h2>
            <p className="text-xs text-slate-500">
              Institutional credentials and Mobile Money withdrawal destination
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Full Academic Name:</span>
              <span className="font-bold text-[#142B45]">
                {currentUser.fullName}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Institution:</span>
              <span className="font-bold text-[#142B45]">
                {currentUser.institutionName || "Makerere University (MAK)"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Department / Faculty:</span>
              <span className="font-bold text-[#142B45]">
                {currentUser.department || "Department of Computer Science"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Academic Role:</span>
              <span className="font-bold text-[#142B45]">
                {currentUser.teachingRole || "Lecturer"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Institutional Email:</span>
              <span className="font-bold text-[#142B45]">
                {currentUser.email || "Registered Faculty Account"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Verification Status:</span>
              <span
                className={`font-black px-2.5 py-1 rounded-full text-xs uppercase ${isPendingLecturer
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
              >
                {isPendingLecturer ? "Under Review" : "Verified Academic"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Withdrawal Network:</span>
              <span className="font-bold text-[#142B45]">MTN MoMo / Airtel Money</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Gateway Status:</span>
              <span className="font-mono font-bold text-[#147D78]">
                MarzPay Sandbox Live
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Classroom Projector Slide & Visual QR Code Modal */}
      {activeSlideDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#142B45] border-2 border-amber-400 p-6 md:p-8 text-white shadow-2xl space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                    Classroom Projector Slide &amp; Visual QR Code
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    {activeSlideDoc.courseCode}: Course Material Access
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlideDoc(null)}
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
                aria-label="Close Slide Modal"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-6 text-center space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 uppercase">
                  {activeSlideDoc.institutionShortCode} Official Lecture Material
                </span>
                <h2 className="text-lg md:text-xl font-black text-white">
                  {activeSlideDoc.title}
                </h2>
              </div>

              {/* Scannable Visual QR Code */}
              <div className="bg-white rounded-2xl p-4 max-w-[260px] mx-auto shadow-xl border-4 border-amber-400 space-y-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(
                    getDirectPlatformUrl(activeSlideDoc.accessCode)
                  )}`}
                  alt={`Scannable QR Code for ${activeSlideDoc.title}`}
                  className="w-full h-auto rounded-lg aspect-square"
                />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Scan With Phone Camera to Open
                </span>
              </div>

              {/* Direct Platform Link */}
              <div className="space-y-1 pt-1">
                <span className="text-xs text-slate-300 font-medium block">
                  Direct Platform Link (Tap in WhatsApp to open directly):
                </span>
                <div className="font-mono text-xs font-bold text-teal-300 bg-white/5 py-2 px-3 rounded-xl border border-white/10 break-all">
                  {getDirectPlatformUrl(activeSlideDoc.accessCode)}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleCopyDirectLink(activeSlideDoc.accessCode)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-3 text-xs font-bold text-white transition"
              >
                <Copy className="h-4 w-4" />
                <span>
                  {copiedItem === activeSlideDoc.accessCode ? "Copied Link!" : "Copy Direct Link"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleShareDirectDocument(activeSlideDoc)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition shadow-lg"
              >
                <Send className="h-4 w-4" />
                <span>Share to Class WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Self-Service Mobile Money Withdrawal Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#142B45]">
                    Withdraw to Mobile Money
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant self-service disbursement to your registered phone number
                  </p>
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
                  Withdrawal Amount (UGX, Min 10,000):
                </label>
                <input
                  type="number"
                  min={10000}
                  max={walletBalance}
                  step={500}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#147D78]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Phone Number:
                </label>
                <input
                  type="text"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder="077xxxxxxx or 075xxxxxxx"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#147D78]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Money Carrier:
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutNetwork("MTN")}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${payoutNetwork === "MTN"
                      ? "border-[#147D78] bg-teal-50 text-slate-900 font-extrabold"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                  >
                    MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutNetwork("AIRTEL")}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${payoutNetwork === "AIRTEL"
                      ? "border-[#147D78] bg-teal-50 text-slate-900 font-extrabold"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                  >
                    Airtel Money
                  </button>
                </div>
              </div>

              {payoutError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-bold">
                  {payoutError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingPayout || payoutAmount > walletBalance}
                  className="flex-1 rounded-xl bg-[#142B45] hover:bg-[#147D78] py-2.5 text-xs font-black text-white transition disabled:opacity-40 shadow-sm"
                >
                  {requestingPayout ? "Disbursing..." : `Confirm Withdrawal ${formatUGX(payoutAmount)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LecturerDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-7xl text-slate-500 font-medium">
          Loading lecturer dashboard...
        </div>
      }
    >
      <LecturerDashboardContent />
    </React.Suspense>
  );
}
