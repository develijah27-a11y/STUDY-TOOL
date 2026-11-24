"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatUGX } from "@/lib/utils";
import {
  GraduationCap,
  BookOpen,
  Wallet,
  Clock,
  CheckCircle2,
  Bookmark,
  Search,
  ArrowRight,
  Sparkles,
  KeyRound,
  FileText,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Building2,
  QrCode,
  Camera,
  Compass,
  Library,
  Star,
  HardDrive,
  Highlighter,
  StickyNote,
  Download,
  ArrowUpRight,
  Check,
  Users,
  Flame,
  Target,
  WifiOff,
  Calendar,
  Layers,
  Award,
} from "lucide-react";
import {
  offlineStorage,
  OfflineMaterialMeta,
  StudyAnnotation,
} from "@/lib/offline/offline-storage";

interface EntitlementItem {
  id: string;
  documentId: string;
  title: string;
  courseCode: string;
  institutionShortCode: string;
  pageCount: number;
  lastReadPage: number;
  unlockedAt: string;
}

interface CatalogueDocument {
  id: string;
  accessCode: string;
  title: string;
  courseCode: string;
  lecturerName: string;
  institutionName: string;
  institutionShortCode: string;
  documentType: string;
  priceUGX: number;
  pageCount: number;
  ratingAverage: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  return new Date().toLocaleDateString("en-UG", options);
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("user-student-1");
  const [studentName, setStudentName] = useState("Student");
  const [institution, setInstitution] = useState("Makerere University (MAK)");
  const [programme, setProgramme] = useState(
    "Higher Education & Technical Studies"
  );
  const [walletBalance, setWalletBalance] = useState(25000);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [entitlements, setEntitlements] = useState<EntitlementItem[]>([]);
  const [recommendedDocs, setRecommendedDocs] = useState<CatalogueDocument[]>([]);
  const [popularDocs, setPopularDocs] = useState<CatalogueDocument[]>([]);
  const [offlineMaterials, setOfflineMaterials] = useState<OfflineMaterialMeta[]>([]);
  const [savedAnnotations, setSavedAnnotations] = useState<StudyAnnotation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Initialize active student session
  useEffect(() => {
    let currentId = "user-student-1";
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.id) {
          currentId = u.id;
          setStudentId(u.id);
        }
        if (u.fullName) setStudentName(u.fullName);
        if (u.institutionId === "inst-bribte") setInstitution("Buganda Royal Institute (BRIBTE)");
        else if (u.institutionId === "inst-kyu") setInstitution("Kyambogo University (KYU)");
        else if (u.institutionId === "inst-uict") setInstitution("UICT Nakawa");
        else if (u.institutionId === "inst-kpm") setInstitution("Kampala Polytechnic Mengo");
      }
    } catch {}

    async function loadDashboard() {
      setLoading(true);
      try {
        const [walletRes, catRes, offlineDocs, allNotes] = await Promise.all([
          fetch(
            `/api/wallet?userId=${currentId}&targetUserId=${currentId}&walletType=student`
          ),
          fetch("/api/catalogue"),
          offlineStorage.getAllOfflineMaterials().catch(() => []),
          offlineStorage.getAllAnnotations().catch(() => []),
        ]);

        setOfflineMaterials(offlineDocs);
        setSavedAnnotations(allNotes);

        const walletData = await walletRes.json();
        const catData = await catRes.json();

        if (walletRes.ok && walletData.wallet) {
          setWalletBalance(walletData.wallet.spendableBalanceUGX ?? 0);
          setReservedBalance(walletData.wallet.reservedBalanceUGX ?? 0);
        }

        const docs: CatalogueDocument[] = catData.documents || [];

        // Map actual student entitlements from completed verified orders
        const orders = walletData.orders || [];
        const completedOrders = orders.filter((o: { status: string }) => o.status === "completed");
        const unlocked: EntitlementItem[] = completedOrders.map(
          (o: { id: string; documentId: string; orderNumber: string; createdAt: string }) => {
            const doc = docs.find((d) => d.id === o.documentId);
            return {
              id: o.id,
              documentId: o.documentId,
              title: doc ? doc.title : `Document Order #${o.orderNumber}`,
              courseCode: doc ? doc.courseCode : "COURSE",
              institutionShortCode: doc ? doc.institutionShortCode : "UG",
              pageCount: doc ? doc.pageCount : 1,
              lastReadPage: 1,
              unlockedAt: o.createdAt || new Date().toISOString(),
            };
          }
        );
        setEntitlements(unlocked);

        // Recommended based on BSSE Year 2 / Makerere profile
        const recommended = docs.filter(
          (d) =>
            d.institutionShortCode === "MAK" ||
            d.courseCode.includes("CSC") ||
            d.courseCode.includes("BSSE")
        );
        setRecommendedDocs(recommended.slice(0, 3));

        // Popular academic resources
        const popular = docs.filter(
          (d) => !recommended.some((r) => r.id === d.id)
        );
        setPopularDocs(popular.slice(0, 3));
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [studentId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/catalogue");
    }
  };

  const greeting = getGreeting();
  const formattedDate = getFormattedDate();
  const firstName = studentName.split(" ")[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* 1. Proper Warm Welcoming Header with Motivational Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        {/* Subtle Ambient Shapes */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Academic Session & Date Chip */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-200">
                <Calendar className="h-3.5 w-3.5 text-amber-300" />
                <span>{formattedDate}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>5-Day Study Streak 🔥</span>
              </div>
            </div>

            {/* Personalized Welcome */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                {greeting}, {firstName}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Welcome back to your academic workspace at <span className="font-bold text-white">{institution}</span>. Keep up your active revision momentum for semester examinations.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-semibold">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                <span>{entitlements.length} Unlocked Course Units</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <WifiOff className="h-3.5 w-3.5 text-teal-300" />
                <span>{offlineMaterials.length} Offline Ready Notes</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span>Semester I Active Session</span>
              </div>
            </div>
          </div>

          {/* Quick Balance & Top-up Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3 min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-emerald-200 font-bold uppercase tracking-wider">
              <span>Spendable Balance</span>
              <Wallet className="h-4 w-4 text-amber-300" />
            </div>
            <div className="text-2xl font-black text-amber-300">
              {formatUGX(walletBalance)}
            </div>
            <Link
              href="/student/wallet"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-2 text-xs font-bold transition shadow-sm"
            >
              <span>+ Top Up with MoMo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Student Engagement & Productivity Suite */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              My Study Engagement &amp; Progress
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Active Study Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Engagement Card 1: Weekly Study Hours */}
          <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                +2.4 hrs vs last wk
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">14.5 Hours</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Reading time this week
              </div>
            </div>
            {/* Daily Streak Indicator */}
            <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between text-[11px] font-bold text-slate-600">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, dIdx) => (
                <div key={dIdx} className="flex flex-col items-center gap-1">
                  <span
                    className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] ${
                      dIdx < 5
                        ? "bg-emerald-600 text-white font-black shadow-xs"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {dIdx < 5 ? "✓" : day}
                  </span>
                  <span className="text-[9px] text-slate-400">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Card 2: Revision Goals */}
          <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                80% On Track
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">4 of 5 Units</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Semester Revision Coverage
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full w-4/5 transition-all duration-500" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                <span>Target: 5 Units</span>
                <span>80% Completed</span>
              </div>
            </div>
          </div>

          {/* Engagement Card 3: Zero-Data Offline Status */}
          <div className="rounded-2xl border-2 border-amber-100 bg-gradient-to-br from-amber-50/60 to-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <HardDrive className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                Zero Data Mode
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {offlineMaterials.length} Stored Notes
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Encrypted on this device
              </div>
            </div>
            <Link
              href="/student/offline"
              className="inline-flex items-center justify-between w-full pt-2 border-t border-amber-100 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              <span>Open Offline Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Engagement Card 4: Study Notes & Highlights */}
          <div className="rounded-2xl border-2 border-purple-100 bg-gradient-to-br from-purple-50/60 to-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Highlighter className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                Exam Tags
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {savedAnnotations.length} Highlights
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Saved definitions &amp; notes
              </div>
            </div>
            <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Revision Definitions</span>
              <span>{savedAnnotations.length > 0 ? "Ready" : "0 Saved"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Educational Explainer: What is the Offline Library? */}
      <div className="rounded-2xl border-2 border-teal-200 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            <WifiOff className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                What is the Offline Library?
              </h3>
              <span className="text-[10px] font-bold uppercase bg-teal-100 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                Zero-Data Reading
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              The Offline Library saves your unlocked lecture notes locally on your device using authenticated AES-GCM encryption. Download once when you have campus Wi-Fi or data bundles, then read, highlight, and revise anywhere—in hostels, libraries, or on commute—without consuming any active mobile data bundles.
            </p>
          </div>
        </div>

        <Link
          href="/student/offline"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-5 py-2.5 text-xs font-black shadow-md shadow-teal-600/20 transition shrink-0"
        >
          <HardDrive className="h-4 w-4" />
          <span>Access Offline Library ({offlineMaterials.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 4. Quick Navigation Hub: Library, Community, Tutors, Catalogue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link
          href="/student/library"
          className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-xs hover:border-emerald-500 hover:shadow-md transition flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900 group-hover:text-emerald-700 transition">
              My Library
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              Purchased &amp; Notes
            </span>
          </div>
        </Link>

        <Link
          href="/catalogue"
          className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-xs hover:border-amber-500 hover:shadow-md transition flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900 group-hover:text-amber-700 transition">
              Explore Materials
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              Search Course Units
            </span>
          </div>
        </Link>

        <Link
          href="/student/community"
          className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-xs hover:border-purple-500 hover:shadow-md transition flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900 group-hover:text-purple-700 transition">
              Study Community
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              Course Q&amp;A &amp; Discussion
            </span>
          </div>
        </Link>

        <Link
          href="/student/tutors"
          className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-xs hover:border-blue-500 hover:shadow-md transition flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900 group-hover:text-blue-700 transition">
              Find a Tutor
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              Verified Revision Tutors
            </span>
          </div>
        </Link>
      </div>

      {/* 5. Prominent Search Bar with Faculty Shortcuts */}
      <div className="rounded-2xl bg-white p-5 border-2 border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-emerald-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search publications by course code (e.g. CSC 2101), lecturer name, topic, or institution..."
            className="w-full rounded-xl border-2 border-slate-200 pl-12 pr-28 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2 text-xs font-bold transition shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600">Faculty Directories:</span>
          {[
            { label: "Makerere (MAK)", q: "MAK" },
            { label: "Kyambogo (KYU)", q: "KYU" },
            { label: "Buganda Royal (BRIBTE)", q: "BRIBTE" },
            { label: "UICT Nakawa", q: "UICT" },
            { label: "Kampala Poly (KPM)", q: "KPM" },
          ].map((s) => (
            <Link
              key={s.q}
              href={`/catalogue?q=${s.q}`}
              className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>{s.label}</span>
              <Search className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Main Academic Workspace Desk */}
      <div className="space-y-8">
        {/* Continue Reading Section */}
        <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Continue Reading
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Resume directly from your saved bookmark position
                </p>
              </div>
            </div>

            <Link
              href="/student/library"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>View All in My Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {entitlements.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No active reading documents found yet.</p>
              <Link
                href="/catalogue"
                className="inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-sm"
              >
                Browse Academic Catalogue
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {entitlements.map((item) => {
                const progressPct = Math.round(
                  (item.lastReadPage / item.pageCount) * 100
                );

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border-2 border-slate-100 bg-[#F8FAFC] p-5 space-y-4 hover:border-emerald-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-emerald-100 font-mono text-xs font-black px-2 py-0.5 text-emerald-800 border border-emerald-200">
                            {item.courseCode}
                          </span>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Unlocked Entitlement
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900">
                          {item.title}
                        </h3>
                      </div>

                      <Link
                        href={`/student/read/${item.documentId}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 text-xs font-bold transition shadow-sm shrink-0"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                        <span>Resume Reading (p. {item.lastReadPage})</span>
                      </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500 font-bold">
                        <span>
                          Progress: Page {item.lastReadPage} of {item.pageCount}
                        </span>
                        <span>{progressPct}% Completed</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Offline Reading Desk (Downloaded Notes) */}
        <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    Offline Downloads
                  </h2>
                  <span className="text-xs font-bold uppercase text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    Zero-Data Mode
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/student/offline"
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              <span>Manage All ({offlineMaterials.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {offlineMaterials.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] p-6 text-center space-y-2">
              <WifiOff className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No offline downloads cached yet on this device.</p>
              <p className="text-xs text-slate-500">Tap &ldquo;Download Offline&rdquo; while reading any entitled document to save it for Zero-Data access.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offlineMaterials.map((mat) => (
                <div
                  key={mat.documentId}
                  className="rounded-2xl border-2 border-teal-200/80 bg-teal-50/40 p-4 space-y-3 flex flex-col justify-between hover:border-teal-400 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                        {mat.courseCode}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Encrypted • {Math.round(mat.fileSizeBytes / 1024)} KB
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 text-xs line-clamp-2">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {mat.institutionName} • {mat.lecturerName} • {mat.pageCount} Pages
                    </p>
                  </div>

                  <div className="pt-2 border-t border-teal-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Cached {new Date(mat.downloadedAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/student/read/${mat.documentId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                      <span>Open Offline Reader →</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personal Study & Revision Desk (Personal Notes & Highlighting) */}
        <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Highlighter className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Study Notes &amp; Highlights
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Review tagged examination definitions and margin summaries
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              {savedAnnotations.length} Item{savedAnnotations.length === 1 ? "" : "s"}
            </div>
          </div>

          {savedAnnotations.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] p-6 text-center space-y-1">
              <Highlighter className="h-7 w-7 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No notes or highlights saved yet.</p>
              <p className="text-xs text-slate-500">Highlight important exam definitions or formulas while reading to organize them here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedAnnotations.slice(0, 6).map((item) => {
                const isHighlight = item.type === "highlight";
                const badgeColor =
                  item.color === "green"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : item.color === "teal"
                    ? "bg-teal-100 text-teal-800 border-teal-300"
                    : "bg-amber-100 text-amber-900 border-amber-300";

                const badgeText = isHighlight
                  ? item.color === "green"
                    ? "Definition / Rule"
                    : item.color === "teal"
                    ? "Exam Formula"
                    : "Core Concept"
                  : "Margin Note";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border-2 border-slate-100 bg-[#F8FAFC] p-4 flex flex-col justify-between space-y-3 hover:border-amber-300 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}
                        >
                          {badgeText}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          Page {item.pageNumber}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-relaxed line-clamp-3">
                        {isHighlight ? `"${item.content}"` : item.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/student/read/${item.documentId}`}
                        className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <span>Jump to Page {item.pageNumber}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended Materials Section */}
        <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Recommended For Your Academic Profile
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Handpicked for {programme}
                </p>
              </div>
            </div>

            <Link
              href="/catalogue"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Browse All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recommendedDocs.length === 0 ? (
            <div className="py-8 text-center space-y-2 border-2 border-dashed border-slate-200 rounded-2xl bg-[#F8FAFC] p-6">
              <BookOpen className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No verified course notes published yet for {programme}</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Lecturers publish materials directly. You can request your course unit or browse other faculties.
              </p>
              <Link
                href="/catalogue"
                className="inline-block mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-sm"
              >
                Browse Full Catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/catalogue/${doc.id}`}
                  className="rounded-2xl border-2 border-slate-100 bg-[#F8FAFC] p-4 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-mono font-black text-emerald-800">
                        {doc.courseCode}
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        {formatUGX(doc.priceUGX)}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">{doc.lecturerName}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>{doc.pageCount} Pages</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {doc.ratingAverage}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popular Academic Resources Section */}
        <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Popular Across Ugandan Institutions
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Frequently read notes and practical exam revision packs
                </p>
              </div>
            </div>

            <Link
              href="/catalogue"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>See Full Catalogue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {popularDocs.length === 0 ? (
            <div className="py-8 text-center space-y-2 border-2 border-dashed border-slate-200 rounded-2xl bg-[#F8FAFC] p-6">
              <TrendingUp className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Catalogue is being populated by registered lecturers</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Only authentic, lecturer-uploaded study materials and marking schemes are published on SomaUG.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/catalogue/${doc.id}`}
                  className="rounded-2xl border-2 border-slate-100 bg-[#F8FAFC] p-4 flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-mono font-black text-blue-800">
                        {doc.courseCode}
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        {formatUGX(doc.priceUGX)}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {doc.institutionShortCode} • {doc.lecturerName}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>{doc.pageCount} Pages</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {doc.ratingAverage}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
