import React from "react";
import Link from "next/link";
import { dbStore } from "@/lib/db/in-memory-store";
import { formatUGX } from "@/lib/utils";
import { SITE_COPY } from "@/lib/constants/site-copy";
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#142B45] via-[#1A3859] to-[#1E3E62] text-white py-14 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <div className="space-y-7">
            {/* Top Academic Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-[#E9B949] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#E9B949]" />
              <span>{SITE_COPY.hero.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-5xl font-bold tracking-tight leading-[1.2] text-balance">
              {SITE_COPY.hero.headline}
            </h1>

            {/* Subline */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
              {SITE_COPY.hero.subline}
            </p>

            {/* Primary Action 1: Search Form (Placed immediately above onboarding) */}
            <form
              action="/catalogue"
              method="GET"
              className="flex flex-col sm:flex-row gap-2.5 max-w-2xl pt-1"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder={SITE_COPY.actions.searchPlaceholder}
                  className="w-full rounded-xl border border-white/20 bg-white pl-11 pr-4 py-3 text-sm text-[#243244] shadow-md focus:ring-2 focus:ring-[#147D78] focus:border-[#147D78] outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D78] hover:bg-[#116965] px-6 py-3 text-sm font-bold text-white shadow-md active:scale-[0.99] transition shrink-0"
              >
                <span>{SITE_COPY.actions.searchButton}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Primary Action 2: Onboarding Card */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 sm:p-7 shadow-xl space-y-4 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#E9B949] uppercase tracking-wider block">
                    {SITE_COPY.hero.onboardingHeading}
                  </span>
                  <p className="text-sm text-slate-100 font-normal leading-relaxed">
                    {SITE_COPY.hero.onboardingBody}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E9B949] hover:bg-[#d9a838] px-5 py-2.5 text-xs font-bold text-[#142B45] shadow-sm transition"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{SITE_COPY.actions.createAccount}</span>
                  </Link>

                  <Link
                    href="/catalogue"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-5 py-2.5 text-xs font-bold text-white transition backdrop-blur-sm"
                  >
                    <Compass className="h-4 w-4" />
                    <span>{SITE_COPY.actions.browseVisitor}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section (Clean Editorial Vector Artwork - Zero External Image Dependencies) */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Universities */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                <UniversityEditorialIllustration className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#147D78] uppercase tracking-wider block">
                  {SITE_COPY.featureCards.universities.category}
                </span>
                <h2 className="text-base font-bold text-[#142B45] leading-snug">
                  {SITE_COPY.featureCards.universities.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {SITE_COPY.featureCards.universities.body}
                </p>
              </div>
            </div>

            <Link
              href="/catalogue?category=university"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#147D78] hover:underline pt-3"
            >
              <span>{SITE_COPY.featureCards.universities.linkText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: Vocational & Technical */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                <VocationalEditorialIllustration className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#147D78] uppercase tracking-wider block">
                  {SITE_COPY.featureCards.vocational.category}
                </span>
                <h2 className="text-base font-bold text-[#142B45] leading-snug">
                  {SITE_COPY.featureCards.vocational.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {SITE_COPY.featureCards.vocational.body}
                </p>
              </div>
            </div>

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#147D78] hover:underline pt-3"
            >
              <span>{SITE_COPY.featureCards.vocational.linkText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 3: Payments & WhatsApp */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                <MoMoEditorialIllustration className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#147D78] uppercase tracking-wider block">
                  {SITE_COPY.featureCards.payments.category}
                </span>
                <h2 className="text-base font-bold text-[#142B45] leading-snug">
                  {SITE_COPY.featureCards.payments.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {SITE_COPY.featureCards.payments.body}
                </p>
              </div>
            </div>

            <Link
              href="/student/wallet"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#147D78] hover:underline pt-3"
            >
              <span>{SITE_COPY.featureCards.payments.linkText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Institution Taxonomy Directory with Document Counts & Equal Heights */}
      <section className="container mx-auto px-4 max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#142B45]">
              {SITE_COPY.institutions.heading}
            </h2>
            <p className="text-sm text-slate-600 font-normal">
              {SITE_COPY.institutions.subtitle}
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#147D78] hover:underline shrink-0"
          >
            <span>{SITE_COPY.institutions.viewAll}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Universities Row */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            {SITE_COPY.institutions.universitiesLabel}
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
                    <span className="block text-xs text-slate-500 font-normal">
                      {inst.location.split(",")[0]}
                    </span>
                  </div>
                  <span className="block text-xs font-medium text-slate-500 pt-1 border-t border-slate-100">
                    {docCount} {docCount === 1 ? "document" : "documents"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Vocational & Technical Row */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            {SITE_COPY.institutions.vocationalLabel}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
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
                    <span className="block text-xs text-slate-500 font-normal">
                      {inst.location.split(",")[0]}
                    </span>
                  </div>
                  <span className="block text-xs font-medium text-slate-500 pt-1 border-t border-slate-100">
                    {docCount} {docCount === 1 ? "document" : "documents"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recently Published Publications (Enhanced Card Content Hierarchy) */}
      <section className="container mx-auto px-4 max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#142B45]">
              {SITE_COPY.publications.heading}
            </h2>
            <p className="text-sm text-slate-600 font-normal">
              {SITE_COPY.publications.subtitle}
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#147D78] hover:underline shrink-0"
          >
            <span>{SITE_COPY.publications.seeAll(publishedDocs.length)}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publishedDocs.slice(0, 6).map((doc) => {
            const inst = institutions.find((i) => i.id === doc.institutionId);
            const course = dbStore.courses.find((c) => c.id === doc.courseUnitId);
            const lecturer = dbStore.lecturerProfiles.find((l) => l.id === doc.lecturerId);

            return (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Row: Course Code Badge & Prominent Price */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-800">
                      {course?.code || doc.courseUnitId}
                    </span>
                    <span className="text-base font-bold text-[#142B45]">
                      {formatUGX(doc.priceUGX)}
                    </span>
                  </div>

                  {/* Title limited to 2 lines */}
                  <Link href={`/catalogue/${doc.id}`} className="block group">
                    <h3 className="text-base font-bold text-[#142B45] group-hover:text-[#147D78] transition line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>
                  </Link>

                  {/* Lecturer Name directly under Title */}
                  <div className="text-xs text-slate-600 font-medium truncate">
                    By {lecturer?.fullName || "Course Lecturer"}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {doc.description}
                  </p>

                  {/* Metadata Row: Page count and Institution tag (>= 12px) */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-normal">
                    <span className="font-semibold text-slate-700">{inst?.shortCode || "UG"}</span>
                    <span>•</span>
                    <span>{doc.pageCount} pages</span>
                  </div>
                </div>

                {/* Action: View Publication & Sample */}
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href={`/catalogue/${doc.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#142B45] px-3.5 py-2.5 text-xs font-bold text-white hover:bg-[#1A3859] active:scale-[0.99] transition"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-[#E9B949]" />
                    <span>{SITE_COPY.actions.viewAndBuy}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Guarantees & Features (Factual academic copy) */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-[#147D78] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#142B45]">{SITE_COPY.guarantees.lecturersTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {SITE_COPY.guarantees.lecturersBody}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-[#E9B949] flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#142B45]">{SITE_COPY.guarantees.ledgerTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {SITE_COPY.guarantees.ledgerBody}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#142B45]">{SITE_COPY.guarantees.momoTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {SITE_COPY.guarantees.momoBody}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#142B45]">{SITE_COPY.guarantees.readerTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {SITE_COPY.guarantees.readerBody}
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner (Unified Button Labels) */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="rounded-2xl bg-gradient-to-r from-[#142B45] via-[#1A3859] to-[#1E3E62] text-white p-8 sm:p-12 shadow-xl text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
              {SITE_COPY.bottomBanner.heading}
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {SITE_COPY.bottomBanner.body}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#E9B949] hover:bg-[#d9a838] px-7 py-3 text-xs font-bold text-[#142B45] shadow-md transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>{SITE_COPY.actions.createAccount}</span>
            </Link>

            <Link
              href="/catalogue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-7 py-3 text-xs font-bold text-white transition backdrop-blur-sm"
            >
              <Compass className="h-4 w-4" />
              <span>{SITE_COPY.actions.browseVisitor}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
