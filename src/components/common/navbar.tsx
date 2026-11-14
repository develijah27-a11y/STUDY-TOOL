"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE_COPY } from "@/lib/constants/site-copy";
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
  QrCode,
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
  const [authenticatedUser, setAuthenticatedUser] = useState<{ id: string; email?: string; role?: string } | null>(null);

  // Close sidebar drawer on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Check authentication session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setAuthenticatedUser(data.user);
          } else {
            setAuthenticatedUser(null);
          }
        }
      } catch {
        setAuthenticatedUser(null);
      }
    }
    checkSession();
  }, [pathname]);

  const navGroups: NavGroup[] = [
    {
      label: "Main Navigation",
      items: [
        { href: "/", label: "Home Overview", icon: Home },
        { href: "/catalogue", label: "Academic Catalogue", icon: Search },
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

          {/* Center: Browse Catalogue Shortcut */}
          <div className="hidden md:flex items-center">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 transition shadow-inner"
            >
              <Search className="h-3.5 w-3.5 text-[#147D78]" />
              <span>Explore Course Materials &amp; Notes</span>
            </Link>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Wallet chip is rendered ONLY for authenticated users with active sessions */}
            {authenticatedUser ? (
              <Link
                href={authenticatedUser.role === "lecturer" ? "/lecturer/dashboard" : "/student/wallet"}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-sm"
                title="Your Account Dashboard & Wallet"
              >
                <Wallet className="h-3.5 w-3.5 text-amber-600" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : null}

            {authenticatedUser ? (
              <Link
                href="/student/profile"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B192C] px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
              >
                <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Account</span>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B192C] px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5 text-amber-400" />
                <span>Sign In</span>
              </Link>
            )}
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
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-white border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${isActive
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
                          className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${isActive
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
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
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
            <Link
              href="/catalogue"
              onClick={() => setIsSidebarOpen(false)}
              className="text-xs font-bold text-[#147D78] hover:underline"
            >
              Browse Catalogue →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#0B192C] text-slate-200 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <BookOpen className="h-5 w-5 text-amber-400" />
              <span>{SITE_COPY.brand.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {SITE_COPY.brand.footerDescription}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Universities
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
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
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
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
              {SITE_COPY.footer.securityHeading}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3 font-normal">
              {SITE_COPY.footer.securityBody}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-900">
              <span className="rounded-lg bg-amber-400 px-2.5 py-1 shadow-sm">
                MTN MoMo
              </span>
              <span className="rounded-lg bg-red-500 text-white px-2.5 py-1 shadow-sm">
                Airtel Money
              </span>
              <span className="rounded-lg bg-white/20 text-white border border-white/30 px-2 py-1">
                Uganda UGX
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-400">
          {SITE_COPY.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
