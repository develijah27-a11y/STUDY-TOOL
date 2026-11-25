"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE_COPY } from "@/lib/constants/site-copy";
import {
  GraduationCap,
  Menu,
  X,
  UserCheck,
  LogIn,
  LogOut,
  UploadCloud,
  Library,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname() || "";
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    id: string;
    email?: string;
    fullName?: string;
    role?: string;
  } | null>(null);

  // Close mobile dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Isolate dashboard shells: student, lecturer, and admin have dedicated internal layouts
  const isDashboardRoute = Boolean(
    pathname.startsWith("/student") ||
    pathname.startsWith("/lecturer") ||
    pathname.startsWith("/admin")
  );

  // Sync authentication state
  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        setAuthenticatedUser(JSON.parse(cached));
      }
    } catch { }

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
      } catch { }
    }
    checkSession();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch { }
    localStorage.removeItem("somaug_user_session");
    setAuthenticatedUser(null);
    setMobileMenuOpen(false);
    router.push("/sign-in");
  };

  if (isDashboardRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-sky-600 to-orange-500 text-white shadow-md shadow-sky-500/25">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Soma<span className="text-orange-500">UG</span> Academic
            </span>
            <span className="block text-[11px] font-bold text-sky-700 dark:text-sky-400 mt-0.5">
              Course Study Materials
            </span>
          </div>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Link
            href="/catalogue"
            className="px-3.5 py-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-400 transition"
          >
            Explore Materials
          </Link>
          <Link
            href="/#how-it-works"
            className="px-3.5 py-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-400 transition"
          >
            How It Works
          </Link>
          <Link
            href="/lecturer/apply"
            className="px-3.5 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800 transition"
          >
            For Lecturers
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {pathname === "/" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-sky-500/25 transition"
              >
                <span>Create Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : authenticatedUser ? (
            <div className="flex items-center gap-2">
              <Link
                href={
                  authenticatedUser.role === "lecturer"
                    ? "/lecturer/dashboard?tab=publications"
                    : "/student/library"
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 transition"
              >
                {authenticatedUser.role === "lecturer" ? (
                  <>
                    <UploadCloud className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>My Publications</span>
                  </>
                ) : (
                  <>
                    <Library className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>My Library</span>
                  </>
                )}
              </Link>

              <Link
                href={
                  authenticatedUser.role === "lecturer"
                    ? "/lecturer/dashboard"
                    : authenticatedUser.role === "admin"
                      ? "/admin/dashboard"
                      : "/student/dashboard"
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-orange-600 hover:from-sky-700 hover:to-orange-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
              >
                <UserCheck className="h-3.5 w-3.5 text-sky-200" />
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-red-600 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
              >
                <span>Create Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Lightweight Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
            {pathname !== "/" && (
              <Link
                href="/catalogue"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Explore Materials
              </Link>
            )}
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              How It Works
            </Link>
            <Link
              href="/lecturer/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold"
            >
              For Lecturers
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {pathname === "/" ? (
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-orange-500 text-white text-xs font-bold"
              >
                Get Started
              </Link>
            ) : authenticatedUser ? (
              <>
                <Link
                  href={authenticatedUser.role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-orange-600 text-white text-xs font-bold"
                >
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-center py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-orange-500 text-white text-xs font-bold"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
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
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand & Mission (md:col-span-5) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-extrabold text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-orange-500 text-white shadow-md shadow-sky-500/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span>
                Soma<span className="text-orange-500">UG</span> Academic
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              Study notes and revision guides authored by course lecturers and tutors. Preview sample pages before paying with mobile money.
            </p>
            <div className="text-xs text-sky-700 dark:text-sky-400 pt-1 font-semibold">
              Pay with mobile money (MTN or Airtel)
            </div>
          </div>

          {/* Quick Links (md:col-span-3) */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li>
                <Link href="/catalogue" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Explore Materials
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/lecturer/apply" className="hover:text-orange-600 dark:hover:text-orange-400 transition">
                  For Lecturers
                </Link>
              </li>
              <li>
                <Link href="/d" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Scan Document QR
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Support (md:col-span-4) */}
          <div className="md:col-span-4 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Policies &amp; Support
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li>
                <Link href="/terms" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Privacy Policy (Uganda DPPA 2019)
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Copyright &amp; 48-Hour Takedown Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  24-Hour Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Contact Support (WhatsApp &amp; Email)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Independent Platform Disclaimer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 text-center max-w-4xl mx-auto">
            {SITE_COPY.footer.disclaimer}
          </p>
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            {SITE_COPY.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
