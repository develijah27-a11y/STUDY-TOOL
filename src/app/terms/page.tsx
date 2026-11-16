"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldAlert,
  Scale,
  DollarSign,
  UserCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="rounded-3xl bg-[#142B45] text-white p-8 md:p-10 shadow-lg mb-8">
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 mb-4 border border-amber-400/30">
            <Scale className="h-4 w-4" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Terms of Use
          </h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
            Please read these terms carefully before using SomaUG Academic. By creating an account, browsing documents, or purchasing materials, you agree to these terms.
          </p>
          <div className="mt-4 text-xs text-slate-400">
            Last Updated: November 2026 · Independent Educational Platform
          </div>
        </div>

        {/* Mandatory Independence Notice */}
        <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-amber-950 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Independence Notice:</span> SomaUG Academic is an independent digital study marketplace. It is not affiliated with, endorsed by, or sponsored by Makerere University, Kyambogo University, or any higher education or vocational institution. Institution names are used solely as descriptors to help students discover course-relevant revision materials.
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">1</span>
              <h2>About the Platform</h2>
            </div>
            <p>
              SomaUG Academic provides an online platform where verified educators, lecturers, and academic tutors can publish original lecture notes, study summaries, and revision guides for university and vocational curricula in Uganda. Students can search for course units, inspect free sample pages, and purchase study access using mobile money.
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">2</span>
              <h2>Lecturer Publishing &amp; Author Ownership</h2>
            </div>
            <p>
              Educators who register to publish on SomaUG retain full copyright in their original literary works. By uploading materials, the publishing educator grants SomaUG a non-exclusive, worldwide, royalty-bearing license to host, display sample previews, and distribute copies to purchasing students.
            </p>
            <p className="font-semibold text-slate-800">
              Mandatory Authorship Warranty:
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs font-medium text-slate-700 italic">
              &quot;I confirm that I wrote this material, I have the legal right to sell it, and it does not breach my employer&apos;s institutional policy, contractual obligations, or any third party&apos;s copyright.&quot;
            </div>
            <p className="text-xs text-slate-500">
              SomaUG reviews lecturer applications prior to granting publication privileges. We do not permit unauthorized past examination papers belonging to universities or examining boards.
            </p>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">3</span>
              <h2>Pricing, Platform Fees &amp; Revenue Split</h2>
            </div>
            <p>
              SomaUG operates an open, transparent revenue split for all published materials:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-teal-50 border border-teal-200 p-4">
                <span className="block text-2xl font-black text-teal-800">85%</span>
                <span className="text-xs font-bold text-teal-900 block mt-1">To the Author / Lecturer</span>
                <span className="text-[11px] text-teal-700 block mt-0.5">
                  Direct earnings from each document purchased by students.
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <span className="block text-2xl font-black text-slate-800">15%</span>
                <span className="text-xs font-bold text-slate-900 block mt-1">SomaUG Platform Fee</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  Covers licensed mobile money gateway fees, web hosting, and maintenance.
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Lecturers can request mobile money payouts directly to their registered MTN or Airtel phone number once their available balance reaches the minimum threshold.
            </p>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">4</span>
              <h2>Student Purchases &amp; Permitted Use</h2>
            </div>
            <p>
              When a student purchases a document, they receive a personal, non-exclusive, non-transferable license to view, highlight, annotate, and study the material for their own individual educational revision.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Purchases are processed per document directly using mobile money (MTN or Airtel).</li>
              <li>Students may not resell, publicly distribute, upload to file-sharing websites, or mass-distribute materials in social media groups.</li>
              <li>SomaUG applies personalized identification markers to documents to prevent unauthorized leakage and protect lecturer intellectual property.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">5</span>
              <h2>Refunds &amp; File Integrity</h2>
            </div>
            <p>
              We provide a 24-hour refund policy if a purchased file is corrupted, illegible, or materially different from the course unit description. Details on how to submit a refund request are provided in our{" "}
              <Link href="/refunds" className="text-teal-700 font-bold hover:underline">
                Refund Policy
              </Link>.
            </p>
          </section>

          {/* Section 6 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">6</span>
              <h2>Copyright Complaints &amp; Takedown Procedure</h2>
            </div>
            <p>
              We respect intellectual property rights and act promptly upon receiving credible notifications of claimed copyright infringement. Notice requirements and our 48-hour takedown process are detailed on our{" "}
              <Link href="/copyright" className="text-teal-700 font-bold hover:underline">
                Copyright &amp; Takedown Policy
              </Link>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">7</span>
              <h2>Limitation of Liability &amp; Disclaimers</h2>
            </div>
            <p>
              Study materials on SomaUG are prepared by independent lecturers and tutors to assist in personal revision. SomaUG does not guarantee examination scores, institutional course grades, or academic credentials. The platform is provided on an &quot;as is&quot; basis within reasonable commercial standards.
            </p>
          </section>
        </div>

        {/* Contact Strip */}
        <div className="mt-8 rounded-2xl bg-slate-100 p-6 text-center text-xs text-slate-600 border border-slate-200">
          Questions regarding these terms? Contact our team at{" "}
          <Link href="/contact" className="text-teal-700 font-bold hover:underline">
            Support &amp; Contact
          </Link>{" "}
          or email <a href="mailto:support@somaug.org" className="font-bold underline">support@somaug.org</a>.
        </div>
      </div>
    </div>
  );
}
