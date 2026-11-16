"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Database,
  Globe2,
  UserCheck,
  ArrowLeft,
  Info,
} from "lucide-react";

export default function PrivacyPage() {
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
            <ShieldCheck className="h-4 w-4" />
            <span>Data Protection &amp; Privacy Notice</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
            SomaUG Academic is committed to protecting your personal data in full compliance with Uganda&apos;s Data Protection and Privacy Act 2019. We follow the principle of data minimization: we collect only what is necessary to serve your study needs.
          </p>
          <div className="mt-4 text-xs text-slate-400">
            Last Updated: November 2026 · Compliant with Uganda DPPA 2019 (PDPO)
          </div>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900">Minimal Collection</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never ask for National ID Numbers (NIN), bank account passwords, or confidential private data.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900">Purpose Limitation</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your details are used strictly to deliver study notes, verify lecturer payouts, and confirm mobile money purchases.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <UserCheck className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900">User Rights</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have the statutory right under Ugandan law to access, rectify, or request deletion of your account records.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">1</span>
              <h2>Information We Collect</h2>
            </div>
            <p>
              When you use SomaUG Academic, we collect only the minimal data required to provide study access:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>
                <strong className="text-slate-800">Account Credentials:</strong> Email address, mobile telephone number, and display name.
              </li>
              <li>
                <strong className="text-slate-800">Academic Preferences (Optional):</strong> Your university or vocational institute name, program, and course unit selections to personalize recommendations.
              </li>
              <li>
                <strong className="text-slate-800">Transaction History:</strong> Mobile money payment confirmation references and document purchase receipts.
              </li>
              <li>
                <strong className="text-slate-800">Lecturer Verification Data:</strong> For publishing educators, department email or teaching credential evidence to review authenticity before publishing.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">2</span>
              <h2>Payment Security &amp; Mobile Money Data</h2>
            </div>
            <p>
              Payments on SomaUG are processed directly through licensed third-party mobile money payment gateways. SomaUG does not hold, store, or transmit your mobile money PIN or confidential wallet credentials. Payment status callbacks contain only transaction identifiers, timestamp, amount in UGX, and masked telephone numbers.
            </p>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">3</span>
              <h2>Cross-Border Data Transfer Disclosure</h2>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
              <Globe2 className="h-5 w-5 text-slate-700 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Statutory Notice under Section 19 of the Uganda Data Protection and Privacy Act:</span>
                {" "}SomaUG utilizes enterprise cloud infrastructure provided by Vercel and Supabase. While user interactions occur in Uganda, encrypted databases and application servers are hosted in secure data centers outside Uganda adhering to SOC 2 Type II and ISO 27001 data security standards. By creating an account, you acknowledge and consent to this technical transmission.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">4</span>
              <h2>Your Rights as a Data Subject</h2>
            </div>
            <p>
              Under Ugandan data protection law, you hold the following rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800 block mb-1">Right to Access</strong>
                You can review your purchase history, profile details, and library at any time from your account dashboard.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800 block mb-1">Right to Rectification</strong>
                You may update incorrect phone numbers, course units, or names directly in your profile settings.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800 block mb-1">Right to Erasure (Deletion)</strong>
                You may request complete deletion of your account and personal identifiers by contacting privacy@somaug.org.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800 block mb-1">Right to Object</strong>
                You may opt out of non-essential academic notifications or promotional updates at any time.
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold">5</span>
              <h2>Data Retention &amp; Inquiries</h2>
            </div>
            <p>
              We retain account data for as long as your account remains active or as required by commercial tax and transaction reporting regulations in Uganda. For inquiries regarding this policy or to exercise your statutory rights, email{" "}
              <a href="mailto:privacy@somaug.org" className="text-teal-700 font-bold underline">
                privacy@somaug.org
              </a>{" "}
              or contact us via our{" "}
              <Link href="/contact" className="text-teal-700 font-bold hover:underline">
                Contact Page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
