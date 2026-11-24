"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  PlusCircle,
  Share2,
  BarChart3,
  Wallet,
  Receipt,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  GraduationCap,
  Menu,
  X,
  HardDrive,
} from "lucide-react";
import { formatUGX } from "@/lib/utils";

function LecturerLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "overview";

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
    department: "Academic Faculty",
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

  // Load active lecturer session & fast balance
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
    } catch { }

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

            // Fast Balance-Only fetch
            const walRes = await fetch(
              `/api/wallet?userId=${data.user.id}&targetUserId=${data.user.id}&walletType=lecturer&type=balance`
            );
            if (walRes.ok) {
              const walData = await walRes.json();
              if (walData.wallet) {
                setEarningsBalance(walData.wallet.spendableBalanceUGX ?? 0);
              }
            }
          }
        }
      } catch { }
    }
    fetchLecturerData();
  }, [pathname, currentTab]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch { }
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
      href: "/lecturer/dashboard?tab=publish",
      label: "Publish Material",
      icon: PlusCircle,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "publish",
    },
    {
      href: "/lecturer/dashboard?tab=share",
      label: "Share Materials",
      icon: Share2,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "share",
    },
    {
      href: "/lecturer/dashboard?tab=analytics",
      label: "Analytics",
      icon: BarChart3,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "analytics",
    },
    {
      href: "/lecturer/dashboard?tab=earnings",
      label: "Wallet & Earnings",
      icon: Wallet,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "earnings",
    },
    {
      href: "/lecturer/dashboard?tab=transactions",
      label: "Transactions",
      icon: Receipt,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "transactions",
    },
    {
      href: "/lecturer/dashboard?tab=profile",
      label: "Profile",
      icon: CheckCircle2,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "profile",
    },
    {
      href: "/lecturer/dashboard?tab=settings",
      label: "Settings & Security",
      icon: ShieldCheck,
      isActive: pathname === "/lecturer/dashboard" && currentTab === "settings",
    },
  ];

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#F4F6F2] flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar (Left Fixed 64 with Independent Scroll) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#153F35] text-white border-r border-[#1E4E42] shrink-0 h-full max-h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1E4E42] shrink-0">
          <Link href="/lecturer/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#23836B] text-[#D6A957] font-black shadow-md border border-[#23836B]/40">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white leading-tight">
                Soma<span className="text-[#D6A957]">UG</span>
              </span>
              <span className="block text-[10px] font-semibold text-[#E9F1EB]/80">
                Lecturer Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Earnings Balance Card */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-white/10 border border-white/10 space-y-1 shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#E9F1EB]/80 tracking-wider block">
            Available Earnings
          </span>
          <div className="text-xl font-black text-[#D6A957]">
            {formatUGX(earningsBalance)}
          </div>
          <Link
            href="/lecturer/dashboard?tab=earnings"
            className="block text-[11px] text-[#E9F1EB] hover:text-[#D6A957] font-bold pt-0.5"
          >
            Withdraw to MoMo →
          </Link>
        </div>

        {/* Navigation Items (Independent Scrolling) */}
        <nav className="flex-1 min-h-0 px-3 py-1 space-y-1 dashboard-sidebar-scroll overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${item.isActive
                  ? "bg-[#23836B] text-white shadow-sm"
                  : "text-[#E9F1EB]/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${item.isActive ? "text-[#D6A957]" : "text-[#E9F1EB]/60"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card & Sign Out */}
        <div className="p-3 border-t border-[#1E4E42] bg-[#12362E] shrink-0">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="block text-xs font-extrabold text-white truncate">
                {lecturer.fullName}
              </span>
              <span className="block text-[10px] text-[#E9F1EB]/70 truncate">
                {lecturer.department || lecturer.institutionName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#153F35] text-white border-b border-[#1E4E42] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg border border-white/20 text-[#E9F1EB] hover:bg-white/10"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/lecturer/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#23836B] text-[#D6A957]">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-extrabold tracking-tight">Lecturer Workspace</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lecturer/dashboard?tab=earnings"
            className="px-2.5 py-1 rounded-lg bg-[#23836B]/30 border border-[#23836B]/50 text-[11px] font-bold text-[#D6A957]"
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-[#153F35] text-white h-full flex flex-col p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1E4E42] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#23836B] text-[#D6A957] flex items-center justify-center font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-extrabold text-sm">Lecturer Workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-[#E9F1EB]/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#E9F1EB]/80 tracking-wider">
                Available Earnings
              </span>
              <div className="text-lg font-black text-[#D6A957]">
                {formatUGX(earningsBalance)}
              </div>
            </div>

            <nav className="flex-1 space-y-1 dashboard-sidebar-scroll overscroll-contain min-h-0">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${item.isActive
                      ? "bg-[#23836B] text-white"
                      : "text-[#E9F1EB]/80 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#1E4E42]">
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

      {/* Main Content Pane (Independent Scrolling) */}
      <main className="dashboard-main-scroll overscroll-contain overflow-x-hidden pb-16 md:pb-8">
        {children}
      </main>
    </div>
  );
}

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <LecturerLayoutContent>{children}</LecturerLayoutContent>
    </Suspense>
  );
}
