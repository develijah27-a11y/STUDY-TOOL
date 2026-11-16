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
  const [isScanning, setIsScanning] = useState(false);
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
  const firstName = studentName.split(" ")[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* 1. Welcoming Personalized Greeting & Profile Header */}
      <div className="rounded-3xl bg-[#142B45] text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
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
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />
                <span>Semester I (2026/2027)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards: Library, Community, Tutors, Catalogue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link
          href="/student/library"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#147D78] transition flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900">My Library</span>
            <span className="block text-[11px] text-slate-500">Purchased &amp; Offline Notes</span>
          </div>
        </Link>

        <Link
          href="/catalogue"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#147D78] transition flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900">Explore Materials</span>
            <span className="block text-[11px] text-slate-500">Search Course Units</span>
          </div>
        </Link>

        <Link
          href="/student/community"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#147D78] transition flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900">Study Community</span>
            <span className="block text-[11px] text-slate-500">Course Q&amp;A &amp; Discussion</span>
          </div>
        </Link>

        <Link
          href="/student/tutors"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#147D78] transition flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900">Find a Tutor</span>
            <span className="block text-[11px] text-slate-500">Verified Revision Tutors</span>
          </div>
        </Link>
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

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 mt-3">
          <span className="text-xs font-bold text-slate-500">Faculty Directories:</span>
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
              className="rounded-lg bg-teal-50 hover:bg-teal-100 text-[#147D78] border border-teal-200/60 px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>{s.label}</span>
              <Search className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Main Academic Workspace Desk */}
      <div className="space-y-8">
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

        {/* Offline Reading Desk (Downloaded Notes) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-teal-50 text-[#147D78] flex items-center justify-center font-bold">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-[#142B45]">
                    Offline Reading Desk (Downloaded Notes)
                  </h2>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    100% Offline
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Read these publications anytime without data, wifi, or mobile network coverage
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              {offlineMaterials.length} Downloaded Pack{offlineMaterials.length === 1 ? "" : "s"}
            </div>
          </div>

          {offlineMaterials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F7F8FA] p-6 text-center space-y-2">
              <HardDrive className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No offline downloads stored on this device yet</p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Open any unlocked document in your library and click &ldquo;Download Offline&rdquo; to store AES-GCM encrypted notes inside your browser for zero-data reading.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offlineMaterials.map((mat) => (
                <div
                  key={mat.documentId}
                  className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black bg-teal-100 text-[#147D78] px-2 py-0.5 rounded">
                        {mat.courseCode}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Encrypted • {Math.round(mat.fileSizeBytes / 1024)} KB
                      </span>
                    </div>
                    <h3 className="font-extrabold text-[#142B45] text-xs line-clamp-2">
                      {mat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {mat.institutionName} • {mat.lecturerName} • {mat.pageCount} Pages
                    </p>
                  </div>

                  <div className="pt-2 border-t border-teal-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Downloaded {new Date(mat.downloadedAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/student/read/${mat.documentId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#147D78] hover:bg-teal-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-sm"
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Highlighter className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-[#142B45]">
                    Personal Study &amp; Revision Desk
                  </h2>
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Revision Notes &amp; Highlights
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Key concepts, definitions, exam formulas, and margin notes captured while studying
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              {savedAnnotations.length} Study Item{savedAnnotations.length === 1 ? "" : "s"}
            </div>
          </div>

          {savedAnnotations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F7F8FA] p-6 text-center space-y-2">
              <StickyNote className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No revision notes or highlights taken yet</p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                While reading any lecture publication, use the Highlighter tool or add margin notes to build your personal revision compendium for semester examinations.
              </p>
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
                    className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}
                        >
                          {badgeText}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          Page {item.pageNumber}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-relaxed line-clamp-3">
                        {isHighlight ? `"${item.content}"` : item.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/student/read/${item.documentId}`}
                        className="text-xs font-bold text-[#147D78] hover:underline flex items-center gap-1"
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

          {recommendedDocs.length === 0 ? (
            <div className="py-8 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-[#F7F8FA] p-6">
              <BookOpen className="h-7 w-7 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No verified course notes published yet for {programme}</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Accredited lecturers publish materials directly. You can request your course unit or browse other university faculties.
              </p>
              <Link
                href="/catalogue"
                className="inline-block mt-2 rounded-xl bg-[#142B45] hover:bg-[#147D78] px-4 py-2 text-xs font-bold text-white transition shadow-sm"
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
          )}
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

          {popularDocs.length === 0 ? (
            <div className="py-8 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-[#F7F8FA] p-6">
              <TrendingUp className="h-7 w-7 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Catalogue is being populated by verified lecturers</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Only authentic, lecturer-uploaded compendiums and marking schemes are approved across Ugandan institutions.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
