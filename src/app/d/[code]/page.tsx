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
  QrCode,
  Camera,
} from "lucide-react";

export default function DocumentCodeResolverPage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = String(params?.code || "").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState(rawCode);
  const [activeTab, setActiveTab] = useState<"code" | "qr">("code");

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
              <QrCode className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-black text-slate-900">
                Scan QR or Enter Document Code
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan the visual QR code projected in class, or enter the short code to open the verified lecture material.
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`flex-1 py-2 rounded-lg transition ${
                  activeTab === "code"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Enter Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("qr")}
                className={`flex-1 py-2 rounded-lg transition ${
                  activeTab === "qr"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Scan QR Code
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center gap-2 text-left font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === "code" ? (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. CSC2101-NOTES, BRIBTE-EE1101"
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
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl bg-slate-950 p-6 text-center border border-slate-800">
                  <div className="relative mx-auto w-40 h-40 border-2 border-amber-400/80 rounded-2xl flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_#f59e0b] animate-bounce" />
                    <Camera className="h-12 w-12 text-white/30" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium pt-4">
                    Point camera at lecturer&apos;s slide or printed handout
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">
                    Or Simulate Instant Scan:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Makerere CSC2101", code: "CSC2101-NOTES" },
                      { name: "Buganda Royal BRIBTE", code: "BRIBTE-EE1101" },
                      { name: "Kampala Poly Mengo", code: "KPM-AUT2102" },
                      { name: "UICT Nakawa", code: "UICT-TLC1204" },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => router.push(`/d/${item.code}`)}
                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 p-2 text-[11px] font-bold text-slate-800 transition text-left flex items-center justify-between"
                      >
                        <span className="truncate">{item.name}</span>
                        <QrCode className="h-3.5 w-3.5 text-amber-600 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

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

