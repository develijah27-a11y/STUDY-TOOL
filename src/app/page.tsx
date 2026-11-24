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
} from "lucide-react";

export default function HomePage() {
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [studentContact, setStudentContact] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Real-time smooth scroll position and scroll progress tracking
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const progress =
            totalHeight > 0
              ? Math.min(1, Math.max(0, currentY / totalHeight))
              : 0;

          setScrollY(currentY);
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Native IntersectionObserver for fluid staggered element and word entry
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
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
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
      a: "Once unlocked via MTN or Airtel Mobile Money, materials are stored securely in your browser cache with cryptographic local access keys. You can read, highlight, and review notes anywhere without an active data bundle.",
    },
    {
      q: "How are university lecturers verified?",
      a: "Lecturers submit their official university credentials and departmental affiliation. The academic coordinator desk validates faculty credentials before publishing privileges are granted.",
    },
    {
      q: "Can I preview documents before purchasing?",
      a: "Yes. Every document includes a multi-page preview featuring the full syllabus outline, table of contents, and sample core topic pages before payment.",
    },
    {
      q: "What payment methods are supported in Uganda?",
      a: "We support instant push-prompt payments on both MTN Uganda Mobile Money and Airtel Money Uganda.",
    },
  ];

  // Genuine Academic Categories
  const academicCategories = [
    {
      code: "TECH-CS",
      faculty: "Computing & Informatics",
      title: "Technology & Computing",
      description:
        "Data structures, algorithmic complexity, database engines, computer networks, systems programming & software engineering.",
      query: "Computer Science",
      icon: Code2,
    },
    {
      code: "ENG-TECH",
      faculty: "Engineering & Built Environment",
      title: "Engineering & Applied Sciences",
      description:
        "Engineering statics, dynamics, finite element analysis, thermodynamics, structural mechanics & electrical circuits.",
      query: "Engineering",
      icon: Compass,
    },
    {
      code: "MED-HLTH",
      faculty: "Health Sciences & Medicine",
      title: "Health & Medical Sciences",
      description:
        "Clinical anatomy, physiological pathways, pathology, pharmacology, epidemiology & public healthcare practice.",
      query: "Health",
      icon: Stethoscope,
    },
    {
      code: "BUS-ECON",
      faculty: "Business & Management",
      title: "Business & Financial Economics",
      description:
        "Corporate financial management, auditing, taxation, macroeconomics, capital budgeting & international trade.",
      query: "Accounting",
      icon: Briefcase,
    },
    {
      code: "LAW-JUR",
      faculty: "School of Law",
      title: "Law & Constitutional Studies",
      description:
        "Constitutional governance, criminal jurisprudence, commercial contracts, civil procedure & judicial precedent.",
      query: "Law",
      icon: Scale,
    },
    {
      code: "EDU-HUM",
      faculty: "Education & Humanities",
      title: "Education & Humanities",
      description:
        "Curriculum theory, instructional methodologies, developmental psychology, educational ethics & linguistics.",
      query: "Education",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="relative space-y-12 sm:space-y-24 pb-28 sm:pb-20 bg-[#F8FAF9] text-[#172B27] overflow-x-hidden">
      {/* Real-time Top Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#16866A] to-[#116B55] z-50 origin-left pointer-events-none transition-transform duration-75"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* 1. Hero Section - Mobile-First Polish with Moving Words */}
      <section className="relative bg-gradient-to-b from-white via-[#F8FAF9] to-[#F4F7F6] pt-8 sm:pt-20 pb-12 sm:pb-24 border-b border-[#E2ECE7]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left reveal-element revealed">
              <div
                className="inline-flex items-center gap-2 rounded-full bg-[#E8F5EF] border border-[#CDE5DA] px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-[#16866A] shadow-2xs transition-transform duration-300"
                style={{ transform: `translateY(${Math.min(8, scrollY * 0.03)}px)` }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#16866A] shrink-0" />
                <span className="truncate">Uganda Higher Education Academic Exchange</span>
              </div>

              {/* Animated Moving Words Headline */}
              <h1
                className="text-[28px] sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#172B27] leading-[1.2] sm:leading-[1.18] transition-transform duration-300"
                style={{ transform: `translateY(${Math.min(16, scrollY * 0.05)}px)` }}
              >
                <span className="word-reveal delay-1">Authentic</span>{" "}
                <span className="word-reveal delay-2">university</span>{" "}
                <span className="word-reveal delay-3">notes,</span>{" "}
                <span className="word-reveal delay-4 text-[#16866A]">directly</span>{" "}
                <span className="word-reveal delay-5">from</span>{" "}
                <span className="word-reveal delay-6">your</span>{" "}
                <span className="word-reveal delay-7">lecturers.</span>
              </h1>

              <p
                className="text-sm sm:text-base lg:text-lg text-[#64736D] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal transition-transform duration-300"
                style={{ transform: `translateY(${Math.min(10, scrollY * 0.03)}px)` }}
              >
                Access faculty-authored lecture summaries, revision guides, and past examination papers. Preview chapters for free and unlock instantly with MTN or Airtel Mobile Money.
              </p>

              {/* Mobile-Ergonomic Search Bar (Prevents iOS zoom with text-base) */}
              <form
                action="/catalogue"
                method="GET"
                className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0 pt-1"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#89958F]" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search course code or title (e.g. BBA 1204)..."
                    className="w-full h-12 rounded-xl border border-[#CDE5DA] bg-white pl-10 pr-4 text-base sm:text-sm text-[#172B27] shadow-sm outline-none focus:border-[#16866A] focus:ring-2 focus:ring-[#16866A]/20 transition font-medium placeholder:text-[#89958F]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#16866A] hover:bg-[#116B55] active:scale-[0.98] px-6 text-sm font-bold text-white shadow-sm transition-all shrink-0 touch-target"
                >
                  <span>Search Notes</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Popular Units */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-[#64736D] pt-1">
                <span className="font-semibold text-[#89958F] text-[11px] sm:text-xs">Popular:</span>
                {["BBA 1204", "CSC 1100", "MEC 2101", "LAW 1101", "ACC 2102"].map((code) => (
                  <Link
                    key={code}
                    href={`/catalogue?q=${encodeURIComponent(code)}`}
                    className="rounded-lg bg-white hover:bg-[#E8F5EF] hover:text-[#16866A] active:bg-[#E8F5EF] px-2.5 py-1 text-xs font-mono font-medium text-[#172B27] border border-[#E2ECE7] shadow-2xs transition"
                  >
                    {code}
                  </Link>
                ))}
              </div>

              {/* Action Buttons - Stacked on Mobile, Row on Desktop */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#16866A] hover:bg-[#116B55] active:scale-[0.98] px-6 text-sm font-bold text-white transition shadow-sm touch-target"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore Study Materials</span>
                </Link>

                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-[#CDE5DA] bg-white hover:bg-[#E8F5EF] active:bg-[#E8F5EF] px-6 text-sm font-bold text-[#172B27] transition shadow-2xs touch-target"
                >
                  <GraduationCap className="h-4 w-4 text-[#16866A]" />
                  <span>For Lecturers</span>
                </Link>
              </div>

              {/* Trust Badges - Mobile Responsive Wrap */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 pt-2 text-[11px] sm:text-xs text-[#64736D]">
                <span className="inline-flex items-center gap-1.5 font-medium bg-white/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-[#E2ECE7] sm:border-0">
                  <Smartphone className="h-3.5 w-3.5 text-[#16866A] shrink-0" /> MTN &amp; Airtel
                </span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-[#CDE5DA]" />
                <span className="inline-flex items-center gap-1.5 font-medium bg-white/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-[#E2ECE7] sm:border-0">
                  <WifiOff className="h-3.5 w-3.5 text-[#16866A] shrink-0" /> Offline Reading
                </span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-[#CDE5DA]" />
                <span className="inline-flex items-center gap-1.5 font-medium bg-white/70 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-[#E2ECE7] sm:border-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#16866A] shrink-0" /> Verified Faculty
                </span>
              </div>
            </div>

            {/* Right Column: IMAGE 1 (hero-students.jpg) - Mobile Responsive Aspect Ratio */}
            <div
              className="lg:col-span-5 reveal-element revealed transition-transform duration-500 ease-out"
              style={{ transform: `translateY(${Math.min(24, scrollY * 0.05)}px)` }}
            >
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-white shadow-lg sm:shadow-xl bg-white group">
                <div className="relative h-[220px] sm:h-[320px] md:h-[400px] w-full">
                  <Image
                    src="/images/hero-students.jpg"
                    alt="University students studying together in a modern campus library"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172B27]/85 via-[#172B27]/20 to-transparent" />
                </div>

                {/* Floating Caption Overlay - Compact on Mobile */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl sm:rounded-2xl bg-white/95 border border-[#E2ECE7] p-2.5 sm:p-3.5 backdrop-blur-md shadow-md flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="text-[11px] sm:text-xs font-bold text-[#172B27] flex items-center gap-1.5 truncate">
                      <GraduationCap className="h-3.5 w-3.5 text-[#16866A] shrink-0" />
                      <span className="truncate">Campus Study Circle</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#64736D] truncate">
                      Makerere · Kyambogo · MUST · MUBS
                    </div>
                  </div>
                  <span className="rounded-lg bg-[#E8F5EF] border border-[#CDE5DA] text-[#16866A] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold shrink-0">
                    Verified Notes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Kinetic Moving Words Ribbons - Smooth & Overflow-Safe on Mobile */}
      <section className="w-full overflow-hidden py-3 sm:py-4 bg-gradient-to-r from-[#F4F7F6] via-[#E8F5EF] to-[#F4F7F6] border-y border-[#E2ECE7] select-none">
        {/* Ribbon 1: Leftward moving stream */}
        <div
          className="flex whitespace-nowrap text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#172B27] py-0.5 sm:py-1 transition-transform duration-100 ease-out"
          style={{ transform: `translateX(${-((scrollY * 0.45) % 1200)}px)` }}
        >
          <div className="flex gap-6 sm:gap-8 shrink-0 animate-marquee-left">
            <span>• AUTHENTIC LECTURE OUTLINES</span>
            <span className="text-[#16866A]">• MAKERERE UNIVERSITY</span>
            <span>• KYAMBOGO UNIVERSITY</span>
            <span className="text-[#16866A]">• MUBS COMMERCE</span>
            <span>• MUST HEALTH SCIENCES</span>
            <span className="text-[#16866A]">• CEDAT ENGINEERING</span>
            <span>• ZERO-DATA OFFLINE ACCESS</span>
            <span className="text-[#16866A]">• INSTANT MTN &amp; AIRTEL MOBILE MONEY</span>
            <span>• VERIFIED DEPARTMENT LECTURERS</span>
            <span className="text-[#16866A]">• EXAM REVISION PACKS</span>
          </div>
          <div className="flex gap-6 sm:gap-8 shrink-0 animate-marquee-left" aria-hidden="true">
            <span>• AUTHENTIC LECTURE OUTLINES</span>
            <span className="text-[#16866A]">• MAKERERE UNIVERSITY</span>
            <span>• KYAMBOGO UNIVERSITY</span>
            <span className="text-[#16866A]">• MUBS COMMERCE</span>
            <span>• MUST HEALTH SCIENCES</span>
            <span className="text-[#16866A]">• CEDAT ENGINEERING</span>
            <span>• ZERO-DATA OFFLINE ACCESS</span>
            <span className="text-[#16866A]">• INSTANT MTN &amp; AIRTEL MOBILE MONEY</span>
            <span>• VERIFIED DEPARTMENT LECTURERS</span>
            <span className="text-[#16866A]">• EXAM REVISION PACKS</span>
          </div>
        </div>

        {/* Ribbon 2: Rightward moving stream */}
        <div
          className="flex whitespace-nowrap text-[10px] sm:text-xs font-mono font-semibold text-[#64736D] py-0.5 sm:py-1 border-t border-[#E2ECE7]/70 pt-1.5 sm:pt-2 transition-transform duration-100 ease-out"
          style={{ transform: `translateX(${((scrollY * 0.35) % 1200)}px)` }}
        >
          <div className="flex gap-6 sm:gap-8 shrink-0 animate-marquee-right">
            <span className="text-[#16866A]">✦ BBA 1204 FINANCIAL MANAGEMENT</span>
            <span>✦ CSC 1100 COMPUTER SYSTEMS</span>
            <span className="text-[#16866A]">✦ MEC 2101 ENGINEERING MECHANICS</span>
            <span>✦ LAW 1101 CONSTITUTIONAL LAW</span>
            <span className="text-[#16866A]">✦ ACC 2102 AUDITING &amp; ASSURANCE</span>
            <span>✦ ENG 1102 THERMODYNAMICS</span>
            <span className="text-[#16866A]">✦ FREE MULTI-PAGE CHAPTER PREVIEWS</span>
            <span>✦ 100% OFFLINE ENCRYPTED CACHE</span>
          </div>
          <div className="flex gap-6 sm:gap-8 shrink-0 animate-marquee-right" aria-hidden="true">
            <span className="text-[#16866A]">✦ BBA 1204 FINANCIAL MANAGEMENT</span>
            <span>✦ CSC 1100 COMPUTER SYSTEMS</span>
            <span className="text-[#16866A]">✦ MEC 2101 ENGINEERING MECHANICS</span>
            <span>✦ LAW 1101 CONSTITUTIONAL LAW</span>
            <span className="text-[#16866A]">✦ ACC 2102 AUDITING &amp; ASSURANCE</span>
            <span>✦ ENG 1102 THERMODYNAMICS</span>
            <span className="text-[#16866A]">✦ FREE MULTI-PAGE CHAPTER PREVIEWS</span>
            <span>✦ 100% OFFLINE ENCRYPTED CACHE</span>
          </div>
        </div>
      </section>

      {/* 3. Key Metrics Bar - Compact & Balanced on Mobile */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 reveal-element">
          <div className="rounded-xl sm:rounded-2xl border border-[#E2ECE7] bg-white p-3.5 sm:p-5 text-center shadow-2xs hover:border-[#16866A]/40 transition">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#172B27]">400+</div>
            <div className="text-[11px] sm:text-xs font-medium text-[#64736D] mt-0.5 sm:mt-1">Verified Units</div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-[#E2ECE7] bg-white p-3.5 sm:p-5 text-center shadow-2xs hover:border-[#16866A]/40 transition">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#16866A]">100%</div>
            <div className="text-[11px] sm:text-xs font-medium text-[#64736D] mt-0.5 sm:mt-1">Offline Cache</div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-[#E2ECE7] bg-white p-3.5 sm:p-5 text-center shadow-2xs hover:border-[#16866A]/40 transition">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#172B27]">MTN &amp; Airtel</div>
            <div className="text-[11px] sm:text-xs font-medium text-[#64736D] mt-0.5 sm:mt-1">Instant Push</div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-[#E2ECE7] bg-white p-3.5 sm:p-5 text-center shadow-2xs hover:border-[#16866A]/40 transition">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#16866A]">0 UGX</div>
            <div className="text-[11px] sm:text-xs font-medium text-[#64736D] mt-0.5 sm:mt-1">Subscription Fee</div>
          </div>
        </div>
      </section>

      {/* 4. Academic Category Cards - Mobile-First Touch Targets */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl" id="academic-disciplines">
        <div className="text-center max-w-lg mx-auto mb-8 sm:mb-10 space-y-1.5 sm:space-y-2 reveal-element">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5EF] px-3.5 py-1 text-xs font-semibold text-[#16866A] border border-[#CDE5DA] shadow-2xs">
            <Layers className="h-3.5 w-3.5 text-[#16866A]" />
            <span>ACADEMIC DISCIPLINES</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#172B27]">
            <span className="word-reveal delay-1">Explore</span>{" "}
            <span className="word-reveal delay-2">Faculty</span>{" "}
            <span className="word-reveal delay-3 text-[#16866A]">Course</span>{" "}
            <span className="word-reveal delay-4">Materials</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#64736D] max-w-md mx-auto leading-relaxed">
            Browse examination-focused lecture summaries and course units aligned with higher education syllabi across Uganda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {academicCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={idx}
                href={`/catalogue?q=${encodeURIComponent(cat.query)}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E2ECE7] bg-white p-4 sm:p-6 shadow-2xs hover:shadow-md hover:border-[#16866A] active:scale-[0.99] active:bg-[#F8FAF9] transition-all duration-200 reveal-element"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#E8F5EF] text-[#16866A] flex items-center justify-center shrink-0 border border-[#CDE5DA] group-hover:scale-105 transition-transform">
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] sm:text-[11px] font-semibold text-[#89958F]">
                          {cat.faculty}
                        </span>
                        <span className="block text-xs font-mono font-bold text-[#16866A]">
                          {cat.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#172B27] group-hover:text-[#16866A] transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#64736D] leading-relaxed mt-1.5 font-normal line-clamp-3 sm:line-clamp-none">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3.5 sm:pt-4 mt-4 sm:mt-5 border-t border-[#E2ECE7] flex items-center justify-between text-xs">
                  <span className="font-medium text-[#89958F] group-hover:text-[#172B27] transition-colors">
                    Browse Units
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#16866A] group-hover:translate-x-1.5 transition-transform duration-200">
                    <span>View Notes</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Feature Section with IMAGE 2 (students-library.jpg) - Verified Faculty */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl" id="how-it-works">
        <div className="rounded-2xl sm:rounded-3xl border border-[#E2ECE7] bg-white p-5 sm:p-8 lg:p-10 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left Column: IMAGE 2 (students-library.jpg) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-[#F8FAF9] shadow-sm sm:shadow-md group">
                <div className="relative h-[200px] sm:h-[300px] lg:h-[380px] w-full">
                  <Image
                    src="/images/students-library.jpg"
                    alt="University students collaborating over course notes at a campus library study table"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172B27]/80 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 p-2.5 sm:p-3 backdrop-blur-md border border-[#E2ECE7] shadow-sm">
                  <div className="text-[11px] sm:text-xs font-bold text-[#172B27] flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#16866A] shrink-0" />
                    <span className="truncate">Curriculum-Aligned Study Materials</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[#64736D] mt-0.5 truncate">
                    Prepared and verified by university lecturers
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Moving Words Section Headline */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5EF] px-3.5 py-1 text-xs font-semibold text-[#16866A] border border-[#CDE5DA]">
                <Award className="h-3.5 w-3.5 text-[#16866A]" />
                <span>ACADEMIC VERIFICATION</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[#172B27] leading-tight">
                <span className="word-reveal delay-1">Authentic</span>{" "}
                <span className="word-reveal delay-2">course</span>{" "}
                <span className="word-reveal delay-3">notes</span>{" "}
                <span className="word-reveal delay-4 text-[#16866A]">authored</span>{" "}
                <span className="word-reveal delay-5">by</span>{" "}
                <span className="word-reveal delay-6">your</span>{" "}
                <span className="word-reveal delay-7">departmental</span>{" "}
                <span className="word-reveal delay-8">lecturers.</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#64736D] leading-relaxed">
                Study with confidence using revision notes, worked examination solutions, and syllabus summaries uploaded directly by accredited lecturers.
              </p>

              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#E8F5EF] text-[#16866A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#172B27]">Departmental Affiliation Verification</h4>
                    <p className="text-[11px] sm:text-xs text-[#64736D] mt-0.5 leading-relaxed">
                      Every publishing educator is vetted to ensure materials reflect actual university exam requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#E8F5EF] text-[#16866A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#172B27]">Free Sample Chapter Previews</h4>
                    <p className="text-[11px] sm:text-xs text-[#64736D] mt-0.5 leading-relaxed">
                      Inspect the document outline, table of contents, and key pages before making any purchase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#E8F5EF] text-[#16866A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#172B27]">Direct Mobile Money Royalties</h4>
                    <p className="text-[11px] sm:text-xs text-[#64736D] mt-0.5 leading-relaxed">
                      Lecturers receive net earnings directly on MTN and Airtel Mobile Money upon student purchases.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-11 sm:h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#16866A] hover:bg-[#116B55] active:scale-[0.98] px-5 text-xs sm:text-sm font-bold text-white shadow-sm transition touch-target"
                >
                  <span>Become a Verified Lecturer</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Section with IMAGE 3 (study-group.jpg) - Zero-Data Offline Reading */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="rounded-2xl sm:rounded-3xl border border-[#E2ECE7] bg-white p-5 sm:p-8 lg:p-10 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left Column: Offline Reading Features */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5EF] px-3.5 py-1 text-xs font-semibold text-[#16866A] border border-[#CDE5DA]">
                <WifiOff className="h-3.5 w-3.5 text-[#16866A]" />
                <span>CAMPUS WI-FI &amp; OFFLINE ACCESS</span>
              </div>

              {/* Moving Words Heading */}
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[#172B27] leading-tight">
                <span className="word-reveal delay-1">Study</span>{" "}
                <span className="word-reveal delay-2">anywhere</span>{" "}
                <span className="word-reveal delay-3">with</span>{" "}
                <span className="word-reveal delay-4 text-[#16866A]">Zero-Data</span>{" "}
                <span className="word-reveal delay-5">offline</span>{" "}
                <span className="word-reveal delay-6">reading</span>{" "}
                <span className="word-reveal delay-7">and</span>{" "}
                <span className="word-reveal delay-8">revision</span>{" "}
                <span className="word-reveal delay-9">tools.</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#64736D] leading-relaxed">
                We understand connectivity challenges. Download your unlocked course units once on campus Wi-Fi and access your notes anywhere without consuming expensive data bundles.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                <div className="rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] p-3.5 sm:p-4 space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-[#E8F5EF] text-[#16866A] flex items-center justify-center">
                    <Download className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#172B27]">Local Encrypted Storage</h4>
                  <p className="text-[11px] sm:text-xs text-[#64736D] leading-relaxed">
                    Documents are stored directly on your phone or laptop with cryptographic keys for instant offline access.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] p-4 space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-[#E8F5EF] text-[#16866A] flex items-center justify-center">
                    <Highlighter className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#172B27]">Active Highlighting &amp; Notes</h4>
                  <p className="text-[11px] sm:text-xs text-[#64736D] leading-relaxed">
                    Tag exam definitions, highlight key statutory principles, and save personal margin annotations.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-11 sm:h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#172B27] hover:bg-[#116B55] active:scale-[0.98] px-5 text-xs sm:text-sm font-bold text-white shadow-sm transition touch-target"
                >
                  <BookOpen className="h-4 w-4 text-[#A3E5D0]" />
                  <span>Start Reading Offline</span>
                </Link>
              </div>
            </div>

            {/* Right Column: IMAGE 3 (study-group.jpg) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-[#F8FAF9] shadow-sm sm:shadow-md group">
                <div className="relative h-[200px] sm:h-[300px] lg:h-[380px] w-full">
                  <Image
                    src="/images/study-group.jpg"
                    alt="Five university students revising together with course notebooks, textbooks and laptop"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172B27]/80 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 p-2.5 sm:p-3 backdrop-blur-md border border-[#E2ECE7] shadow-sm">
                  <div className="text-[11px] sm:text-xs font-bold text-[#172B27] flex items-center gap-1.5 truncate">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#16866A] shrink-0" />
                    <span className="truncate">Peer Study &amp; Examination Groups</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[#64736D] mt-0.5 truncate">
                    Prepare together for end-of-semester papers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Academic Community & Peer Tutors Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 reveal-element">
          <Link
            href="/student/community"
            className="rounded-2xl border border-[#E2ECE7] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#16866A] active:scale-[0.99] active:bg-[#F8FAF9] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#E8F5EF] text-[#16866A] flex items-center justify-center shrink-0 border border-[#CDE5DA]">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-[#172B27] group-hover:text-[#16866A] transition truncate">
                  Academic Community
                </h3>
                <p className="text-[11px] sm:text-xs text-[#64736D] mt-0.5 line-clamp-1">
                  Peer study groups, past paper discussions, and departmental Q&amp;A.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#89958F] group-hover:text-[#16866A] group-hover:translate-x-1.5 transition shrink-0" />
          </Link>

          <Link
            href="/student/tutors"
            className="rounded-2xl border border-[#E2ECE7] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#16866A] active:scale-[0.99] active:bg-[#F8FAF9] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#E8F5EF] text-[#16866A] flex items-center justify-center shrink-0 border border-[#CDE5DA]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-[#172B27] group-hover:text-[#16866A] transition truncate">
                  Peer Tutors Desk
                </h3>
                <p className="text-[11px] sm:text-xs text-[#64736D] mt-0.5 line-clamp-1">
                  Book 1-on-1 revision sessions with top department students.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#89958F] group-hover:text-[#16866A] group-hover:translate-x-1.5 transition shrink-0" />
          </Link>
        </div>
      </section>

      {/* 8. Course Unit Request Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-2xl sm:rounded-3xl bg-white text-[#172B27] p-5 sm:p-8 lg:p-10 shadow-sm border border-[#CDE5DA] reveal-element">
          <div className="text-center max-w-md mx-auto mb-5 sm:mb-6 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#16866A] bg-[#E8F5EF] px-3 py-0.5 rounded-full">
              <span>Course Coordinator Desk</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B27]">
              Can&apos;t find your specific course unit?
            </h2>
            <p className="text-xs text-[#64736D] leading-relaxed">
              Submit your course code and university. We will notify relevant faculty lecturers to upload notes.
            </p>
          </div>

          {requestSent ? (
            <div className="rounded-2xl bg-[#E8F5EF] border border-[#CDE5DA] p-5 text-center space-y-2 max-w-sm mx-auto">
              <CheckCircle2 className="h-7 w-7 text-[#16866A] mx-auto" />
              <p className="text-sm font-bold text-[#172B27]">Course Request Logged</p>
              <p className="text-xs text-[#64736D] leading-relaxed">
                Our academic coordinators have received your request and will contact department lecturers.
              </p>
              <button
                type="button"
                onClick={() => setRequestSent(false)}
                className="text-xs text-[#16866A] underline font-bold pt-1 touch-target"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit} className="max-w-md mx-auto space-y-2.5 sm:space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Course code (e.g. MEC 2101)"
                  className="h-12 rounded-xl bg-[#F8FAF9] border border-[#CDE5DA] px-3.5 text-base sm:text-xs text-[#172B27] placeholder-[#89958F] outline-none focus:border-[#16866A] focus:ring-1 focus:ring-[#16866A] transition font-medium w-full"
                />
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course unit title"
                  className="h-12 rounded-xl bg-[#F8FAF9] border border-[#CDE5DA] px-3.5 text-base sm:text-xs text-[#172B27] placeholder-[#89958F] outline-none focus:border-[#16866A] focus:ring-1 focus:ring-[#16866A] transition font-medium w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="University / Institute"
                  className="h-12 rounded-xl bg-[#F8FAF9] border border-[#CDE5DA] px-3.5 text-base sm:text-xs text-[#172B27] placeholder-[#89958F] outline-none focus:border-[#16866A] focus:ring-1 focus:ring-[#16866A] transition font-medium w-full"
                />
                <input
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="Phone or Email (Optional)"
                  className="h-12 rounded-xl bg-[#F8FAF9] border border-[#CDE5DA] px-3.5 text-base sm:text-xs text-[#172B27] placeholder-[#89958F] outline-none focus:border-[#16866A] focus:ring-1 focus:ring-[#16866A] transition font-medium w-full"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full h-12 rounded-xl bg-[#16866A] hover:bg-[#116B55] active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition shadow-sm touch-target"
              >
                {submittingRequest ? "Submitting..." : "Submit Course Request"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 9. Frequently Asked Questions */}
      <section className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center max-w-sm mx-auto mb-6 sm:mb-8 space-y-1 reveal-element">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B27]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#64736D]">
            Common questions on accessing notes, offline reading, and lecturer publishing.
          </p>
        </div>

        <div className="space-y-2 sm:space-y-2.5 reveal-element">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl sm:rounded-2xl border border-[#E2ECE7] bg-white overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left text-xs sm:text-sm font-bold text-[#172B27] hover:bg-[#F8FAF9] active:bg-[#F8FAF9] transition min-h-[48px] touch-target"
                >
                  <span className="pr-2">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#89958F] transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-[#16866A]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs text-[#64736D] border-t border-[#E2ECE7] pt-2.5 sm:pt-3 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Floating Mobile Sticky Quick Bar (Visible on mobile screens when scrolled) */}
      {scrollY > 380 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 transition-all duration-300">
          <div className="bg-[#172B27]/95 backdrop-blur-md text-white rounded-2xl p-2 shadow-xl border border-white/15 flex items-center justify-between gap-2">
            <Link
              href="/catalogue"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#16866A] hover:bg-[#116B55] active:scale-[0.98] text-xs font-bold text-white shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Explore Course Notes</span>
            </Link>
            <Link
              href="/#academic-disciplines"
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-xs font-semibold text-slate-200"
            >
              Disciplines
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
