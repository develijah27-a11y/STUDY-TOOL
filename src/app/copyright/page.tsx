"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  FileCheck,
  Clock,
  Send,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function CopyrightPage() {
  const [formData, setFormData] = useState({
    claimantName: "",
    claimantEmail: "",
    organization: "",
    documentUrl: "",
    infringementDescription: "",
    signature: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission recording
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

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
            <Clock className="h-4 w-4" />
            <span>48-Hour Takedown Commitment</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Copyright &amp; Takedown Policy
          </h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
            SomaUG Academic strictly respects intellectual property rights. We prohibit the unauthorized distribution of copyrighted materials and act promptly to remove any infringing content within 48 hours of notification.
          </p>
        </div>

        {/* Key Policies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
              <FileCheck className="h-5 w-5 text-teal-600" />
              <h3>Author Ownership &amp; Originality</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every educator publishing on SomaUG must explicitly certify that they personally authored the material, have the legal right to sell it, and that publication does not breach institutional employment policies or third-party rights.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3>Policy on Examination Question Papers</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official past examination question papers are the intellectual property of their respective institutions or examining bodies. SomaUG does not accept or distribute unauthorized university exam question papers.
            </p>
          </div>
        </div>

        {/* Detailed Takedown Process */}
        <div className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-4 mb-8">
          <div className="flex items-center gap-2 text-[#142B45] font-bold text-base">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h2>48-Hour Notice and Takedown Procedure</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            If you are a copyright owner, author, or authorized institutional representative and believe that any study material available on SomaUG infringes your copyright, please notify us immediately. Our compliance protocol is as follows:
          </p>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 shrink-0">Step 1:</span>
              <span>Submit the notice below or email <strong>copyright@somaug.org</strong> with the material&apos;s URL or document code.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 shrink-0">Step 2:</span>
              <span>Our moderation desk reviews the claim and disables public access to the document within <strong>48 hours</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 shrink-0">Step 3:</span>
              <span>The publishing user is notified and given an opportunity to provide evidence of authorship or license. If unsubstantiated, the material is permanently removed.</span>
            </div>
          </div>
        </div>

        {/* Takedown Submission Form */}
        <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-[#142B45] mb-2">
            Submit a Copyright Takedown Request
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            All fields are required to process a formal infringement notification under our 48-hour takedown commitment.
          </p>

          {submitted ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-950">
                Takedown Notice Received
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Thank you. Your notification has been logged by our compliance desk. Public access to the specified document will be reviewed and addressed within 48 hours. A confirmation email has been dispatched.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 transition"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Your Full Name / Authorized Representative *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.claimantName}
                    onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                    placeholder="e.g. Dr. Jane Namubiru"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.claimantEmail}
                    onChange={(e) => setFormData({ ...formData, claimantEmail: e.target.value })}
                    placeholder="you@institution.ac.ug or personal email"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Institution or Organization (If Applicable)
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Faculty of Law / Independent Author"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Document URL or Title on SomaUG *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.documentUrl}
                    onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                    placeholder="e.g. somaug.org/d/MAK-CSC2101 or Unit Code"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description of Copyright Ownership &amp; Infringement *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.infringementDescription}
                  onChange={(e) => setFormData({ ...formData, infringementDescription: e.target.value })}
                  placeholder="Explain why this upload is unauthorized and describe your original work..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Electronic Signature (Type Your Full Legal Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                  placeholder="I declare under penalty of perjury that I am the copyright owner or authorized agent"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-6 py-3 text-xs font-bold transition shadow-sm"
              >
                <Send className="h-4 w-4 text-amber-400" />
                <span>{submitting ? "Submitting Notice..." : "Submit 48-Hour Takedown Request"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
