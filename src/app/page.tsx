"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
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
  Code2,
  Scale,
  Briefcase,
  Wrench,
  Stethoscope,
  BookMarked,
  Users,
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

  const disciplines = [
    { title: "Computer Science & IT", icon: Code2, tags: "Algorithms, Databases, Networks", query: "Computer Science", color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200" },
    { title: "Law & Legal Studies", icon: Scale, tags: "Constitutional, Criminal, Commercial", query: "Law", color: "from-amber-500/10 to-yellow-500/10 text-amber-700 border-amber-200" },
    { title: "Business & Finance", icon: Briefcase, tags: "Accounting, Economics, Procurement", query: "Accounting", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200" },
    { title: "Engineering & Tech", icon: Wrench, tags: "Circuits, Thermodynamics, Mechanics", query: "Engineering", color: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200" },
    { title: "Health & Medicine", icon: Stethoscope, tags: "Anatomy, Pharmacology, Public Health", query: "Health", color: "from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200" },
    { title: "Humanities & Education", icon: BookMarked, tags: "Curriculum, Psychology, Ethics", query: "Education", color: "from-cyan-500/10 to-teal-500/10 text-cyan-700 border-cyan-200" },
  ];

  const faqs = [
    {
      q: "How do I access materials?",
      a: "Search by course code, preview sample pages for free, and unlock instantly with MTN or Airtel Mobile Money.",
    },
    {
      q: "Can I read offline?",
      a: "Yes. Tap 'Download Offline' inside the reader to save encrypted notes to your device for zero-data reading.",
    },
    {
      q: "How do lecturers get paid?",
      a: "Lecturers set their own document prices and withdraw earnings directly to their mobile money wallets at any time.",
    },
    {
      q: "What if a document has errors?",
      a: "We offer a 24-hour refund guarantee if an unlocked document is incomplete or does not match its syllabus description.",
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#F8FAFC]">
      {/* 1. Hero Section - Ultra Clean & Minimal */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1528] via-[#10223D] to-[#142B45] text-white pt-12 pb-16 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-[#E9B949]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Uganda Academic Materials</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Study notes from course lecturers.
              </h1>

              <p className="text-sm sm:text-base text-slate-200 font-normal max-w-lg mx-auto lg:mx-0">
                Course notes and past papers. Free previews. Instant mobile money unlock.
              </p>

              {/* Search Box */}
              <form
                action="/catalogue"
                method="GET"
                className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0 pt-1"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Course code (e.g. CSC 2101, LAW 1101)..."
                    className="w-full rounded-xl border border-white/20 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 shadow outline-none focus:ring-2 focus:ring-[#147D78] font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow transition shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Quick Code Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-300">
                <span className="text-xs text-slate-400">Popular:</span>
                {["CSC 2101", "LAW 1101", "BBA 1204", "MEC 2101"].map((code) => (
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
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-sm"
                >
                  <BookOpen className="h-4 w-4 text-[#E9B949]" />
                  <span>Explore Notes</span>
                </Link>

                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition"
                >
                  <GraduationCap className="h-4 w-4 text-[#E9B949]" />
                  <span>Join as Lecturer</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-teal-400" /> MTN &amp; Airtel MoMo
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5 text-amber-400" /> Offline Reading
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 24h Guarantee
                </span>
              </div>
            </div>

            {/* Right Column: Clean Reader Preview Mockup */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-xl backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                  <span className="font-mono text-slate-400">CSC 2101 · Notes</span>
                  <span className="rounded-full bg-teal-500/20 text-teal-300 px-2 py-0.5 text-xs font-bold flex items-center gap-1">
                    <Download className="h-3 w-3" /> Offline Ready
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Data Structures &amp; Algorithms</span>
                  <span className="font-mono text-teal-300 font-bold">UGX 3,000</span>
                </div>

                {/* Reader Sample */}
                <div className="rounded-xl bg-white p-3 text-slate-800 text-xs space-y-2 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Binary Search</span>
                    <span className="font-mono">Page 4 of 42</span>
                  </div>

                  <div className="p-1.5 rounded bg-amber-50 text-amber-950 font-medium border-l-2 border-amber-500 text-xs">
                    Time complexity: O(log n) worst-case.
                  </div>

                  <div className="p-1.5 rounded bg-emerald-50 text-emerald-950 font-medium border-l-2 border-emerald-500 text-xs">
                    Recurrence: T(n) = T(n/2) + O(1).
                  </div>

                  <div className="rounded bg-slate-900 p-2 font-mono text-xs text-slate-200">
                    <span className="text-teal-400">// Midpoint</span>
                    <div>mid = low + (high - low) / 2;</div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Highlighter className="h-3.5 w-3.5 text-slate-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                    </div>
                    <span className="text-teal-700 font-bold flex items-center gap-1">
                      <StickyNote className="h-3 w-3" /> Notes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Course Disciplines Grid */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-md mx-auto mb-8 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#142B45]">
            Browse Disciplines
          </h2>
          <p className="text-xs text-slate-500">
            Select a field to find course materials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={`/catalogue?q=${encodeURIComponent(item.query)}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#147D78] transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 border`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.tags}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Three Core Features */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Offline Reading</h3>
            <p className="text-xs text-slate-600">
              Download notes once on campus Wi-Fi. Read anytime without mobile data.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-[#E9B949] flex items-center justify-center">
              <Highlighter className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Highlights &amp; Notes</h3>
            <p className="text-xs text-slate-600">
              Color-code key terms in yellow, green, or blue. Add margin notes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Mobile Money</h3>
            <p className="text-xs text-slate-600">
              Pay per document via MTN or Airtel. No monthly subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Community & Tutors */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/student/community"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-purple-300 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Study Community</h3>
                <p className="text-xs text-slate-500">Course Q&amp;A and group discussions</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-purple-700 shrink-0" />
          </Link>

          <Link
            href="/student/tutors"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Find a Tutor</h3>
                <p className="text-xs text-slate-500">1-on-1 revision sessions</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-700 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 5. Request Course Notes */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-2xl bg-[#142B45] text-white p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-md mx-auto mb-5 space-y-1">
            <h2 className="text-lg sm:text-xl font-bold">
              Can&apos;t find your course unit?
            </h2>
            <p className="text-xs text-slate-300">
              Submit your course code. We will notify relevant lecturers.
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
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Course code (e.g. CSC 2101)"
                  className="rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-400"
                />
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Course title"
                  className="rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
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

      {/* 6. For Lecturers */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-[#142B45]">
              Publish Course Notes
            </h2>
            <p className="text-xs text-slate-500">
              Upload study materials, set your price, and withdraw earnings via Mobile Money.
            </p>
          </div>
          <Link
            href="/lecturer/apply"
            className="rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-5 py-2.5 text-xs font-bold transition shrink-0"
          >
            Join as Lecturer
          </Link>
        </div>
      </section>

      {/* 7. FAQ */}
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
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 hover:bg-slate-50"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-teal-700" : ""
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
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
