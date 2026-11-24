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
  ArrowUpRight,
  Layers,
  TrendingUp,
  Cpu,
  Compass,
  Microscope,
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

  // 1. Learning Resources - High-End Fintech Design with Precision Schematics (No Emojis)
  const learningResources = [
    {
      code: "TECH-CS",
      faculty: "CoCIS Computing",
      title: "Technology & Computing",
      category: "Distributed systems, algorithmic complexity, data structures, network security & database engines.",
      query: "Computer Science",
      count: "94 Units",
      svgGraphic: (
        <svg viewBox="0 0 240 70" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
          <pattern id="grid-cs" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#1E293B" strokeWidth="0.5" />
          </pattern>
          <rect width="240" height="70" fill="url(#grid-cs)" />
          {/* Header Metric Line */}
          <text x="10" y="13" fill="#64748B" fontSize="7.5" fontFamily="monospace" fontWeight="600">SYS :: DISTRIBUTED-BUS-01</text>
          <text x="180" y="13" fill="#10B981" fontSize="7.5" fontFamily="monospace" fontWeight="600">99.98% VERIFIED</text>
          {/* Microservice Architecture Schematic */}
          <rect x="12" y="24" width="46" height="28" rx="4" fill="#0B132B" stroke="#0284C7" strokeWidth="1" />
          <text x="18" y="37" fill="#38BDF8" fontSize="7" fontFamily="monospace" fontWeight="700">API GATEWAY</text>
          <text x="18" y="46" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">PORT 443</text>

          <path d="M58 38 h 26" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="71" cy="38" r="2.5" fill="#38BDF8" />

          <rect x="84" y="20" width="62" height="36" rx="4" fill="#0B132B" stroke="#147D78" strokeWidth="1.2" />
          <text x="90" y="33" fill="#5EEAD4" fontSize="7" fontFamily="monospace" fontWeight="700">ALGO ENGINE</text>
          <text x="90" y="42" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">O(log n) · SHARDED</text>
          <text x="90" y="50" fill="#2DD4BF" fontSize="6.5" fontFamily="monospace">SYNC ACTIVE</text>

          <path d="M146 38 h 26" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="159" cy="38" r="2.5" fill="#38BDF8" />

          <rect x="172" y="24" width="56" height="28" rx="4" fill="#0B132B" stroke="#0284C7" strokeWidth="1" />
          <text x="178" y="37" fill="#38BDF8" fontSize="7" fontFamily="monospace" fontWeight="700">DATA STORE</text>
          <text x="178" y="46" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">REPLICATED</text>
        </svg>
      ),
    },
    {
      code: "ENG-MEC",
      faculty: "CEDAT Engineering",
      title: "Mathematics & Engineering",
      category: "Planar truss mechanics, finite element analysis, thermodynamics, calculus & fluid dynamics.",
      query: "Engineering",
      count: "78 Units",
      svgGraphic: (
        <svg viewBox="0 0 240 70" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
          <pattern id="grid-eng" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#1E293B" strokeWidth="0.5" />
          </pattern>
          <rect width="240" height="70" fill="url(#grid-eng)" />
          {/* Header Metric Line */}
          <text x="10" y="13" fill="#64748B" fontSize="7.5" fontFamily="monospace" fontWeight="600">CAD :: TRUSS-STATICS-ANALYSIS</text>
          <text x="180" y="13" fill="#F59E0B" fontSize="7.5" fontFamily="monospace" fontWeight="600">ΣF = 0 · 48.2 kN</text>
          {/* Planar Truss Schematic */}
          <path d="M20 54 L60 22 L100 54 L140 22 L180 54 L220 22" stroke="#6366F1" strokeWidth="1.5" />
          <path d="M20 54 L220 54" stroke="#4F46E5" strokeWidth="1.5" />
          <path d="M60 22 L140 22 M140 22 L220 22" stroke="#4F46E5" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="60" y1="22" x2="60" y2="54" stroke="#818CF8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="140" y1="22" x2="140" y2="54" stroke="#818CF8" strokeWidth="1" strokeDasharray="2 2" />

          {/* Truss Nodes */}
          {[20, 60, 100, 140, 180, 220].map((cx, i) => (
            <circle key={i} cx={cx} cy={cx % 80 === 60 || cx === 220 ? 22 : 54} r="3" fill="#1E1B4B" stroke="#A5B4FC" strokeWidth="1.5" />
          ))}

          {/* Reaction Force Vector */}
          <path d="M20 62 L20 56" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 58 L20 54 L22 58" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <text x="26" y="63" fill="#10B981" fontSize="6.5" fontFamily="monospace" fontWeight="700">R_A</text>

          <path d="M180 62 L180 56" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          <path d="M178 58 L180 54 L182 58" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <text x="186" y="63" fill="#10B981" fontSize="6.5" fontFamily="monospace" fontWeight="700">R_B</text>
        </svg>
      ),
    },
    {
      code: "MED-SCI",
      faculty: "CHS Health Sciences",
      title: "Science & Medicine",
      category: "Clinical pathology, human anatomy, biochemical pathways, pharmacology & public health.",
      query: "Health",
      count: "52 Units",
      svgGraphic: (
        <svg viewBox="0 0 240 70" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
          <pattern id="grid-med" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#1E293B" strokeWidth="0.5" />
          </pattern>
          <rect width="240" height="70" fill="url(#grid-med)" />
          {/* Header Metric Line */}
          <text x="10" y="13" fill="#64748B" fontSize="7.5" fontFamily="monospace" fontWeight="600">LAB :: SPECTRAL-LATTICE-CHS</text>
          <text x="180" y="13" fill="#F43F5E" fontSize="7.5" fontFamily="monospace" fontWeight="600">λ = 540nm · ISO</text>

          {/* Molecular Lattice / Biochemical Wave */}
          <path d="M 15 38 Q 40 18, 65 38 T 115 38 T 165 38 T 215 38" fill="none" stroke="#FB7185" strokeWidth="1.5" />
          <path d="M 15 38 Q 40 58, 65 38 T 115 38 T 165 38 T 215 38" fill="none" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Connecting Base Pairs */}
          {[30, 55, 80, 105, 130, 155, 180, 205].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="28" x2={x} y2="48" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="1.5 1.5" />
              <circle cx={x} cy={i % 2 === 0 ? 28 : 48} r="2.5" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1" />
            </g>
          ))}
          <text x="12" y="63" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">BASE SYNTHESIS: ADENINE · GUANINE</text>
        </svg>
      ),
    },
    {
      code: "FIN-ACC",
      faculty: "MUBS Business",
      title: "Business & Economics",
      category: "Corporate financial management, auditing, taxation, macroeconomics & capital markets.",
      query: "Accounting",
      count: "86 Units",
      svgGraphic: (
        <svg viewBox="0 0 240 70" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
          <pattern id="grid-fin" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#1E293B" strokeWidth="0.5" />
          </pattern>
          <rect width="240" height="70" fill="url(#grid-fin)" />
          {/* Header Metric Line */}
          <text x="10" y="13" fill="#64748B" fontSize="7.5" fontFamily="monospace" fontWeight="600">MKT :: LIQUIDITY-FLOW-UGX</text>
          <text x="180" y="13" fill="#10B981" fontSize="7.5" fontFamily="monospace" fontWeight="600">Δ +18.4% YIELD</text>

          {/* Baseline Grid */}
          <line x1="12" y1="58" x2="228" y2="58" stroke="#334155" strokeWidth="1" />

          {/* Fintech Candlesticks */}
          {[
            { x: 25, high: 22, low: 52, open: 42, close: 30, up: true },
            { x: 50, high: 28, low: 56, open: 34, close: 46, up: false },
            { x: 75, high: 18, low: 48, open: 38, close: 24, up: true },
            { x: 100, high: 24, low: 54, open: 28, close: 40, up: false },
            { x: 125, high: 16, low: 44, open: 34, close: 20, up: true },
            { x: 150, high: 14, low: 42, open: 24, close: 18, up: true },
            { x: 175, high: 20, low: 46, open: 22, close: 32, up: false },
            { x: 200, high: 12, low: 38, open: 28, close: 16, up: true },
          ].map((bar, i) => (
            <g key={i}>
              <line x1={bar.x + 4} y1={bar.high} x2={bar.x + 4} y2={bar.low} stroke={bar.up ? "#10B981" : "#EF4444"} strokeWidth="1" />
              <rect
                x={bar.x}
                y={Math.min(bar.open, bar.close)}
                width="8"
                height={Math.max(4, Math.abs(bar.close - bar.open))}
                rx="1"
                fill={bar.up ? "#059669" : "#DC2626"}
                stroke={bar.up ? "#34D399" : "#F87171"}
                strokeWidth="0.8"
              />
            </g>
          ))}

          {/* Exponential Moving Average Trendline */}
          <path d="M 20 44 Q 60 40, 100 32 T 180 20 T 225 14" fill="none" stroke="#38BDF8" strokeWidth="1.8" />
          <circle cx="225" cy="14" r="2.5" fill="#38BDF8" />
        </svg>
      ),
    },
    {
      code: "LAW-JUR",
      faculty: "School of Law (SoL)",
      title: "Law & Constitutional Studies",
      category: "Constitutional governance, criminal jurisprudence, corporate contracts, civil procedure & evidence.",
      query: "Law",
      count: "71 Units",
      svgGraphic: (
        <svg viewBox="0 0 240 70" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
          <pattern id="grid-law" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#1E293B" strokeWidth="0.5" />
          </pattern>
          <rect width="240" height="70" fill="url(#grid-law)" />
          {/* Header Metric Line */}
          <text x="10" y="13" fill="#64748B" fontSize="7.5" fontFamily="monospace" fontWeight="600">JUR :: STATUTORY-EQUILIBRIUM</text>
          <text x="180" y="13" fill="#EAB308" fontSize="7.5" fontFamily="monospace" fontWeight="600">ART. 79 CONST</text>

          {/* Precision Scales of Justice Schematic */}
          <line x1="120" y1="18" x2="120" y2="58" stroke="#CA8A04" strokeWidth="2" />
          <line x1="105" y1="58" x2="135" y2="58" stroke="#CA8A04" strokeWidth="2" />
          <line x1="60" y1="26" x2="180" y2="26" stroke="#EAB308" strokeWidth="1.8" />

          {/* Center Pivot */}
          <circle cx="120" cy="26" r="3.5" fill="#FEF08A" stroke="#A16207" strokeWidth="1.5" />

          {/* Left Pan */}
          <line x1="60" y1="26" x2="48" y2="42" stroke="#CA8A04" strokeWidth="1" />
          <line x1="60" y1="26" x2="72" y2="42" stroke="#CA8A04" strokeWidth="1" />
          <path d="M 44 42 Q 60 50, 76 42 Z" fill="#713F12" stroke="#FACC15" strokeWidth="1" />

          {/* Right Pan */}
          <line x1="180" y1="26" x2="168" y2="42" stroke="#CA8A04" strokeWidth="1" />
          <line x1="180" y1="26" x2="192" y2="42" stroke="#CA8A04" strokeWidth="1" />
          <path d="M 164 42 Q 180 50, 196 42 Z" fill="#713F12" stroke="#FACC15" strokeWidth="1" />

          {/* Statutory Hierarchy Indicator */}
          <text x="15" y="63" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">RATIO DECIDENDI · STARE DECISIS</text>
        </svg>
      ),
    },
    {
      code: "EDU-HUM",
      faculty: "CEES Education",
      title: "Education & Humanities",
      category: "Curriculum theory, educational psychology, instructional methodologies, ethics & linguistics.",
      query: "Education",
      count: "64 Units",
      svgGraphic: (
        <svg viewBox="0 0 240 70" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
          <pattern id="grid-edu" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#1E293B" strokeWidth="0.5" />
          </pattern>
          <rect width="240" height="70" fill="url(#grid-edu)" />
          {/* Header Metric Line */}
          <text x="10" y="13" fill="#64748B" fontSize="7.5" fontFamily="monospace" fontWeight="600">PED :: CURRICULUM-TAXONOMY</text>
          <text x="180" y="13" fill="#38BDF8" fontSize="7.5" fontFamily="monospace" fontWeight="600">4.0 CU / MOD</text>

          {/* Modular Learning Tree */}
          <rect x="20" y="30" width="46" height="22" rx="3" fill="#0B132B" stroke="#0284C7" strokeWidth="1" />
          <text x="24" y="44" fill="#38BDF8" fontSize="6.5" fontFamily="monospace" fontWeight="700">PEDAGOGY</text>

          <path d="M66 41 h 24" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="2 2" />

          <rect x="90" y="22" width="60" height="38" rx="3" fill="#0B132B" stroke="#147D78" strokeWidth="1.2" />
          <text x="95" y="35" fill="#5EEAD4" fontSize="6.5" fontFamily="monospace" fontWeight="700">INSTRUCTION</text>
          <text x="95" y="45" fill="#94A3B8" fontSize="6" fontFamily="monospace">COGNITIVE DOMAIN</text>
          <text x="95" y="53" fill="#2DD4BF" fontSize="6" fontFamily="monospace">ASSESSMENT MATRIX</text>

          <path d="M150 41 h 24" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="2 2" />

          <rect x="174" y="30" width="52" height="22" rx="3" fill="#0B132B" stroke="#0284C7" strokeWidth="1" />
          <text x="178" y="44" fill="#38BDF8" fontSize="6.5" fontFamily="monospace" fontWeight="700">MASTERY</text>
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

      {/* 3. Learning Resources Section - High-End Fintech Design (Zero Emojis) */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0B1528] px-3.5 py-1 text-[11px] font-mono font-semibold text-teal-400 border border-slate-800 shadow-sm">
            <Layers className="h-3.5 w-3.5 text-teal-400" />
            <span>ACADEMIC CURRICULUM ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B1528]">
            Learning Resources
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Faculty-aligned course units with authentic lecture outlines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {learningResources.map((res, idx) => (
            <Link
              key={idx}
              href={`/catalogue?q=${encodeURIComponent(res.query)}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_32px_-6px_rgba(20,125,120,0.14)] hover:border-[#147D78]/60 transition-all duration-300 overflow-hidden"
            >
              {/* Card Header Taxonomy */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                      {res.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 truncate">
                      {res.faculty}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                    {res.count}
                  </span>
                </div>

                {/* Precision Fintech Dark Schematic Graphic */}
                <div className="h-24 w-full mb-3.5 rounded-xl border border-slate-900 bg-[#070D18] p-1 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-[#147D78]/50 transition-colors">
                  {res.svgGraphic}
                </div>

                {/* Card Title & Syllabus Summary */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0B1528] group-hover:text-[#147D78] transition-colors leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    {res.category}
                  </p>
                </div>
              </div>

              {/* Card Footer Micro-Interaction */}
              <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                  Lecture Outlines &amp; Notes
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[#147D78] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                  <span>Curriculum</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>



      {/* 5. Core Platform Features - Clean, High-Impact Showcase */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:border-teal-300 hover:shadow-md transition">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Zero-Data Offline Reading</h3>
                <span className="text-xs font-mono font-semibold text-teal-700">Encrypted Local Storage</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              Download notes once on campus Wi-Fi. Access study materials anywhere without active data bundles.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:border-amber-300 hover:shadow-md transition">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-[#E9B949] flex items-center justify-center shrink-0 border border-amber-100">
                <Highlighter className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Highlighting &amp; Notes</h3>
                <span className="text-xs font-mono font-semibold text-amber-700">Revision Workspace</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              Color-code examination concepts, tag definitions, and save personal margin summaries directly on each page.
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
                    className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-teal-700" : ""
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
