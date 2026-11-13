"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatUGX } from "@/lib/utils";
import {
  GraduationCap,
  BookOpen,
  Wallet,
  Clock,
  CheckCircle2,
  Bookmark,
  Search,
  ArrowRight,
  Sparkles,
  KeyRound,
  FileText,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Download,
  Building2,
  QrCode,
  Camera,
} from "lucide-react";

interface EntitlementItem {
  id: string;
  documentId: string;
  title: string;
  courseCode: string;
  institutionShortCode: string;
  pageCount: number;
  lastReadPage: number;
  unlockedAt: string;
}

export default function StudentDashboardPage() {
  const [studentId, setStudentId] = useState("user-student-1");
  const [studentName, setStudentName] = useState("Grace Namukasa");
  const [institution, setInstitution] = useState("Makerere University (MAK)");
  const [programme, setProgramme] = useState("Bachelor of Science in Software Engineering (BSSE Year 2)");
  const [walletBalance, setWalletBalance] = useState(25000);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [entitlements, setEntitlements] = useState<EntitlementItem[]>([]);
  const [quickCode, setQuickCode] = useState("");
  const [codeTab, setCodeTab] = useState<"qr" | "code">("qr");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [walletRes, catRes] = await Promise.all([
          fetch(`/api/wallet?userId=${studentId}&targetUserId=${studentId}&walletType=student`),
          fetch("/api/catalogue"),
        ]);

        const walletData = await walletRes.json();
        const catData = await catRes.json();

        if (walletRes.ok) {
          setWalletBalance(walletData.wallet?.spendableBalanceUGX ?? 25000);
          setReservedBalance(walletData.wallet?.reservedBalanceUGX ?? 0);
        }

        const docs = catData.documents || [];
        // Student 1 has unlocked CSC 2101 Notes by default
        const unlocked: EntitlementItem[] = [
          {
            id: "ent-1",
            documentId: "doc-csc2101-notes",
            title: "CSC 2101: Complete Data Structures & Algorithms Lecture Compendium",
            courseCode: "CSC 2101",
            institutionShortCode: "MAK",
            pageCount: 48,
            lastReadPage: 12,
            unlockedAt: "2026-11-01",
          },
          {
            id: "ent-2",
            documentId: "doc-csc2101-pastpapers",
            title: "CSC 2101: 5-Year Solved Past Examination Papers & Marking Guide",
            courseCode: "CSC 2101",
            institutionShortCode: "MAK",
            pageCount: 28,
            lastReadPage: 5,
            unlockedAt: "2026-11-04",
          },
        ];
        setEntitlements(unlocked);
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [studentId]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      
      {/* Top Banner: Academic Profile & Quick Status */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 sm:p-10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-300">
              <GraduationCap className="h-4 w-4" />
              <span>Student Academic Workspace</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Welcome back, {studentName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {institution} • {programme}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                <span>{entitlements.length} Unlocked Course Documents</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified Student Session</span>
              </div>
            </div>
          </div>

          {/* Quick Wallet Balance Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 min-w-[280px] space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Available Wallet Balance
            </span>
            <div className="text-3xl font-black text-amber-400">
              {formatUGX(walletBalance)}
            </div>
            <p className="text-[11px] text-slate-300">
              Deposit once with MTN/Airtel MoMo • Instant document purchase
            </p>
            <div className="flex gap-2 pt-1">
              <Link
                href="/student/wallet"
                className="flex-1 text-center rounded-xl bg-amber-500 hover:bg-amber-400 py-2 text-xs font-black text-slate-950 transition shadow-md"
              >
                Top Up UGX
              </Link>
              <Link
                href="/catalogue"
                className="flex-1 text-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 py-2 text-xs font-bold text-white transition"
              >
                Browse Docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: My Unlocked Documents & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): My Reading Desk */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    My Study Reading Desk
                  </h2>
                  <p className="text-xs text-slate-500">
                    All unlocked course materials are available with anti-piracy DRM protection
                  </p>
                </div>
              </div>

              <Link
                href="/student/library"
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Full Library →
              </Link>
            </div>

            {entitlements.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No course documents unlocked yet.</p>
                <Link
                  href="/catalogue"
                  className="inline-block rounded-xl bg-[#0B192C] px-4 py-2 text-xs font-bold text-white"
                >
                  Browse Academic Catalogue
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {entitlements.map((item) => {
                  const progressPct = Math.round((item.lastReadPage / item.pageCount) * 100);

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-slate-200 font-mono text-[10px] font-black px-2 py-0.5 text-slate-800">
                              {item.courseCode}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Unlocked Entitlement
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {item.title}
                          </h3>
                        </div>

                        <Link
                          href={`/student/read/${item.documentId}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B192C] hover:bg-[#162942] text-white px-4 py-2.5 text-xs font-bold transition shadow-sm shrink-0"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                          <span>Resume Reading (p. {item.lastReadPage})</span>
                        </Link>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>Progress: Page {item.lastReadPage} of {item.pageCount}</span>
                          <span>{progressPct}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Code Redeemer & Course Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick QR Scanner & Document Code Redeemer */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Scan or Redeem Material
                  </h3>
                  <p className="text-[11px] text-slate-500">From projector screen, WhatsApp or notes</p>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCodeTab("qr")}
                  className={`px-2.5 py-1 rounded-md transition ${
                    codeTab === "qr"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Scan QR
                </button>
                <button
                  type="button"
                  onClick={() => setCodeTab("code")}
                  className={`px-2.5 py-1 rounded-md transition ${
                    codeTab === "code"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Enter Code
                </button>
              </div>
            </div>

            {codeTab === "qr" ? (
              <div className="space-y-3">
                {/* Visual Camera Viewfinder Simulation */}
                <div className="relative rounded-2xl bg-slate-950 p-4 text-center overflow-hidden border border-slate-800">
                  {/* Targeting frame corners */}
                  <div className="relative mx-auto w-36 h-36 border-2 border-amber-400/70 rounded-xl flex items-center justify-center overflow-hidden">
                    {/* Animated Scanning Laser */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce" />
                    <Camera className="h-10 w-10 text-white/30" />
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium pt-3 leading-tight">
                    Point camera at lecturer&apos;s projector screen or printed handout
                  </p>
                </div>

                {/* Instant Quick-Scan Shortcuts */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Quick-Scan Lecture Materials:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "CSC2101", code: "CSC2101-NOTES" },
                      { label: "BRIBTE-EE", code: "BRIBTE-EE1101" },
                      { label: "KPM-AUT", code: "KPM-AUT2102" },
                      { label: "UICT-TLC", code: "UICT-TLC1204" },
                    ].map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => {
                          setIsScanning(true);
                          setTimeout(() => {
                            window.location.href = `/d/${s.code}`;
                          }, 400);
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 py-1.5 px-2 text-[10px] font-mono font-bold text-slate-800 transition text-left flex items-center justify-between"
                      >
                        <span>{s.label}</span>
                        <QrCode className="h-3 w-3 text-amber-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (quickCode.trim()) {
                    window.location.href = `/d/${encodeURIComponent(quickCode.trim().toUpperCase())}`;
                  }
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Document Access Code:
                  </label>
                  <input
                    type="text"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value)}
                    placeholder="e.g. CSC2101-NOTES, BRIBTE-EE1101"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B192C] py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <span>Open Document</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                </button>
              </form>
            )}
          </div>

          {/* Quick Enrolled Course Units */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              My Semester Courses
            </h3>
            <div className="space-y-2">
              {[
                { code: "CSC 2101", name: "Data Structures & Algorithms" },
                { code: "BSSE 3102", name: "Distributed Systems & Cloud" },
                { code: "LAW 2105", name: "Constitutional Law of Uganda" },
              ].map((c) => (
                <Link
                  key={c.code}
                  href={`/catalogue?q=${encodeURIComponent(c.code)}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs hover:border-slate-300 transition"
                >
                  <div>
                    <span className="font-extrabold text-slate-900 block">{c.code}</span>
                    <span className="text-[11px] text-slate-500">{c.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
