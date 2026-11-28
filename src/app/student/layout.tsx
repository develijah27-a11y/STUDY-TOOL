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
  QrCode,
  ShieldCheck,
  Camera,
  ArrowRight,
  HardDrive,
  Highlighter,
} from "lucide-react";
import { formatUGX } from "@/lib/utils";
import { offlineStorage } from "@/lib/offline/offline-storage";

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
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);

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

  // Load student session, wallet, offline materials & revision notes count
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
    } catch { }

    async function fetchSessionData() {
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
      } catch { }

      try {
        const [offlineDocs, annotations] = await Promise.all([
          offlineStorage.getAllOfflineMaterials().catch(() => []),
          offlineStorage.getAllAnnotations().catch(() => []),
        ]);
        setOfflineCount(offlineDocs.length);
        setNotesCount(annotations.length);
      } catch { }
    }
    fetchSessionData();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch { }
    localStorage.removeItem("somaug_user_session");
    window.location.href = "/sign-in";
  };

  const navItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: Home },
    { href: "/catalogue", label: "Explore", icon: Compass },
    { href: "/student/library", label: "My Library", icon: BookOpen },
    {
      href: "/student/revision",
      label: "Personal Revision",
      icon: Highlighter,
      badge: notesCount > 0 ? notesCount : undefined,
    },
    {
      href: "/student/offline",
      label: "Stored Notes",
      icon: HardDrive,
      badge: offlineCount > 0 ? offlineCount : undefined,
    },
    { href: "/student/wallet", label: "Wallet", icon: Wallet },
    { href: "/student/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden transition-colors">
      {/* Desktop Sidebar (Left Fixed 64 with Independent Scroll) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 shrink-0 h-full max-h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Soma<span className="text-orange-500">UG</span>
              </span>
              <span className="block text-[11px] font-bold text-sky-600 dark:text-sky-400">
                Student Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Wallet Glance in Sidebar */}
        <div className="px-3.5 py-2.5 mx-3 my-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 space-y-1 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-sky-800 dark:text-sky-300 font-bold uppercase tracking-wider">
            <span>Spendable Balance</span>
            <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <div className="text-lg font-black text-orange-600 dark:text-orange-400 font-mono">
            {formatUGX(walletBalance)}
          </div>
          <Link
            href="/student/wallet"
            className="block text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-700 font-bold"
          >
            Manage Wallet →
          </Link>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 min-h-0 px-3 py-1 space-y-3 dashboard-sidebar-scroll overscroll-contain">
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
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${isActive
                    ? "bg-sky-500 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-300"
                    }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${isActive
                        ? "bg-white/25 text-white"
                        : "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Document Access in Sidebar */}
          <div className="rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/40 p-3 space-y-2">
            <span className="text-[11px] font-bold text-orange-800 dark:text-orange-200 flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5 text-orange-500" />
              Quick Document Access
            </span>
            <Link
              href="/d"
              className="flex items-center justify-between rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-1.5 text-[11px] font-bold transition group shadow-xs"
            >
              <span className="flex items-center gap-1.5">
                <Camera className="h-3 w-3 text-white" />
                Scan QR / Enter Code
              </span>
              <ArrowRight className="h-3 w-3 text-white group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </nav>

        {/* Bottom User Card & Sign Out */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                {student.fullName}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {student.institutionName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header (Single Clean Mobile Navigation) */}
      <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              Soma<span className="text-orange-500">UG</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/wallet"
            className="px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-[11px] font-bold text-orange-600 dark:text-orange-400"
          >
            {formatUGX(walletBalance)}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-slate-800"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer (The only mobile navigation, no duplicate bottom bar) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-white dark:bg-slate-950 text-slate-900 dark:text-white h-full flex flex-col p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-black text-sm">Student Workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-sky-800 dark:text-sky-300 tracking-wider">
                Spendable Balance
              </span>
              <div className="text-base font-black text-orange-600 dark:text-orange-400 font-mono">
                {formatUGX(walletBalance)}
              </div>
            </div>

            <nav className="flex-1 space-y-1 dashboard-sidebar-scroll overscroll-contain min-h-0">
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
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${isActive
                      ? "bg-sky-500 text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-300"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/40 p-2.5 mt-2 space-y-1.5">
                <span className="text-[11px] font-bold text-orange-800 dark:text-orange-200 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-orange-500" />
                  Quick Document Access
                </span>
                <Link
                  href="/d"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-1.5 text-[11px] font-bold"
                >
                  <span>Scan QR / Enter Code</span>
                  <ArrowRight className="h-3 w-3 text-white" />
                </Link>
              </div>
            </nav>

            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 text-xs font-bold transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane (Independent Scrolling, no bottom nav clutter) */}
      <main className="dashboard-main-scroll overscroll-contain overflow-x-hidden pb-8">
        {children}
      </main>
    </div>
  );
}
