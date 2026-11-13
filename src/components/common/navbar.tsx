"use client";

import React, { useState, useEffect } from "react";
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
  Menu,
  X,
  ChevronRight,
  Building2,
  Layers,
  Sparkles,
  UserPlus,
  Home,
  CheckCircle2,
} from "lucide-react";
import { formatUGX } from "@/lib/utils";

interface NavGroup {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [quickCode, setQuickCode] = useState("");

  // Close sidebar drawer on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const navGroups: NavGroup[] = [
    {
      label: "Main Navigation",
      items: [
        { href: "/", label: "Home Overview", icon: Home },
        { href: "/catalogue", label: "Academic Catalogue", icon: Search },
        { href: "/d", label: "Enter Document Code", icon: KeyRound, badge: "WhatsApp" },
      ],
    },
    {
      label: "Student Portal",
      items: [
        { href: "/student/library", label: "Study Library", icon: Library },
        { href: "/student/wallet", label: "Student Wallet (UGX)", icon: Wallet },
        { href: "/student/profile", label: "Academic Profile", icon: UserCheck },
      ],
    },
    {
      label: "Lecturer Hub",
      items: [
        { href: "/lecturer/dashboard", label: "Publish & Earnings", icon: UploadCloud, badge: "85% Split" },
        { href: "/collections/MAK-CSC2101-2026", label: "WhatsApp Course Packs", icon: Share2 },
        { href: "/lecturer/apply", label: "Staff Verification", icon: CheckCircle2 },
      ],
    },
    {
      label: "Comptroller & Audit",
      items: [
        { href: "/admin/dashboard", label: "Double-Entry Ledger", icon: ShieldCheck, badge: "Reconciled" },
      ],
    },
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
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          
          {/* Left: Sidebar Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 transition shadow-sm"
              aria-label="Toggle Navigation Sidebar"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B192C] text-amber-400 shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-base font-extrabold tracking-tight text-slate-900 leading-none">
                  Soma<span className="text-amber-600">UG</span> Academic
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 mt-1">
                  Uganda Universities &amp; Vocational Institutes
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Quick Code Entry Pill */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 transition shadow-inner"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-600" />
              <span>Have a Document Code from WhatsApp?</span>
              <span className="rounded bg-amber-500 text-slate-950 font-bold px-2 py-0.5 text-[10px]">
                Enter Code
              </span>
            </button>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="md:hidden inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800"
              title="Enter Document Code"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-600" />
              <span>Code</span>
            </button>

            <Link
              href="/student/wallet"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-sm"
              title="Student Wallet Balance"
            >
              <Wallet className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">Wallet:</span>
              <span className="font-extrabold text-emerald-800">UGX 25,000</span>
            </Link>

            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B192C] px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
            >
              <LogIn className="h-3.5 w-3.5 text-amber-400" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer & Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-white border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B192C] text-amber-400 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900 leading-tight">
                Soma<span className="text-amber-600">UG</span> Academic
              </span>
              <span className="block text-[10px] font-semibold text-slate-500">
                Navigation &amp; Portals
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick New User Welcome Card inside Sidebar */}
        <div className="p-4 bg-gradient-to-br from-[#0B192C] to-[#1E3E62] text-white m-3 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>New to SomaUG?</span>
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
            Access lecture notes, past paper solutions, and vocational guides from verified Ugandan tutors.
          </p>
          <div className="flex gap-2 pt-1">
            <Link
              href="/sign-up"
              onClick={() => setIsSidebarOpen(false)}
              className="flex-1 text-center rounded-lg bg-amber-500 py-1.5 text-[11px] font-black text-slate-950 hover:bg-amber-400"
            >
              Sign Up
            </Link>
            <Link
              href="/catalogue"
              onClick={() => setIsSidebarOpen(false)}
              className="flex-1 text-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 py-1.5 text-[11px] font-bold text-white"
            >
              As Visitor
            </Link>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {group.label}
              </span>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                        isActive
                          ? "bg-[#0B192C] text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-amber-400 text-slate-950"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
            <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Covering Makerere, Kyambogo, Buganda Royal, UICT &amp; 12+ more</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              href="/sign-in"
              onClick={() => setIsSidebarOpen(false)}
              className="text-xs font-bold text-slate-900 hover:underline"
            >
              Sign In to Account
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                setShowCodeModal(true);
              }}
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
            >
              <KeyRound className="h-3 w-3" />
              <span>Redeem Code</span>
            </button>
          </div>
        </div>
      </aside>

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
                  <p className="text-[11px] text-slate-500">Shared by tutor on WhatsApp or blackboard</p>
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
                  placeholder="e.g. CSC2101-NOTES, BRIBTE-EE1101"
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
              Official academic and vocational document marketplace for Ugandan universities,
              polytechnics, and institutes. Instant student unlock via MTN &amp; Airtel Mobile Money.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Universities
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Makerere University (MAK)</li>
              <li>Kyambogo University (KYU)</li>
              <li>Mbarara University (MUST)</li>
              <li>Uganda Christian University (UCU)</li>
              <li>Makerere University Business School (MUBS)</li>
              <li>Kampala International University (KIU)</li>
              <li>Gulu University (GU)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Vocational &amp; Technical Institutes
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Buganda Royal Institute (BRIBTE Mengo)</li>
              <li>Kampala Polytechnic Mengo (KPM)</li>
              <li>Uganda Institute of ICT (UICT Nakawa)</li>
              <li>Nakawa Vocational Training College (NVTC)</li>
              <li>Uganda Technical College (UTC Kichwamba)</li>
              <li>Law Development Centre (LDC)</li>
              <li>YMCA Comprehensive Institute</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Academic Integrity &amp; Payment
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All transactions are secured by our double-entry ledger in exact integer UGX amounts.
              Reading is DRM-protected with dynamic anti-piracy student watermarks.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold text-amber-300">
              <span className="rounded bg-white/10 px-2 py-1">MTN MoMo</span>
              <span className="rounded bg-white/10 px-2 py-1">Airtel Money</span>
              <span className="rounded bg-white/10 px-2 py-1">UBTEB &amp; NCHE</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SomaUG Academic. Republic of Uganda Academic &amp; Vocational Document Marketplace.
        </div>
      </div>
    </footer>
  );
}
