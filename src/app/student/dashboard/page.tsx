"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatUGX } from "@/lib/utils";
import {
  BookOpen,
  Search,
  ArrowRight,
  Star,
  Layers,
} from "lucide-react";
import { offlineStorage } from "@/lib/offline/offline-storage";

interface EntitlementItem {
  id: string;
  documentId: string;
  title: string;
  subjectName: string;
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

const INSTITUTION_MAP: Record<string, string> = {
  "inst-mak": "Makerere University",
  "inst-kyu": "Kyambogo University",
  "inst-must": "Mbarara University",
  "inst-ucu": "Uganda Christian University",
  "inst-mubs": "Makerere Business School",
  "inst-uict": "UICT Nakawa",
  "inst-bribte": "Buganda Royal Institute",
  "inst-kpm": "Kampala Polytechnic",
};

const PROGRAMME_MAP: Record<string, string> = {
  "prog-bsse": "Software Engineering",
  "prog-bcs": "Computer Science",
  "prog-bit": "Information Technology",
  "prog-bba": "Business Administration",
  "prog-bee": "Electrical Engineering",
  "prog-bce": "Civil Engineering",
  "prog-llb": "Bachelor of Laws",
  "prog-voc-elec": "Electrical Installation",
  "prog-voc-auto": "Automotive Mechanics",
};

// Map any legacy codes into full words
function getSubjectNameInWords(codeOrTitle: string, titleFallback?: string): string {
  const upper = (codeOrTitle || "").toUpperCase();
  if (upper.includes("CSC") || upper.includes("COMP") || upper.includes("TECH")) return "Computer Science";
  if (upper.includes("BSSE") || upper.includes("SOFT")) return "Software Engineering";
  if (upper.includes("BIT") || upper.includes("INFO")) return "Information Technology";
  if (upper.includes("BBA") || upper.includes("BUS") || upper.includes("MGT")) return "Business Administration";
  if (upper.includes("ACC") || upper.includes("FIN") || upper.includes("ECON")) return "Accounting & Finance";
  if (upper.includes("LAW") || upper.includes("LLB") || upper.includes("JUR")) return "Law & Legal Studies";
  if (upper.includes("MEC") || upper.includes("ENG")) return "Engineering";
  if (upper.includes("MED") || upper.includes("NURS") || upper.includes("HLTH")) return "Health Sciences";
  if (upper.includes("EDU")) return "Education";
  return titleFallback ? titleFallback.slice(0, 24) : "Academic Course";
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("Student");
  const [institution, setInstitution] = useState("Makerere University");
  const [programme, setProgramme] = useState("Software Engineering");
  const [academicYear, setAcademicYear] = useState<number>(2);
  const [semester, setSemester] = useState<number>(1);
  const [activeCourseUnits, setActiveCourseUnits] = useState<string[]>([
    "Data Structures",
    "Database Systems",
  ]);
  const [entitlements, setEntitlements] = useState<EntitlementItem[]>([]);
  const [recommendedDocs, setRecommendedDocs] = useState<CatalogueDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentId = "user-student-1";

    async function loadDashboard() {
      setLoading(true);
      try {
        try {
          const profileRes = await fetch("/api/auth/profile");
          if (profileRes.ok) {
            const profData = await profileRes.json();
            if (profData?.user) {
              const u = profData.user;
              currentId = u.id;
              if (u.fullName) setStudentName(u.fullName);
              if (u.institutionId) {
                setInstitution(INSTITUTION_MAP[u.institutionId] || u.institutionId);
              }
              if (u.programmeId) {
                setProgramme(PROGRAMME_MAP[u.programmeId] || u.programmeId);
              }
              if (u.academicYear) setAcademicYear(Number(u.academicYear));
              if (u.semester) setSemester(Number(u.semester));
              if (Array.isArray(u.activeCourseUnits) && u.activeCourseUnits.length > 0) {
                setActiveCourseUnits(
                  u.activeCourseUnits.map((c: string) => getSubjectNameInWords(c))
                );
              }
            }
          }
        } catch { }

        const [walletRes, catRes] = await Promise.all([
          fetch(
            `/api/wallet?userId=${currentId}&targetUserId=${currentId}&walletType=student`
          ),
          fetch("/api/catalogue"),
        ]);

        const walletData = await walletRes.json();
        const catData = await catRes.json();
        const docs: CatalogueDocument[] = catData.documents || [];

        const orders = walletData.orders || [];
        const completedOrders = orders.filter((o: { status: string }) => o.status === "completed");
        const unlocked: EntitlementItem[] = completedOrders.map(
          (o: { id: string; documentId: string; orderNumber: string; createdAt: string }) => {
            const doc = docs.find((d) => d.id === o.documentId);
            return {
              id: o.id,
              documentId: o.documentId,
              title: doc ? doc.title : `Study Material #${o.orderNumber}`,
              subjectName: doc ? getSubjectNameInWords(doc.courseCode, doc.title) : "Course Notes",
              institutionShortCode: doc ? doc.institutionShortCode : "UG",
              pageCount: doc ? doc.pageCount : 1,
              lastReadPage: 1,
              unlockedAt: o.createdAt || new Date().toISOString(),
            };
          }
        );
        setEntitlements(unlocked);

        const recommended = docs.filter(
          (d) =>
            d.title.toLowerCase().includes("engineering") ||
            d.title.toLowerCase().includes("programming") ||
            d.courseCode.includes("CSC") ||
            d.courseCode.includes("BSSE")
        );
        setRecommendedDocs(recommended.slice(0, 3));
      } catch (err) {
        console.error("Dashboard failed to initialize:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/catalogue");
    }
  };

  const greeting = getGreeting();
  const firstName = studentName.split(" ")[0] || "Student";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      {/* 1. Clean Welcoming Header (No emojis, no money display, concise) */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-orange-500 text-white p-5 sm:p-6 shadow-md">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            {greeting}, {firstName}
          </h1>

          <p className="text-xs sm:text-sm text-sky-100 font-medium">
            <span className="font-bold text-white">{programme}</span> •{" "}
            <span>{institution}</span> •{" "}
            <span className="text-orange-200 font-semibold">
              Year {academicYear}, Semester {semester === 1 ? "I" : "II"}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="bg-white/15 px-2.5 py-1 rounded-lg font-semibold text-white">
              {entitlements.length} Unlocked Materials
            </span>
            <span className="bg-white/15 px-2.5 py-1 rounded-lg font-semibold text-white">
              Semester {semester === 1 ? "I" : "II"} Session
            </span>
          </div>
        </div>
      </div>

      {/* 2. Direct Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-sky-600 dark:text-sky-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search materials by subject, topic, or lecturer..."
          className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-24 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-xs"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 h-8 px-4 rounded-lg bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 text-white text-xs font-bold transition shadow-xs"
        >
          Search
        </button>
      </form>

      {/* 3. Continue Reading */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Continue Reading
              </h2>
            </div>
          </div>

          <Link
            href="/student/library"
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>My Library</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {entitlements.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <BookOpen className="h-7 w-7 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500">No active reading documents found yet.</p>
            <Link
              href="/catalogue"
              className="inline-block rounded-xl bg-gradient-to-r from-sky-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Explore Study Materials
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entitlements.slice(0, 3).map((item) => {
              const progressPct = Math.round(
                (item.lastReadPage / item.pageCount) * 100
              );

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                        {item.subjectName}
                      </span>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </h3>
                    </div>

                    <Link
                      href={`/student/read/${item.documentId}`}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 text-white px-4 py-2 text-xs font-bold transition shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Resume (p. {item.lastReadPage})</span>
                    </Link>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Page {item.lastReadPage} of {item.pageCount}</span>
                      <span>{progressPct}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-1.5 rounded-full"
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

      {/* 4. Recommended Study Materials (Full subject words, no course codes) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 flex items-center justify-center font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Recommended for {programme}
              </h2>
            </div>
          </div>

          <Link
            href="/catalogue"
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>Browse All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recommendedDocs.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <p className="text-xs text-slate-500">Materials for this programme are currently being uploaded by lecturers.</p>
            <Link href="/catalogue" className="text-xs font-bold text-sky-600 hover:underline">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendedDocs.map((doc) => {
              const subjectWords = getSubjectNameInWords(doc.courseCode, doc.title);
              return (
                <Link
                  key={doc.id}
                  href={`/catalogue/${doc.id}`}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4 flex flex-col justify-between hover:border-sky-400 dark:hover:border-sky-500 transition space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-sky-100 dark:bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-300">
                        {subjectWords}
                      </span>
                      <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                        {formatUGX(doc.priceUGX)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">{doc.lecturerName}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>{doc.pageCount} Pages</span>
                    <span className="flex items-center gap-1 text-orange-500 font-bold">
                      <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                      {doc.ratingAverage}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
