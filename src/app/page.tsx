"use client";

import React, { useState, useEffect } from "react";
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
  Users,
  WifiOff,
  Code2,
  Compass,
  Stethoscope,
  Briefcase,
  Scale,
  Award,
  Layers,
  Check,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [studentContact, setStudentContact] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // High-performance, zero-rerender native IntersectionObserver for fluid section reveals
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const elements = document.querySelectorAll(".reveal-element");

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
      a: "Once unlocked via MTN or Airtel Mobile Money, materials are saved to your secure offline cache with cryptographic access keys. You can read, highlight, and review notes anywhere without an active data bundle.",
    },
    {
      q: "How are university lecturers verified?",
      a: "Lecturers submit their university credentials and faculty affiliation. Our academic desk verifies credentials before publishing and withdrawal privileges are activated.",
    },
    {
      q: "Can I preview documents before purchasing?",
      a: "Yes. Every document includes a free multi-page preview with the course outline, syllabus breakdown, and sample topic pages before any payment is made.",
    },
    {
      q: "What payment methods are supported in Uganda?",
      a: "We support instant push-prompt payments on both MTN Uganda Mobile Money and Airtel Money Uganda.",
    },
  ];

  // Authentic Academic Categories with Distinct, Bright & Colorful Palettes
  const academicCategories = [
    {
      code: "TECH-CS",
      faculty: "Computing & Informatics",
      title: "Technology & Computing",
      description:
        "Data structures, algorithms, database engines, computer networks, systems programming and software engineering.",
      query: "Computer Science",
      icon: Code2,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      iconBg: "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25",
      accentBorder: "hover:border-blue-500 hover:shadow-blue-500/10",
      linkText: "text-blue-600 group-hover:text-blue-700",
      codeBadge: "text-blue-700 bg-blue-50 border-blue-100",
    },
    {
      code: "ENG-TECH",
      faculty: "Engineering & Applied Sciences",
      title: "Engineering & Mechanics",
      description:
        "Engineering statics, dynamics, structural analysis, thermodynamics, calculus and circuit theory.",
      query: "Engineering",
      icon: Compass,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25",
      accentBorder: "hover:border-amber-500 hover:shadow-amber-500/10",
      linkText: "text-amber-600 group-hover:text-amber-700",
      codeBadge: "text-amber-700 bg-amber-50 border-amber-100",
    },
    {
      code: "MED-HLTH",
      faculty: "Health Sciences & Medicine",
      title: "Health & Clinical Sciences",
      description:
        "Clinical anatomy, physiology, pathology, pharmacology, epidemiology and public healthcare administration.",
      query: "Health",
      icon: Stethoscope,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25",
      accentBorder: "hover:border-emerald-500 hover:shadow-emerald-500/10",
      linkText: "text-emerald-600 group-hover:text-emerald-700",
      codeBadge: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      code: "BUS-ECON",
      faculty: "Business & Management",
      title: "Business & Financial Economics",
      description:
        "Corporate financial management, auditing, taxation, macroeconomics, capital budgeting and market theory.",
      query: "Accounting",
      icon: Briefcase,
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      iconBg: "bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25",
      accentBorder: "hover:border-purple-500 hover:shadow-purple-500/10",
      linkText: "text-purple-600 group-hover:text-purple-700",
      codeBadge: "text-purple-700 bg-purple-50 border-purple-100",
    },
    {
      code: "LAW-JUR",
      faculty: "School of Law",
      title: "Law & Constitutional Studies",
      description:
        "Constitutional governance, criminal jurisprudence, commercial contracts, civil procedure and judicial precedent.",
      query: "Law",
      icon: Scale,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      iconBg: "bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25",
      accentBorder: "hover:border-rose-500 hover:shadow-rose-500/10",
      linkText: "text-rose-600 group-hover:text-rose-700",
      codeBadge: "text-rose-700 bg-rose-50 border-rose-100",
    },
    {
      code: "EDU-HUM",
      faculty: "Education & Humanities",
      title: "Education & Pedagogical Sciences",
      description:
        "Curriculum development, instructional methods, developmental psychology, educational ethics and language studies.",
      query: "Education",
      icon: GraduationCap,
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      iconBg: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25",
      accentBorder: "hover:border-cyan-500 hover:shadow-cyan-500/10",
      linkText: "text-cyan-600 group-hover:text-cyan-700",
      codeBadge: "text-cyan-700 bg-cyan-50 border-cyan-100",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-20 bg-[#FAFCFB] text-slate-900">
      {/* 1. Hero Section - Bright, Radiant Gradient & High-Contrast Design */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-100/60 via-teal-50/40 to-white pt-10 sm:pt-16 pb-12 sm:pb-20 border-b border-emerald-100/80">
        {/* Colorful Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-r from-emerald-200/40 via-teal-200/30 to-amber-200/30 blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left reveal-element revealed">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 border border-emerald-300/60 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-xs">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Uganda Higher Education Academic Exchange</span>
              </div>

              {/* Bold, Vivid, High-Contrast Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight sm:leading-[1.12]">
                Authentic university notes, directly from your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                  lecturers.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Access faculty-authored lecture summaries, revision guides, and past examination papers. Preview chapters for free and unlock instantly with MTN or Airtel Mobile Money.
              </p>

              {/* Search Bar with Vivid Emerald Accent */}
              <form
                action="/catalogue"
                method="GET"
                className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0 pt-1"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-700" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search course code or title (e.g. BBA 1204)..."
                    className="w-full h-12 rounded-xl border-2 border-emerald-200 bg-white pl-10 pr-4 text-base sm:text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition font-medium placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition shrink-0 touch-target"
                >
                  <span>Search Notes</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Colorful Popular Units */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-600 pt-1">
                <span className="font-bold text-slate-800">Popular Units:</span>
                <Link
                  href="/catalogue?q=BBA%201204"
                  className="rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 text-xs font-mono font-bold transition shadow-2xs"
                >
                  BBA 1204
                </Link>
                <Link
                  href="/catalogue?q=CSC%201100"
                  className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 text-xs font-mono font-bold transition shadow-2xs"
                >
                  CSC 1100
                </Link>
                <Link
                  href="/catalogue?q=MEC%202101"
                  className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-mono font-bold transition shadow-2xs"
                >
                  MEC 2101
                </Link>
                <Link
                  href="/catalogue?q=LAW%201101"
                  className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 text-xs font-mono font-bold transition shadow-2xs"
                >
                  LAW 1101
                </Link>
                <Link
                  href="/catalogue?q=ACC%202102"
                  className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-mono font-bold transition shadow-2xs"
                >
                  ACC 2102
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] px-6 text-sm font-black text-white transition shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/20 touch-target"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore Study Materials</span>
                </Link>

                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-600/40 bg-white hover:bg-emerald-50/70 px-6 text-sm font-bold text-emerald-900 transition shadow-xs touch-target"
                >
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  <span>For Lecturers</span>
                </Link>
              </div>

              {/* Colorful Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full shadow-2xs">
                  <Smartphone className="h-3.5 w-3.5 text-amber-600 shrink-0" /> MTN &amp; Airtel Mobile Money
                </span>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200/80 px-3 py-1 rounded-full shadow-2xs">
                  <WifiOff className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Zero-Data Offline Reading
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Verified University Faculty
                </span>
              </div>
            </div>

            {/* Right Column: IMAGE 1 (hero-students.jpg) */}
            <div className="lg:col-span-5 reveal-element revealed">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white group ring-4 ring-emerald-500/10">
                <div className="relative h-[250px] sm:h-[350px] md:h-[410px] w-full">
                  <Image
                    src="/images/hero-students.jpg"
                    alt="University students studying together in a modern campus library"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                </div>

                {/* Caption Card */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl sm:rounded-2xl bg-white/95 border border-emerald-100 p-3.5 backdrop-blur-md shadow-lg flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                      <GraduationCap className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">Campus Study Circle</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 truncate">
                      Higher Education Academic Notes
                    </div>
                  </div>
                  <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 text-xs font-bold shrink-0 shadow-xs">
                    Verified Notes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar - Bright & Distinct Color Cards */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 reveal-element">
          {/* Metric 1: Verified Units */}
          <div className="rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-white to-white p-4 sm:p-5 text-center shadow-xs hover:shadow-md hover:border-emerald-500 transition-all duration-300">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold mb-2">
              <Layers className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">400+</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Verified Course Units</div>
          </div>

          {/* Metric 2: Offline Reading */}
          <div className="rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-white to-white p-4 sm:p-5 text-center shadow-xs hover:shadow-md hover:border-blue-500 transition-all duration-300">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold mb-2">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">100%</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Offline Encrypted Reading</div>
          </div>

          {/* Metric 3: Mobile Money */}
          <div className="rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-white p-4 sm:p-5 text-center shadow-xs hover:shadow-md hover:border-amber-500 transition-all duration-300">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold mb-2">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700">MTN &amp; Airtel</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Instant Push Payments</div>
          </div>

          {/* Metric 4: Free Student Access */}
          <div className="rounded-2xl border-2 border-purple-200/80 bg-gradient-to-br from-purple-50/80 via-white to-white p-4 sm:p-5 text-center shadow-xs hover:shadow-md hover:border-purple-500 transition-all duration-300">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold mb-2">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-700">0 UGX</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Student Platform Fee</div>
          </div>
        </div>
      </section>

      {/* 3. Academic Category Cards - Bright, Colourful, Distinct Cards */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl" id="academic-disciplines">
        <div className="text-center max-w-lg mx-auto mb-8 sm:mb-10 space-y-2 reveal-element">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
            <Layers className="h-3.5 w-3.5 text-emerald-700" />
            <span>ACADEMIC DISCIPLINES</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Explore Faculty Course Materials
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
            Browse examination-focused lecture summaries and course units aligned with higher education syllabi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {academicCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            const staggerClass = `stagger-${idx + 1}`;
            return (
              <Link
                key={idx}
                href={`/catalogue?q=${encodeURIComponent(cat.query)}`}
                className={`group relative flex flex-col justify-between rounded-2xl border-2 border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-lg ${cat.accentBorder} active:scale-[0.99] transition-all duration-300 reveal-element ${staggerClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          {cat.faculty}
                        </span>
                        <span className={`inline-block text-xs font-mono font-black px-2 py-0.5 rounded-md mt-0.5 border ${cat.codeBadge}`}>
                          {cat.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2 font-normal">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 group-hover:text-slate-900 transition-colors">
                    Browse Units
                  </span>
                  <span className={`inline-flex items-center gap-1 font-black ${cat.linkText} group-hover:translate-x-1.5 transition-transform duration-200`}>
                    <span>View Notes</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Feature Section with IMAGE 2 (students-library.jpg) - Verified Faculty */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl" id="how-it-works">
        <div className="rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 p-6 sm:p-8 lg:p-12 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: IMAGE 2 (students-library.jpg) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl group ring-4 ring-emerald-500/10">
                <div className="relative h-[240px] sm:h-[320px] lg:h-[400px] w-full">
                  <Image
                    src="/images/students-library.jpg"
                    alt="University students collaborating over course notes at a campus library study table"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 p-3.5 backdrop-blur-md border border-emerald-100 shadow-md">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Curriculum-Aligned Study Materials</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5 truncate">
                    Authored and reviewed by university faculty
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Clean, Colorful Heading and Features */}
            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
                <Award className="h-3.5 w-3.5 text-emerald-700" />
                <span>ACADEMIC VERIFICATION</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Authentic course notes authored by your departmental lecturers.
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed">
                Study with confidence using revision notes, worked examination solutions, and syllabus summaries uploaded directly by accredited lecturers.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/80 border border-emerald-100 shadow-xs">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Departmental Affiliation Verification</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Every publishing educator is vetted to ensure materials reflect actual university exam requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/80 border border-blue-100 shadow-xs">
                  <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Free Sample Chapter Previews</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Inspect the document outline, table of contents, and key pages before making any purchase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/80 border border-amber-100 shadow-xs">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Direct Mobile Money Withdrawals</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Lecturers receive net royalties directly on MTN and Airtel Mobile Money upon student purchases.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition touch-target"
                >
                  <span>Become a Verified Lecturer</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feature Section with IMAGE 3 (study-group.jpg) - Zero-Data Offline Reading */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 p-6 sm:p-8 lg:p-12 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Offline Reading Features */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-xs font-bold text-blue-800 border border-blue-200 shadow-2xs">
                <WifiOff className="h-3.5 w-3.5 text-blue-700" />
                <span>OFFLINE ACCESSIBILITY</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Study anywhere with Zero-Data offline reading and revision tools.
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed">
                Download your unlocked course notes once on campus Wi-Fi and access your materials anywhere without requiring an active data connection.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 to-white p-4 space-y-2 shadow-xs">
                  <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Download className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Local Encrypted Storage</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Documents are stored securely on your device with cryptographic keys for instant offline access.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-4 space-y-2 shadow-xs">
                  <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <Highlighter className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Active Highlighting &amp; Notes</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tag exam definitions, highlight statutory principles, and save personal margin annotations.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition touch-target"
                >
                  <BookOpen className="h-4 w-4 text-amber-300" />
                  <span>Start Reading Offline</span>
                </Link>
              </div>
            </div>

            {/* Right Column: IMAGE 3 (study-group.jpg) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl group ring-4 ring-blue-500/10">
                <div className="relative h-[240px] sm:h-[320px] lg:h-[400px] w-full">
                  <Image
                    src="/images/study-group.jpg"
                    alt="Five university students revising together with course notebooks, textbooks and laptop"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 p-3.5 backdrop-blur-md border border-blue-100 shadow-md">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                    <Users className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">Peer Study &amp; Revision</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5 truncate">
                    Collaborate and prepare for semester examinations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Academic Community & Peer Tutors Desk - Colorful Vibrant Cards */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 reveal-element">
          <Link
            href="/student/community"
            className="rounded-2xl border-2 border-purple-200/90 bg-gradient-to-r from-purple-50/70 via-white to-purple-50/30 p-5 shadow-xs hover:border-purple-500 hover:shadow-md active:scale-[0.99] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-purple-700 transition truncate">
                  Academic Community
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">
                  Peer study groups, past paper discussions, and departmental Q&amp;A.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1.5 transition shrink-0" />
          </Link>

          <Link
            href="/student/tutors"
            className="rounded-2xl border-2 border-emerald-200/90 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/30 p-5 shadow-xs hover:border-emerald-500 hover:shadow-md active:scale-[0.99] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition truncate">
                  Peer Tutors Desk
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">
                  Book 1-on-1 revision sessions with top department students.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-1.5 transition shrink-0" />
          </Link>
        </div>
      </section>

      {/* 7. Course Unit Request Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30 text-slate-900 p-6 sm:p-10 shadow-md border-2 border-teal-200/80 reveal-element">
          <div className="text-center max-w-md mx-auto mb-6 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-100 border border-teal-200 px-3.5 py-1 rounded-full shadow-2xs">
              <span>Course Coordinator Desk</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">
              Can&apos;t find your specific course unit?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Submit your course code and institution. We will contact relevant departmental lecturers to upload notes.
            </p>
          </div>

          {requestSent ? (
            <div className="rounded-2xl bg-emerald-100/90 border border-emerald-300 p-6 text-center space-y-2 max-w-sm mx-auto shadow-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-700 mx-auto" />
              <p className="text-base font-black text-emerald-900">Course Request Logged</p>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                Our academic coordinators have received your request and will follow up with faculty educators.
              </p>
              <button
                type="button"
                onClick={() => setRequestSent(false)}
                className="text-xs text-emerald-800 underline font-bold pt-1 touch-target"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit} className="max-w-md mx-auto space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Course code (e.g. MEC 2101)"
                  className="h-12 rounded-xl bg-white border-2 border-slate-200 px-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition font-medium w-full shadow-2xs"
                />
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course unit title"
                  className="h-12 rounded-xl bg-white border-2 border-slate-200 px-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition font-medium w-full shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="University / Institute"
                  className="h-12 rounded-xl bg-white border-2 border-slate-200 px-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition font-medium w-full shadow-2xs"
                />
                <input
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="Phone or Email (Optional)"
                  className="h-12 rounded-xl bg-white border-2 border-slate-200 px-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition font-medium w-full shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-black transition shadow-md shadow-teal-600/25 touch-target"
              >
                {submittingRequest ? "Submitting..." : "Submit Course Request"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center max-w-sm mx-auto mb-6 sm:mb-8 space-y-1 reveal-element">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Common questions on accessing notes, offline reading, and lecturer publishing.
          </p>
        </div>

        <div className="space-y-2.5 reveal-element">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                  isOpen ? "border-emerald-500 bg-white shadow-sm" : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-900 hover:bg-emerald-50/50 transition min-h-[48px] touch-target"
                >
                  <span className="pr-2">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-emerald-600" : "text-slate-400"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-700 border-t border-slate-100 pt-3 leading-relaxed font-normal bg-emerald-50/20">
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
