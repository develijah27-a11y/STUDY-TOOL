"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  FolderGit2,
  Wallet,
  BarChart3,
  CheckCircle2,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Share2,
  ShieldCheck,
  Building2,
  PlusCircle,
} from "lucide-react";
import { formatUGX } from "@/lib/utils";

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCurrentTab(params.get("tab") || "overview");
    }
  }, [pathname]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lecturer, setLecturer] = useState<{
    id: string;
    fullName: string;
    email: string;
    institutionName?: string;
    department?: string;
  }>({
    id: "lecturer",
    fullName: "Lecturer",
    email: "lecturer@somaug.ac.ug",
    institutionName: "Makerere University",
    department: "Department of Computer Science",
  });
  const [earningsBalance, setEarningsBalance] = useState<number>(0);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, currentTab]);

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

  // Load active lecturer session & earnings
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        setLecturer({
          id: u.id || "lecturer",
          fullName: u.fullName || "Lecturer",
          email: u.email || "",
          institutionName: u.institutionName || "Makerere University",
          department: u.department || "Academic Faculty",
        });
      }
    } catch {}

    async function fetchLecturerData() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setLecturer({
              id: data.user.id,
              fullName: data.user.fullName || "Lecturer",
              email: data.user.email || "",
              institutionName: data.user.institutionName || "Makerere University",
              department: data.user.department || "Academic Faculty",
            });
            localStorage.setItem("somaug_user_session", JSON.stringify(data.user));

            // Fetch lecturer earnings balance
            const walRes = await fetch(
              `/api/wallet?userId=${data.user.id}&targetUserId=${data.user.id}&walletType=lecturer`
            );
            if (walRes.ok) {
              const walData = await walRes.json();
              if (walData.wallet) {
                setEarningsBalance(walData.wallet.spendableBalanceUGX ?? 0);
              }
            }
          }
        }
      } catch {}
    }
    fetchLecturerData();
  }, [pathname, currentTab]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {}
    localStorage.removeItem("somaug_user_session");
    window.location.href = "/sign-in";
  };

  const navItems = [
    {
      href: "/lecturer/dashboard?tab=overview",
      label: "Overview",
      icon: LayoutDashboard,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "overview",
    },
    {
      href: "/lecturer/dashboard?tab=publications",
      label: "My Publications",
      icon: UploadCloud,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "publications",
    },
    {
      href: "/lecturer/dashboard?tab=collections",
      label: "Collections",
      icon: FolderGit2,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "collections",
    },
    {
      href: "/lecturer/dashboard?tab=earnings",
      label: "Earnings & Wallet",
      icon: Wallet,
      badge: "85%",
      isActive: pathname === "/lecturer/dashboard" && currentTab === "earnings",
    },
    {
      href: "/lecturer/dashboard?tab=analytics",
      label: "Analytics",
      icon: BarChart3,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "analytics",
    },
    {
      href: "/lecturer/apply",
      label: "Profile & Verification",
      icon: CheckCircle2,
      isActive: pathname === "/lecturer/apply",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col md:flex-row">
      {/* Desktop Sidebar (Left Fixed 64) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#142B45] text-white border-r border-slate-800 shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/lecturer/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#147D78] text-amber-400 font-black shadow-md border border-teal-500/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white leading-tight">
                Soma<span className="text-amber-400">UG</span>
              </span>
              <span className="block text-[11px] font-semibold text-amber-400">
                Lecturer Desk
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Earnings Balance */}
        <div className="px-4 py-3 mx-4 my-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold uppercase tracking-wider">
            <span>Accrued Royalties</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-black">
              85% Net
            </span>
          </div>
          <div className="text-xl font-black text-[#E9B949]">
            {formatUGX(earningsBalance)}
          </div>
          <Link
            href="/lecturer/dashboard?tab=earnings"
            className="block text-[11px] text-teal-300 hover:text-teal-200 font-bold pt-0.5"
          >
            Weekly MoMo Payouts →
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition ${
                  item.isActive
                    ? "bg-[#147D78] text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${item.isActive ? "text-amber-300" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-amber-400/30 text-amber-300 px-1.5 py-0.5 rounded font-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card & Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-[#0e1f32]">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="block text-xs font-extrabold text-white truncate">
                {lecturer.fullName}
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                {lecturer.department || lecturer.institutionName}
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
          <Link href="/lecturer/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#147D78] text-amber-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-extrabold tracking-tight">Lecturer Desk</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lecturer/dashboard?tab=earnings"
            className="px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-[11px] font-bold text-amber-300"
          >
            {formatUGX(earningsBalance)}
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
                <div className="h-8 w-8 rounded-lg bg-[#147D78] text-amber-400 flex items-center justify-center font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-extrabold text-sm">Lecturer Desk</span>
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
                Accrued Royalties
              </span>
              <div className="text-lg font-black text-amber-400">
                {formatUGX(earningsBalance)}
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition ${
                      item.isActive
                        ? "bg-[#147D78] text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-amber-400/30 text-amber-300 px-1.5 py-0.5 rounded font-black">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
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

      {/* Mobile Bottom Bar for Lecturer */}
      <nav
        aria-label="Lecturer Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden safe-area-inset-bottom"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition ${
                  item.isActive
                    ? "text-[#147D78] font-bold"
                    : "text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                <Icon className={`h-5 w-5 ${item.isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className="text-[10px] leading-none">{item.label}</span>
                {item.isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#147D78] mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
