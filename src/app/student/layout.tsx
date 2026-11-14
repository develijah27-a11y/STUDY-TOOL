"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Compass,
  BookOpen,
  Wallet,
  User,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Search,
  QrCode,
  ShieldCheck,
  Camera,
  ArrowRight,
  Library,
} from "lucide-react";
import { formatUGX } from "@/lib/utils";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [student, setStudent] = useState<{
    id: string;
    fullName: string;
    email: string;
    institutionName?: string;
  }>({
    id: "student",
    fullName: "Student",
    email: "student@somaug.ac.ug",
    institutionName: "Makerere University",
  });
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Load active student session & wallet balance
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        setStudent({
          id: u.id || "student",
          fullName: u.fullName || "Student",
          email: u.email || "",
          institutionName: u.institutionName || "Uganda Higher Education",
        });
      }
    } catch {}

    async function fetchSessionAndWallet() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setStudent({
              id: data.user.id,
              fullName: data.user.fullName || "Student",
              email: data.user.email || "",
              institutionName: data.user.institutionName || "Uganda Higher Education",
            });
            localStorage.setItem("somaug_user_session", JSON.stringify(data.user));

            // Fetch spendable wallet balance
            const walRes = await fetch(
              `/api/wallet?userId=${data.user.id}&targetUserId=${data.user.id}&walletType=student`
            );
            if (walRes.ok) {
              const walData = await walRes.json();
              if (walData.wallet) {
                setWalletBalance(walData.wallet.spendableBalanceUGX ?? 0);
              }
            }
          }
        }
      } catch {}
    }
    fetchSessionAndWallet();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {}
    localStorage.removeItem("somaug_user_session");
    window.location.href = "/sign-in";
  };

  const navItems = [
    { href: "/student/dashboard", label: "Home", icon: Home },
    { href: "/catalogue", label: "Explore", icon: Compass },
    { href: "/student/library", label: "My Library", icon: BookOpen },
    { href: "/student/wallet", label: "Wallet", icon: Wallet },
    { href: "/student/profile", label: "Profile", icon: User },
  ];

  const isReaderPage = pathname.startsWith("/student/read/");

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col md:flex-row">
      {/* Desktop Sidebar (Left Fixed 64) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#142B45] text-white border-r border-slate-800 shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-[#142B45] font-black shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white leading-tight">
                Soma<span className="text-amber-400">UG</span>
              </span>
              <span className="block text-[11px] font-semibold text-teal-300">
                Student Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Wallet Glance */}
        <div className="px-4 py-3 mx-4 my-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold uppercase tracking-wider">
            <span>Spendable Balance</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-amber-400">
            {formatUGX(walletBalance)}
          </div>
          <Link
            href="/student/wallet"
            className="block text-[11px] text-teal-300 hover:text-teal-200 font-bold pt-0.5"
          >
            + Top up via MoMo →
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/student/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                    isActive
                      ? "bg-[#147D78] text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Document Access in Sidebar */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-teal-300" />
                Quick Document Access
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Scan or open course documents instantly
            </p>
            <Link
              href="/d"
              className="flex items-center justify-between rounded-lg bg-teal-800/40 hover:bg-teal-700/50 border border-teal-500/30 px-2.5 py-1.5 text-[11px] font-bold text-white transition group"
            >
              <span className="flex items-center gap-1.5">
                <Camera className="h-3 w-3 text-amber-300" />
                Scan QR / Enter Code
              </span>
              <ArrowRight className="h-3 w-3 text-amber-300 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          {/* My Academic Library Desk in Sidebar */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <Library className="h-3.5 w-3.5 text-amber-300" />
                My Academic Library
              </span>
              <Link
                href="/student/library"
                className="text-[10px] font-bold text-teal-300 hover:text-teal-200"
              >
                Open →
              </Link>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Access your saved annotations, bookmarks, reading progress, and verified purchase receipts.
            </p>
            <Link
              href="/student/library"
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white transition"
            >
              <BookOpen className="h-3 w-3 text-teal-300" />
              <span>Go to Study Desk</span>
            </Link>
          </div>
        </nav>

        {/* Bottom User Card & Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-[#0e1f32]">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="block text-xs font-extrabold text-white truncate">
                {student.fullName}
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                {student.email || student.institutionName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#142B45] text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg border border-white/20 text-slate-200 hover:bg-white/10"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-[#142B45]">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-extrabold tracking-tight">SomaUG</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/wallet"
            className="px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-[11px] font-bold text-amber-300"
          >
            {formatUGX(walletBalance)}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-red-300 hover:bg-white/10"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-[#142B45] text-white h-full flex flex-col p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-400 text-[#142B45] flex items-center justify-center font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-extrabold text-sm">Student Workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                Spendable Balance
              </span>
              <div className="text-lg font-black text-amber-400">
                {formatUGX(walletBalance)}
              </div>
            </div>

            <nav className="flex-1 space-y-3 overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/student/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                        isActive
                          ? "bg-[#147D78] text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Quick Document Access */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-teal-300" />
                  Quick Document Access
                </span>
                <p className="text-[10px] text-slate-400">Scan or open course documents instantly</p>
                <Link
                  href="/d"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-teal-800/40 border border-teal-500/30 px-2.5 py-1.5 text-[11px] font-bold text-white"
                >
                  <span className="flex items-center gap-1.5">
                    <Camera className="h-3 w-3 text-amber-300" />
                    Scan QR / Code
                  </span>
                  <ArrowRight className="h-3 w-3 text-amber-300" />
                </Link>
              </div>

              {/* Mobile My Academic Library Desk */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Library className="h-3.5 w-3.5 text-amber-300" />
                    My Academic Library
                  </span>
                  <Link
                    href="/student/library"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[10px] font-bold text-teal-300"
                  >
                    Open →
                  </Link>
                </div>
                <Link
                  href="/student/library"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white"
                >
                  <BookOpen className="h-3 w-3 text-teal-300" />
                  <span>Go to Study Desk</span>
                </Link>
              </div>
            </nav>

            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2.5 text-xs font-bold transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Visible ONLY on mobile and hidden in reader) */}
      {!isReaderPage && (
        <nav
          aria-label="Student Mobile Navigation"
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden safe-area-inset-bottom"
        >
          <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/student/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 transition ${
                    isActive
                      ? "text-[#147D78] font-bold"
                      : "text-slate-500 hover:text-slate-900 font-medium"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                  <span className="text-[11px] leading-none">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#147D78] mt-0.5" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

