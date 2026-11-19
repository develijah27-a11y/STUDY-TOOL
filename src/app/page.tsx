"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatUGX } from "@/lib/utils";
import { SITE_COPY } from "@/lib/constants/site-copy";
import {
  Search,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Eye,
  Send,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Smartphone,
  Download,
  Highlighter,
  StickyNote,
  Award,
  Layers,
  Code2,
  Scale,
  Briefcase,
  Wrench,
  Stethoscope,
  BookMarked,
  Users,
  Check,
  Lock,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [studentContact, setStudentContact] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<"preview" | "syllabus" | "author">("preview");

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRequest(true);
    setTimeout(() => {
      setSubmittingRequest(false);
      setRequestSent(true);
      setCourseCode("");
      setCourseTitle("");
      setInstitutionName("");
      setStudentContact("");
    }, 600);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const disciplines = [
    {
      title: "Computer Science & IT",
      icon: Code2,
      courses: "Algorithms, Database Systems, Networks, Software Eng",
      query: "Computer Science",
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200",
    },
    {
      title: "Law & Legal Studies",
      icon: Scale,
      courses: "Constitutional Law, Criminal Law, Evidence, Commercial",
      query: "Law",
      color: "from-amber-500/10 to-yellow-500/10 text-amber-700 border-amber-200",
    },
    {
      title: "Business & Economics",
      icon: Briefcase,
      courses: "Financial Accounting, Microeconomics, Procurement, Tax",
      query: "Accounting",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200",
    },
    {
      title: "Engineering & Tech",
      icon: Wrench,
      courses: "Circuit Analysis, Thermodynamics, Mechanics, Materials",
      query: "Engineering",
      color: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200",
    },
    {
      title: "Health & Medical",
      icon: Stethoscope,
      courses: "Human Anatomy, Clinical Pharmacology, Public Health",
      query: "Health",
      color: "from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200",
    },
    {
      title: "Humanities & Education",
      icon: BookMarked,
      courses: "Curriculum Studies, Educational Psychology, Ethics",
      query: "Education",
      color: "from-cyan-500/10 to-teal-500/10 text-cyan-700 border-cyan-200",
    },
  ];

  return (
    <div className="space-y-20 pb-20 bg-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1528] via-[#10223D] to-[#142B45] text-white pt-12 pb-20 md:py-24 border-b border-slate-800">
        {/* Glow & Backdrop Accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Heading, Subtitle & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-[#E9B949] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Uganda&apos;s Independent Academic Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-5xl font-black tracking-tight leading-[1.15] text-balance">
                University lecture notes directly from verified educators.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0">
                Search course unit notes, past paper walkthroughs, and exam summaries tailored to your syllabus. Preview pages for free before unlocking with mobile money.
              </p>

              {/* Single Prominent Search Box */}
              <form
                action="/catalogue"
                method="GET"
                className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto lg:mx-0 pt-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search course code (e.g. CSC 2101, LAW 1101) or topic..."
                    className="w-full rounded-2xl border border-white/20 bg-white/95 pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 shadow-md focus:ring-2 focus:ring-[#147D78] focus:bg-white outline-none font-medium placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#147D78] hover:bg-[#116965] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-900/40 transition shrink-0"
                >
                  <span>Search Notes</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-300">
                <span className="text-[11px] text-slate-400 mr-1">Trending:</span>
                {[
                  { label: "CSC 2101", q: "CSC 2101" },
                  { label: "LAW 1101", q: "LAW 1101" },
                  { label: "BBA 1204", q: "BBA 1204" },
                  { label: "MEC 2101", q: "MEC 2101" },
                  { label: "FIN 3102", q: "FIN 3102" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={`/catalogue?q=${encodeURIComponent(item.q)}`}
                    className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-mono text-slate-200 border border-white/10 transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition"
                >
                  <BookOpen className="h-4 w-4 text-[#E9B949]" />
                  <span>Explore Materials</span>
                </Link>

                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-7 py-3 text-xs sm:text-sm font-bold text-white transition backdrop-blur-sm"
                >
                  <GraduationCap className="h-4 w-4 text-[#E9B949]" />
                  <span>Join as a Lecturer</span>
                </Link>
              </div>

              {/* Micro Trust Strip */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-teal-400" />
                  <span>MTN &amp; Airtel MoMo</span>
                </div>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>Offline Study Vault</span>
                </div>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>24h Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Study Reader Preview Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                {/* Window Chrome / Status Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-1">somaug-reader.app</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 text-teal-300 px-2 py-0.5 text-[10px] font-bold">
                    <Download className="h-3 w-3" /> Offline Ready
                  </span>
                </div>

                {/* Document Header Inside Mockup */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-teal-900/60 text-teal-300 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold">
                      CSC 2101
                    </span>
                    <span className="text-[11px] text-slate-400">Semester 1 Notes</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Data Structures &amp; Algorithmic Analysis
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1 text-slate-300 font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-[#E9B949]" />
                      <span>Dr. Emmanuel K.</span>
                      <CheckCircle2 className="h-3 w-3 text-teal-400 inline" />
                    </div>
                    <span className="font-mono text-teal-300 font-bold">UGX 3,000</span>
                  </div>
                </div>

                {/* Simulated Interactive Reader Page with Multi-color Highlighters */}
                <div className="rounded-2xl bg-white p-4 text-slate-800 text-xs shadow-inner space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">Section 2: Binary Search Proof</span>
                    <span className="font-mono">Page 4 of 42</span>
                  </div>

                  {/* Highlights Demonstration */}
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <p>
                      An algorithm is efficient if its running time is bounded by a polynomial. For sorted arrays, we implement logarithmic searching:
                    </p>

                    {/* Yellow highlighted passage */}
                    <div className="p-1.5 rounded bg-amber-100 text-amber-950 font-medium border-l-2 border-amber-500">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">Core Definition (Yellow)</span>
                      &quot;Binary Search divides the search space in half each iteration, yielding worst-case time complexity O(log n).&quot;
                    </div>

                    {/* Green highlighted formula */}
                    <div className="p-1.5 rounded bg-emerald-100 text-emerald-950 font-medium border-l-2 border-emerald-500">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">Exam Formula (Green)</span>
                      T(n) = T(n/2) + O(1) ⇒ Satisfies Master Theorem Case 2: Θ(log n).
                    </div>

                    {/* Code snippet */}
                    <div className="rounded-lg bg-slate-900 p-2.5 text-[10px] font-mono text-slate-200">
                      <div className="text-teal-400">// Safe midpoint calculation</div>
                      <div className="text-slate-300">int mid = low + (high - low) / 2;</div>
                    </div>
                  </div>

                  {/* Highlighter Palette Toolbar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <Highlighter className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-semibold text-slate-600">Highlighter:</span>
                      <span className="h-3 w-3 rounded-full bg-amber-400 ring-2 ring-amber-300" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                      <span className="h-3 w-3 rounded-full bg-purple-400" />
                    </div>
                    <span className="text-teal-700 font-bold flex items-center gap-1">
                      <StickyNote className="h-3 w-3" /> 2 Personal Notes
                    </span>
                  </div>
                </div>

                {/* Micro Float Badges */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                    <span>Instant offline decryption</span>
                  </div>
                  <span className="text-slate-300 font-medium">42 Pages PDF · 1.8 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Course Disciplines & Exploration Grid */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-800 px-3 py-1 text-xs font-bold border border-teal-200">
            <Layers className="h-3.5 w-3.5 text-teal-600" />
            <span>Academic Faculties &amp; Syllabuses</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B45]">
            Browse by Course Discipline
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Find lecture packets, past paper solutions, and syllabus compendiums organized by field.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {disciplines.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={`/catalogue?q=${encodeURIComponent(item.query)}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#147D78] transition duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 border`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#147D78] transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.courses}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-teal-800">
                  <span>Explore Course Notes</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition duration-150" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Three Key Features: Built for Ugandan Realities */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 border border-teal-500/30">
              Built for Campus Life
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Engineered for the realities of university study.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We designed SomaUG around the everyday challenges faced by Ugandan university students: scarce Wi-Fi, unpredictable data bundles, and exam revision pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Offline Vault */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Offline Study Vault
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Download materials once when connected to campus Wi-Fi. Access and read encrypted documents anytime without consuming additional mobile data bundles.
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/80 border border-slate-700/60 p-3 text-[11px] text-teal-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                <span>Zero data used while reading offline</span>
              </div>
            </div>

            {/* Feature 2: Study Annotations & Highlighting */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-[#E9B949] border border-amber-500/30 flex items-center justify-center">
                  <Highlighter className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Multi-Color Highlighting &amp; Notes
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mark critical definitions, formulas, and exam tips in Yellow, Green, or Purple. Keep personal study notes directly inside your dashboard.
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/80 border border-slate-700/60 p-3 text-[11px] text-[#E9B949] flex items-center gap-2">
                <StickyNote className="h-4 w-4 shrink-0 text-[#E9B949]" />
                <span>Synchronized to your personal study desk</span>
              </div>
            </div>

            {/* Feature 3: Mobile Money Micro-Payments */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  MTN &amp; Airtel Micro-Unlocks
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No subscriptions or credit cards required. Pay only for the specific course unit you need (typically UGX 2,000 to UGX 5,000) using your local mobile money number.
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/80 border border-slate-700/60 p-3 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>24-hour document quality refund guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Genuine Document Preview & Interactive Sample */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-800 px-3 py-1 text-[11px] font-bold mb-2 border border-teal-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Genuine Verified Publication</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#142B45]">
                CSC 2101: Data Structures &amp; Algorithms
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Complete Lecture Compendium &amp; 5-Year Past Paper Solutions · 42 Pages
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="block text-2xl font-black text-slate-900 font-mono">
                {formatUGX(3000)}
              </span>
              <span className="block text-xs text-slate-500">
                One-time unlock · MTN / Airtel MoMo
              </span>
            </div>
          </div>

          {/* Interactive Preview Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActivePreviewTab("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activePreviewTab === "preview"
                  ? "bg-[#142B45] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Sample Excerpt (Page 1)
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("syllabus")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activePreviewTab === "syllabus"
                  ? "bg-[#142B45] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Topics Covered
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("author")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activePreviewTab === "author"
                  ? "bg-[#142B45] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Lecturer Verification
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8 rounded-2xl bg-slate-50 border border-slate-200 p-6 space-y-4 font-sans min-h-[220px]">
              {activePreviewTab === "preview" && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[11px] text-slate-500">
                    <span className="font-mono font-bold text-slate-800">Chapter 1: Asymptotic Complexity &amp; Big-O</span>
                    <span className="rounded bg-teal-100 text-teal-800 px-2 py-0.5 text-[10px] font-bold">Free Sample</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Algorithm analysis evaluates time and memory requirements as input size n grows asymptotically. Big-O provides a formal theoretical upper bound:
                  </p>
                  <div className="rounded-xl bg-white p-4 border border-slate-200 text-xs font-mono text-slate-800 space-y-1.5 shadow-sm">
                    <div className="text-teal-700 font-bold">// Binary Search: O(log n) Time &amp; O(1) Space</div>
                    <div>int low = 0, high = n - 1;</div>
                    <div>while (low &lt;= high) &#123;</div>
                    <div className="pl-4">int mid = low + (high - low) / 2;</div>
                    <div className="pl-4">if (arr[mid] == target) return mid;</div>
                    <div className="pl-4">else if (arr[mid] &lt; target) low = mid + 1;</div>
                    <div className="pl-4">else high = mid - 1;</div>
                    <div>&#125;</div>
                  </div>
                </div>
              )}

              {activePreviewTab === "syllabus" && (
                <div className="space-y-3 text-xs text-slate-700">
                  <h4 className="font-bold text-slate-900 text-sm">Course Syllabus Structure:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                      <span>Asymptotic Analysis &amp; Recurrences</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                      <span>Linked Lists, Stacks &amp; Queues</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                      <span>Binary Search Trees &amp; AVL Balancing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                      <span>Graph Algorithms: BFS, DFS &amp; Dijkstra</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                      <span>Dynamic Programming &amp; Greedy Strategies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                      <span>Solved Exam Solutions (2021–2025)</span>
                    </li>
                  </ul>
                </div>
              )}

              {activePreviewTab === "author" && (
                <div className="space-y-3 text-xs text-slate-700">
                  <h4 className="font-bold text-slate-900 text-sm">Author &amp; Institutional Context</h4>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <p className="font-semibold text-slate-900">Dr. Emmanuel K. (Senior Lecturer)</p>
                    <p className="text-slate-500 text-[11px]">Department of Computer Science &amp; Engineering</p>
                    <p className="text-teal-700 font-medium text-[11px]">
                      Identity and syllabus verified by SomaUG academic review desk.
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Note: SomaUG is an independent platform. Institution names are used solely for student course matching.
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-4 space-y-5">
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Syllabus-aligned by verified university lecturer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Save for offline study on phone or laptop</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Personal annotations &amp; multi-color highlighting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>24-hour money-back quality guarantee</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/catalogue?q=CSC+2101"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white py-3 px-4 text-xs font-bold transition shadow-sm"
                >
                  <Eye className="h-4 w-4 text-[#E9B949]" />
                  <span>View in Catalogue</span>
                </Link>

                <Link
                  href="/catalogue"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-3 px-4 text-xs font-bold transition"
                >
                  <span>Explore All Study Materials</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Student Community & Tutor Directory Spotlight */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Community Card */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-purple-500/5 via-white to-indigo-500/5 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-300 transition">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Student Study Groups &amp; Q&amp;A Community
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with coursemates from your university. Ask syllabus questions, exchange revision tips, and collaborate on difficult past paper questions.
              </p>
            </div>
            <Link
              href="/student/community"
              className="inline-flex items-center gap-2 text-xs font-bold text-purple-800 hover:text-purple-950 transition"
            >
              <span>Join Study Community</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Find a Tutor Card */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-500/5 via-white to-teal-500/5 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                1-on-1 Academic Tutoring Directory
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Book private revision sessions with verified teaching assistants and top-performing graduate tutors. Hourly rates in UGX with direct scheduling.
              </p>
            </div>
            <Link
              href="/student/tutors"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-800 hover:text-blue-950 transition"
            >
              <span>Find a Verified Tutor</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Course Unit Request Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#10223D] to-[#142B45] text-white p-6 sm:p-10 shadow-lg">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-8">
            <span className="inline-block rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 border border-teal-500/30">
              Student Request Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Can&apos;t find your course unit? Request notes.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tell us which course unit you need notes for. We will alert verified lecturers teaching that syllabus to publish their study materials.
            </p>
          </div>

          {requestSent ? (
            <div className="rounded-2xl bg-teal-500/10 border border-teal-500/30 p-8 text-center space-y-3 max-w-md mx-auto">
              <CheckCircle2 className="h-10 w-10 text-teal-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Course Request Logged</h3>
              <p className="text-xs text-slate-300">
                Thank you! We have logged your request. We will notify you once notes for this course unit are published.
              </p>
              <button
                type="button"
                onClick={() => setRequestSent(false)}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 transition"
              >
                Request another course unit
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit} className="max-w-xl mx-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Course Unit Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CSC 2101 or LAW 1101"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3.5 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Course Unit Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3.5 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    University / Institute *
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Makerere, Kyambogo, BRIBTE"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3.5 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Your Phone or Email (Optional)
                  </label>
                  <input
                    type="text"
                    value={studentContact}
                    onChange={(e) => setStudentContact(e.target.value)}
                    placeholder="To alert you when published"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3.5 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] text-white px-8 py-3.5 text-xs font-bold transition shadow-lg"
                >
                  <Send className="h-4 w-4 text-amber-300" />
                  <span>{submittingRequest ? "Submitting..." : "Submit Course Request"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 7. For Lecturers Section */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="inline-block rounded-full bg-teal-50 text-teal-800 px-3 py-1 text-xs font-bold border border-teal-200">
              For University &amp; College Educators
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#142B45]">
              Publish your course materials. Direct to your students.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Equip your classes with structured lecture notes, practical assignment guides, and past paper answers while receiving transparent payments directly to your mobile money wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SITE_COPY.forLecturers.benefits.map((benefit, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="h-8 w-8 rounded-xl bg-[#142B45] text-[#E9B949] flex items-center justify-center font-bold text-xs">
                  0{i + 1}
                </div>
                <h3 className="text-xs font-bold text-slate-900">{benefit.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Author Commitment Box */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 font-medium">
            <span className="font-bold">Author Commitment:</span> Every publishing lecturer confirms: &quot;I wrote this material, I have the legal right to distribute it, and it does not breach my employer&apos;s policies or infringe copyright.&quot;
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="/lecturer/apply"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-7 py-3.5 text-xs font-bold transition shadow-sm"
            >
              <GraduationCap className="h-4 w-4 text-[#E9B949]" />
              <span>Apply to Join as a Lecturer</span>
            </Link>

            <Link
              href="/terms"
              className="text-xs font-bold text-[#147D78] hover:underline"
            >
              Author Guidelines &amp; Policies →
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center max-w-lg mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-black text-[#142B45]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Clear, honest answers about how SomaUG operates.
          </p>
        </div>

        <div className="space-y-3">
          {SITE_COPY.faq.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? "rotate-180 text-teal-700" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
