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

  // Native IntersectionObserver for fluid section reveals
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
      q: "How do I read notes offline?",
      a: "Once unlocked, notes save to your device storage. You can read, highlight, and revise anytime without using mobile data.",
    },
    {
      q: "Are lecturers verified?",
      a: "Yes. Every educator must verify their university credentials and faculty affiliation before publishing materials.",
    },
    {
      q: "Can I preview materials before paying?",
      a: "Yes. Every document includes a free multi-page preview with the syllabus outline and sample pages.",
    },
    {
      q: "Which payment methods work in Uganda?",
      a: "We support instant push-prompt payments via MTN Mobile Money and Airtel Money.",
    },
  ];

  // Authentic Academic Categories with Bright, Warm Palettes
  const academicCategories = [
    {
      code: "TECH-CS",
      faculty: "Computing & IT",
      title: "Technology & Computing",
      description: "Data structures, programming, database systems, and networking.",
      query: "Computer Science",
      icon: Code2,
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
      iconBg: "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30",
      accentBorder: "hover:border-blue-500 hover:shadow-blue-500/15",
      linkText: "text-blue-700 group-hover:text-blue-800",
      codeBadge: "text-blue-800 bg-blue-50 border-blue-200",
    },
    {
      code: "ENG-TECH",
      faculty: "Engineering",
      title: "Engineering & Applied Sciences",
      description: "Statics, structural analysis, thermodynamics, and circuits.",
      query: "Engineering",
      icon: Compass,
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30",
      accentBorder: "hover:border-amber-500 hover:shadow-amber-500/15",
      linkText: "text-amber-700 group-hover:text-amber-800",
      codeBadge: "text-amber-800 bg-amber-50 border-amber-200",
    },
    {
      code: "MED-HLTH",
      faculty: "Health Sciences",
      title: "Health & Clinical Medicine",
      description: "Anatomy, physiology, pharmacology, and clinical diagnostics.",
      query: "Health",
      icon: Stethoscope,
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
      iconBg: "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30",
      accentBorder: "hover:border-emerald-500 hover:shadow-emerald-500/15",
      linkText: "text-emerald-700 group-hover:text-emerald-800",
      codeBadge: "text-emerald-800 bg-emerald-50 border-emerald-200",
    },
    {
      code: "BUS-ECON",
      faculty: "Business & Finance",
      title: "Economics & Management",
      description: "Accounting, corporate finance, taxation, and market economics.",
      query: "Accounting",
      icon: Briefcase,
      badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
      iconBg: "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30",
      accentBorder: "hover:border-purple-500 hover:shadow-purple-500/15",
      linkText: "text-purple-700 group-hover:text-purple-800",
      codeBadge: "text-purple-800 bg-purple-50 border-purple-200",
    },
    {
      code: "LAW-JUR",
      faculty: "School of Law",
      title: "Law & Legal Studies",
      description: "Constitutional law, contracts, criminal jurisprudence, and civil procedure.",
      query: "Law",
      icon: Scale,
      badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
      iconBg: "bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30",
      accentBorder: "hover:border-rose-500 hover:shadow-rose-500/15",
      linkText: "text-rose-700 group-hover:text-rose-800",
      codeBadge: "text-rose-800 bg-rose-50 border-rose-200",
    },
    {
      code: "EDU-HUM",
      faculty: "Education & Arts",
      title: "Education & Humanities",
      description: "Curriculum development, instructional psychology, and pedagogy.",
      query: "Education",
      icon: GraduationCap,
      badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-300",
      iconBg: "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30",
      accentBorder: "hover:border-cyan-500 hover:shadow-cyan-500/15",
      linkText: "text-cyan-700 group-hover:text-cyan-800",
      codeBadge: "text-cyan-800 bg-cyan-50 border-cyan-200",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 bg-[#FFFDF9] text-slate-900">
      {/* 1. Hero Section - Warm Ivory & Vivid Emerald */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-emerald-50/50 to-[#FFFDF9] pt-10 sm:pt-16 pb-12 sm:pb-16 border-b border-amber-200/50">
        {/* Warm Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-72 bg-gradient-to-r from-amber-200/35 via-emerald-200/40 to-teal-100/30 blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left reveal-element revealed">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/90 border border-emerald-300 px-3.5 py-1 text-xs font-bold text-[#153F35] shadow-xs">
                <Sparkles className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Uganda Higher Education Academic Exchange</span>
              </div>

              {/* Bold Headline */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#153F35] leading-tight sm:leading-[1.12]">
                Authentic university notes, directly from your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600">
                  lecturers.
                </span>
              </h1>

              {/* Crisp Subhead */}
              <p className="text-base sm:text-lg text-slate-700 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Faculty-authored lecture summaries, revision guides, and past examination papers. Preview free chapters and unlock instantly with MTN or Airtel.
              </p>

              {/* Search Bar */}
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
                    className="w-full h-12 rounded-xl border-2 border-emerald-300 bg-white pl-10 pr-4 text-base sm:text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition font-medium placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-emerald-700/25 transition shrink-0 touch-target"
                >
                  <span>Search Notes</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Popular Units */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-700 pt-0.5">
                <span className="font-bold text-slate-900">Popular:</span>
                <Link
                  href="/catalogue?q=BBA%201204"
                  className="rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 text-xs font-mono font-bold transition"
                >
                  BBA 1204
                </Link>
                <Link
                  href="/catalogue?q=CSC%201100"
                  className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 text-xs font-mono font-bold transition"
                >
                  CSC 1100
                </Link>
                <Link
                  href="/catalogue?q=MEC%202101"
                  className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-mono font-bold transition"
                >
                  MEC 2101
                </Link>
                <Link
                  href="/catalogue?q=LAW%201101"
                  className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 text-xs font-mono font-bold transition"
                >
                  LAW 1101
                </Link>
                <Link
                  href="/catalogue?q=ACC%202102"
                  className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-mono font-bold transition"
                >
                  ACC 2102
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] px-6 text-sm font-bold text-white transition shadow-lg shadow-emerald-700/25 ring-2 ring-emerald-500/20 touch-target"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore Study Materials</span>
                </Link>

                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-700/40 bg-white hover:bg-emerald-50/80 px-6 text-sm font-bold text-[#153F35] transition shadow-xs touch-target"
                >
                  <GraduationCap className="h-4 w-4 text-emerald-700" />
                  <span>For Lecturers</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
                  <Smartphone className="h-3.5 w-3.5 text-amber-700 shrink-0" /> MTN &amp; Airtel Mobile Money
                </span>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-300 px-3 py-1 rounded-full shadow-2xs">
                  <WifiOff className="h-3.5 w-3.5 text-blue-700 shrink-0" /> Zero-Data Offline Reading
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 shrink-0" /> Verified University Faculty
                </span>
              </div>
            </div>

            {/* Right Column: IMAGE 1 (hero-students.jpg) */}
            <div className="lg:col-span-5 reveal-element revealed">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white group ring-4 ring-emerald-500/15">
                <div className="relative h-[240px] sm:h-[340px] md:h-[400px] w-full">
                  <Image
                    src="/images/hero-students.jpg"
                    alt="University students studying together in a modern campus library"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                </div>

                {/* Caption Card */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl sm:rounded-2xl bg-white/95 border border-amber-200/80 p-3 backdrop-blur-md shadow-lg flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                      <GraduationCap className="h-4 w-4 text-emerald-700 shrink-0" />
                      <span className="truncate">Campus Study Circle</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 truncate">
                      Uganda University Academic Notes
                    </div>
                  </div>
                  <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-3 py-1 text-xs font-bold shrink-0 shadow-xs">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar - Warm, Bright, High-Contrast */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 reveal-element">
          {/* Metric 1 */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/90 to-white p-4 text-center shadow-xs hover:border-emerald-600 transition">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold mb-1.5">
              <Layers className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#153F35]">400+</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Verified Units</div>
          </div>

          {/* Metric 2 */}
          <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50/90 to-white p-4 text-center shadow-xs hover:border-blue-600 transition">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800 font-bold mb-1.5">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-900">100%</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Offline Reading</div>
          </div>

          {/* Metric 3 */}
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-4 text-center shadow-xs hover:border-amber-600 transition">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold mb-1.5">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900">MTN &amp; Airtel</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Instant Payments</div>
          </div>

          {/* Metric 4 */}
          <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50/90 to-white p-4 text-center shadow-xs hover:border-purple-600 transition">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold mb-1.5">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-900">0 UGX</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Student Platform Fee</div>
          </div>
        </div>
      </section>

      {/* 3. Academic Category Cards - Vibrant & Crisp */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl" id="academic-disciplines">
        <div className="text-center max-w-lg mx-auto mb-6 sm:mb-8 space-y-1.5 reveal-element">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-[#153F35] border border-emerald-300 shadow-2xs">
            <Layers className="h-3.5 w-3.5 text-emerald-700" />
            <span>ACADEMIC DISCIPLINES</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#153F35]">
            Explore Faculty Course Materials
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            Course units and revision summaries aligned with your university syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {academicCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            const staggerClass = `stagger-${idx + 1}`;
            return (
              <Link
                key={idx}
                href={`/catalogue?q=${encodeURIComponent(cat.query)}`}
                className={`group relative flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs hover:shadow-md ${cat.accentBorder} active:scale-[0.99] transition-all duration-200 reveal-element ${staggerClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                          {cat.faculty}
                        </span>
                        <span className={`inline-block text-xs font-mono font-black px-2 py-0.5 rounded-md mt-0.5 border ${cat.codeBadge}`}>
                          {cat.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1.5 font-normal">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                    Browse Units
                  </span>
                  <span className={`inline-flex items-center gap-1 font-black ${cat.linkText} group-hover:translate-x-1 transition-transform`}>
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
        <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-amber-50/20 p-6 sm:p-8 lg:p-10 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: IMAGE 2 */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl group ring-4 ring-emerald-500/15">
                <div className="relative h-[230px] sm:h-[300px] lg:h-[380px] w-full">
                  <Image
                    src="/images/students-library.jpg"
                    alt="University students collaborating over course notes at a campus library study table"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 p-3 backdrop-blur-md border border-emerald-200 shadow-md">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span className="truncate">Curriculum-Aligned Notes</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5 truncate">
                    Authored and reviewed by university faculty
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Crisp Features */}
            <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-[#153F35] border border-emerald-300 shadow-2xs">
                <Award className="h-3.5 w-3.5 text-emerald-700" />
                <span>ACADEMIC VERIFICATION</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#153F35] leading-tight">
                Course notes authored directly by your university lecturers.
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                Study with confidence using revision notes, worked solutions, and syllabus summaries uploaded directly by accredited educators.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/90 border border-emerald-200 shadow-2xs">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Vetted Faculty</h4>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-normal">
                      Every lecturer is verified with their university department.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/90 border border-blue-200 shadow-2xs">
                  <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Free Chapter Previews</h4>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-normal">
                      Read the syllabus outline and sample pages before unlocking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/90 border border-amber-200 shadow-2xs">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Instant Mobile Money</h4>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-normal">
                      Lecturers earn royalties directly via MTN and Airtel Mobile Money.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-emerald-700/25 transition touch-target"
                >
                  <span>Become a Verified Lecturer</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feature Section with IMAGE 3 (study-group.jpg) - Offline Reading */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-teal-50/20 p-6 sm:p-8 lg:p-10 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Offline Reading Features */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-900 border border-blue-300 shadow-2xs">
                <WifiOff className="h-3.5 w-3.5 text-blue-700" />
                <span>OFFLINE ACCESSIBILITY</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                Study anywhere with Zero-Data offline reading.
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                Save notes once on campus Wi-Fi, then read anytime without an active internet bundle.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 to-white p-4 space-y-1.5 shadow-xs">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Download className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Encrypted Storage</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    Secure on-device caching for instant offline studying.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-4 space-y-1.5 shadow-xs">
                  <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <Highlighter className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Highlighting &amp; Notes</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    Mark key concepts and save personal annotations.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition touch-target"
                >
                  <BookOpen className="h-4 w-4 text-amber-300" />
                  <span>Start Reading Offline</span>
                </Link>
              </div>
            </div>

            {/* Right Column: IMAGE 3 */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl group ring-4 ring-blue-500/15">
                <div className="relative h-[230px] sm:h-[300px] lg:h-[380px] w-full">
                  <Image
                    src="/images/study-group.jpg"
                    alt="Five university students revising together with course notebooks, textbooks and laptop"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 p-3 backdrop-blur-md border border-blue-200 shadow-md">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                    <Users className="h-4 w-4 text-blue-700 shrink-0" />
                    <span className="truncate">Peer Study &amp; Revision</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5 truncate">
                    Prepare together for semester examinations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Academic Community & Peer Tutors Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal-element">
          <Link
            href="/student/community"
            className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/80 via-white to-purple-50/40 p-4 sm:p-5 shadow-xs hover:border-purple-500 hover:shadow-md active:scale-[0.99] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-purple-700 transition truncate">
                  Academic Community
                </h3>
                <p className="text-xs text-slate-700 mt-0.5 line-clamp-1 font-medium">
                  Study groups, past paper discussions, and departmental Q&amp;A.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-purple-700 group-hover:translate-x-1 transition shrink-0" />
          </Link>

          <Link
            href="/student/tutors"
            className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 p-4 sm:p-5 shadow-xs hover:border-emerald-500 hover:shadow-md active:scale-[0.99] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition truncate">
                  Peer Tutors Desk
                </h3>
                <p className="text-xs text-slate-700 mt-0.5 line-clamp-1 font-medium">
                  1-on-1 revision sessions with top department students.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-emerald-700 group-hover:translate-x-1 transition shrink-0" />
          </Link>
        </div>
      </section>

      {/* 7. Course Unit Request Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-br from-white via-teal-50/50 to-amber-50/30 text-slate-900 p-6 sm:p-8 shadow-sm border-2 border-teal-200 reveal-element">
          <div className="text-center max-w-md mx-auto mb-5 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-900 bg-teal-100 border border-teal-300 px-3 py-0.5 rounded-full shadow-2xs">
              <span>Course Coordinator Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Can&apos;t find your course unit?
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Submit your course code and university. We will reach out to faculty to upload notes.
            </p>
          </div>

          {requestSent ? (
            <div className="rounded-2xl bg-emerald-100 border border-emerald-300 p-5 text-center space-y-1.5 max-w-sm mx-auto shadow-xs">
              <CheckCircle2 className="h-7 w-7 text-emerald-700 mx-auto" />
              <p className="text-sm font-black text-emerald-900">Course Request Logged</p>
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
            <form onSubmit={handleRequestSubmit} className="max-w-md mx-auto space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Course code (e.g. MEC 2101)"
                  className="h-11 rounded-xl bg-white border-2 border-slate-200 px-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition font-medium w-full shadow-2xs"
                />
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course unit title"
                  className="h-11 rounded-xl bg-white border-2 border-slate-200 px-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition font-medium w-full shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="University / Institute"
                  className="h-11 rounded-xl bg-white border-2 border-slate-200 px-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition font-medium w-full shadow-2xs"
                />
                <input
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="Phone or Email (Optional)"
                  className="h-11 rounded-xl bg-white border-2 border-slate-200 px-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition font-medium w-full shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-teal-600/25 touch-target"
              >
                {submittingRequest ? "Submitting..." : "Submit Course Request"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center max-w-sm mx-auto mb-5 space-y-1 reveal-element">
          <h2 className="text-2xl sm:text-3xl font-black text-[#153F35]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-700 font-medium">
            Everything you need to know about SomaUG.
          </p>
        </div>

        <div className="space-y-2 reveal-element">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                  isOpen ? "border-emerald-500 bg-white shadow-xs" : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left text-xs sm:text-sm font-bold text-slate-900 hover:bg-emerald-50/40 transition min-h-[48px] touch-target"
                >
                  <span className="pr-2">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-emerald-700" : "text-slate-400"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-xs text-slate-700 border-t border-slate-100 pt-2.5 leading-relaxed font-normal bg-amber-50/20">
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
