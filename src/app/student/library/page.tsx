"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatUGX, formatDate } from "@/lib/utils";
import {
  Library,
  BookOpen,
  CheckCircle2,
  Receipt,
  Search,
  Wallet,
  Clock,
} from "lucide-react";

interface EntitledOrder {
  id: string;
  orderNumber: string;
  documentId: string;
  documentVersion: number;
  grossAmountUGX: number;
  receiptReference: string;
  status: string;
  createdAt: string;
}

interface CatalogueDoc {
  id: string;
  title: string;
  courseCode: string;
  institutionShortCode: string;
  lecturerName: string;
  pageCount: number;
  currentVersion: number;
}

export default function StudentLibraryPage() {
  const [orders, setOrders] = useState<EntitledOrder[]>([]);
  const [docs, setDocs] = useState<CatalogueDoc[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentId = "user-student-1";
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.id) currentId = u.id;
      }
    } catch {}

    async function loadLibrary() {
      setLoading(true);
      try {
        const [walRes, catRes] = await Promise.all([
          fetch(`/api/wallet?userId=${currentId}&targetUserId=${currentId}&walletType=student`),
          fetch("/api/catalogue"),
        ]);
        const walData = await walRes.json();
        const catData = await catRes.json();
        setOrders(walData.orders || []);
        setWalletBalance(walData.wallet?.spendableBalanceUGX ?? 0);
        setDocs(catData.documents || []);
      } finally {
        setLoading(false);
      }
    }
    loadLibrary();
  }, []);

  const activeOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="rounded-xl bg-[#0f2027] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Library className="h-4 w-4" />
            <span>Personal Study Library</span>
          </div>
          <h1 className="text-2xl font-bold">Grace Namukasa&apos;s Purchased Materials</h1>
          <p className="text-xs text-slate-300">
            Access your purchased course compendiums, saved bookmarks, private study notes, and official receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/wallet"
            className="rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20"
          >
            <Wallet className="inline h-3.5 w-3.5 mr-1.5 text-amber-400" />
            Balance: {formatUGX(walletBalance)}
          </Link>
          <Link
            href="/catalogue"
            className="rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <Search className="inline h-3.5 w-3.5 mr-1" />
            Find More Notes
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading your study library...</div>
      ) : activeOrders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-4">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              No Unlocked Publications Yet
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Explore course materials, past papers, and lecture notes in the catalogue. When you unlock materials with your UGX balance or Mobile Money, they will appear here in your permanent study library.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/catalogue"
              className="rounded-xl bg-[#142B45] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
            >
              Browse Full Catalogue
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {activeOrders.map((ord) => {
            const doc = docs.find((d) => d.id === ord.documentId);
            return (
              <div
                key={ord.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-bold text-emerald-800">
                      <CheckCircle2 className="inline h-3 w-3 mr-1" />
                      Entitled Version v{ord.documentVersion}.0
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      <Receipt className="inline h-3 w-3 mr-1" />
                      {ord.receiptReference}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {doc?.title || `Document ${ord.documentId}`}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {doc?.institutionShortCode} • {doc?.courseCode} • {doc?.lecturerName}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Purchased {formatDate(ord.createdAt)} ({formatUGX(ord.grossAmountUGX)})
                  </div>

                  <Link
                    href={`/student/read/${ord.documentId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f2027] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                    <span>Continue Reading</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

