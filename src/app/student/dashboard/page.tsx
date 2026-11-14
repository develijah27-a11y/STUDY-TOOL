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
} from "lucide-react";

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

export default function StudentDashboardPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("user-student-1");
  const [studentName, setStudentName] = useState("Grace Namukasa");
  const [institution, setInstitution] = useState("Makerere University (MAK)");
  const [programme, setProgramme] = useState(
    "Bachelor of Science in Software Engineering (BSSE Year 2)"
  );
  const [walletBalance, setWalletBalance] = useState(25000);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [entitlements, setEntitlements] = useState<EntitlementItem[]>([]);
  const [recommendedDocs, setRecommendedDocs] = useState<CatalogueDocument[]>([]);
  const [popularDocs, setPopularDocs] = useState<CatalogueDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [walletRes, catRes] = await Promise.all([
          fetch(
            `/api/wallet?userId=${studentId}&targetUserId=${studentId}&walletType=student`
          ),
          fetch("/api/catalogue"),
        ]);

        const walletData = await walletRes.json();
        const catData = await catRes.json();

        if (walletRes.ok) {
          setWalletBalance(walletData.wallet?.spendableBalanceUGX ?? 25000);
          setReservedBalance(walletData.wallet?.reservedBalanceUGX ?? 0);
        }

        const docs: CatalogueDocument[] = catData.documents || [];

        // Student's active unlocked reading desk
        const unlocked: EntitlementItem[] = [
          {
            id: "ent-1",
            documentId: "doc-csc2101-notes",
            title: "CSC 2101: Data Structures and Algorithms Notes",
            courseCode: "CSC 2101",
            institutionShortCode: "MAK",
            pageCount: 48,
            lastReadPage: 12,
            unlockedAt: "2026-11-01",
          },
          {
            id: "ent-2",
            documentId: "doc-csc2101-pastpapers",
            title: "CSC 2101: Solved Past Papers and Guide",
            courseCode: "CSC 2101",
            institutionShortCode: "MAK",
            pageCount: 28,
            lastReadPage: 5,
            unlockedAt: "2026-11-04",
          },
        ];
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
  const firstName = studentName.split(" ")[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* 1. Welcoming Personalized Greeting & Profile Header */}
      <div className="rounded-3xl bg-[#142B45] text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#147D78]/30 border border-[#147D78]/50 px-3.5 py-1 text-xs font-bold text-teal-200">
              <GraduationCap className="h-4 w-4 text-[#E9B949]" />
              <span>Student Academic Workspace</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                {greeting}, {firstName}. What are you studying today?
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {institution} • {programme}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <BookOpen className="h-3.5 w-3.5 text-[#E9B949]" />
                <span>{entitlements.length} Active Study Materials</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified Student Session</span>
              </div>
            </div>
          </div>

          {/* Quick Wallet Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 min-w-[280px] space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Available Spendable Balance
            </span>
            <div className="text-3xl font-black text-[#E9B949]">
              {formatUGX(walletBalance)}
            </div>
            <p className="text-xs text-slate-300">
              Pay with MTN MoMo or Airtel Money • Instant document unlock
            </p>
            <div className="flex gap-2 pt-1">
              <Link
                href="/student/wallet"
                className="flex-1 text-center rounded-xl bg-[#147D78] hover:bg-[#0f635f] py-2.5 text-xs font-black text-white transition shadow-md"
              >
                Top Up UGX
              </Link>
              <Link
                href="/student/library"
                className="flex-1 text-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 py-2.5 text-xs font-bold text-white transition"
              >
                My Library
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Prominent Search Bar (Publication titles, Lecturers, Institutions, Course Units) */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search publications by course code (e.g. CSC 2101), lecturer name, topic, or institution..."
            className="w-full rounded-xl border border-slate-300 pl-12 pr-28 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-[#147D78] focus:ring-2 focus:ring-[#147D78]/20 outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 rounded-lg bg-[#142B45] hover:bg-[#147D78] text-white px-4 py-2 text-xs font-bold transition shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500">Quick Filters:</span>
          {[
            { label: "CSC 2101", query: "CSC 2101" },
            { label: "Makerere (MAK)", query: "Makerere" },
            { label: "Buganda Royal (BRIBTE)", query: "BRIBTE" },
            { label: "Kampala Polytechnic (KPM)", query: "KPM" },
            { label: "Past Papers", query: "Past Papers" },
            { label: "Lecture Notes", query: "Notes" },
          ].map((tag) => (
            <Link
              key={tag.label}
              href={`/catalogue?q=${encodeURIComponent(tag.query)}`}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-medium transition"
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Main Grid: Continue Reading & Side Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Continue Reading Desk & Recommendations */}
        <div className="lg:col-span-8 space-y-8">
          {/* Continue Reading Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#147D78]/10 text-[#147D78] flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#142B45]">
                    Continue Reading
                  </h2>
                  <p className="text-xs text-slate-500">
                    Resume directly from your saved bookmark position
                  </p>
                </div>
              </div>

              <Link
                href="/student/library"
                className="text-xs font-bold text-[#147D78] hover:underline"
              >
                View All in My Library →
              </Link>
            </div>

            {entitlements.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No active reading documents found.</p>
                <Link
                  href="/catalogue"
                  className="inline-block rounded-xl bg-[#142B45] hover:bg-[#147D78] px-4 py-2 text-xs font-bold text-white transition"
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
                      className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-5 space-y-4 hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-slate-200 font-mono text-xs font-black px-2 py-0.5 text-slate-800">
                              {item.courseCode}
                            </span>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Unlocked Entitlement
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-[#142B45]">
                            {item.title}
                          </h3>
                        </div>

                        <Link
                          href={`/student/read/${item.documentId}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#142B45] hover:bg-[#147D78] text-white px-4 py-2.5 text-xs font-bold transition shadow-sm shrink-0"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-[#E9B949]" />
                          <span>Resume Reading (p. {item.lastReadPage})</span>
                        </Link>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                          <span>
                            Progress: Page {item.lastReadPage} of {item.pageCount}
                          </span>
                          <span>{progressPct}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#147D78] h-2 rounded-full transition-all duration-300"
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

          {/* Recommended Materials Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#142B45]">
                    Recommended For Your Academic Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Handpicked for {programme}
                  </p>
                </div>
              </div>

              <Link
                href="/catalogue"
                className="text-xs font-bold text-[#147D78] hover:underline"
              >
                Browse All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/catalogue/${doc.id}`}
                  className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-4 flex flex-col justify-between hover:border-[#147D78] hover:shadow-md transition space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-mono font-black text-slate-800">
                        {doc.courseCode}
                      </span>
                      <span className="text-xs font-bold text-[#147D78]">
                        {formatUGX(doc.priceUGX)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#142B45] line-clamp-2 leading-snug">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-500">{doc.lecturerName}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>{doc.pageCount} Pages</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {doc.ratingAverage}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Academic Resources Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#142B45]">
                    Popular Across Ugandan Institutions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Frequently read notes and practical guides
                  </p>
                </div>
              </div>

              <Link
                href="/catalogue"
                className="text-xs font-bold text-[#147D78] hover:underline"
              >
                See Full Catalogue →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/catalogue/${doc.id}`}
                  className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-4 flex flex-col justify-between hover:border-[#147D78] hover:shadow-md transition space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-mono font-black text-slate-800">
                        {doc.courseCode}
                      </span>
                      <span className="text-xs font-bold text-[#147D78]">
                        {formatUGX(doc.priceUGX)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#142B45] line-clamp-2 leading-snug">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {doc.institutionShortCode} • {doc.lecturerName}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>{doc.pageCount} Pages</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {doc.ratingAverage}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Scanner & Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick QR Scanner & Handout Scanner */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#142B45]">
                    Scan Classroom QR Code
                  </h3>
                  <p className="text-xs text-slate-500">
                    From lecture projector slides or printed handouts
                  </p>
                </div>
              </div>

              <Link
                href="/d"
                className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-bold transition flex items-center gap-1"
              >
                <Camera className="h-3 w-3 text-[#147D78]" />
                <span>Camera</span>
              </Link>
            </div>

            <div className="space-y-3">
              <div className="relative rounded-2xl bg-slate-950 p-4 text-center overflow-hidden border border-slate-800">
                <div className="relative mx-auto w-32 h-32 border-2 border-amber-400/70 rounded-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce" />
                  <Camera className="h-8 w-8 text-white/30" />
                </div>
                <p className="text-xs text-slate-300 font-medium pt-3 leading-tight">
                  Point camera at lecturer&apos;s projector screen or printed handout
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Quick Access Shortcuts:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "CSC 2101", code: "CSC2101-NOTES" },
                    { label: "BRIBTE EE", code: "BRIBTE-EE1101" },
                    { label: "KPM AUTO", code: "KPM-AUT2102" },
                    { label: "UICT TLC", code: "UICT-TLC1204" },
                  ].map((s) => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => {
                        setIsScanning(true);
                        setTimeout(() => {
                          window.location.href = `/d/${s.code}`;
                        }, 300);
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 py-2 px-2.5 text-xs font-mono font-bold text-slate-800 transition text-left flex items-center justify-between"
                    >
                      <span>{s.label}</span>
                      <QrCode className="h-3.5 w-3.5 text-[#147D78]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access to My Library Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-[#142B45] flex items-center gap-1.5">
                <Library className="h-4 w-4 text-[#147D78]" />
                <span>My Academic Library</span>
              </h3>
              <Link
                href="/student/library"
                className="text-xs font-bold text-[#147D78] hover:underline"
              >
                Open →
              </Link>
            </div>

            <p className="text-xs text-slate-500">
              Access your saved annotations, bookmarks, reading progress, and verified purchase receipts.
            </p>

            <Link
              href="/student/library"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-800 transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#147D78]" />
              <span>Go to Study Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
