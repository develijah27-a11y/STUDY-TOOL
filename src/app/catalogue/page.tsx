"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
import {
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  FileText,
  BookOpen,
  GraduationCap,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface EnrichedDoc {
  id: string;
  accessCode?: string;
  title: string;
  description: string;
  institutionId: string;
  institutionName: string;
  institutionShortCode: string;
  programmeId?: string;
  programmeCode: string;
  courseUnitId: string;
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
  lecturerVerified: boolean;
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

export default function CataloguePage() {
  const [documents, setDocuments] = useState<EnrichedDoc[]>([]);
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string; shortCode: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; code: string; name: string; institutionId: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [studentSession, setStudentSession] = useState<{
    institutionId?: string;
    institutionName?: string;
    courseUnits?: string[];
    department?: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "directory">("cards");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [prioritizeAcademicProfile, setPrioritizeAcademicProfile] = useState(false);
  const [sortBy, setSortBy] = useState<"relevant" | "price_asc" | "price_desc" | "sales">("relevant");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.role === "student" && (u.institutionId || u.activeCourseUnits?.length)) {
          setStudentSession({
            institutionId: u.institutionId,
            institutionName: u.institutionName,
            courseUnits: u.activeCourseUnits || [],
            department: u.department,
          });
          setPrioritizeAcademicProfile(true);
        }
      }
    } catch {}

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("q");
      const instParam = params.get("institutionId");
      if (qParam) setSearchQuery(qParam);
      if (instParam) setSelectedInstitution(instParam);
    }

    async function loadCatalogue() {
      setLoading(true);
      try {
        const res = await fetch("/api/catalogue");
        if (res.ok) {
          const data = await res.json();
          setDocuments(Array.isArray(data?.documents) ? data.documents : []);
          setInstitutions(Array.isArray(data?.institutions) ? data.institutions : []);
          setCourses(Array.isArray(data?.courses) ? data.courses : []);
        } else {
          setDocuments([]);
          setInstitutions([]);
          setCourses([]);
        }
      } catch (err) {
        console.error("Failed to load catalogue:", err);
        setDocuments([]);
        setInstitutions([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    loadCatalogue();
  }, []);

  const filteredDocs = useMemo(() => {
    let list = [...documents];

    if (selectedInstitution !== "all") {
      list = list.filter((d) => d.institutionId === selectedInstitution);
    }
    if (selectedCourse !== "all") {
      list = list.filter((d) => d.courseUnitId === selectedCourse);
    }
    if (selectedType !== "all") {
      list = list.filter((d) => d.documentType === selectedType);
    }
    list = list.filter((d) => (d.priceUGX ?? 0) <= maxPrice);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) =>
        [
          d.title || "",
          d.description || "",
          d.courseCode || "",
          d.courseName || "",
          d.lecturerName || "",
          d.institutionShortCode || "",
          ...(Array.isArray(d.topics) ? d.topics : []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.priceUGX ?? 0) - (b.priceUGX ?? 0));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.priceUGX ?? 0) - (a.priceUGX ?? 0));
    } else if (sortBy === "sales") {
      list.sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
    } else if (prioritizeAcademicProfile && studentSession) {
      const studentUnits = studentSession.courseUnits || [];
      const studentInst = studentSession.institutionId;

      list.sort((a, b) => {
        const aUnitMatch = studentUnits.some((u) => a.courseCode.toLowerCase().includes(u.toLowerCase())) ? 3 : 0;
        const bUnitMatch = studentUnits.some((u) => b.courseCode.toLowerCase().includes(u.toLowerCase())) ? 3 : 0;
        const aInstMatch = studentInst && a.institutionId === studentInst ? 1 : 0;
        const bInstMatch = studentInst && b.institutionId === studentInst ? 1 : 0;
        return (bUnitMatch + bInstMatch) - (aUnitMatch + aInstMatch);
      });
    }

    return list;
  }, [
    documents,
    selectedInstitution,
    selectedCourse,
    selectedType,
    maxPrice,
    searchQuery,
    prioritizeAcademicProfile,
    studentSession,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedInstitution("all");
    setSelectedCourse("all");
    setSelectedType("all");
    setMaxPrice(50000);
    setSortBy("relevant");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 md:p-10 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Course Notes &amp; Revision Guides</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Browse Study Materials in UGX.
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Lecture notes, summaries, and revision guides from educators and tutors. Preview sample pages before paying with mobile money.
          </p>
        </div>

        {/* Academic Profile Priority Pill (ONLY for logged-in students with saved profile) */}
        {studentSession && studentSession.courseUnits && studentSession.courseUnits.length > 0 && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 flex items-center justify-between gap-4 max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <span className="block font-bold text-white">Your Course Units</span>
                <span className="text-slate-300">
                  {studentSession.institutionName || "Saved Institute"} •{" "}
                  {studentSession.courseUnits.join(", ")}
                </span>
              </div>
            </div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-300 cursor-pointer bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <input
                type="checkbox"
                checked={prioritizeAcademicProfile}
                onChange={(e) => setPrioritizeAcademicProfile(e.target.checked)}
                className="rounded"
              />
              Priority
            </label>
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, course unit (e.g. CSC 2101, LAW 2105), or lecturer..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/10 outline-none transition"
            />
          </div>

          {/* Institution Filter Dropdown (Plain text filter, no logos/claims) */}
          <div className="md:col-span-2">
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#0B192C]"
            >
              <option value="all">Filter by Institution</option>
              <optgroup label="Universities">
                {(institutions || [])
                  .filter((i: any) => !i.category || i.category === "university")
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.shortCode} — {i.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Vocational &amp; Technical">
                {(institutions || [])
                  .filter((i: any) => i.category && i.category !== "university")
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.shortCode} — {i.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Course Unit Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#0B192C]"
            >
              <option value="all">All Course Units</option>
              {(courses || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#0B192C]"
            >
              <option value="all">All Formats</option>
              <option value="lecture_notes">Lecture Notes</option>
              <option value="past_paper_solution">Past Paper Solutions</option>
              <option value="study_guide">Study Guides</option>
              <option value="lab_manual">Lab Manuals</option>
              <option value="curriculum_summary">Summaries / Sheets</option>
            </select>
          </div>
        </div>

        {/* Bottom Toolbar Row: Price Slider, Sort & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">
              Max Price: <strong>{formatUGX(maxPrice)}</strong>
            </span>
            <input
              type="range"
              min={1000}
              max={50000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32 sm:w-44 accent-[#0B192C]"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
            >
              <option value="relevant">Course Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="sales">Most Popular</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* View Switcher: Study Materials vs Course Unit Directory */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === "cards"
                ? "bg-[#142B45] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>All Study Materials ({filteredDocs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("directory")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === "directory"
                ? "bg-[#142B45] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Course Unit Directory</span>
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredDocs.length} of {documents.length} publications
        </span>
      </div>

      {/* Course Unit Directory Mode */}
      {viewMode === "directory" ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#142B45]">
                Course Unit Directory
              </h3>
              <p className="text-xs text-slate-500">
                Browse lecture notes and study guides organized by course unit
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(courses || []).map((course) => {
                const count = documents.filter(
                  (d) => d.courseUnitId === course.id || d.courseCode === course.code
                ).length;
                const inst = institutions.find((i) => i.id === course.institutionId);

                return (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-5 space-y-3 hover:border-[#147D78] transition shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded bg-[#142B45] text-white">
                          {course.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          {inst?.shortCode || "UG"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-[#142B45] text-sm leading-snug">
                        {course.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {inst?.name || "Institution"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold">
                        {count} {count === 1 ? "publication" : "publications"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourse(course.id);
                          setViewMode("cards");
                        }}
                        className="font-bold text-[#147D78] hover:underline"
                      >
                        Explore Notes →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 text-[#147D78] flex items-center justify-center mx-auto">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-[#142B45]">
              No publications found
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              No study notes matched your search criteria. Try clearing filters or search for another course unit code. If your course is not yet listed, you can request it or apply to publish.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/lecturer/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 text-[#E9B949]" />
              <span>Apply to Publish Notes</span>
            </Link>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-800 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => {
            const isMatch =
              prioritizeAcademicProfile &&
              studentSession?.courseUnits &&
              studentSession.courseUnits.some((u) =>
                doc.courseCode.toLowerCase().includes(u.toLowerCase())
              );

            return (
              <div
                key={doc.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4 ${
                  isMatch ? "border-[#E9B949] ring-2 ring-[#E9B949]/20" : "border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Course Code Badge & Prominent Price */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-800">
                      {doc.courseCode}
                    </span>
                    <span className="text-base font-bold text-[#142B45]">
                      {formatUGX(doc.priceUGX)}
                    </span>
                  </div>

                  {isMatch && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-bold text-amber-900">
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      Matched to Your Enrolled Course
                    </div>
                  )}

                  {/* Title */}
                  <Link href={`/catalogue/${doc.id}`} className="block group">
                    <h2 className="text-base font-bold text-[#142B45] group-hover:text-[#147D78] transition line-clamp-2 leading-snug">
                      {doc.title}
                    </h2>
                  </Link>

                  {/* Lecturer Name directly under Title */}
                  <div className="text-xs text-slate-600 font-medium truncate">
                    By {doc.lecturerName}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {doc.description}
                  </p>

                  {/* Document Type Badge & Topics */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                      {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                    </span>
                    {(doc.topics || []).slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs text-slate-600 font-normal"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Page Count & Institution */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-normal">
                    <span className="font-semibold text-slate-700">{doc.institutionShortCode}</span>
                    <span>•</span>
                    <span>{doc.pageCount} pages</span>
                    {Array.isArray(doc.allowedPreviewPages) && doc.allowedPreviewPages.length > 0 && (
                      <>
                        <span>•</span>
                        <Link
                          href={`/catalogue/${doc.id}#preview`}
                          className="font-bold text-[#147D78] hover:underline"
                        >
                          Preview sample
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href={`/catalogue/${doc.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#142B45] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1A3859] active:scale-[0.99] transition"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#E9B949]" />
                    <span>Preview &amp; Buy</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
