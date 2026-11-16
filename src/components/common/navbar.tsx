"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE_COPY } from "@/lib/constants/site-copy";
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Search,
  Library,
  UploadCloud,
  UserCheck,
  LogIn,
  LogOut,
  QrCode,
  FileText,
  Menu,
  X,
  UserPlus,
  Home,
  CheckCircle2,
  User,
  HelpCircle,
  Smartphone,
  Wallet,
} from "lucide-react";

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
  const pathname = usePathname() || "";
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    id: string;
    email?: string;
    fullName?: string;
    role?: string;
  } | null>(null);

  // Isolate dashboard shells completely: student, lecturer, and admin have dedicated layouts
  const isDashboardRoute = Boolean(
    pathname.startsWith("/student") ||
    pathname.startsWith("/lecturer") ||
    pathname.startsWith("/admin")
  );

  // Close sidebar drawer on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Lock background body scroll when sidebar drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isSidebarOpen]);

  // Check authentication session
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        setAuthenticatedUser(JSON.parse(cached));
      }
    } catch {}

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setAuthenticatedUser(data.user);
            localStorage.setItem("somaug_user_session", JSON.stringify(data.user));
            return;
          }
        }
        setAuthenticatedUser(null);
        localStorage.removeItem("somaug_user_session");
      } catch {}
    }
    checkSession();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {}
    localStorage.removeItem("somaug_user_session");
    setAuthenticatedUser(null);
    setIsSidebarOpen(false);
    router.push("/sign-in");
  };

  // Grouped navigation strictly following The One Rule
  const navGroups: NavGroup[] = [];

  if (!authenticatedUser) {
    // 1. Unauthenticated Visitor / Guest
    navGroups.push(
      {
        label: "Study Materials",
        items: [
          { href: "/", label: "Home", icon: Home },
          { href: "/catalogue", label: "Browse Course Materials", icon: Search },
          { href: "/d", label: "Scan Document QR", icon: QrCode },
        ],
      },
      {
        label: "For Educators",
        items: [
          { href: "/lecturer/apply", label: "Teach on SomaUG", icon: CheckCircle2, badge: "85% Split" },
        ],
      },
      {
        label: "Policies & Legal",
        items: [
          { href: "/#how-it-works", label: "How It Works", icon: Smartphone },
          { href: "/terms", label: "Terms of Use", icon: FileText },
          { href: "/privacy", label: "Privacy Policy (PDPO)", icon: ShieldCheck },
          { href: "/copyright", label: "Copyright & Takedown", icon: FileText },
          { href: "/refunds", label: "Refund Policy", icon: CheckCircle2 },
          { href: "/contact", label: "Contact Support", icon: HelpCircle },
        ],
      }
    );
  } else if (authenticatedUser.role === "lecturer") {
    // 2. Authenticated Lecturer
    navGroups.push(
      {
        label: "Lecturer Desk",
        items: [
          { href: "/lecturer/dashboard", label: "Lecturer Overview", icon: Home },
          { href: "/lecturer/dashboard?tab=publications", label: "Publications & Upload", icon: UploadCloud },
          { href: "/lecturer/dashboard?tab=earnings", label: "Earnings & MoMo Withdrawals", icon: Wallet, badge: "85%" },
        ],
      },
      {
        label: "Academic Discovery",
        items: [
          { href: "/catalogue", label: "Browse Materials", icon: Search },
          { href: "/d", label: "Scan Document QR", icon: QrCode },
        ],
      },
      {
        label: "Policies & Support",
        items: [
          { href: "/terms", label: "Terms & Author Guidelines", icon: FileText },
          { href: "/copyright", label: "Copyright Policy", icon: FileText },
          { href: "/contact", label: "Contact Support", icon: HelpCircle },
        ],
      }
    );
  } else if (authenticatedUser.role === "admin") {
    // 3. Platform Admin
    navGroups.push(
      {
        label: "Administration",
        items: [
          { href: "/admin/dashboard", label: "Platform Review & Audit", icon: ShieldCheck, badge: "Admin" },
          { href: "/catalogue", label: "Browse Materials", icon: Search },
        ],
      }
    );
  } else {
    // 4. Authenticated Student
    navGroups.push(
      {
        label: "Student Desk",
        items: [
          { href: "/student/dashboard", label: "Student Dashboard", icon: Home },
          { href: "/student/library", label: "My Library & Purchases", icon: Library },
          { href: "/student/profile", label: "Academic Profile", icon: UserCheck },
        ],
      },
      {
        label: "Academic Discovery",
        items: [
          { href: "/catalogue", label: "Browse Materials", icon: Search },
          { href: "/d", label: "Scan Document QR", icon: QrCode },
        ],
      },
      {
        label: "Policies & Support",
        items: [
          { href: "/terms", label: "Terms of Use", icon: FileText },
          { href: "/refunds", label: "Refund Policy", icon: CheckCircle2 },
          { href: "/contact", label: "Contact Support", icon: HelpCircle },
        ],
      }
    );
  }

  if (isDashboardRoute) {
    return null;
  }

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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142B45] text-[#E9B949] shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-base font-extrabold tracking-tight text-[#142B45] leading-none">
                  Soma<span className="text-amber-600">UG</span> Academic
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 mt-1">
                  Course Study Notes &amp; Revision Guides
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Clean Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700">
            <Link
              href="/catalogue"
              className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#147D78] transition"
            >
              Browse Materials
            </Link>
            <Link
              href="/#how-it-works"
              className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#147D78] transition"
            >
              How It Works
            </Link>
            <Link
              href="/lecturer/apply"
              className="px-3 py-2 rounded-xl hover:bg-teal-50 text-[#147D78] transition flex items-center gap-1.5"
            >
              <span>Teach on SomaUG</span>
              <span className="rounded-md bg-teal-100 text-[#147D78] px-1.5 py-0.5 text-[10px]">
                85%
              </span>
            </Link>
            <Link
              href="/d"
              className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#147D78] transition flex items-center gap-1 text-slate-500"
            >
              <QrCode className="h-3.5 w-3.5 text-[#147D78]" />
              <span>Scan QR</span>
            </Link>
          </nav>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            {authenticatedUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href={
                    authenticatedUser.role === "lecturer"
                      ? "/lecturer/dashboard"
                      : "/student/library"
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 transition shadow-sm"
                >
                  {authenticatedUser.role === "lecturer" ? (
                    <>
                      <UploadCloud className="h-3.5 w-3.5 text-teal-700" />
                      <span className="hidden sm:inline">Lecturer Desk</span>
                    </>
                  ) : (
                    <>
                      <Library className="h-3.5 w-3.5 text-teal-700" />
                      <span className="hidden sm:inline">My Library</span>
                    </>
                  )}
                </Link>

                <Link
                  href={
                    authenticatedUser.role === "lecturer"
                      ? "/lecturer/dashboard"
                      : "/student/dashboard"
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B45] hover:bg-[#1A3859] px-3.5 py-2 text-xs font-bold text-white transition shadow-sm"
                >
                  <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 transition shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-600" />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#147D78] hover:bg-[#116965] px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#E9B949]" />
                  <span>Join Free</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer & Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 touch-none"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-[100dvh] max-h-screen w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col overscroll-contain touch-pan-y ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B192C] text-amber-400 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900 leading-tight">
                Soma<span className="text-amber-600">UG</span> Academic
              </span>
              <span className="block text-[10px] font-semibold text-slate-500">
                Course Study Notes &amp; Guides
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 shrink-0">
          {authenticatedUser ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0B192C] to-[#1E3E62] text-white shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  <User className="h-3 w-3" />
                  <span>{authenticatedUser.role || "Student"} Workspace</span>
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div>
                <span className="block text-sm font-extrabold text-white truncate">
                  {authenticatedUser.fullName || authenticatedUser.email}
                </span>
                <span className="block text-[11px] text-slate-300 truncate">
                  {authenticatedUser.email}
                </span>
              </div>
              <div className="pt-1 flex gap-2">
                <Link
                  href={authenticatedUser.role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard"}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex-1 text-center rounded-lg bg-amber-500 py-1.5 text-[11px] font-black text-slate-950 hover:bg-amber-400"
                >
                  Dashboard
                </Link>
                <Link
                  href={authenticatedUser.role === "lecturer" ? "/lecturer/dashboard?tab=earnings" : "/student/library"}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex-1 text-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 py-1.5 text-[11px] font-bold text-white"
                >
                  {authenticatedUser.role === "lecturer" ? "Earnings" : "My Library"}
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0B192C] to-[#1E3E62] text-white shadow-md space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Find Notes for Your Course</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
                Preview sample pages before you pay. Pay per document with mobile money.
              </p>
              <div className="flex gap-2 pt-1">
                <Link
                  href="/sign-up"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex-1 text-center rounded-lg bg-amber-500 py-1.5 text-[11px] font-black text-slate-950 hover:bg-amber-400"
                >
                  Create Account
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex-1 text-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 py-1.5 text-[11px] font-bold text-white"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Grouped Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 overscroll-contain touch-pan-y">
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
                          className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${
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
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2.5 shrink-0">
          {authenticatedUser ? (
            <div className="flex items-center justify-between">
              <div className="text-xs truncate max-w-[170px]">
                <span className="block font-bold text-slate-900 truncate">
                  {authenticatedUser.fullName || authenticatedUser.email}
                </span>
                <span className="block text-[11px] text-slate-500 capitalize">
                  {authenticatedUser.role || "Student"} Mode
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 transition flex items-center gap-1 shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <Link
                href="/sign-in"
                onClick={() => setIsSidebarOpen(false)}
                className="text-xs font-bold text-slate-900 hover:underline"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsSidebarOpen(false)}
                className="text-xs font-bold text-[#147D78] hover:underline"
              >
                Create Account →
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (
    pathname?.startsWith("/student") ||
    pathname?.startsWith("/lecturer") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand & Mission (md:col-span-5) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5 text-[#142B45] font-extrabold text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#142B45] text-[#E9B949]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span>SomaUG Academic</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Study notes and revision guides authored by course lecturers and tutors. Preview sample pages before paying with mobile money.
            </p>
            <div className="text-xs text-slate-500 pt-1 font-medium">
              Pay with mobile money (MTN or Airtel)
            </div>
          </div>

          {/* Quick Links (md:col-span-3) */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/catalogue" className="hover:text-teal-700 transition">
                  Browse Materials
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-teal-700 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/lecturer/apply" className="hover:text-teal-700 transition">
                  Teach on SomaUG (85% Split)
                </Link>
              </li>
              <li>
                <Link href="/d" className="hover:text-teal-700 transition">
                  Scan Document QR
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance (md:col-span-4) */}
          <div className="md:col-span-4 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Policies &amp; Support
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/terms" className="hover:text-teal-700 transition">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal-700 transition">
                  Privacy Policy (Uganda DPPA 2019)
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-teal-700 transition">
                  Copyright &amp; 48-Hour Takedown Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-teal-700 transition">
                  24-Hour Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-700 transition">
                  Contact Support (WhatsApp &amp; Email)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Independent Platform Disclaimer */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <p className="text-[11px] leading-relaxed text-slate-500 text-center max-w-4xl mx-auto">
            {SITE_COPY.footer.disclaimer}
          </p>
          <div className="text-center text-xs text-slate-400">
            {SITE_COPY.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
