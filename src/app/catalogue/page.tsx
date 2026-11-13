"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
import {
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Building2,
  FileText,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface EnrichedDoc {
  id: string;
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

export default function CataloguePage() {
  const [documents, setDocuments] = useState<EnrichedDoc[]>([]);
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string; shortCode: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; code: string; name: string; institutionId: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [prioritizeAcademicProfile, setPrioritizeAcademicProfile] = useState(true);

  useEffect(() => {
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
        const data = await res.json();
        setDocuments(data.documents || []);
        setInstitutions(data.institutions || []);
        setCourses(data.courses || []);
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
    list = list.filter((d) => d.priceUGX <= maxPrice);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) =>
        [d.title, d.description, d.courseCode, d.courseName, d.lecturerName, ...d.topics]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // Rank strong academic profile match (Makerere BSSE Year 2 CSC 2101) highest when enabled
    if (prioritizeAcademicProfile) {
      list.sort((a, b) => {
        const aMatch = a.courseCode === "CSC 2101" ? 2 : a.institutionShortCode === "MAK" ? 1 : 0;
        const bMatch = b.courseCode === "CSC 2101" ? 2 : b.institutionShortCode === "MAK" ? 1 : 0;
        return bMatch - aMatch;
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
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedInstitution("all");
    setSelectedCourse("all");
    setSelectedType("all");
    setMaxPrice(50000);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header & Student Academic Profile Match Banner */}
      <div className="rounded-xl bg-[#0f2027] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Academic Resource Catalogue</h1>
          <p className="text-xs text-slate-300">
            Search verified lecture compendiums, past examination solutions, and laboratory manuals across Ugandan universities.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-white/10 border border-white/15 px-4 py-2.5">
          <GraduationCap className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="block font-bold text-white">Active Student Profile: Grace Namukasa</span>
            <span className="text-slate-300">Makerere University • BSSE Year 2, Sem 1</span>
          </div>
          <label className="ml-2 flex items-center gap-1.5 text-xs font-semibold text-amber-300 cursor-pointer">
            <input
              type="checkbox"
              checked={prioritizeAcademicProfile}
              onChange={(e) => setPrioritizeAcademicProfile(e.target.checked)}
              className="rounded border-white/30"
            />
            Boost My Course
          </label>
        </div>
      </div>

      {/* Search & Structured Filter Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, course code (CSC 2101), lecturer, or topic..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-slate-900 outline-none"
            />
          </div>

          <div>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="all">All Universities</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.shortCode} — {i.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="all">All Course Units</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="all">All Document Types</option>
              <option value="lecture_notes">Lecture Notes</option>
              <option value="past_paper_solution">Past Paper Solutions</option>
              <option value="study_guide">Study Guides</option>
              <option value="lab_manual">Lab Manuals</option>
              <option value="curriculum_summary">Cheat Sheets / Summaries</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-700">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold">Max Price: {formatUGX(maxPrice)}</span>
            <input
              type="range"
              min={1000}
              max={50000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-36 accent-[#0f2027]"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredDocs.length}</strong> verified publications
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Catalogue Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white p-5"
            />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">
            No academic publications match your current filter criteria.
          </p>
          <p className="text-xs text-slate-500">
            Try clearing your filters or searching across all Ugandan universities.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f2027] px-4 py-2 text-xs font-bold text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                    <Building2 className="h-3 w-3 text-slate-500" />
                    {doc.institutionShortCode} • {doc.courseCode}
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-extrabold text-amber-900">
                    {formatUGX(doc.priceUGX)}
                  </span>
                </div>

                {prioritizeAcademicProfile && doc.courseCode === "CSC 2101" && (
                  <div className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    Matches Your Enrolled Course Unit (CSC 2101)
                  </div>
                )}

                <Link href={`/catalogue/${doc.id}`} className="block group">
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-amber-700">
                    {doc.title}
                  </h2>
                </Link>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {doc.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {doc.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {doc.lecturerName}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {doc.pageCount} pages •{" "}
                    {doc.allowedPreviewPages.length > 0
                      ? `${doc.allowedPreviewPages.length} sample pages`
                      : "Metadata only (short doc)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/catalogue/${doc.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f2027] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Details &amp; Buy</span>
                  </Link>
                  <Link
                    href={`/student/read/${doc.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Open Reader</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

