"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Search,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function DocumentCodeResolverPage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = String(params?.code || "").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState(rawCode);

  useEffect(() => {
    async function resolveCode() {
      if (!rawCode || rawCode === "index") {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/catalogue");
        const data = await res.json();
        const docs = data.documents || [];

        // Match case-insensitively by accessCode or id
        const normalized = rawCode.toLowerCase().replace(/\s+/g, "");
        const matched = docs.find((d: any) => {
          const docAccessCode = (d.accessCode || "").toLowerCase().replace(/\s+/g, "");
          const docId = (d.id || "").toLowerCase().replace(/\s+/g, "");
          const courseCode = (d.courseCode || "").toLowerCase().replace(/\s+/g, "");
          return (
            docAccessCode === normalized ||
            docId === normalized ||
            courseCode === normalized
          );
        });

        if (matched) {
          router.replace(`/catalogue/${matched.id}`);
        } else {
          setLoading(false);
          setError(`No publication found matching access code "${rawCode}".`);
        }
      } catch (err) {
        setLoading(false);
        setError("Network error resolving document code.");
      }
    }

    resolveCode();
  }, [rawCode, router]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    router.push(`/d/${encodeURIComponent(manualCode.trim().toUpperCase())}`);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center container mx-auto px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-6">
        
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
            <h2 className="text-base font-extrabold text-slate-900">
              Connecting to Verified Academic Document...
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Resolving code <span className="font-bold text-amber-700">[{rawCode}]</span> on SomaUG platform
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-sm">
              <GraduationCap className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-black text-slate-900">
                Enter Lecturer Document Code
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                If your university lecturer shared a short access code via WhatsApp or in class, enter it below to jump directly to the PDF.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center gap-2 text-left font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. CSC2101-NOTES or LAW2105"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm font-mono font-bold uppercase text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-5 py-3 text-xs font-black text-white hover:bg-[#162942] transition shadow-md"
              >
                <span>Open Document on SomaUG</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link href="/catalogue" className="font-bold text-amber-700 hover:underline">
                Browse Full Academic Catalogue →
              </Link>
              <Link href="/" className="text-slate-500 hover:text-slate-800 font-medium">
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
