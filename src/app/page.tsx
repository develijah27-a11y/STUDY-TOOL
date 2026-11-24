"use client";

import React, { useState } from "react";
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
  Clock,
  Award,
  Layers,
  FileCheck2,
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

  // Replaced any algorithms mention with software engineering & cloud
  const disciplines = [
    {
      title: "Computer Science & IT",
      icon: Code2,
      tags: "Software Systems, Databases, Cloud Networks",
      query: "Computer Science",
      count: "94 Units",
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200",
    },
    {
      title: "Law & Legal Studies",
      icon: Scale,
      tags: "Constitutional, Commercial, Criminal Law",
      query: "Law",
      count: "68 Units",
      color: "from-amber-500/10 to-yellow-500/10 text-amber-700 border-amber-200",
    },
    {
      title: "Business & Economics",
      icon: Briefcase,
      tags: "Accounting, Procurement, Public Finance",
      query: "Accounting",
      count: "82 Units",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200",
    },
    {
      title: "Engineering & Tech",
      icon: Wrench,
      tags: "Electrical, Civil, Mechanical Systems",
      query: "Engineering",
      count: "55 Units",
      color: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200",
    },
    {
      title: "Health & Medicine",
      icon: Stethoscope,
      tags: "Clinical Anatomy, Pharmacology, Nursing",
      query: "Health",
      count: "47 Units",
      color: "from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200",
    },
    {
      title: "Education & Humanities",
      icon: BookMarked,
      tags: "Curriculum Studies, Psychology, Ethics",
      query: "Education",
      count: "61 Units",
      color: "from-cyan-500/10 to-teal-500/10 text-cyan-700 border-cyan-200",
    },
  ];

  const faqs = [
    {
      q: "How do I access course notes?",
      a: "Search by your course unit code, preview sample pages for free, and unlock access via MTN or Airtel Mobile Money.",
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
    <div className="space-y-16 sm:space-y-20 pb-20 bg-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071224] via-[#0D1F38] to-[#142B45] text-white pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-slate-800">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#147D78]/20 via-[#147D78]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all shrink-0 hover:shadow-teal-900/40"
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Popular Course Units (No Algorithms) */}
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-6 py-3 text-xs sm:text-sm font-bold text-white transition"
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

            {/* Right Column: Desktop-Only Study Reader Preview Mockup (HIDDEN ON MOBILE) */}
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

      {/* 3. Course Disciplines Grid */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-md mx-auto mb-8 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#142B45]">
            Browse Disciplines
          </h2>
          <p className="text-xs text-slate-500">
            Select your faculty to discover course lecture notes and exam guides.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={`/catalogue?q=${encodeURIComponent(item.query)}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#147D78] hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 border`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition">
                        {item.title}
                      </h3>
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-normal">
                      {item.tags}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Three Core Pillars */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Pay solely for the course units you take via MTN or Airtel. No recurring recurring monthly fees.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Community & Tutors */}
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

      {/* 6. Request Course Notes Form */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-2xl bg-gradient-to-br from-[#0B1528] to-[#142B45] text-white p-6 sm:p-8 shadow-md border border-slate-800">
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

      {/* 7. Lecturer Call to Action */}
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

      {/* 8. FAQ */}
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
