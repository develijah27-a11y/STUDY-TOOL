"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
import { SITE_COPY } from "@/lib/constants/site-copy";
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
    }, 600);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-16 pb-16 bg-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#142B45] via-[#163252] to-[#1E3E62] text-white py-16 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl text-center sm:text-left">
          <div className="space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-semibold text-[#E9B949]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Independent Academic Study Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-5xl font-black tracking-tight leading-[1.18] text-balance">
              Access academic study notes authored by course lecturers.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
              SomaUG helps university and tertiary students find lecture notes, revision guides, and syllabus compendiums. Preview free sample pages before paying with mobile money.
            </p>

            {/* Single Prominent Search Area */}
            <form
              action="/catalogue"
              method="GET"
              className="flex flex-col sm:flex-row gap-2.5 max-w-2xl pt-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by course unit code (e.g. CSC 2101, LAW 1101) or topic..."
                  className="w-full rounded-xl border border-white/20 bg-white pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 shadow-md focus:ring-2 focus:ring-[#147D78] outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition shrink-0"
              >
                <span>Search Notes</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Two Clear Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/catalogue"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition"
              >
                <BookOpen className="h-4 w-4 text-[#E9B949]" />
                <span>Explore Materials</span>
              </Link>

              <Link
                href="/lecturer/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-7 py-3 text-xs sm:text-sm font-bold text-white transition backdrop-blur-sm"
              >
                <GraduationCap className="h-4 w-4 text-[#E9B949]" />
                <span>Join as a Lecturer</span>
              </Link>
            </div>

            <div className="text-xs text-slate-300 pt-1">
              Pay with mobile money (MTN or Airtel) · No subscription required
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center max-w-lg mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-extrabold text-[#142B45]">
            How SomaUG Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A simple 3-step study workflow built for university and college revision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SITE_COPY.howItWorks.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 relative hover:border-[#147D78] transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142B45] text-[#E9B949] font-black text-sm">
                {step.step}
              </div>
              <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Sample Document Preview Section */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 text-teal-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Genuine Document Preview
              </div>
              <h2 className="text-xl font-extrabold text-[#142B45]">
                CSC 2101: Data Structures &amp; Algorithms
              </h2>
              <p className="text-xs text-slate-500">
                Lecture Notes &amp; Solved Exercises · 42 Pages
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="block text-lg font-black text-slate-900">
                {formatUGX(3000)}
              </span>
              <span className="block text-[11px] text-slate-500">
                Pay per document · Mobile money
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visual Sample Page Box */}
            <div className="md:col-span-7 rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[11px] text-slate-500">
                <span className="font-mono font-bold text-slate-700">Sample Page 1 of 42</span>
                <span className="rounded bg-teal-100 text-teal-800 px-1.5 py-0.5 text-[10px] font-bold">Free Preview</span>
              </div>
              <div className="space-y-2 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 text-sm">Chapter 1: Asymptotic Analysis &amp; Big-O Notation</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  In computer science, algorithm analysis measures execution time and memory requirements as input size increases. Big-O provides the theoretical upper bound on asymptotic runtime...
                </p>
                <div className="rounded-lg bg-white p-3 border border-slate-200 text-[11px] font-mono text-slate-800 space-y-1">
                  <div className="text-teal-700 font-bold">// Binary Search Time Complexity: O(log n)</div>
                  <div>int low = 0, high = n - 1;</div>
                  <div>while (low &lt;= high) &#123; int mid = low + (high - low) / 2; &#125;</div>
                </div>
              </div>
            </div>

            {/* Document Details & Action */}
            <div className="md:col-span-5 space-y-4">
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Syllabus-structured course material</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Read online or save for offline study</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>24-hour purchase protection guarantee</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/catalogue"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white py-3 px-4 text-xs font-bold transition shadow-sm"
                >
                  <Eye className="h-4 w-4 text-[#E9B949]" />
                  <span>Explore All Study Materials</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Can't Find Your Course? Request Notes Engine */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-[#142B45] text-white p-6 sm:p-10 shadow-lg">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-6">
            <span className="inline-block rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 border border-teal-500/30">
              Student Request Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Can&apos;t find your course unit? Request notes.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Tell us which course unit you need notes for. We will alert verified lecturers teaching that syllabus to publish their study materials.
            </p>
          </div>

          {requestSent ? (
            <div className="rounded-2xl bg-teal-500/10 border border-teal-500/30 p-6 text-center space-y-3 max-w-lg mx-auto">
              <CheckCircle2 className="h-10 w-10 text-teal-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Course Request Logged</h3>
              <p className="text-xs text-slate-300">
                Thank you! We have logged your request. We will notify you once notes for this course unit are published.
              </p>
              <button
                type="button"
                onClick={() => setRequestSent(false)}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 transition"
              >
                Request another course unit
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit} className="max-w-xl mx-auto space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Course Unit Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CSC 2101 or LAW 1101"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Course Unit Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    University / Institute *
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Makerere, Kyambogo, BRIBTE"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Your Phone or Email (Optional)
                  </label>
                  <input
                    type="text"
                    value={studentContact}
                    onChange={(e) => setStudentContact(e.target.value)}
                    placeholder="To notify you when published"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] text-white px-7 py-3 text-xs font-bold transition shadow-md"
                >
                  <Send className="h-4 w-4 text-amber-300" />
                  <span>{submittingRequest ? "Submitting..." : "Submit Course Request"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 5. For Lecturers Section */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="inline-block rounded-full bg-teal-50 text-teal-800 px-3 py-1 text-xs font-bold border border-teal-200">
              For University &amp; Tertiary Educators
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B45]">
              {SITE_COPY.forLecturers.heading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {SITE_COPY.forLecturers.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SITE_COPY.forLecturers.benefits.map((benefit, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
              >
                <h3 className="text-xs font-bold text-slate-900">{benefit.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Author Commitment Line */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 font-medium">
            <span className="font-bold">Author Commitment:</span> Every publishing lecturer confirms: &quot;I wrote this material, I have the right to sell it, and it does not breach my employer&apos;s policy or anyone&apos;s copyright.&quot;
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/lecturer/apply"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-6 py-3 text-xs font-bold transition shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 text-[#E9B949]" />
              <span>Join as a Lecturer</span>
            </Link>

            <Link
              href="/terms"
              className="text-xs font-bold text-[#147D78] hover:underline"
            >
              Author Guidelines &amp; Policies →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center max-w-lg mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-extrabold text-[#142B45]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Clear, honest answers about how SomaUG works.
          </p>
        </div>

        <div className="space-y-3">
          {SITE_COPY.faq.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? "rotate-180 text-teal-700" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.answer}
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
