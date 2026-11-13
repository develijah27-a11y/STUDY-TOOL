"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Lock,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function LecturerVerificationApplyPage() {
  const [fullName, setFullName] = useState("Dr. Emmanuel Ssemogerere");
  const [institutionId, setInstitutionId] = useState("inst-mak");
  const [department, setDepartment] = useState(
    "Department of Electrical & Computer Engineering (CEDAT)"
  );
  const [teachingRole, setTeachingRole] = useState("Senior Lecturer");
  const [institutionalEmail, setInstitutionalEmail] = useState("e.ssemogerere@cedat.mak.ac.ug");
  const [manualReviewRequested, setManualReviewRequested] = useState(false);
  const [payoutNetwork, setPayoutNetwork] = useState<"MTN" | "AIRTEL">("MTN");
  const [payoutPhone, setPayoutPhone] = useState("0772889900");
  const [status, setStatus] = useState<"draft" | "submitted" | "under_review" | "approved">(
    "under_review"
  );

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitted");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      <div className="rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Academic Publisher Verification (Part IV §9)</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Lecturer Verification &amp; Payout Registration
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              To protect students from unverified handouts and copyright infringement, all
              lecturers complete verification before publishing or receiving weekly mobile money payouts.
            </p>
          </div>
          <Link
            href="/lecturer/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shrink-0"
          >
            <span>Go to Lecturer Hub</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Verification Status Pipeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Application Verification Lifecycle
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { key: "draft", label: "1. Draft Profile" },
            { key: "submitted", label: "2. Evidence Submitted" },
            { key: "under_review", label: "3. Academic Review" },
            { key: "approved", label: "4. Approved Publisher" },
          ].map((step) => {
            const isCurrent = status === step.key;
            return (
              <div
                key={step.key}
                className={`rounded-xl border p-3 font-bold flex items-center gap-2 ${
                  isCurrent
                    ? "border-amber-400 bg-amber-50 text-amber-950"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {isCurrent ? (
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application Form */}
      <form
        onSubmit={handleSubmitApplication}
        className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6 text-xs"
      >
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              Institutional Credentials &amp; Teaching Appointment
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
            <Lock className="h-3 w-3 text-emerald-600" />
            Evidence Stored Privately
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Academic Name &amp; Title
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              University / Institution
            </label>
            <select
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              <option value="inst-mak">Makerere University (MAK)</option>
              <option value="inst-kyu">Kyambogo University (KYU)</option>
              <option value="inst-must">Mbarara University (MUST)</option>
              <option value="inst-ucu">Uganda Christian University (UCU)</option>
              <option value="inst-mubs">Makerere University Business School (MUBS)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Faculty / Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teaching Role
            </label>
            <select
              value={teachingRole}
              onChange={(e) => setTeachingRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Senior Lecturer">Senior Lecturer</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Assistant Lecturer">Assistant Lecturer</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-bold text-slate-700">
            Institutional Email Address (`.ac.ug`)
          </label>
          <input
            type="email"
            value={institutionalEmail}
            onChange={(e) => setInstitutionalEmail(e.target.value)}
            placeholder="name@mak.ac.ug"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
          <label className="flex items-center gap-2 text-slate-600 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={manualReviewRequested}
              onChange={(e) => setManualReviewRequested(e.target.checked)}
              className="rounded"
            />
            <span>
              I do not currently have an active `.ac.ug` email — request manual appointment letter
              verification by administration staff.
            </span>
          </label>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
            <span>Verification Evidence (University Staff ID or Appointment Letter)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Privacy Guarantee: Verification documents are stored in encrypted private storage and
            may only be inspected by authorized verification staff. They are never exposed on your
            public lecturer profile.
          </p>
        </div>

        {/* Registered Mobile Money Payout Destination */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Registered Mobile Money Payout Destination (Weekly Consolidated Settlement)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Telecom Network
              </label>
              <select
                value={payoutNetwork}
                onChange={(e) => setPayoutNetwork(e.target.value as "MTN" | "AIRTEL")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-bold"
              >
                <option value="MTN">MTN Mobile Money Uganda</option>
                <option value="AIRTEL">Airtel Money Uganda</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Registered Mobile Money Number
              </label>
              <input
                type="text"
                value={payoutPhone}
                onChange={(e) => setPayoutPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="rounded-xl bg-[#0B192C] px-6 py-3 text-xs font-bold text-white hover:bg-slate-800"
          >
            Submit Verification Application for Review
          </button>

          <Link
            href="/admin/dashboard"
            className="text-xs font-bold text-amber-700 hover:underline"
          >
            Review Applications in Admin Portal →
          </Link>
        </div>
      </form>
    </div>
  );
}

