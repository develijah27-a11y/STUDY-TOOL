"use client";

import React from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Clock,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

export default function RefundsPage() {
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
          <div className="inline-flex items-center gap-2 rounded-xl bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-300 mb-4 border border-teal-500/30">
            <Clock className="h-4 w-4" />
            <span>24-Hour Purchase Protection</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Refund &amp; Dispute Policy
          </h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
            Every publication on SomaUG provides free sample pages and a table of contents so you can inspect quality prior to paying. If technical or material issues arise, our 24-hour refund policy protects your mobile money transaction.
          </p>
        </div>

        {/* Eligible Situations */}
        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#142B45]">
              Eligible Grounds for a Full Refund (Within 24 Hours)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <strong className="text-slate-900 block">Corrupted / Inaccessible File</strong>
                <p className="text-slate-600">
                  The document fails to open, contains unreadable pages, or produces technical errors on your device.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <strong className="text-slate-900 block">Material Misdescription</strong>
                <p className="text-slate-600">
                  The document covers an entirely different syllabus, course unit, or level than described in the author title.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <strong className="text-slate-900 block">Duplicate Billing</strong>
                <p className="text-slate-600">
                  A mobile money glitch caused double deduction for a single document unlock.
                </p>
              </div>
            </div>
          </section>

          {/* Ineligible Situations */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-[#142B45]">
              Ineligible Circumstances
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Change of mind after fully reading or downloading the complete document.</li>
              <li>Failure to check the free preview pages prior to checkout where the preview accurately reflected the content.</li>
              <li>Refund claims submitted after the 24-hour window from the transaction timestamp.</li>
            </ul>
          </section>

          {/* How to Claim */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#142B45]">
              How to Request a Refund
            </h2>
            <p className="text-xs text-slate-600">
              To request a refund within 24 hours of purchase, follow these steps:
            </p>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 font-bold text-[11px] shrink-0">1</span>
                <div>
                  <strong>Locate Your Transaction Reference:</strong> Keep the Mobile Money SMS confirmation (MTN Txn ID or Airtel Money Ref) and your document title or code.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 font-bold text-[11px] shrink-0">2</span>
                <div>
                  <strong>Contact Support:</strong> Reach out via WhatsApp or email (details below) stating your phone number, document ID, and the issue experienced.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 font-bold text-[11px] shrink-0">3</span>
                <div>
                  <strong>Resolution:</strong> Upon validation, funds are credited back to your originating mobile money account within 24 to 48 business hours.
                </div>
              </div>
            </div>
          </section>

          {/* Quick Help Card */}
          <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-teal-950">Need Help with a Purchase?</h3>
              <p className="text-xs text-teal-800 mt-0.5">
                Our support team is available Monday through Saturday to review transaction issues.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] text-white px-5 py-2.5 text-xs font-bold transition shadow-sm shrink-0"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
