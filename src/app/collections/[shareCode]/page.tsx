"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
import {
  Share2,
  QrCode,
  CheckCircle2,
  Building2,
  FileText,
  BookOpen,
  ShieldCheck,
  Copy,
} from "lucide-react";

interface CollectionItem {
  id: string;
  title: string;
  description: string;
  shareCode: string;
  documentIds: string[];
  qrCodeDataUrl?: string;
}

interface CatalogueDoc {
  id: string;
  title: string;
  description: string;
  institutionShortCode: string;
  courseCode: string;
  priceUGX: number;
  pageCount: number;
  lecturerName: string;
}

export default function PublicCollectionPage() {
  const params = useParams();
  const shareCode = String(params?.shareCode || "MAK-CSC2101-2026");

  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [docs, setDocs] = useState<CatalogueDoc[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCollection() {
      const res = await fetch("/api/catalogue");
      const data = await res.json();
      const foundCol = (data.collections || []).find(
        (c: CollectionItem) => c.shareCode === shareCode || c.id === shareCode
      );
      setCollection(foundCol || data.collections?.[0] || null);
      setDocs(data.documents || []);
    }
    loadCollection();
  }, [shareCode]);

  const handleCopyWhatsApp = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-xs text-slate-500">
        Loading lecturer course resource collection...
      </div>
    );
  }

  const includedDocs = docs.filter((d) => collection.documentIds.includes(d.id));
  const totalPackValueUGX = includedDocs.reduce((sum, d) => sum + d.priceUGX, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Collection Banner & QR Code Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0f2027] to-[#2c5364] text-white p-6 md:p-8 shadow-lg">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300">
              <Share2 className="h-3.5 w-3.5" />
              <span>Lecturer-Verified WhatsApp Course Resource Pack • {collection.shareCode}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
              {collection.title}
            </h1>

            <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-2xl">
              {collection.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                <Copy className="h-4 w-4" />
                <span>
                  {copied
                    ? "Copied! Paste into Class WhatsApp Group"
                    : "Copy Link for Class WhatsApp Group"}
                </span>
              </button>

              <span className="text-xs text-slate-300 font-medium">
                {includedDocs.length} Publications • Combined Pack Value:{" "}
                <strong className="text-amber-300">{formatUGX(totalPackValueUGX)}</strong>
              </span>
            </div>
          </div>

          {/* QR Code Box for Classroom Projection & WhatsApp Sharing */}
          <div className="rounded-xl bg-white text-slate-900 p-5 text-center space-y-2 shadow-md max-w-xs mx-auto">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
              <QrCode className="h-4 w-4 text-amber-600" />
              <span>Scan in Lecture Hall or WhatsApp</span>
            </div>
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-3">
              {collection.qrCodeDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={collection.qrCodeDataUrl}
                  alt={collection.shareCode}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-center space-y-1">
                  <QrCode className="h-14 w-14 text-slate-800 mx-auto" />
                  <span className="block font-mono text-[10px] font-bold text-slate-600">
                    {collection.shareCode}
                  </span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Class coordinators and students can forward this QR code freely.
            </p>
          </div>
        </div>
      </div>

      {/* Role & Access Control Guarantee Notice (Part III §7 & Part VII §13) */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3 text-xs text-amber-950">
        <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Strict Access &amp; Coordinator Boundary (Server-Enforced):
          </p>
          <p>
            Class coordinators and students may share this public link and QR code with classmates,
            but cannot modify the collection, alter prices, or access protected full PDFs without
            an individual student wallet entitlement.
          </p>
        </div>
      </div>

      {/* Publications in this Collection */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Included Course Publications ({includedDocs.length})
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {includedDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                    <Building2 className="h-3 w-3 text-slate-500" />
                    {doc.institutionShortCode} • {doc.courseCode}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-900">
                    {formatUGX(doc.priceUGX)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{doc.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3">{doc.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {doc.lecturerName}
                  </span>
                  <span className="text-slate-500">{doc.pageCount} pages</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/catalogue/${doc.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f2027] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Preview &amp; Buy</span>
                  </Link>
                  <Link
                    href={`/student/read/${doc.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

