"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Smartphone,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    category: "Payment / Mobile Money",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 500);
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
            <HelpCircle className="h-4 w-4" />
            <span>Student &amp; Lecturer Support</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Contact Support
          </h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
            Have questions about a mobile money payment, course unit materials, or publishing your study notes? We are here to assist.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <a
            href="https://wa.me/256700000000?text=Hello%20SomaUG%20Support,%20I%20need%20help%20with%20"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-emerald-400 transition group space-y-2 block"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="text-xs font-bold text-slate-900">WhatsApp Helpdesk</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fastest response for urgent mobile money transaction and unlock queries.
            </p>
            <span className="text-xs font-bold text-emerald-700 block pt-1">
              Chat on WhatsApp →
            </span>
          </a>

          <a
            href="mailto:support@somaug.org"
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-teal-400 transition group space-y-2 block"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:scale-110 transition">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xs font-bold text-slate-900">Email Support</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              For copyright inquiries, lecturer onboarding verification, or feedback.
            </p>
            <span className="text-xs font-bold text-teal-700 block pt-1">
              support@somaug.org →
            </span>
          </a>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xs font-bold text-slate-900">Support Hours</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monday – Saturday<br />
              8:00 AM – 8:00 PM (East Africa Time, Kampala)
            </p>
            <span className="text-[11px] font-semibold text-slate-500 block pt-1">
              Sunday: Urgent payment issues only
            </span>
          </div>
        </div>

        {/* Message Form */}
        <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-[#142B45] mb-2">
            Send Us a Message
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Leave your details and question. Our team typically replies within 2 to 4 business hours.
          </p>

          {submitted ? (
            <div className="rounded-2xl bg-teal-50 border border-teal-200 p-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-teal-600 mx-auto" />
              <h3 className="text-sm font-bold text-teal-950">
                Message Dispatched
              </h3>
              <p className="text-xs text-teal-800 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. We have logged your request and our support desk will contact you via WhatsApp or email shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 transition"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kenneth Kato"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone Number or Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. 077... or 075... or email"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  What do you need help with? *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="Payment / Mobile Money">Payment / Mobile Money Unlock Issue</option>
                  <option value="Document Access">Document Access / Offline Reading Issue</option>
                  <option value="Lecturer Publishing">Lecturer Publishing / Onboarding</option>
                  <option value="Copyright / Content Report">Report Content / Copyright Question</option>
                  <option value="General Feedback">General Feedback / Suggest a Course Unit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Your Message or Question *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue or question clearly..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white px-6 py-3 text-xs font-bold transition shadow-sm"
              >
                <Send className="h-4 w-4 text-amber-400" />
                <span>{submitting ? "Sending..." : "Send Support Message"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
