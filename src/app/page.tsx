import React from "react";
import Link from "next/link";
import { dbStore } from "@/lib/db/in-memory-store";
import { formatUGX } from "@/lib/utils";
import {
  UniversityEditorialIllustration,
  VocationalEditorialIllustration,
  MoMoEditorialIllustration,
} from "@/components/common/editorial-illustrations";
import {
  Search,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Building2,
  Sparkles,
  UserPlus,
  Compass,
  Smartphone,
  ChevronRight,
  GraduationCap,
  FileText,
  BadgePercent,
  QrCode,
  Share2,
  Lock,
  Layers,
  Award,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const publishedDocs = dbStore.documents.filter((d) => d.status === "published");
  const institutions = dbStore.institutions;

  const universities = institutions.filter((i) => !i.category || i.category === "university");
  const vocationalColleges = institutions.filter(
    (i) =>
      i.category === "vocational_polytechnic" ||
      i.category === "college" ||
      i.category === "specialized"
  );

  return (
    <div className="space-y-16 pb-16 bg-[#F7F8FA]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#142B45] via-[#163252] to-[#1E3E62] text-white py-16 md:py-24 border-b border-slate-800">
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <div className="space-y-6 text-center sm:text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold text-[#E9B949] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#E9B949]" />
              <span>Start from UGX 2,000 · Browse for free · Pay with mobile money.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-balance">
              Study smarter with notes from your lecturers.
            </h1>

            {/* Core Subtitle */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl font-normal">
              Find lecturer-prepared notes, past examination papers, practical manuals and revision materials from universities and vocational institutes across Uganda.
            </p>

            {/* Trust Tagline */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-teal-200 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#E9B949]" />
                Affordable materials
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Secure MTN MoMo &amp; Airtel Money payments
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-amber-300" />
                Instant access
              </span>
            </div>

            {/* Prominent Search Bar */}
            <form
              action="/catalogue"
              method="GET"
              className="flex flex-col sm:flex-row gap-2.5 max-w-3xl pt-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search course code (e.g. CSC 2101), unit title, lecturer or university..."
                  className="w-full rounded-xl border border-white/20 bg-white pl-11 pr-4 py-3.5 text-xs sm:text-sm text-[#243244] shadow-lg focus:ring-2 focus:ring-[#147D78] focus:border-[#147D78] outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md active:scale-[0.99] transition shrink-0"
              >
                <span>Search Materials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Popular:</span>
              {[
                { label: "CSC 2101", q: "CSC 2101" },
                { label: "Makerere (MAK)", q: "MAK" },
                { label: "Past Papers", q: "Past Papers" },
                { label: "Kyambogo (KYU)", q: "KYU" },
                { label: "Lecture Notes", q: "Notes" },
                { label: "Buganda Royal (BRIBTE)", q: "BRIBTE" },
              ].map((tag) => (
                <Link
                  key={tag.label}
                  href={`/catalogue?q=${encodeURIComponent(tag.q)}`}
                  className="rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 px-2.5 py-1 text-xs font-medium transition"
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 pt-3">
              <Link
                href="/catalogue"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition"
              >
                <BookOpen className="h-4 w-4 text-[#E9B949]" />
                <span>Browse Study Materials</span>
              </Link>

              <Link
                href="/lecturer/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-7 py-3.5 text-xs sm:text-sm font-bold text-white transition backdrop-blur-sm"
              >
                <GraduationCap className="h-4 w-4 text-[#E9B949]" />
                <span>Join as a Lecturer</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Attractive Category Cards */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B45]">
            Curated For Ugandan Higher Education
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Whether preparing for semester examinations or mastering technical trade skills, explore authentic materials organized by faculty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category Card 1: University Study Materials */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md hover:border-[#147D78]/60 transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-3">
                <UniversityEditorialIllustration className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#147D78] uppercase tracking-wider block">
                  Degree Programmes
                </span>
                <h3 className="text-base font-bold text-[#142B45] leading-snug">
                  University Study Materials
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Syllabus compendiums, worked past paper solutions, and lecture notes tailored for Makerere, Kyambogo, MUST, MUBS, UCU, and KIU faculties.
                </p>
              </div>
            </div>

            <Link
              href="/catalogue?category=university"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#147D78] hover:underline pt-3 border-t border-slate-100"
            >
              <span>Explore University Materials</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Category Card 2: Technical & Vocational Materials */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md hover:border-[#147D78]/60 transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-3">
                <VocationalEditorialIllustration className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#147D78] uppercase tracking-wider block">
                  Technical &amp; Vocational
                </span>
                <h3 className="text-base font-bold text-[#142B45] leading-snug">
                  Technical &amp; Vocational Materials
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  UBTEB past papers, electrical installation manuals, automotive technology, and ICT cabling guides from BRIBTE, Kampala Poly Mengo, and UICT.
                </p>
              </div>
            </div>

            <Link
              href="/catalogue?category=vocational_polytechnic"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#147D78] hover:underline pt-3 border-t border-slate-100"
            >
              <span>Explore Vocational Materials</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Category Card 3: Lecturer-Verified Resources */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md hover:border-[#147D78]/60 transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-3">
                <MoMoEditorialIllustration className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#147D78] uppercase tracking-wider block">
                  Verified Authorship
                </span>
                <h3 className="text-base font-bold text-[#142B45] leading-snug">
                  Lecturer-Verified Resources
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Academic materials authored and uploaded directly by accredited lecturers. No unverified, synthetic, or scraped documents.
                </p>
              </div>
            </div>

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#147D78] hover:underline pt-3 border-t border-slate-100"
            >
              <span>Browse Verified Resources</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Visually Rich Institution Directory */}
      <section id="institutions" className="container mx-auto px-4 max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#142B45]">
              Participating Higher Education Institutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Accredited universities, polytechnics, and vocational institutes across Uganda.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#147D78] hover:underline shrink-0"
          >
            <span>View All in Catalogue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Universities Grid */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Universities
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {universities.map((inst) => {
              const docCount = publishedDocs.filter((d) => d.institutionId === inst.id).length;

              return (
                <Link
                  key={inst.id}
                  href={`/catalogue?institutionId=${inst.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 text-center flex flex-col justify-between space-y-2 hover:border-[#142B45] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#147D78] outline-none transition"
                >
                  <div className="space-y-1">
                    <span className="inline-block rounded-md bg-[#142B45] text-[#E9B949] font-mono font-bold text-xs px-2.5 py-0.5">
                      {inst.shortCode}
                    </span>
                    <span className="block text-xs font-bold text-[#243244] line-clamp-1">
                      {inst.name}
                    </span>
                    <span className="block text-[11px] text-slate-500 font-normal truncate">
                      {inst.location.split(",")[0]}
                    </span>
                  </div>
                  <span className="block text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-100">
                    {docCount} {docCount === 1 ? "document" : "documents"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Vocational & Technical Institutes Grid */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Vocational &amp; Technical Institutes
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {vocationalColleges.map((inst) => {
              const docCount = publishedDocs.filter((d) => d.institutionId === inst.id).length;

              return (
                <Link
                  key={inst.id}
                  href={`/catalogue?institutionId=${inst.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 text-center flex flex-col justify-between space-y-2 hover:border-[#147D78] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#147D78] outline-none transition"
                >
                  <div className="space-y-1">
                    <span className="inline-block rounded-md bg-emerald-50 text-[#147D78] border border-emerald-200 font-mono font-bold text-xs px-2.5 py-0.5">
                      {inst.shortCode}
                    </span>
                    <span className="block text-xs font-bold text-[#243244] line-clamp-1">
                      {inst.name}
                    </span>
                    <span className="block text-[11px] text-slate-500 font-normal truncate">
                      {inst.location.split(",")[0]}
                    </span>
                  </div>
                  <span className="block text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-100">
                    {docCount} {docCount === 1 ? "document" : "documents"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Lecturer Publishing & Earnings Section */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-r from-[#142B45] via-[#1A3859] to-[#1E3E62] text-white p-8 md:p-12 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column (7 cols): Proposition & Highlights */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/40 px-3.5 py-1 text-xs font-bold text-amber-300">
                <BadgePercent className="h-4 w-4" />
                <span>85% Net Royalty Split For Educators</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Publish Your Lecture Notes &amp; Earn Directly in UGX.
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Join verified lecturers across Makerere, Kyambogo, and accredited institutes. Distribute course unit notes, past paper solutions, and practical guides with automated weekly MoMo payouts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="rounded-xl bg-white/10 p-3.5 space-y-1 border border-white/10">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Wallet className="h-4 w-4 text-[#E9B949]" />
                    <span>85% Revenue Share</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Transparent financial ledger with automated weekly MTN MoMo or Airtel Money payouts.
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-3.5 space-y-1 border border-white/10">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Protected Copyright</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Dynamic student watermarking and secure in-browser reader prevent unauthorized redistribution.
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-3.5 space-y-1 border border-white/10">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <QrCode className="h-4 w-4 text-teal-300" />
                    <span>Slide QR Codes</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Generate 1-click classroom QR codes for projector slides and printed student handouts.
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-3.5 space-y-1 border border-white/10">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Share2 className="h-4 w-4 text-amber-300" />
                    <span>Class WhatsApp Packs</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Share organized semester bundles directly to course WhatsApp groups with instant preview.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                <Link
                  href="/lecturer/apply"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#E9B949] hover:bg-[#d9a838] px-6 py-3 text-xs font-extrabold text-[#142B45] shadow-md transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Apply to Publish as Lecturer</span>
                </Link>

                <Link
                  href="/lecturer/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-6 py-3 text-xs font-bold text-white transition"
                >
                  <span>Lecturer Dashboard →</span>
                </Link>
              </div>
            </div>

            {/* Right Column (5 cols): Visual Preview Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#E9B949]" />
                  <span className="font-bold text-sm text-white">Verified Lecturer Workspace</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-slate-300">Earnings Split</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">85% Lecturer / 15% Platform</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-slate-300">Supported Networks</span>
                  <span className="font-bold text-white">MTN MoMo &amp; Airtel Money</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-slate-300">Pricing Freedom</span>
                  <span className="font-bold text-white">UGX 1,000 — UGX 50,000</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-slate-300">Payout Schedule</span>
                  <span className="font-bold text-white">Automated Weekly Settlements</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 italic pt-1">
                Lecturers retain full copyright ownership and can update or unpublish materials at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Platform Guarantees (Trust Framework) */}
      <section id="guarantees" className="container mx-auto px-4 max-w-6xl space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#142B45]">
            Built on Academic Trust &amp; Integrity
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Every transaction and document upload is backed by strict institutional verification.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-[#147D78] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#142B45]">Authorized Faculty</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Materials originate exclusively from accredited lecturers verified by department email and institutional staff IDs.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-[#E9B949] flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#142B45]">Accurate Ledger</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              All transactions are recorded in double-entry UGX accounting. Zero hidden deductions or inflated balances.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#142B45]">MTN &amp; Airtel MoMo</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Instant document unlock through authorized Uganda mobile money gateways with instant confirmation receipts.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#142B45]">Secure Web Reader</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Read unlocked materials immediately on phone, tablet, or PC with personal bookmarks, notes, and progress saving.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Bottom Final CTA */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-r from-[#142B45] via-[#1A3859] to-[#1E3E62] text-white p-8 sm:p-14 shadow-xl text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-balance">
              Ready to study smarter?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Access verified lecture notes, past paper marking guides, and vocational handbooks starting from UGX 2,000.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/catalogue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition"
            >
              <BookOpen className="h-4 w-4 text-[#E9B949]" />
              <span>Browse Study Materials</span>
            </Link>

            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#E9B949] hover:bg-[#d9a838] px-8 py-3.5 text-xs sm:text-sm font-extrabold text-[#142B45] shadow-md transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Free Account</span>
            </Link>

            <Link
              href="/lecturer/apply"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-7 py-3.5 text-xs sm:text-sm font-bold text-white transition backdrop-blur-sm"
            >
              <GraduationCap className="h-4 w-4 text-[#E9B949]" />
              <span>Join as a Lecturer</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
