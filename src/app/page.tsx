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
  Download,
  Highlighter,
  Users,
  WifiOff,
  Code2,
  Compass,
  Stethoscope,
  Briefcase,
  Scale,
  Layers,
  Check,
  Zap,
  Smartphone,
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

  // Authentic Academic Categories with Sky Blue & Orange Blended Palettes
  const academicCategories = [
    {
      code: "TECH-CS",
      faculty: "Computing & IT",
      title: "Technology & Computing",
      description: "Data structures, programming, database systems, and networking.",
      query: "Computer Science",
      icon: Code2,
      iconBg: "bg-gradient-to-tr from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/30",
      accentBorder: "hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-sky-500/15",
      linkText: "text-sky-600 dark:text-sky-400 group-hover:text-orange-500",
      codeBadge: "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800",
    },
    {
      code: "ENG-TECH",
      faculty: "Engineering",
      title: "Engineering & Applied Sciences",
      description: "Statics, structural analysis, thermodynamics, and circuits.",
      query: "Engineering",
      icon: Compass,
      iconBg: "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30",
      accentBorder: "hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-orange-500/15",
      linkText: "text-orange-600 dark:text-orange-400 group-hover:text-sky-500",
      codeBadge: "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800",
    },
    {
      code: "MED-HLTH",
      faculty: "Health Sciences",
      title: "Health & Clinical Medicine",
      description: "Anatomy, physiology, pharmacology, and clinical diagnostics.",
      query: "Health",
      icon: Stethoscope,
      iconBg: "bg-gradient-to-tr from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/30",
      accentBorder: "hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-sky-500/15",
      linkText: "text-sky-600 dark:text-sky-400 group-hover:text-orange-500",
      codeBadge: "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800",
    },
    {
      code: "BUS-ECON",
      faculty: "Business & Finance",
      title: "Economics & Management",
      description: "Accounting, corporate finance, taxation, and market economics.",
      query: "Accounting",
      icon: Briefcase,
      iconBg: "bg-gradient-to-tr from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30",
      accentBorder: "hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-orange-500/15",
      linkText: "text-orange-600 dark:text-orange-400 group-hover:text-sky-500",
      codeBadge: "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800",
    },
    {
      code: "LAW-JUR",
      faculty: "School of Law",
      title: "Law & Legal Studies",
      description: "Constitutional law, contracts, criminal jurisprudence, and civil procedure.",
      query: "Law",
      icon: Scale,
      iconBg: "bg-gradient-to-tr from-sky-500 via-sky-600 to-orange-500 text-white shadow-md shadow-sky-500/30",
      accentBorder: "hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-sky-500/15",
      linkText: "text-sky-600 dark:text-sky-400 group-hover:text-orange-500",
      codeBadge: "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800",
    },
    {
      code: "EDU-HUM",
      faculty: "Education & Arts",
      title: "Education & Humanities",
      description: "Curriculum development, instructional psychology, and pedagogy.",
      query: "Education",
      icon: GraduationCap,
      iconBg: "bg-gradient-to-tr from-orange-500 via-orange-600 to-sky-600 text-white shadow-md shadow-orange-500/30",
      accentBorder: "hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-orange-500/15",
      linkText: "text-orange-600 dark:text-orange-400 group-hover:text-sky-500",
      codeBadge: "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Hero Section - Sky Blue & Orange Harmonies */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-orange-50/40 to-slate-50 dark:from-slate-900 dark:via-sky-950/30 dark:to-slate-950 pt-10 sm:pt-16 pb-12 sm:pb-16 border-b border-sky-200/60 dark:border-slate-800">
        {/* Sky Blue & Orange Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-72 bg-gradient-to-r from-sky-400/25 via-orange-400/20 to-sky-300/20 dark:from-sky-500/15 dark:via-orange-500/15 dark:to-sky-400/10 blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left reveal-element revealed">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/90 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 px-3.5 py-1 text-xs font-bold text-sky-900 dark:text-sky-300 shadow-xs">
                <Sparkles className="h-4 w-4 text-orange-500 shrink-0" />
                <span>Uganda Higher Education Academic Exchange</span>
              </div>

              {/* Bold Headline */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight sm:leading-[1.12]">
                Authentic university notes, directly from your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-orange-500 dark:from-sky-400 dark:via-sky-300 dark:to-orange-400">
                  lecturers.
                </span>
              </h1>

              {/* Crisp Subhead */}
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Faculty-authored lecture summaries, revision guides, and past examination papers. Preview free chapters and unlock instantly with MTN or Airtel.
              </p>

              {/* Search Bar */}
              <form
                action="/catalogue"
                method="GET"
                className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0 pt-1"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search course code or title (e.g. BBA 1204)..."
                    className="w-full h-12 rounded-xl border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 pl-10 pr-4 text-base sm:text-sm text-slate-900 dark:text-white shadow-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-orange-500 hover:from-sky-600 hover:to-orange-600 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-sky-500/25 transition shrink-0 touch-target"
                >
                  <span>Search Notes</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Right Column: IMAGE 1 (hero-students.jpg) */}
            <div className="lg:col-span-5 reveal-element revealed">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 group ring-4 ring-sky-500/15 dark:ring-sky-400/20">
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
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-200 dark:border-slate-800 p-3 backdrop-blur-md shadow-lg flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      <GraduationCap className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="truncate">Campus Study Circle</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                      Uganda University Academic Notes
                    </div>
                  </div>
                  <span className="rounded-lg bg-gradient-to-r from-sky-500 to-orange-500 text-white px-3 py-1 text-xs font-bold shrink-0 shadow-xs">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar - Sky Blue & Orange Cards */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 reveal-element">
          {/* Metric 1 */}
          <div className="rounded-2xl border-2 border-sky-300 dark:border-sky-800/80 bg-gradient-to-br from-sky-50 dark:from-sky-950/50 to-white dark:to-slate-900 p-4 text-center shadow-xs hover:border-sky-500 transition">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold mb-1.5">
              <Layers className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-400">400+</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Verified Units</div>
          </div>

          {/* Metric 2 */}
          <div className="rounded-2xl border-2 border-orange-300 dark:border-orange-800/80 bg-gradient-to-br from-orange-50 dark:from-orange-950/50 to-white dark:to-slate-900 p-4 text-center shadow-xs hover:border-orange-500 transition">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold mb-1.5">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">100%</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Offline Reading</div>
          </div>

          {/* Metric 3 */}
          <div className="rounded-2xl border-2 border-sky-300 dark:border-sky-800/80 bg-gradient-to-br from-sky-50 dark:from-sky-950/50 to-white dark:to-slate-900 p-4 text-center shadow-xs hover:border-sky-500 transition">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold mb-1.5">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-400">MTN &amp; Airtel</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Instant Payments</div>
          </div>

          {/* Metric 4 */}
          <div className="rounded-2xl border-2 border-orange-300 dark:border-orange-800/80 bg-gradient-to-br from-orange-50 dark:from-orange-950/50 to-white dark:to-slate-900 p-4 text-center shadow-xs hover:border-orange-500 transition">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold mb-1.5">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">0 UGX</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Student Platform Fee</div>
          </div>
        </div>
      </section>

      {/* 3. Academic Category Cards */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl" id="academic-disciplines">
        <div className="text-center max-w-lg mx-auto mb-6 sm:mb-8 space-y-1.5 reveal-element">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Explore Faculty Course Materials
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
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
                className={`group relative flex flex-col justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md ${cat.accentBorder} active:scale-[0.99] transition-all duration-200 reveal-element ${staggerClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          {cat.faculty}
                        </span>
                        <span className={`inline-block text-xs font-mono font-black px-2 py-0.5 rounded-md mt-0.5 border ${cat.codeBadge}`}>
                          {cat.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5 font-normal">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
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
        <div className="rounded-3xl border-2 border-sky-200 dark:border-sky-900 bg-gradient-to-br from-white dark:from-slate-900 via-sky-50/40 dark:via-slate-900 to-orange-50/20 dark:to-slate-950 p-6 sm:p-8 lg:p-10 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: IMAGE 2 */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group ring-4 ring-sky-500/15 dark:ring-sky-400/20">
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
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 dark:bg-slate-900/95 p-3 backdrop-blur-md border border-sky-200 dark:border-slate-800 shadow-md">
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="truncate">Curriculum-Aligned Notes</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                    Authored and reviewed by university faculty
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Crisp Features */}
            <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Course notes authored directly by your university lecturers.
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                Study with confidence using revision notes, worked solutions, and syllabus summaries uploaded directly by accredited educators.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-sky-200 dark:border-sky-800/80 shadow-2xs">
                  <div className="h-7 w-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Vetted Faculty</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-normal">
                      Every lecturer is verified with their university department.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-orange-200 dark:border-orange-800/80 shadow-2xs">
                  <div className="h-7 w-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Free Chapter Previews</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-normal">
                      Read the syllabus outline and sample pages before unlocking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-sky-200 dark:border-sky-800/80 shadow-2xs">
                  <div className="h-7 w-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Instant Mobile Money</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-normal">
                      Lecturers earn royalties directly via MTN and Airtel Mobile Money.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-orange-500 hover:from-sky-600 hover:to-orange-600 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-sky-500/25 transition touch-target"
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
        <div className="rounded-3xl border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-white dark:from-slate-900 via-orange-50/40 dark:via-slate-900 to-sky-50/20 dark:to-slate-950 p-6 sm:p-8 lg:p-10 shadow-sm reveal-element">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Offline Reading Features */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Study anywhere with Zero-Data offline reading.
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                Save notes once on campus Wi-Fi, then read anytime without an active internet bundle.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50 dark:from-sky-950/50 to-white dark:to-slate-900 p-4 space-y-1.5 shadow-xs">
                  <div className="h-8 w-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
                    <Download className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Encrypted Storage</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    Secure on-device caching for instant offline studying.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 dark:from-orange-950/50 to-white dark:to-slate-900 p-4 space-y-1.5 shadow-xs">
                  <div className="h-8 w-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                    <Highlighter className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Highlighting &amp; Notes</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    Mark key concepts and save personal annotations.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-sky-600 hover:from-orange-600 hover:to-sky-700 active:scale-[0.98] px-6 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition touch-target"
                >
                  <BookOpen className="h-4 w-4 text-white" />
                  <span>Start Reading Offline</span>
                </Link>
              </div>
            </div>

            {/* Right Column: IMAGE 3 */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group ring-4 ring-orange-500/15 dark:ring-orange-400/20">
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
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-xl bg-white/95 dark:bg-slate-900/95 p-3 backdrop-blur-md border border-orange-200 dark:border-slate-800 shadow-md">
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                    <Users className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span className="truncate">Peer Study &amp; Revision</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5 truncate">
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
            className="rounded-2xl border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-r from-sky-50/80 dark:from-sky-950/40 via-white dark:via-slate-900 to-sky-50/40 dark:to-slate-900 p-4 sm:p-5 shadow-xs hover:border-sky-400 hover:shadow-md active:scale-[0.99] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition truncate">
                  Academic Community
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1 font-medium">
                  Study groups, past paper discussions, and departmental Q&amp;A.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition shrink-0" />
          </Link>

          <Link
            href="/student/tutors"
            className="rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50/80 dark:from-orange-950/40 via-white dark:via-slate-900 to-orange-50/40 dark:to-slate-900 p-4 sm:p-5 shadow-xs hover:border-orange-400 hover:shadow-md active:scale-[0.99] transition flex items-center justify-between group touch-target"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition truncate">
                  Peer Tutors Desk
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1 font-medium">
                  1-on-1 revision sessions with top department students.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition shrink-0" />
          </Link>
        </div>
      </section>

      {/* 7. Course Unit Request Desk */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-br from-white dark:from-slate-900 via-sky-50/40 dark:via-slate-900 to-orange-50/30 dark:to-slate-950 text-slate-900 dark:text-white p-6 sm:p-8 shadow-sm border-2 border-sky-200 dark:border-sky-800 reveal-element">
          <div className="text-center max-w-md mx-auto mb-5 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Can&apos;t find your course unit?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Submit your course code and university. We will reach out to faculty to upload notes.
            </p>
          </div>

          {requestSent ? (
            <div className="rounded-2xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700 p-5 text-center space-y-1.5 max-w-sm mx-auto shadow-xs">
              <CheckCircle2 className="h-7 w-7 text-sky-600 dark:text-sky-400 mx-auto" />
              <p className="text-sm font-black text-sky-900 dark:text-sky-200">Course Request Logged</p>
              <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed font-medium">
                Our academic coordinators have received your request and will follow up with faculty educators.
              </p>
              <button
                type="button"
                onClick={() => setRequestSent(false)}
                className="text-xs text-orange-600 dark:text-orange-400 underline font-bold pt-1 touch-target"
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
                  className="h-11 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-3.5 text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition font-medium w-full shadow-2xs"
                />
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course unit title"
                  className="h-11 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-3.5 text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition font-medium w-full shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="University / Institute"
                  className="h-11 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-3.5 text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition font-medium w-full shadow-2xs"
                />
                <input
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="Phone or Email (Optional)"
                  className="h-11 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-3.5 text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition font-medium w-full shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-orange-500 hover:from-sky-600 hover:to-orange-600 active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-sky-500/25 touch-target"
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
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
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
                  isOpen
                    ? "border-sky-500 dark:border-sky-400 bg-white dark:bg-slate-900 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:bg-sky-50/50 dark:hover:bg-slate-800 transition min-h-[48px] touch-target"
                >
                  <span className="pr-2">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-orange-500" : "text-slate-400"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2.5 leading-relaxed font-normal bg-sky-50/30 dark:bg-slate-800/40">
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
