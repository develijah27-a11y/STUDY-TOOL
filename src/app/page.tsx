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

  // 1. Learning Resources with subtle visual graphics representing technology, mathematics, science & business
  const learningResources = [
    {
      title: "Technology & Computing",
      category: "Software, Networks & Systems",
      query: "Computer Science",
      count: "94 Units",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      accent: "#3B82F6",
      // Visual SVG graphic representing Technology
      svgGraphic: (
        <svg viewBox="0 0 120 80" className="w-full h-full opacity-60 group-hover:opacity-90 transition" fill="none">
          <rect x="10" y="15" width="100" height="50" rx="8" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="25" y="25" width="70" height="30" rx="4" fill="#3B82F6" fillOpacity="0.1" stroke="#3B82F6" strokeWidth="1.5" />
          <circle cx="35" cy="40" r="3" fill="#60A5FA" />
          <circle cx="85" cy="40" r="3" fill="#60A5FA" />
          <path d="M38 40h44" stroke="#60A5FA" strokeWidth="1.5" />
          <path d="M60 25v-10M40 25v-10M80 25v-10M60 55v10M40 55v10M80 55v10" stroke="#3B82F6" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: "Mathematics & Engineering",
      category: "Thermodynamics, Mechanics & Calculus",
      query: "Engineering",
      count: "78 Units",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      accent: "#8B5CF6",
      // Visual SVG graphic representing Mathematics & Blueprint Geometry
      svgGraphic: (
        <svg viewBox="0 0 120 80" className="w-full h-full opacity-60 group-hover:opacity-90 transition" fill="none">
          <circle cx="60" cy="40" r="28" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 2" />
          <polygon points="60,18 84,54 36,54" stroke="#A78BFA" strokeWidth="1.5" fill="#8B5CF6" fillOpacity="0.08" />
          <line x1="60" y1="18" x2="60" y2="54" stroke="#C4B5FD" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="20" y1="65" x2="100" y2="65" stroke="#8B5CF6" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: "Science & Medicine",
      category: "Clinical Anatomy, Pathology & Health",
      query: "Health",
      count: "52 Units",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      accent: "#F43F5E",
      // Visual SVG graphic representing Science & Molecular Nodes
      svgGraphic: (
        <svg viewBox="0 0 120 80" className="w-full h-full opacity-60 group-hover:opacity-90 transition" fill="none">
          <circle cx="35" cy="30" r="7" fill="#F43F5E" fillOpacity="0.15" stroke="#F43F5E" strokeWidth="1.5" />
          <circle cx="85" cy="30" r="7" fill="#F43F5E" fillOpacity="0.15" stroke="#F43F5E" strokeWidth="1.5" />
          <circle cx="60" cy="55" r="9" fill="#FB7185" fillOpacity="0.25" stroke="#FB7185" strokeWidth="1.5" />
          <line x1="41" y1="33" x2="54" y2="48" stroke="#F43F5E" strokeWidth="1.5" />
          <line x1="79" y1="33" x2="66" y2="48" stroke="#F43F5E" strokeWidth="1.5" />
          <line x1="42" y1="30" x2="78" y2="30" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      ),
    },
    {
      title: "Business & Economics",
      category: "Corporate Finance, Auditing & Markets",
      query: "Accounting",
      count: "86 Units",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      accent: "#10B981",
      // Visual SVG graphic representing Business & Financial Growth
      svgGraphic: (
        <svg viewBox="0 0 120 80" className="w-full h-full opacity-60 group-hover:opacity-90 transition" fill="none">
          <line x1="15" y1="65" x2="105" y2="65" stroke="#10B981" strokeWidth="1.5" />
          <rect x="25" y="45" width="12" height="20" rx="2" fill="#10B981" fillOpacity="0.3" stroke="#10B981" strokeWidth="1" />
          <rect x="45" y="32" width="12" height="33" rx="2" fill="#10B981" fillOpacity="0.4" stroke="#10B981" strokeWidth="1" />
          <rect x="65" y="24" width="12" height="41" rx="2" fill="#10B981" fillOpacity="0.5" stroke="#10B981" strokeWidth="1" />
          <rect x="85" y="14" width="12" height="51" rx="2" fill="#34D399" fillOpacity="0.6" stroke="#34D399" strokeWidth="1" />
          <path d="M25 45L45 32L65 24L85 14" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Law & Constitutional Studies",
      category: "Commercial, Criminal & Public Law",
      query: "Law",
      count: "71 Units",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accent: "#F59E0B",
      // Visual SVG graphic representing Law & Scales of Justice
      svgGraphic: (
        <svg viewBox="0 0 120 80" className="w-full h-full opacity-60 group-hover:opacity-90 transition" fill="none">
          <line x1="60" y1="15" x2="60" y2="65" stroke="#F59E0B" strokeWidth="2" />
          <line x1="30" y1="26" x2="90" y2="26" stroke="#F59E0B" strokeWidth="2" />
          <path d="M30 26l-10 22h20l-10-22z" stroke="#FBBF24" strokeWidth="1.5" fill="#F59E0B" fillOpacity="0.15" />
          <path d="M90 26l-10 22h20l-10-22z" stroke="#FBBF24" strokeWidth="1.5" fill="#F59E0B" fillOpacity="0.15" />
          <line x1="45" y1="65" x2="75" y2="65" stroke="#F59E0B" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      title: "Education & Humanities",
      category: "Curriculum Design, Psychology & Ethics",
      query: "Education",
      count: "64 Units",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      accent: "#06B6D4",
      // Visual SVG graphic representing Humanities & Academic Quill/Book
      svgGraphic: (
        <svg viewBox="0 0 120 80" className="w-full h-full opacity-60 group-hover:opacity-90 transition" fill="none">
          <path d="M60 22C46 16 25 18 20 20v38c6-2 24-4 40 4 16-8 34-6 40-4V20c-5-2-26-4-40 2z" stroke="#06B6D4" strokeWidth="1.5" fill="#06B6D4" fillOpacity="0.1" />
          <line x1="60" y1="22" x2="60" y2="62" stroke="#22D3EE" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  // 2. Featured Materials: Actual Previews of notes, textbooks & documents
  const featuredMaterials = [
    {
      code: "LAW 1101",
      title: "Constitutional Law & Judicial Review",
      institution: "Makerere University · School of Law",
      lecturer: "Assoc. Prof. F. Tumwine",
      priceUGX: 3000,
      pages: 38,
      rating: 4.9,
      downloads: 142,
      excerpt: "Comprehensive study compendium: Separation of Powers, Judicial Independence under Art. 128, and leading Supreme Court precedents.",
      tag: "Lecture Pack",
    },
    {
      code: "BBA 1204",
      title: "Corporate Financial Management & Budgeting",
      institution: "MUBS · Faculty of Commerce",
      lecturer: "Dr. S. Nabukenya",
      priceUGX: 2500,
      pages: 44,
      rating: 4.8,
      downloads: 198,
      excerpt: "Discounted Cash Flows (DCF), Net Present Value matrices, WACC optimization, and working capital solutions with examination cases.",
      tag: "Syllabus Notes",
    },
    {
      code: "CSC 1100",
      title: "Computer Systems & Digital Architecture",
      institution: "CoCIS · Department of Networks",
      lecturer: "Dr. K. Ssemwogerere",
      priceUGX: 3500,
      pages: 52,
      rating: 5.0,
      downloads: 215,
      excerpt: "Boolean algebra simplification, Karnaugh mapping, logic gate synthesis, memory hierarchies, and pipelined RISC instruction cycles.",
      tag: "Full Exam Guide",
    },
  ];

  const faqs = [
    {
      q: "How do I access course notes?",
      a: "Search by course code, preview sample pages for free, and unlock access via MTN or Airtel Mobile Money.",
    },
    {
      q: "Can I study offline without data?",
      a: "Yes. Tap 'Download Offline' in the reader. All documents are stored encrypted locally on your phone or laptop with zero internet required.",
    },
    {
      q: "How do lecturers publish and get paid?",
      a: "Verified university lecturers upload course packs, set document pricing in UGX, and withdraw net earnings directly to their mobile money wallets anytime.",
    },
    {
      q: "What is the 24-hour refund policy?",
      a: "If an unlocked document does not match its university course outline, request an instant automated refund from your wallet history within 24 hours.",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-[#F8FAFC]">
      {/* 1. Hero Section with Photograph Background (Diverse Students Studying in Modern Library) */}
      <section className="relative overflow-hidden bg-[#071224] text-white pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-800">
        {/* Background Image: One single high-impact hero image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-students.jpg"
            alt="University students studying together in a modern university library"
            fill
            priority
            className="object-cover object-center opacity-25 mix-blend-luminosity filter contrast-125 brightness-75"
          />
          {/* Dark abstract blue gradient overlay ensuring 100% text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071224] via-[#071224]/90 to-[#0B1A30]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/15 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-semibold text-[#E9B949] shadow-inner backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Uganda Higher Education Study Tool</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
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
                    placeholder="Search course code (e.g. LAW 1101, BBA 1204)..."
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

              {/* Popular Course Units (NO Algorithms on Mobile or Anywhere) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-300 pt-1">
                <span className="text-xs text-slate-400 font-medium">Popular:</span>
                {["LAW 1101", "BBA 1204", "CSC 1100", "MEC 2101", "ACC 2102"].map((code) => (
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-6 py-3 text-xs sm:text-sm font-bold text-white transition backdrop-blur-sm"
                >
                  <GraduationCap className="h-4 w-4 text-[#E9B949]" />
                  <span>Join as Lecturer</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Smartphone className="h-3.5 w-3.5 text-teal-400" /> MTN &amp; Airtel
                </span>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <WifiOff className="h-3.5 w-3.5 text-amber-400" /> Offline Encrypted
                </span>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 24h Guarantee
                </span>
              </div>
            </div>

            {/* Right Column: Desktop-Only Reader Preview Mockup (HIDDEN ON MOBILE) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
                  <span className="font-mono text-slate-400 font-semibold">LAW 1101 · Constitutional Law</span>
                  <span className="rounded-full bg-teal-500/20 text-teal-300 px-2 py-0.5 text-xs font-bold flex items-center gap-1">
                    <Download className="h-3 w-3" /> Offline Ready
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Principles of Constitutional Governance</span>
                  <span className="font-mono text-teal-300 font-bold">UGX 3,000</span>
                </div>

                {/* Reader Sample Preview */}
                <div className="rounded-xl bg-white p-3.5 text-slate-800 text-xs space-y-2.5 font-sans shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Doctrine of Separation of Powers</span>
                    <span className="font-mono">Page 3 of 38</span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50 text-amber-950 font-medium border-l-2 border-amber-500 text-xs">
                    Article 79: The Parliament of Uganda shall make laws on any matter for peace, order, and good governance.
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-950 font-medium border-l-2 border-emerald-500 text-xs">
                    Judicial Independence: Courts shall not be subject to the direction or control of any person or authority.
                  </div>

                  <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-xs text-slate-200">
                    <span className="text-teal-400">// Case Law Reference</span>
                    <div>Major General Tinyefuza v Attorney General (Constitutional Appeal No. 1)</div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Highlighter className="h-3.5 w-3.5 text-slate-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                    </div>
                    <span className="text-teal-700 font-bold flex items-center gap-1">
                      <StickyNote className="h-3 w-3" /> Verified Notes
                    </span>
                  </div>
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

      {/* 3. Learning Resources Section (Subtle visual graphics representing technology, mathematics, science, business) */}
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
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#147D78] hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden relative"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-3 z-10">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${res.badgeColor}`}>
                  {res.count}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
              </div>

              {/* Graphic container with subtle visual representation */}
              <div className="h-20 w-full mb-3 rounded-xl bg-slate-900/90 border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                {res.svgGraphic}
              </div>

              {/* Title & Category */}
              <div className="z-10">
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

      {/* 4. Featured Materials: Actual Previews of notes, textbooks & academic documents */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-md mx-auto mb-8 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#142B45]">
            Featured Study Materials
          </h2>
          <p className="text-xs text-slate-500">
            Verified lecture notes, syllabus summaries, and solved examination papers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredMaterials.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
            >
              {/* Document Mockup Header & Cover Preview */}
              <div className="bg-[#0B1528] text-white p-4 border-b border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#E9B949] bg-white/10 px-2 py-0.5 rounded">
                    {item.code}
                  </span>
                  <span className="text-xs font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold leading-snug line-clamp-2 text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  {item.institution}
                </p>
              </div>

              {/* Document Excerpt Preview */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;{item.excerpt}&rdquo;
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{item.rating}</span>
                    <span className="font-normal text-slate-400 font-mono">({item.downloads})</span>
                  </div>
                  <span className="font-mono text-slate-600">{item.pages} Pages</span>
                </div>

                {/* Footer with Price and CTA */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-slate-400 block font-sans">Student Price</span>
                    <span className="text-sm font-mono font-black text-slate-900">
                      UGX {item.priceUGX.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/catalogue?q=${encodeURIComponent(item.code)}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-3.5 py-2 text-xs font-bold transition shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5 text-teal-400" />
                    <span>Preview</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Section Backgrounds: Dark Abstract Blue Academic Texture with Very Low Contrast */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="rounded-3xl bg-[#091528] text-white p-6 sm:p-10 relative overflow-hidden border border-slate-800 shadow-xl">
          {/* Very low contrast dark abstract geometric blueprint texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #147D78 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white/10 text-teal-300 flex items-center justify-center border border-white/10">
                <WifiOff className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Zero-Data Offline Reading</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Download notes once on campus Wi-Fi. Access study materials anywhere without active data bundles.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center border border-white/10">
                <Highlighter className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Active Highlights &amp; Notes</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Color-code examination concepts, tag definitions, and save personal margin summaries directly on each page.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center border border-white/10">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Pay-Per-Document MoMo</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pay solely for the course units you take via MTN or Airtel. No recurring monthly subscription fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Community & Peer Tutors */}
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

      {/* 7. Request Course Notes Form (Dark Abstract Blue Texture) */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-2xl bg-[#0B1528] text-white p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #147D78 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 text-center max-w-md mx-auto mb-5 space-y-1">
            <h2 className="text-lg sm:text-xl font-bold">
              Can&apos;t find your course unit?
            </h2>
            <p className="text-xs text-slate-300">
              Submit your course code. We will notify relevant university lecturers.
            </p>
          </div>

          {requestSent ? (
            <div className="relative z-10 rounded-xl bg-teal-500/10 border border-teal-500/30 p-4 text-center space-y-2 max-w-sm mx-auto">
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
            <form onSubmit={handleRequestSubmit} className="relative z-10 max-w-md mx-auto space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Course code (e.g. LAW 1101)"
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
