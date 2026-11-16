"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Lock,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  BadgePercent,
  FileText,
} from "lucide-react";

export default function LecturerVerificationApplyPage() {
  const [fullName, setFullName] = useState("");
  const [institutionId, setInstitutionId] = useState("inst-mak");
  const [department, setDepartment] = useState("");
  const [teachingRole, setTeachingRole] = useState("Lecturer");
  const [contactEmail, setContactEmail] = useState("");
  const [payoutNetwork, setPayoutNetwork] = useState<"MTN" | "AIRTEL">("MTN");
  const [payoutPhone, setPayoutPhone] = useState("");
  const [authorDeclaration, setAuthorDeclaration] = useState(false);
  const [status, setStatus] = useState<"draft" | "submitted">("draft");

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorDeclaration) {
      alert("Please confirm the authorship declaration before submitting.");
      return;
    }
    setStatus("submitted");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 px-3 py-1 text-xs font-bold text-teal-300">
              <BadgePercent className="h-3.5 w-3.5" />
              <span>85% Net Split For Authors</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Apply to Publish on SomaUG
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Every lecturer application is reviewed by SomaUG before publishing. You keep 85% of your document sales and withdraw directly to your MTN or Airtel mobile money number.
            </p>
          </div>
          <Link
            href="/lecturer/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shrink-0"
          >
            <span>Lecturer Desk</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {status === "submitted" ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Application Received</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you, {fullName || "Educator"}! We have received your application. Our team reviews educator details to ensure course unit relevance. You will receive an SMS or email notification once approved.
          </p>
          <div className="pt-2">
            <Link
              href="/lecturer/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#142B45] text-white px-5 py-2.5 text-xs font-bold"
            >
              <span>Go to Lecturer Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmitApplication}
          className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6 text-xs"
        >
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Academic Appointment &amp; Institution
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
              <Lock className="h-3 w-3 text-emerald-600" />
              Review by SomaUG Desk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Academic Name &amp; Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Jane Namubiru"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                University or Institute *
              </label>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="inst-mak">Makerere University (MAK)</option>
                <option value="inst-kyu">Kyambogo University (KYU)</option>
                <option value="inst-must">Mbarara University (MUST)</option>
                <option value="inst-ucu">Uganda Christian University (UCU)</option>
                <option value="inst-mubs">Makerere University Business School (MUBS)</option>
                <option value="inst-bribte">Buganda Royal Institute (BRIBTE)</option>
                <option value="inst-uict">Uganda Institute of ICT (UICT)</option>
                <option value="other">Other Institution</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Faculty / Department *
              </label>
              <input
                type="text"
                placeholder="e.g. Department of Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Teaching Role *
              </label>
              <select
                value={teachingRole}
                onChange={(e) => setTeachingRole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Senior Lecturer">Senior Lecturer</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Assistant Lecturer">Assistant Lecturer</option>
                <option value="Teaching Assistant">Teaching Assistant / Tutor</option>
                <option value="Vocational Instructor">Vocational Instructor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Contact Email Address *
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="e.g. name@mak.ac.ug or personal email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Registered Mobile Money Payout Destination */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Mobile Money Withdrawal Account
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              When students purchase your study materials, 85% of each sale is credited to your balance. You can withdraw directly to this mobile money number.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Money Provider *
                </label>
                <select
                  value={payoutNetwork}
                  onChange={(e) => setPayoutNetwork(e.target.value as "MTN" | "AIRTEL")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="AIRTEL">Airtel Money</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Money Phone Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0772 123 456"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mandatory Author Declaration */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-3">
            <span className="font-bold flex items-center gap-1.5 text-amber-950 text-xs">
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              <span>Mandatory Authorship &amp; Copyright Declaration:</span>
            </span>
            <label className="flex items-start gap-2.5 text-xs text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={authorDeclaration}
                onChange={(e) => setAuthorDeclaration(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="leading-relaxed">
                I confirm that I wrote or hold the copyright for the materials I publish, I have the right to sell them, and my publications do not breach my employer&apos;s policy or anyone&apos;s copyright. I understand that SomaUG does not accept unauthorized past examination question papers.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={!authorDeclaration}
              className="w-full sm:w-auto rounded-xl bg-[#142B45] hover:bg-[#1A3859] px-6 py-3 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
            >
              Submit Application for Review
            </button>

            <Link
              href="/terms"
              className="text-xs font-bold text-[#147D78] hover:underline"
            >
              Read Full Author Terms &amp; Policies →
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
