"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Wallet,
  GraduationCap,
  ShieldCheck,
  Search,
  Library,
  UploadCloud,
  Share2,
  UserCheck,
  LogIn,
  KeyRound,
  ArrowRight,
  FileText,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [quickCode, setQuickCode] = useState("");

  const navItems = [
    { href: "/catalogue", label: "Catalogue", icon: Search },
    { href: "/student/library", label: "Study Library", icon: Library },
    { href: "/student/wallet", label: "Student Wallet", icon: Wallet },
    { href: "/student/profile", label: "Academic Profile", icon: UserCheck },
    { href: "/lecturer/dashboard", label: "Lecturer Hub", icon: UploadCloud },
    { href: "/collections/MAK-CSC2101-2026", label: "WhatsApp Packs", icon: Share2 },
    { href: "/admin/dashboard", label: "Admin & Audit", icon: ShieldCheck },
  ];

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    const clean = quickCode.trim().toUpperCase();
    setShowCodeModal(false);
    setQuickCode("");
    router.push(`/d/${encodeURIComponent(clean)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B192C] text-amber-400 shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-slate-900">
                Soma<span className="text-amber-600">UG</span> Academic
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Uganda University Document Marketplace
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#0B192C] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Quick "Enter Doc Code" Button */}
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 transition"
              title="Enter Document Code shared on WhatsApp or in class"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">Enter Code</span>
            </button>

            <Link
              href="/student/wallet"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              <Wallet className="h-3.5 w-3.5 text-amber-600" />
              <span>UGX Wallet</span>
            </Link>

            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B192C] px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              <LogIn className="h-3.5 w-3.5 text-amber-400" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>

        {/* Mobile horizontal navigation bar */}
        <div className="flex lg:hidden overflow-x-auto border-t border-slate-100 bg-slate-50/90 px-3 py-2 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                  isActive
                    ? "bg-[#0B192C] text-white"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Enter Document Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Enter Document Code</h3>
                  <p className="text-[11px] text-slate-500">Shared by your lecturer on WhatsApp</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRedeemCode} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value)}
                  placeholder="e.g. CSC2101-NOTES or LAW2105"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-[#0B192C] py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <span>Open PDF</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#0B192C] text-slate-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <BookOpen className="h-5 w-5 text-amber-400" />
              <span>SomaUG Academic</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built for Ugandan university lecturers and students. Exact integer UGX double-entry
              ledger, protected online study reader, and verified MTN &amp; Airtel Mobile Money settlements.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Partner Universities
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Makerere University (MAK)</li>
              <li>Kyambogo University (KYU)</li>
              <li>Mbarara University (MUST)</li>
              <li>Uganda Christian University (UCU)</li>
              <li>Makerere University Business School (MUBS)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Marketplace Taxonomy
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Lecture Notes &amp; Compendiums</li>
              <li>Solved Past Papers &amp; Marking Schemes</li>
              <li>Laboratory Practicals &amp; Code</li>
              <li>Constitutional Law Casebooks</li>
              <li>Exam Cram Sheets &amp; Summaries</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Academic Integrity &amp; Payment
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All transactions are secured by our authoritative double-entry ledger. Document reading
              is DRM-protected with dynamic anti-piracy student watermarks.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold text-amber-300">
              <span className="rounded bg-white/10 px-2 py-1">MTN MoMo</span>
              <span className="rounded bg-white/10 px-2 py-1">Airtel Money</span>
              <span className="rounded bg-white/10 px-2 py-1">UGX Cash Clearing</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SomaUG Academic. Republic of Uganda Academic Document Marketplace.
        </div>
      </div>
    </footer>
  );
}
