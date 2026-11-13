import React from "react";
import Link from "next/link";
import Image from "next/image";
import { dbStore } from "@/lib/db/in-memory-store";
import { formatUGX } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Wallet,
  Share2,
  ArrowRight,
  Building2,
  FileText,
  Sparkles,
  KeyRound,
  UserPlus,
  Compass,
  Zap,
  Wrench,
  Award,
  Smartphone,
  ChevronRight,
  Star,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const publishedDocs = dbStore.documents.filter((d) => d.status === "published");
  const institutions = dbStore.institutions;

  const universities = institutions.filter((i) => !i.category || i.category === "university");
  const vocationalColleges = institutions.filter(
    (i) => i.category === "vocational_polytechnic" || i.category === "college" || i.category === "specialized"
  );

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B192C] via-[#162942] to-[#1E3E62] text-white py-16 md:py-24 border-b border-slate-800">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl space-y-8">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Uganda&apos;s Central Higher Education &amp; Vocational Learning Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Verified Lecture Notes, Technical Manuals &amp; Past Papers in{" "}
              <span className="text-amber-400 underline decoration-amber-500/40 decoration-wavy">UGX</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-3xl font-normal">
              Peer-reviewed academic materials published directly by accredited lecturers and tutors across{" "}
              <strong className="text-white">Makerere (MAK)</strong>, <strong className="text-white">Kyambogo (KYU)</strong>,{" "}
              <strong className="text-white">MUST</strong>, and premier technical colleges including{" "}
              <strong className="text-amber-300">Buganda Royal Institute (BRIBTE)</strong>,{" "}
              <strong className="text-amber-300">Kampala Polytechnic Mengo</strong>, and{" "}
              <strong className="text-amber-300">UICT Nakawa</strong>.
            </p>

            {/* Prominent Onboarding Card */}
            <div className="rounded-3xl border-2 border-amber-400/80 bg-white/10 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    <span>New to SomaUG Academic?</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Start Reading or Publish Course Materials Today
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    Fund your wallet once via MTN/Airtel Money or browse peer-reviewed materials freely.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-xs font-black text-slate-950 shadow-lg hover:bg-amber-400 active:scale-[0.98] transition"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create an Account</span>
                  </Link>

                  <Link
                    href="/catalogue"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 hover:bg-white/20 px-6 py-3.5 text-xs font-extrabold text-white transition backdrop-blur-sm"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Browse Catalogue as Visitor</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Search & Code Entry Bar */}
            <div className="space-y-3 pt-2">
              <form
                action="/catalogue"
                method="GET"
                className="flex flex-col sm:flex-row gap-2 max-w-3xl"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search by course (e.g. CSC 2101, BRIBTE EE 1101, LAW 2105) or topic..."
                    className="w-full rounded-2xl border-0 bg-white pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 shadow-xl focus:ring-2 focus:ring-amber-400 outline-none font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 border border-slate-700 px-6 py-3.5 text-xs font-black text-white shadow-xl hover:bg-slate-800 transition"
                >
                  <span>Search Materials</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </button>
              </form>

              {/* WhatsApp Code Quick Link */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <KeyRound className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Received a Document Code or Link from your Tutor on WhatsApp?</span>
                <Link
                  href="/d"
                  className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-0.5"
                >
                  <span>Enter Code Directly</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Academic & Technical Vocational Showcase Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Universities */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md transition group">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                alt="Ugandan university students studying with verified lecture compendiums"
                className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#0B192C]/90 text-amber-400 px-3 py-1 rounded-full text-[11px] font-black backdrop-blur-sm">
                Universities
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Chartered University Compendiums
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Comprehensive lecture notes, past exams with marking schemes, and laboratory practical guides for Makerere, Kyambogo, MUST, MUBS, UCU, and KIU.
              </p>
            </div>

            <Link
              href="/catalogue?category=university"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline pt-2"
            >
              <span>Explore University Notes</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 2: Vocational & Polytechnic Institutes */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md transition group">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                alt="Technical and vocational engineering students in practical workshop"
                className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#0B192C]/90 text-emerald-400 px-3 py-1 rounded-full text-[11px] font-black backdrop-blur-sm">
                Vocational &amp; Technical
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Vocational &amp; Polytechnic Guides
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                UBTEB syllabus handbooks, electrical installation diagrams, automotive engine overhaul guides, and telecommunications practicals for Buganda Royal, Kampala Polytechnic, and UICT.
              </p>
            </div>

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-2"
            >
              <span>Explore Technical Manuals</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 3: Mobile Money & WhatsApp Class Sharing */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md transition group">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80"
                alt="Instant Mobile Money payments and digital study reader"
                className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#0B192C]/90 text-amber-400 px-3 py-1 rounded-full text-[11px] font-black backdrop-blur-sm">
                Fintech &amp; WhatsApp
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Instant MoMo &amp; WhatsApp Access
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Deposit once in exact integer UGX with MTN MoMo or Airtel Money. Lecturers share 1-click links and codes directly into class WhatsApp groups.
              </p>
            </div>

            <Link
              href="/student/wallet"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline pt-2"
            >
              <span>View UGX Student Wallet</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive Institution Taxonomy Directory */}
      <section className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Browse by University &amp; Vocational Institute
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Curated materials from 14+ certified higher education institutions and polytechnics across Uganda
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 hover:underline"
          >
            <span>View Full Directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Universities Row */}
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
            Universities
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {universities.map((inst) => (
              <Link
                key={inst.id}
                href={`/catalogue?institutionId=${inst.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center space-y-1.5 hover:border-slate-900 hover:shadow-sm transition"
              >
                <span className="inline-block rounded-lg bg-[#0B192C] text-amber-400 font-mono font-black text-xs px-2.5 py-1">
                  {inst.shortCode}
                </span>
                <span className="block text-xs font-extrabold text-slate-900 line-clamp-1">
                  {inst.name}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">
                  {inst.location.split(",")[0]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Vocational & Technical Row */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
            Vocational, Technical &amp; Polytechnic Institutes
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {vocationalColleges.map((inst) => (
              <Link
                key={inst.id}
                href={`/catalogue?institutionId=${inst.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center space-y-1.5 hover:border-emerald-600 hover:shadow-sm transition"
              >
                <span className="inline-block rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-black text-xs px-2.5 py-1">
                  {inst.shortCode}
                </span>
                <span className="block text-xs font-extrabold text-slate-900 line-clamp-2">
                  {inst.name}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">
                  {inst.location.split(",")[0]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Featured Documents from Universities & Technical Colleges */}
      <section className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Recently Published Publications &amp; Guides
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Verified notes, UBTEB practical handbooks, and past paper model solutions ready to unlock
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 hover:underline"
          >
            <span>See All {publishedDocs.length} Publications</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publishedDocs.slice(0, 6).map((doc) => {
            const inst = institutions.find((i) => i.id === doc.institutionId);
            const isVocational = inst?.category && inst.category !== "university";

            return (
              <div
                key={doc.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-black ${
                        isVocational
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {inst?.shortCode || "UG"} • {isVocational ? "Vocational" : "University"}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {formatUGX(doc.priceUGX)}
                    </span>
                  </div>

                  <Link href={`/catalogue/${doc.id}`} className="block group">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-md bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-mono font-bold">
                      Code: {doc.accessCode || doc.id}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                      {doc.pageCount} Pages
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  <Link
                    href={`/catalogue/${doc.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B192C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#162942] transition"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                    <span>View &amp; Buy</span>
                  </Link>

                  <Link
                    href={`/d/${doc.accessCode || doc.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    title="Quick Direct Access Link"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4 Core Guarantees & Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">100% Verified Tutors</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Every lecturer and workshop instructor undergoes strict institutional verification before publishing materials.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Double-Entry UGX Ledger</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Exact integer Ugandan Shilling accounting. Balances, refunds, and earnings are balanced to zero discrepancy.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">MTN &amp; Airtel Mobile Money</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Top up student wallet via instant USSD prompt (*165# / *185#). Zero hassle and instant document unlocks.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Protected DRM Reader</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Anti-piracy dynamic student watermarking, customizable themes (Sepia/Dark/Light), notes, and bookmarks.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Excel in Your University or Technical Exams?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Join thousands of Ugandan students accessing authoritative compendiums from verified lecturers.
              Instant access on your phone, tablet, or laptop.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-xs font-black text-slate-950 shadow-lg hover:bg-amber-400 active:scale-[0.98] transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Free Student Account</span>
            </Link>

            <Link
              href="/catalogue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 hover:bg-white/20 px-8 py-4 text-xs font-extrabold text-white transition backdrop-blur-sm"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Catalogue as Visitor</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
