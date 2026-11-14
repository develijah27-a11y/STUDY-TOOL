"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Camera,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function DocumentQRResolverPage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = String(params?.code || "").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveQrLink() {
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
          setError(`No academic publication found matching this QR link.`);
        }
      } catch (err) {
        setLoading(false);
        setError("Network error resolving document.");
      }
    }

    resolveQrLink();
  }, [rawCode, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center container mx-auto px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-6">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#147D78] border-t-transparent"></div>
            <h2 className="text-base font-extrabold text-[#142B45]">
              Opening Verified Academic Document...
            </h2>
            <p className="text-xs text-slate-500">
              Redirecting to secure reader desk on SomaUG Academic
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#147D78]/10 text-[#147D78] shadow-sm">
              <QrCode className="h-7 w-7" />
            </div>

            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>SSL Encrypted Connection</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-black text-[#142B45]">
                Document QR Scanner
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan the visual QR code projected in lecture halls or shared on WhatsApp to open verified study materials.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center gap-2 text-left font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Camera Viewfinder */}
            <div className="space-y-4">
              <div className="relative rounded-2xl bg-slate-950 p-6 text-center border border-slate-800">
                <div className="relative mx-auto w-40 h-40 border-2 border-teal-400/80 rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_10px_#147D78] animate-bounce" />
                  <Camera className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-slate-300 font-medium pt-4">
                  Point camera at lecturer&apos;s slide or printed handout
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 block uppercase">
                  Quick Access Shortcuts:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Makerere CSC 2101", code: "CSC2101-NOTES" },
                    { name: "Buganda Royal BRIBTE", code: "BRIBTE-EE1101" },
                    { name: "Kampala Poly Mengo", code: "KPM-AUT2102" },
                    { name: "UICT Nakawa", code: "UICT-TLC1204" },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => router.push(`/d/${item.code}`)}
                      className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-[#147D78] p-2.5 text-xs font-bold text-slate-800 transition text-left flex items-center justify-between"
                    >
                      <span className="truncate">{item.name}</span>
                      <QrCode className="h-3.5 w-3.5 text-[#147D78] shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link href="/catalogue" className="font-bold text-[#147D78] hover:underline">
                Browse Full Catalogue →
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
