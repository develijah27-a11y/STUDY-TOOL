"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Smartphone,
  Download,
  Highlighter,
  StickyNote,
  Code2,
  Scale,
  Briefcase,
  Wrench,
  Stethoscope,
  BookMarked,
  Users,
  WifiOff,
  Eye,
  FileText,
  Star,
  Check,
  Award,
} from "lucide-react";

export default function HomePage() {
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [studentContact, setStudentContact] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
    }, 400);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "How do I access purchased course materials offline?",
      a: "Once purchased via MTN or Airtel Mobile Money, materials are saved to your offline-ready device cache with cryptographic access keys, allowing complete offline reading without consuming extra data.",
    },
    {
      q: "How does lecturer verification work?",
      a: "Lecturers submit their official university credentials and departmental affiliation. The academic admin team reviews documentation before approving publishing privileges.",
    },
    {
      q: "Can I preview documents before purchasing?",
      a: "Yes. Every document offers a free multi-page preview including outline, table of contents, and sample core topics before you make any payment.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support instant push-prompt payments on both MTN Uganda Mobile Money and Airtel Money Uganda.",
    },
  ];

  // 1. Learning Resources with sharp, vibrant visual representations (No faint/blurred graphics)
  const learningResources = [
    {
      title: "Technology & Computing",
      category: "Software, Networks & Systems",
      query: "Computer Science",
      count: "94 Units",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accentBorder: "border-blue-200 hover:border-blue-500",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full" fill="none">
          <rect x="8" y="10" width="104" height="50" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
          <rect x="24" y="20" width="72" height="30" rx="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
          <circle cx="36" cy="35" r="3.5" fill="#2563EB" />
          <circle cx="84" cy="35" r="3.5" fill="#2563EB" />
          <path d="M40 35h40" stroke="#1D4ED8" strokeWidth="2" strokeDasharray="3 2" />
          <path d="M60 10v10M40 10v10M80 10v10M60 50v10M40 50v10M80 50v10" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Mathematics & Engineering",
      category: "Thermodynamics, Mechanics & Calculus",
      query: "Engineering",
      count: "78 Units",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accentBorder: "border-purple-200 hover:border-purple-500",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full" fill="none">
          <rect x="8" y="10" width="104" height="50" rx="6" fill="#FAF5FF" stroke="#8B5CF6" strokeWidth="1.5" />
          <circle cx="60" cy="35" r="22" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 2" />
          <polygon points="60,16 80,48 40,48" stroke="#6D28D9" strokeWidth="1.5" fill="#EDE9FE" />
          <line x1="60" y1="16" x2="60" y2="48" stroke="#7C3AED" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="18" y1="56" x2="102" y2="56" stroke="#8B5CF6" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: "Science & Medicine",
      category: "Clinical Anatomy, Pathology & Health",
      query: "Health",
      count: "52 Units",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      accentBorder: "border-rose-200 hover:border-rose-500",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full" fill="none">
          <rect x="8" y="10" width="104" height="50" rx="6" fill="#FFF1F2" stroke="#F43F5E" strokeWidth="1.5" />
          <circle cx="34" cy="26" r="8" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1.5" />
          <circle cx="86" cy="26" r="8" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1.5" />
          <circle cx="60" cy="48" r="9" fill="#FECDD3" stroke="#BE123C" strokeWidth="2" />
          <line x1="40" y1="31" x2="53" y2="43" stroke="#E11D48" strokeWidth="2" />
          <line x1="80" y1="31" x2="67" y2="43" stroke="#E11D48" strokeWidth="2" />
          <line x1="42" y1="26" x2="78" y2="26" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      ),
    },
    {
      title: "Business & Economics",
      category: "Corporate Finance, Auditing & Markets",
      query: "Accounting",
      count: "86 Units",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accentBorder: "border-emerald-200 hover:border-emerald-500",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full" fill="none">
          <rect x="8" y="10" width="104" height="50" rx="6" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
          <line x1="18" y1="54" x2="102" y2="54" stroke="#059669" strokeWidth="1.5" />
          <rect x="26" y="38" width="12" height="16" rx="2" fill="#A7F3D0" stroke="#059669" strokeWidth="1" />
          <rect x="46" y="28" width="12" height="26" rx="2" fill="#6EE7B7" stroke="#059669" strokeWidth="1" />
          <rect x="66" y="20" width="12" height="34" rx="2" fill="#34D399" stroke="#047857" strokeWidth="1" />
          <rect x="86" y="14" width="12" height="40" rx="2" fill="#10B981" stroke="#047857" strokeWidth="1" />
          <path d="M26 38L46 28L66 20L86 14" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Law & Constitutional Studies",
      category: "Commercial, Criminal & Public Law",
      query: "Law",
      count: "71 Units",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      accentBorder: "border-amber-200 hover:border-amber-500",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full" fill="none">
          <rect x="8" y="10" width="104" height="50" rx="6" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="60" y1="16" x2="60" y2="54" stroke="#B45309" strokeWidth="2" />
          <line x1="32" y1="24" x2="88" y2="24" stroke="#D97706" strokeWidth="2" />
          <path d="M32 24l-9 18h18l-9-18z" stroke="#B45309" strokeWidth="1.5" fill="#FDE68A" />
          <path d="M88 24l-9 18h18l-9-18z" stroke="#B45309" strokeWidth="1.5" fill="#FDE68A" />
          <line x1="48" y1="54" x2="72" y2="54" stroke="#92400E" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      title: "Education & Humanities",
      category: "Curriculum Design, Psychology & Ethics",
      query: "Education",
      count: "64 Units",
      badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
      accentBorder: "border-cyan-200 hover:border-cyan-500",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full" fill="none">
          <rect x="8" y="10" width="104" height="50" rx="6" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="1.5" />
          <path d="M60 20C47 15 28 17 22 19v32c7-2 22-3 38 4 16-7 31-6 38-4V19c-6-2-25-4-38 1z" stroke="#0891B2" strokeWidth="1.5" fill="#CFFAFE" />
          <line x1="60" y1="20" x2="60" y2="55" stroke="#0E7490" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-[#F8FAFC]">
      {/* 1. Hero Section - Crisp, Natural Library Photo & High-Contrast Typography */}
      <section className="bg-[#0B1528] text-white pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-semibold text-[#E9B949] shadow-inner">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Uganda Higher Education Study Tool</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                Authentic course notes from your lecturers.
              </h1>

              <p className="text-sm sm:text-base text-slate-200 font-normal max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Exam-focused revision notes and past papers. Free previews. Instant MTN and Airtel Mobile Money unlock.
              </p>

              {/* Search Bar */}
              <form
                action="/catalogue"
                method="GET"
                className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0 pt-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search course code (e.g. BBA 1204, CSC 1100, MEC 2101)..."
                    className="w-full rounded-xl border border-white/20 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 shadow-md outline-none focus:ring-2 focus:ring-[#147D78] font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Popular Course Units */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-300 pt-1">
                <span className="text-xs text-slate-400 font-medium">Popular:</span>
                {["BBA 1204", "CSC 1100", "MEC 2101", "ACC 2102", "ENG 1102"].map((code) => (
                  <Link
                    key={code}
                    href={`/catalogue?q=${encodeURIComponent(code)}`}
                    className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs font-mono text-slate-200 border border-white/10 transition"
                  >
                    {code}
                  </Link>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-6 py-3 text-xs sm:text-sm font-bold text-white transition shadow-sm"
                >
                  <BookOpen className="h-4 w-4 text-[#E9B949]" />
                  <span>Explore Course Notes</span>
                </Link>

                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-6 py-3 text-xs sm:text-sm font-bold text-white transition"
                >
                  <GraduationCap className="h-4 w-4 text-[#E9B949]" />
                  <span>Join as Lecturer</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Smartphone className="h-3.5 w-3.5 text-teal-400" /> MTN and Airtel
                </span>
                <span className="inline-block h-1 w-1 rounded-full bg-slate-500" />
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <WifiOff className="h-3.5 w-3.5 text-amber-400" /> Offline Encrypted
                </span>
                <span className="inline-block h-1 w-1 rounded-full bg-slate-500" />
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 24h Guarantee
                </span>
              </div>
            </div>

            {/* Right Column: Sharp, Bright, High-Definition Photograph of Library Students (HIDDEN ON MOBILE) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl bg-slate-900 group">
                <div className="relative h-[380px] w-full">
                  <Image
                    src="/images/hero-students.jpg"
                    alt="University students studying together in a modern university library"
                    fill
                    priority
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle clean bottom gradient to anchor the text badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                </div>

                {/* Floating Clear Info Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/95 border border-white/15 p-3.5 backdrop-blur-md shadow-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-teal-400" />
                      <span>University Library Study Circle</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Makerere · Kyambogo · MUST · MUBS
                    </div>
                  </div>
                  <span className="rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 px-2 py-1 text-xs font-mono font-bold">
                    Verified Notes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="text-lg sm:text-2xl font-black text-[#142B45]">400+</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Verified Documents</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="text-lg sm:text-2xl font-black text-[#147D78]">100%</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Offline Encrypted</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="text-lg sm:text-2xl font-black text-[#142B45]">MTN &amp; Airtel</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Instant Mobile Money</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="text-lg sm:text-2xl font-black text-amber-600">0 UGX</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Subscription Fee</div>
          </div>
        </div>
      </section>

      {/* 3. Learning Resources Section - Sharp, High-Contrast & Professional */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-md mx-auto mb-8 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#142B45]">
            Learning Resources
          </h2>
          <p className="text-xs text-slate-500">
            Faculty-aligned course units with authentic lecture outlines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {learningResources.map((res, idx) => (
            <Link
              key={idx}
              href={`/catalogue?q=${encodeURIComponent(res.query)}`}
              className={`rounded-2xl border ${res.accentBorder} bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${res.badgeColor}`}>
                  {res.count}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
              </div>

              {/* Sharp, Bright Domain Vector Container */}
              <div className="h-20 w-full mb-3 rounded-xl overflow-hidden flex items-center justify-center">
                {res.svgGraphic}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  {res.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Materials: ACTUAL, CRISP PREVIEWS OF NOTES & ACADEMIC TEXTS */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-md mx-auto mb-8 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#142B45]">
            Featured Study Materials
          </h2>
          <p className="text-xs text-slate-500">
            Actual previews of lecture notes, syllabus summaries, and judicial case references.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Engineering Mechanics */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
            {/* Header Banner */}
            <div className="bg-[#142B45] text-white p-4 border-b border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono font-bold text-[#E9B949] bg-white/10 px-2 py-0.5 rounded">
                  MEC 2101 · Engineering
                </span>
                <span className="rounded-full bg-teal-500/20 text-teal-300 px-2 py-0.5 text-xs font-bold flex items-center gap-1">
                  <Download className="h-3 w-3" /> Offline Ready
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                Engineering Mechanics &amp; Statics
              </h3>
              <div className="text-xs font-mono font-bold text-teal-300 mt-0.5">
                UGX 3,000
              </div>
            </div>

            {/* Crisp Actual Note Page Preview */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#FAFBFD]">
              <div className="rounded-xl bg-white border border-slate-200 p-3.5 text-xs space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-800">Equilibrium of Rigid Bodies</span>
                  <span className="font-mono">Page 3 of 42</span>
                </div>

                <div className="p-2 rounded-lg bg-blue-50 text-blue-950 font-medium border-l-2 border-blue-500 text-xs leading-relaxed">
                  First Condition of Equilibrium: The vector sum of all external forces acting on the rigid body must be zero (ΣF = 0).
                </div>

                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-950 font-medium border-l-2 border-emerald-500 text-xs leading-relaxed">
                  Second Condition of Equilibrium: The algebraic sum of moments of all forces about any point must equal zero (ΣM = 0).
                </div>

                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-xs text-slate-200">
                  <span className="text-teal-400">// Analysis Procedure</span>
                  <div className="text-white mt-0.5">
                    Planar Truss Analysis: Method of Joints &amp; Method of Sections
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-600 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 font-bold text-teal-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    Verified Notes
                  </span>
                  <span className="text-slate-400 font-mono">CEDAT Engineering</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold">4.9</span>
                  <span className="text-slate-400">(156 downloads)</span>
                </div>
                <Link
                  href="/catalogue?q=MEC%202101"
                  className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-4 py-2 text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5 text-teal-400" />
                  <span>Preview Pack</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: BBA Corporate Finance */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
            <div className="bg-[#142B45] text-white p-4 border-b border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono font-bold text-[#E9B949] bg-white/10 px-2 py-0.5 rounded">
                  BBA 1204 · Commerce
                </span>
                <span className="rounded-full bg-teal-500/20 text-teal-300 px-2 py-0.5 text-xs font-bold flex items-center gap-1">
                  <Download className="h-3 w-3" /> Offline Ready
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                Corporate Financial Management
              </h3>
              <div className="text-xs font-mono font-bold text-teal-300 mt-0.5">
                UGX 2,500
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#FAFBFD]">
              <div className="rounded-xl bg-white border border-slate-200 p-3.5 text-xs space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-800">Capital Budgeting &amp; Cash Flow</span>
                  <span className="font-mono">Page 4 of 44</span>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-950 font-medium border-l-2 border-emerald-500 text-xs leading-relaxed">
                  NPV Rule: Accept projects where discounted future net inflows exceed initial capital outlay (NPV &gt; 0).
                </div>

                <div className="p-2 rounded-lg bg-blue-50 text-blue-950 font-medium border-l-2 border-blue-500 text-xs leading-relaxed">
                  Cost of Capital: WACC = (E/V * Re) + (D/V * Rd * (1 - Tc)).
                </div>

                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-xs text-slate-200">
                  <span className="text-teal-400">// Practical Exam Case</span>
                  <div className="text-white mt-0.5">
                    Uganda Breweries Expansion 2024 Working Capital Case
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-600 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 font-bold text-teal-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    Verified Notes
                  </span>
                  <span className="text-slate-400 font-mono">MUBS Commerce</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold">4.8</span>
                  <span className="text-slate-400">(198 downloads)</span>
                </div>
                <Link
                  href="/catalogue?q=BBA%201204"
                  className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-4 py-2 text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5 text-teal-400" />
                  <span>Preview Pack</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: CSC 1100 Computer Systems */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
            <div className="bg-[#142B45] text-white p-4 border-b border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono font-bold text-[#E9B949] bg-white/10 px-2 py-0.5 rounded">
                  CSC 1100 · Computing
                </span>
                <span className="rounded-full bg-teal-500/20 text-teal-300 px-2 py-0.5 text-xs font-bold flex items-center gap-1">
                  <Download className="h-3 w-3" /> Offline Ready
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                Computer Systems &amp; Digital Logic
              </h3>
              <div className="text-xs font-mono font-bold text-teal-300 mt-0.5">
                UGX 3,500
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#FAFBFD]">
              <div className="rounded-xl bg-white border border-slate-200 p-3.5 text-xs space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-800">Boolean Logic &amp; Gate Synthesis</span>
                  <span className="font-mono">Page 5 of 52</span>
                </div>

                <div className="p-2 rounded-lg bg-purple-50 text-purple-950 font-medium border-l-2 border-purple-500 text-xs leading-relaxed">
                  De Morgan Laws: NOT (A AND B) = (NOT A) OR (NOT B); NOT (A OR B) = (NOT A) AND (NOT B).
                </div>

                <div className="p-2 rounded-lg bg-teal-50 text-teal-950 font-medium border-l-2 border-teal-500 text-xs leading-relaxed">
                  Karnaugh Map Minimization: Grouping adjacent powers of 2 (1, 2, 4, 8) eliminates redundant literals.
                </div>

                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-xs text-slate-200">
                  <span className="text-teal-400">// Register-Transfer Level</span>
                  <div className="text-white mt-0.5">
                    Instruction Fetch &rarr; Decode &rarr; ALU Execute &rarr; Writeback
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-600 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 font-bold text-teal-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    Verified Notes
                  </span>
                  <span className="text-slate-400 font-mono">CoCIS Systems</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold">5.0</span>
                  <span className="text-slate-400">(215 downloads)</span>
                </div>
                <Link
                  href="/catalogue?q=CSC%201100"
                  className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-4 py-2 text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5 text-teal-400" />
                  <span>Preview Pack</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Platform Features - Clean, Razor-Sharp Panels */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-sm hover:border-teal-200 transition">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero-Data Offline Reading</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download notes once on campus Wi-Fi. Access study materials anywhere without active data bundles.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-sm hover:border-amber-200 transition">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-[#E9B949] flex items-center justify-center">
              <Highlighter className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Active Highlighting &amp; Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Color-code examination concepts, tag definitions, and save personal margin summaries directly on each page.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-sm hover:border-emerald-200 transition">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Pay-Per-Document MoMo</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pay solely for the course units you take via MTN or Airtel. No recurring monthly subscription fees.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Community & Tutors Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/student/community"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition">
                  Academic Community
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Peer study groups, past paper discussions, and course Q&amp;A.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition shrink-0" />
          </Link>

          <Link
            href="/student/tutors"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition">
                  Peer Tutors Desk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Book 1-on-1 revision sessions with top department students.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition shrink-0" />
          </Link>
        </div>
      </section>

      {/* 7. Request Course Notes Form - High Contrast Clean Deep Navy */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-2xl bg-[#0B1528] text-white p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="text-center max-w-md mx-auto mb-5 space-y-1">
            <h2 className="text-lg sm:text-xl font-bold">
              Can&apos;t find your course unit?
            </h2>
            <p className="text-xs text-slate-300">
              Submit your course code. We will notify relevant university lecturers.
            </p>
          </div>

          {requestSent ? (
            <div className="rounded-xl bg-teal-500/10 border border-teal-500/30 p-4 text-center space-y-2 max-w-sm mx-auto">
              <CheckCircle2 className="h-6 w-6 text-teal-400 mx-auto" />
              <p className="text-xs font-bold text-white">Course Request Logged</p>
              <button
                type="button"
                onClick={() => setRequestSent(false)}
                className="text-xs text-teal-300 underline font-bold"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit} className="max-w-md mx-auto space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Course code (e.g. MEC 2101 or CSC 1100)"
                  className="rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-400"
                />
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course unit title"
                  className="rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="University / Institute"
                  className="rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-400"
                />
                <input
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="Phone or Email (Optional)"
                  className="rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full rounded-xl bg-[#147D78] hover:bg-[#116965] text-white py-2.5 text-xs font-bold transition shadow"
              >
                {submittingRequest ? "Submitting..." : "Submit Course Request"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 8. Lecturer Call to Action */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-[#142B45]">
              Publish Course Notes
            </h2>
            <p className="text-xs text-slate-500">
              Upload study materials, set your price, and withdraw earnings directly via Mobile Money.
            </p>
          </div>
          <Link
            href="/lecturer/apply"
            className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-5 py-2.5 text-xs font-bold transition shrink-0 shadow-sm"
          >
            Join as Lecturer
          </Link>
        </div>
      </section>

      {/* 9. FAQ Accordion */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center max-w-sm mx-auto mb-6 space-y-1">
          <h2 className="text-lg font-bold text-[#142B45]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 hover:bg-slate-50 transition"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      isOpen ? "rotate-180 text-teal-700" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-600 border-t border-slate-100 pt-2 leading-relaxed">
                    {item.a}
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
