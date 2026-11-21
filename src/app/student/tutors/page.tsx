"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
import {
  GraduationCap,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Filter,
  MessageSquare,
  ShieldCheck,
  Send,
} from "lucide-react";

interface TutorProfile {
  id: string;
  name: string;
  title: string;
  institution: string;
  subjects: string[];
  hourlyRateUGX: number;
  ratingAverage: number;
  reviewsCount: number;
  availability: string;
  bio: string;
  isVerified: boolean;
}

export default function FindTutorPage() {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [studentContact, setStudentContact] = useState("");

  const tutors: TutorProfile[] = [
    {
      id: "tut-1",
      name: "Eng. Brian Kateregga",
      title: "Algorithms & Systems Tutor",
      institution: "Makerere University (CEDAT)",
      subjects: ["Data Structures", "Algorithms", "C++ Programming", "Database Design"],
      hourlyRateUGX: 15000,
      ratingAverage: 4.9,
      reviewsCount: 38,
      availability: "Weekday evenings & Saturday mornings",
      bio: "CEDAT graduate with 4 years tutoring computing students in complex algorithmic recurrence relations, graph theory, and database normalization.",
      isVerified: true,
    },
    {
      id: "tut-2",
      name: "Adv. Christine Akello",
      title: "Commercial & Contract Law Tutor",
      institution: "Makerere University / LDC",
      subjects: ["Law of Contract", "Torts", "Commercial Transactions", "Legal Research"],
      hourlyRateUGX: 20000,
      ratingAverage: 4.8,
      reviewsCount: 26,
      availability: "Saturdays & Sunday afternoons",
      bio: "Practicing advocate and academic tutor guiding LLB students through case analysis, problem question structuring, and statutory interpretation.",
      isVerified: true,
    },
    {
      id: "tut-3",
      name: "Mr. Ronald Mugerwa",
      title: "Quantitative Methods & Financial Accounting",
      institution: "Makerere University Business School (MUBS)",
      subjects: ["Business Statistics", "Financial Accounting", "Cost Accounting"],
      hourlyRateUGX: 12000,
      ratingAverage: 4.9,
      reviewsCount: 42,
      availability: "Flexible weekday slots (online or in-person)",
      bio: "Experienced accounting tutor specializing in helping BBA and B.Com students master reconciliations, depreciation, and quantitative regression models.",
      isVerified: true,
    },
    {
      id: "tut-4",
      name: "Ms. Fiona Nabatanzi",
      title: "Electrical Principles & Workshop Math",
      institution: "Buganda Royal Institute (BRIBTE)",
      subjects: ["Electrical Technology", "Engineering Math", "UBTEB Workshop Guide"],
      hourlyRateUGX: 10000,
      ratingAverage: 4.7,
      reviewsCount: 19,
      availability: "Weekends (Mengo / Online)",
      bio: "Certified technical instructor helping diploma and certificate candidates prepare for UBTEB practicals and theory examinations.",
      isVerified: true,
    },
  ];

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setSelectedTutor(null);
      setInquiryMessage("");
      setStudentContact("");
    }, 1500);
  };

  const filteredTutors = tutors.filter((t) => {
    const matchSubject =
      selectedSubject === "all" ||
      t.subjects.some((s) => s.toLowerCase().includes(selectedSubject.toLowerCase()));
    const matchSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSubject && matchSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-[#142B45] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 text-teal-300 px-3 py-0.5 text-xs font-bold border border-teal-500/30">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Verified Peer &amp; Faculty Tutoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find an Academic Tutor
          </h1>
          <p className="text-xs text-slate-300">
            Book 1-on-1 revision sessions with subject tutors.
          </p>
        </div>
      </div>

      {/* Trust Guarantee */}
      <div className="rounded-2xl bg-teal-50 border border-teal-200 p-3.5 flex items-center gap-2.5 text-xs text-teal-950 font-medium">
        <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
        <span>Tutors set hourly rates in UGX. Direct session scheduling.</span>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject or tutor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#147D78]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600">Subject Area:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="all">All Disciplines</option>
            <option value="Algorithms">Algorithms &amp; Computing</option>
            <option value="Law">Law &amp; Jurisprudence</option>
            <option value="Accounting">Accounting &amp; Business</option>
            <option value="Engineering">Engineering &amp; Technical</option>
          </select>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTutors.map((tutor) => (
          <div
            key={tutor.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#147D78] transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {tutor.name}
                    </h3>
                    {tutor.isVerified && (
                      <span title="Verified Tutor">
                        <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 block">
                    {tutor.title}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {tutor.institution}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black text-slate-900 block font-mono">
                    {formatUGX(tutor.hourlyRateUGX)}
                  </span>
                  <span className="text-xs text-slate-500">per hour</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tutor.bio}
              </p>

              {/* Subjects */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tutor.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="rounded-md bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-medium"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              {/* Rating & Availability */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{tutor.ratingAverage}</span>
                  <span className="text-slate-400 font-normal">({tutor.reviewsCount} reviews)</span>
                </div>

                <div className="flex items-center gap-1 text-slate-600 text-xs">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{tutor.availability}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTutor(tutor)}
              className="w-full rounded-xl bg-[#142B45] hover:bg-[#1A3859] text-white py-2.5 text-xs font-bold transition shadow-sm"
            >
              Request Tutoring Session
            </button>
          </div>
        ))}
      </div>

      {/* Inquiry Modal */}
      {selectedTutor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Request Tutoring: {selectedTutor.name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Rate: {formatUGX(selectedTutor.hourlyRateUGX)}/hr
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTutor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {inquirySent ? (
              <div className="p-4 rounded-2xl bg-teal-50 text-teal-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <span>Tutoring request dispatched! The tutor will reach out via WhatsApp/email.</span>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Your Phone Number (WhatsApp preferred) or Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0772 123 456 or name@student.ac.ug"
                    value={studentContact}
                    onChange={(e) => setStudentContact(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Topic / Course Unit You Need Help With *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mention your course unit, specific topic, and preferred meeting times..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTutor(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#142B45] text-white font-bold hover:bg-[#1A3859]"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

