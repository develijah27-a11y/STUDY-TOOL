import React from "react";
import Link from "next/link";
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
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const publishedDocs = dbStore.documents.filter((d) => d.status === "published");
  const institutions = dbStore.institutions;
  const collections = dbStore.collections.filter((c) => c.isPublished);

  return (
    <div className="space-y-12">
      {/* Scholarly Hero Section */}
      <section className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white py-14 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Academic Resource Marketplace for Ugandan Universities</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Verified Lecture Notes, Past Paper Solutions &amp; Course Packs in{" "}
              <span className="text-amber-400">UGX</span>.
            </h1>

            <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl">
              Discover peer-reviewed course materials published directly by verified lecturers at{" "}
              <strong>Makerere (MAK)</strong>, <strong>Kyambogo (KYU)</strong>,{" "}
              <strong>MUST</strong>, <strong>MUBS</strong>, and <strong>UCU</strong>. Fund your
              student wallet once with MTN MoMo or Airtel Money and unlock instant mobile-friendly reading.
            </p>

            {/* Quick Search Bar */}
            <form
              action="/catalogue"
              method="GET"
              className="flex flex-col sm:flex-row gap-2 max-w-2xl pt-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by course code (e.g. CSC 2101, LAW 2105) or topic..."
                  className="w-full rounded-lg border-0 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 shadow-lg focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-amber-400 transition-colors"
              >
                <span>Explore Catalogue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Access Code Prompt for WhatsApp Shared Codes */}
            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <KeyRound className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Received a Document Access Code on WhatsApp?</span>
              <Link
                href="/d"
                className="font-bold text-amber-400 hover:text-amber-300 underline"
              >
                Enter Code Directly →
              </Link>
            </div>

            {/* Institution Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-300 font-medium">Browse by University:</span>
              {institutions.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/catalogue?institutionId=${inst.id}`}
                  className="rounded-md bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 text-xs font-semibold text-white transition"
                >
                  {inst.shortCode} — {inst.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Guarantees */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">100% Verified Lecturers</h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Every publisher undergoes institutional staff verification before publishing or setting prices.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-amber-50 p-2.5 text-amber-700">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Atomic Student Wallet</h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Deposit via MTN MoMo or Airtel Money. Purchases execute atomically with instant digital receipts.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2.5 text-blue-700">
              <Share2 className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">WhatsApp Class Packs</h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Lecturers generate official course bundle links and QR codes that class coordinators can forward to WhatsApp groups.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-lg bg-purple-50 p-2.5 text-purple-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Protected Study Reader</h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Read on any Android phone or laptop with bookmarks, private notes, reading progress, and dynamic watermarking.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      <section className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Peer-Reviewed Course Materials
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Featured University Publications
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f2027] hover:underline"
          >
            <span>View Full Academic Catalogue ({publishedDocs.length})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedDocs.map((doc) => {
            const inst = dbStore.institutions.find((i) => i.id === doc.institutionId);
            const course = dbStore.courses.find((c) => c.id === doc.courseUnitId);
            const lecturer = dbStore.lecturerProfiles.find((l) => l.id === doc.lecturerId);

            return (
              <div
                key={doc.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                      <Building2 className="h-3 w-3 text-slate-500" />
                      {inst?.shortCode} • {course?.code}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-900">
                      {formatUGX(doc.priceUGX)}
                    </span>
                  </div>

                  <Link href={`/catalogue/${doc.id}`} className="block group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                      {doc.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doc.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{lecturer?.fullName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {doc.pageCount} pages • v{doc.currentVersion}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/catalogue/${doc.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f2027] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Inspect &amp; Preview</span>
                    </Link>
                    <Link
                      href={`/student/read/${doc.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      Reader
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lecturer-Curated WhatsApp Course Collections */}
      <section className="container mx-auto px-4 space-y-6">
        <div className="rounded-2xl bg-slate-900 text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Share2 className="h-3.5 w-3.5" />
                Built for WhatsApp Class Groups
              </span>
              <h2 className="text-xl md:text-2xl font-bold">
                Lecturer-Curated Course Resource Collections
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Authorized lecturers assemble semester study packs with a shareable link and QR code.
                Students and class coordinators can forward these links to class WhatsApp groups
                without ever gaining unauthorized editing or pricing access.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {collections.map((col) => {
                const lec = dbStore.lecturerProfiles.find((l) => l.id === col.lecturerId);
                return (
                  <div
                    key={col.id}
                    className="rounded-xl bg-white/10 border border-white/15 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <span className="text-[11px] font-mono text-amber-300">
                        Code: {col.shareCode}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{col.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        Curated by {lec?.fullName} • {col.documentIds.length} publications
                      </p>
                    </div>
                    <Link
                      href={`/collections/${col.shareCode}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                    >
                      <span>Open Collection &amp; QR Share</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

