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

  // Authentic Academic Categories
  const academicCategories = [
    {
      code: "TECH-CS",
      faculty: "Computing & Informatics",
      title: "Technology & Computing",
      description:
        "Data structures, algorithms, database engines, computer networks, systems programming and software engineering.",
      query: "Computer Science",
      icon: Code2,
    },
    {
      code: "ENG-TECH",
      faculty: "Engineering & Applied Sciences",
      title: "Engineering & Mechanics",
      description:
        "Engineering statics, dynamics, structural analysis, thermodynamics, calculus and circuit theory.",
      query: "Engineering",
      icon: Compass,
    },
    {
      code: "MED-HLTH",
      faculty: "Health Sciences & Medicine",
      title: "Health & Clinical Sciences",
      description:
        "Clinical anatomy, physiology, pathology, pharmacology, epidemiology and public healthcare administration.",
      query: "Health",
      icon: Stethoscope,
    },
    {
      code: "BUS-ECON",
      faculty: "Business & Management",
      title: "Business & Financial Economics",
      description:
        "Corporate financial management, auditing, taxation, macroeconomics, capital budgeting and market theory.",
      query: "Accounting",
      icon: Briefcase,
    },
    {
      code: "LAW-JUR",
      faculty: "School of Law",
      title: "Law & Constitutional Studies",
      description:
        "Constitutional governance, criminal jurisprudence, commercial contracts, civil procedure and judicial precedent.",
      query: "Law",
      icon: Scale,
    },
    {
      code: "EDU-HUM",
      faculty: "Education & Humanities",
      title: "Education & Pedagogical Sciences",
      description:
        "Curriculum development, instructional methods, developmental psychology, educational ethics and language studies.",
      query: "Education",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-20 bg-[#F4F6F2] text-[#183D32]">
      {/* 1. Hero Section - Warm Ivory & Forest Green Identity */}
      <section className="bg-[#F7F5EF] pt-8 sm:pt-16 pb-12 sm:pb-20 border-b border-[#E3E9E4]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left reveal-element revealed">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F1EB] border border-[#E3E9E4] px-3.5 py-1 text-xs font-semibold text-[#23836B]">
                <Sparkles className="h-3.5 w-3.5 text-[#23836B] shrink-0" />
                <span>Uganda Higher Education Academic Exchange</span>
              </div>

              {/* Complete, Unbroken Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold tracking-tight text-[#153F35] leading-tight sm:leading-[1.18]">
                Authentic university notes, directly from your lecturers.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[#738078] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Access faculty-authored lecture summaries, revision guides, and past examination papers. Preview chapters for free and unlock instantly with MTN or Airtel Mobile Money.
              </p>

              {/* Search Bar (text-base on mobile prevents iOS auto-zoom) */}
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
                    className="w-full h-12 rounded-xl border border-[#E3E9E4] bg-white pl-10 pr-4 text-base sm:text-sm text-[#183D32] shadow-sm outline-none focus:border-[#23836B] focus:ring-2 focus:ring-[#23836B]/20 transition font-medium placeholder:text-[#89958F]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#23836B] hover:bg-[#153F35] active:scale-[0.98] px-6 text-sm font-bold text-white shadow-sm transition shrink-0 touch-target"
                >
                  <span>Search Notes</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Popular Units */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-[#738078] pt-1">
                <span className="font-semibold text-[#89958F]">Popular Units:</span>
                {["BBA 1204", "CSC 1100", "MEC 2101", "LAW 1101", "ACC 2102"].map((code) => (
                  <Link
                    key={code}
                    href={`/catalogue?q=${encodeURIComponent(code)}`}
                    className="rounded-lg bg-white hover:bg-[#E9F1EB] hover:text-[#23836B] px-2.5 py-1 text-xs font-mono font-medium text-[#183D32] border border-[#E3E9E4] transition"
                  >
                    {code}
                  </Link>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#23836B] hover:bg-[#153F35] active:scale-[0.98] px-6 text-sm font-bold text-white transition shadow-sm touch-target"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore Study Materials</span>
                </Link>

                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-[#E3E9E4] bg-white hover:bg-[#E9F1EB] px-6 text-sm font-bold text-[#183D32] transition touch-target"
                >
                  <GraduationCap className="h-4 w-4 text-[#23836B]" />
                  <span>For Lecturers</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 pt-2 text-xs text-[#738078]">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Smartphone className="h-3.5 w-3.5 text-[#23836B] shrink-0" /> MTN &amp; Airtel Mobile Money
                </span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-[#E3E9E4]" />
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <WifiOff className="h-3.5 w-3.5 text-[#23836B] shrink-0" /> Zero-Data Offline Reading
                </span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-[#E3E9E4]" />
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#23836B] shrink-0" /> Verified University Faculty
                </span>
              </div>
            </div>

            {/* Right Column: IMAGE 1 (hero-students.jpg) */}
            <div className="lg:col-span-5 reveal-element revealed">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-white shadow-lg bg-white group">
                <div className="relative h-[240px] sm:h-[340px] md:h-[400px] w-full">
                  <Image
                    src="/images/hero-students.jpg"
                    alt="University students studying together in a modern campus library"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#153F35]/80 via-[#153F35]/20 to-transparent" />
                </div>

                {/* Caption Card */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl sm:rounded-2xl bg-white/95 border border-[#E3E9E4] p-3 backdrop-blur-md shadow-md flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="text-xs font-bold text-[#153F35] flex items-center gap-1.5 truncate">
                      <GraduationCap className="h-3.5 w-3.5 text-[#23836B] shrink-0" />
                      <span className="truncate">Campus Study Circle</span>
                    </div>
                    <div className="text-[11px] text-[#738078] truncate">
                      Higher Education Academic Notes
                    </div>
                  </div>
                  <span className="rounded-lg bg-[#E9F1EB] border border-[#E3E9E4] text-[#23836B] px-2.5 py-1 text-xs font-semibold shrink-0">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 reveal-element">
          <div className="rounded-xl sm:rounded-2xl border border-[#E3E9E4] bg-white p-4 sm:p-5 text-center shadow-2xs hover:border-[#23836B]/40 transition">
            <div className="text-xl sm:text-3xl font-extrabold text-[#153F35]">400+</div>
            <div className="text-xs font-medium text-[#738078] mt-1">Verified Course Units</div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-[#E3E9E4] bg-white p-4 sm:p-5 text-center shadow-2xs hover:border-[#23836B]/40 transition">
            <div className="text-xl sm:text-3xl font-extrabold text-[#23836B]">100%</div>
            <div className="text-xs font-medium text-[#738078] mt-1">Offline Encrypted Reading</div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-[#E3E9E4] bg-white p-4 sm:p-5 text-center shadow-2xs hover:border-[#23836B]/40 transition">
            <div className="text-xl sm:text-3xl font-extrabold text-[#153F35]">MTN &amp; Airtel</div>
            <div className="text-xs font-medium text-[#738078] mt-1">Instant Push Payments</div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-[#E3E9E4] bg-white p-4 sm:p-5 text-center shadow-2xs hover:border-[#23836B]/40 transition">
            <div className="text-xl sm:text-3xl font-extrabold text-[#23836B]">0 UGX</div>
            <div className="text-xs font-medium text-[#738078] mt-1">Student Platform Fee</div>
          </div>
        </div>
      </section>

      {/* 3. Academic Category Cards - Staggered Reveal */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl" id="academic-disciplines">
        <div className="text-center max-w-lg mx-auto mb-8 sm:mb-10 space-y-2 reveal-element">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F1EB] px-3.5 py-1 text-xs font-semibold text-[#23836B] border border-[#E3E9E4]">
            <Layers className="h-3.5 w-3.5 text-[#23836B]" />
            <span>ACADEMIC DISCIPLINES</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#153F35]">
            Explore Faculty Course Materials
          </h2>

          <p className="text-xs sm:text-sm text-[#738078] max-w-md mx-auto leading-relaxed">
            Browse examination-focused lecture summaries and course units aligned with higher education syllabi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {academicCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            const staggerClass = `stagger-${idx + 1}`;
            return (
              <Link
                key={idx}
                href={`/catalogue?q=${encodeURIComponent(cat.query)}`}
                className={`group relative flex flex-col justify-between rounded-2xl border border-[#E3E9E4] bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-[#23836B] active:scale-[0.99] transition-all duration-300 reveal-element ${staggerClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-xl bg-[#E9F1EB] text-[#23836B] flex items-center justify-center shrink-0 border border-[#E3E9E4] group-hover:scale-105 transition-transform">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] sm:text-[11px] font-semibold text-[#89958F]">
                          {cat.faculty}
                        </span>
                        <span className="block text-xs font-mono font-bold text-[#23836B]">
                          {cat.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#153F35] group-hover:text-[#23836B] transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#738078] leading-relaxed mt-1.5 font-normal">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3.5 sm:pt-4 mt-4 sm:mt-5 border-t border-[#E3E9E4] flex items-center justify-between text-xs">
                  <span className="font-medium text-[#89958F] group-hover:text-[#183D32] transition-colors">
                    Browse Units
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#23836B] group-hover:translate-x-1.5 transition-transform duration-200">
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
        <div className="rounded-2xl sm:rounded-3xl border border-[#E3E9E4] bg-white p-5 sm:p-8 lg:p-10 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left Column: IMAGE 2 (students-library.jpg) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-[#F7F5EF] shadow-sm group">
                <div className="relative h-[220px] sm:h-[300px] lg:h-[380px] w-full">
                  <Image
                    src="/images/students-library.jpg"
                    alt="University students collaborating over course notes at a campus library study table"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#153F35]/80 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 p-3 backdrop-blur-md border border-[#E3E9E4] shadow-sm">
                  <div className="text-xs font-bold text-[#153F35] flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-4 w-4 text-[#23836B] shrink-0" />
                    <span className="truncate">Curriculum-Aligned Study Materials</span>
                  </div>
                  <div className="text-[11px] text-[#738078] mt-0.5 truncate">
                    Authored and reviewed by university faculty
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Clean, Unbroken Heading and Features */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F1EB] px-3.5 py-1 text-xs font-semibold text-[#23836B] border border-[#E3E9E4]">
                <Award className="h-3.5 w-3.5 text-[#23836B]" />
                <span>ACADEMIC VERIFICATION</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[#153F35] leading-tight">
                Authentic course notes authored by your departmental lecturers.
              </h2>

              <p className="text-xs sm:text-sm text-[#738078] leading-relaxed">
                Study with confidence using revision notes, worked examination solutions, and syllabus summaries uploaded directly by accredited lecturers.
              </p>

              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#E9F1EB] text-[#23836B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#153F35]">Departmental Affiliation Verification</h4>
                    <p className="text-xs text-[#738078] mt-0.5 leading-relaxed">
                      Every publishing educator is vetted to ensure materials reflect actual university exam requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#E9F1EB] text-[#23836B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#153F35]">Free Sample Chapter Previews</h4>
                    <p className="text-xs text-[#738078] mt-0.5 leading-relaxed">
                      Inspect the document outline, table of contents, and key pages before making any purchase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#E9F1EB] text-[#23836B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#153F35]">Direct Mobile Money Withdrawals</h4>
                    <p className="text-xs text-[#738078] mt-0.5 leading-relaxed">
                      Lecturers receive net royalties directly on MTN and Airtel Mobile Money upon student purchases.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#23836B] hover:bg-[#153F35] active:scale-[0.98] px-5 text-sm font-bold text-white shadow-sm transition touch-target"
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
        <div className="rounded-2xl sm:rounded-3xl border border-[#E3E9E4] bg-white p-5 sm:p-8 lg:p-10 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left Column: Offline Reading Features */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F1EB] px-3.5 py-1 text-xs font-semibold text-[#23836B] border border-[#E3E9E4]">
                <WifiOff className="h-3.5 w-3.5 text-[#23836B]" />
                <span>OFFLINE ACCESSIBILITY</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[#153F35] leading-tight">
                Study anywhere with Zero-Data offline reading and revision tools.
              </h2>

              <p className="text-xs sm:text-sm text-[#738078] leading-relaxed">
                Download your unlocked course notes once on campus Wi-Fi and access your materials anywhere without requiring an active data connection.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                <div className="rounded-xl border border-[#E3E9E4] bg-[#F7F5EF] p-4 space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-[#E9F1EB] text-[#23836B] flex items-center justify-center">
                    <Download className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#153F35]">Local Encrypted Storage</h4>
                  <p className="text-xs text-[#738078] leading-relaxed">
                    Documents are stored securely on your device with cryptographic keys for instant offline access.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E3E9E4] bg-[#F7F5EF] p-4 space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-[#E9F1EB] text-[#23836B] flex items-center justify-center">
                    <Highlighter className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#153F35]">Active Highlighting &amp; Notes</h4>
                  <p className="text-xs text-[#738078] leading-relaxed">
                    Tag exam definitions, highlight statutory principles, and save personal margin annotations.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#153F35] hover:bg-[#23836B] active:scale-[0.98] px-5 text-sm font-bold text-white shadow-sm transition touch-target"
                >
                  <BookOpen className="h-4 w-4 text-[#D6A957]" />
                  <span>Start Reading Offline</span>
                </Link>
              </div>
            </div>

            {/* Right Column: IMAGE 3 (study-group.jpg) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-[#F7F5EF] shadow-sm group">
                <div className="relative h-[220px] sm:h-[300px] lg:h-[380px] w-full">
                  <Image
                    src="/images/study-group.jpg"
                    alt="Five university students revising together with course notebooks, textbooks and laptop"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#153F35]/80 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 p-3 backdrop-blur-md border border-[#E3E9E4] shadow-sm">
                  <div className="text-xs font-bold text-[#153F35] flex items-center gap-1.5 truncate">
                    <Users className="h-4 w-4 text-[#23836B] shrink-0" />
                    <span className="truncate">Peer Study &amp; Revision</span>
                  </div>
                  <div className="text-[11px] text-[#738078] mt-0.5 truncate">
                    Collaborate and prepare for semester examinations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Academic Community & Peer Tutors Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 reveal-element">
          <Link
            href="/student/community"
            className="rounded-2xl border border-[#E3E9E4] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#23836B] active:scale-[0.99] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#E9F1EB] text-[#23836B] flex items-center justify-center shrink-0 border border-[#E3E9E4]">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-[#153F35] group-hover:text-[#23836B] transition truncate">
                  Academic Community
                </h3>
                <p className="text-xs text-[#738078] mt-0.5 line-clamp-1">
                  Peer study groups, past paper discussions, and departmental Q&amp;A.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#89958F] group-hover:text-[#23836B] group-hover:translate-x-1.5 transition shrink-0" />
          </Link>

          <Link
            href="/student/tutors"
            className="rounded-2xl border border-[#E3E9E4] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#23836B] active:scale-[0.99] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#E9F1EB] text-[#23836B] flex items-center justify-center shrink-0 border border-[#E3E9E4]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-[#153F35] group-hover:text-[#23836B] transition truncate">
                  Peer Tutors Desk
                </h3>
                <p className="text-xs text-[#738078] mt-0.5 line-clamp-1">
                  Book 1-on-1 revision sessions with top department students.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#89958F] group-hover:text-[#23836B] group-hover:translate-x-1.5 transition shrink-0" />
          </Link>
        </div>
      </section>

      {/* 7. Course Unit Request Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-2xl sm:rounded-3xl bg-white text-[#183D32] p-5 sm:p-8 lg:p-10 shadow-sm border border-[#E3E9E4] reveal-element">
          <div className="text-center max-w-md mx-auto mb-5 sm:mb-6 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23836B] bg-[#E9F1EB] px-3 py-0.5 rounded-full">
              <span>Course Coordinator Desk</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-[#153F35]">
              Can&apos;t find your specific course unit?
            </h2>
            <p className="text-xs text-[#738078] leading-relaxed">
              Submit your course code and institution. We will contact relevant departmental lecturers to upload notes.
            </p>
          </div>

          {requestSent ? (
            <div className="rounded-2xl bg-[#E9F1EB] border border-[#E3E9E4] p-5 text-center space-y-2 max-w-sm mx-auto">
              <CheckCircle2 className="h-7 w-7 text-[#23836B] mx-auto" />
              <p className="text-sm font-bold text-[#153F35]">Course Request Logged</p>
              <p className="text-xs text-[#738078] leading-relaxed">
                Our academic coordinators have received your request and will follow up with faculty educators.
              </p>
              <button
                type="button"
                onClick={() => setRequestSent(false)}
                className="text-xs text-[#23836B] underline font-bold pt-1 touch-target"
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
                  className="h-12 rounded-xl bg-[#F4F6F2] border border-[#E3E9E4] px-3.5 text-base sm:text-xs text-[#183D32] placeholder-[#89958F] outline-none focus:border-[#23836B] focus:ring-1 focus:ring-[#23836B] transition font-medium w-full"
                />
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course unit title"
                  className="h-12 rounded-xl bg-[#F4F6F2] border border-[#E3E9E4] px-3.5 text-base sm:text-xs text-[#183D32] placeholder-[#89958F] outline-none focus:border-[#23836B] focus:ring-1 focus:ring-[#23836B] transition font-medium w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="University / Institute"
                  className="h-12 rounded-xl bg-[#F4F6F2] border border-[#E3E9E4] px-3.5 text-base sm:text-xs text-[#183D32] placeholder-[#89958F] outline-none focus:border-[#23836B] focus:ring-1 focus:ring-[#23836B] transition font-medium w-full"
                />
                <input
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="Phone or Email (Optional)"
                  className="h-12 rounded-xl bg-[#F4F6F2] border border-[#E3E9E4] px-3.5 text-base sm:text-xs text-[#183D32] placeholder-[#89958F] outline-none focus:border-[#23836B] focus:ring-1 focus:ring-[#23836B] transition font-medium w-full"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full h-12 rounded-xl bg-[#23836B] hover:bg-[#153F35] active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition shadow-sm touch-target"
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
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#153F35]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#738078]">
            Common questions on accessing notes, offline reading, and lecturer publishing.
          </p>
        </div>

        <div className="space-y-2 sm:space-y-2.5 reveal-element">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl sm:rounded-2xl border border-[#E3E9E4] bg-white overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left text-xs sm:text-sm font-bold text-[#183D32] hover:bg-[#F7F5EF] active:bg-[#F7F5EF] transition min-h-[48px] touch-target"
                >
                  <span className="pr-2">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#89958F] transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-[#23836B]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs text-[#738078] border-t border-[#E3E9E4] pt-2.5 sm:pt-3 leading-relaxed">
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
