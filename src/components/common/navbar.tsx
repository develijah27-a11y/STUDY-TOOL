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
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#059669] to-[#0D9488] text-white shadow-md shadow-emerald-500/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-black tracking-tight text-slate-900 leading-none">
              Soma<span className="text-emerald-600">UG</span> Academic
            </span>
            <span className="block text-[11px] font-bold text-emerald-800/80 mt-0.5">
              Course Study Materials
            </span>
          </div>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Link
            href="/catalogue"
            className="px-3.5 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition"
          >
            Explore Materials
          </Link>
          <Link
            href="/#how-it-works"
            className="px-3.5 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition"
          >
            How It Works
          </Link>
          <Link
            href="/lecturer/apply"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200/80 transition"
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
                className="px-3.5 py-2 text-xs font-bold text-slate-800 hover:text-emerald-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-600/25 transition"
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] hover:bg-[#EDF4F0] px-3.5 py-2 text-xs font-bold text-[#172B27] transition"
              >
                {authenticatedUser.role === "lecturer" ? (
                  <>
                    <UploadCloud className="h-3.5 w-3.5 text-[#16866A]" />
                    <span>My Publications</span>
                  </>
                ) : (
                  <>
                    <Library className="h-3.5 w-3.5 text-[#16866A]" />
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#172B27] hover:bg-[#116B55] px-4 py-2 text-xs font-bold text-white transition shadow-sm"
              >
                <UserCheck className="h-3.5 w-3.5 text-[#A3E5D0]" />
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-[#89958F] hover:text-red-600 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="px-3.5 py-2 text-xs font-bold text-[#172B27] hover:text-[#16866A] transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#16866A] hover:bg-[#116B55] px-4 py-2 text-xs font-bold text-white shadow-sm transition"
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
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Lightweight Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2ECE7] bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1 text-xs font-semibold text-[#172B27]">
            <Link
              href="/catalogue"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-[#F4F7F6]"
            >
              Explore Materials
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-[#F4F7F6]"
            >
              How It Works
            </Link>
            <Link
              href="/lecturer/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-[#E8F5EF] text-[#16866A] font-bold"
            >
              For Lecturers
            </Link>
          </div>

          <div className="pt-2 border-t border-[#E2ECE7] flex flex-col gap-2">
            {pathname === "/" ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-[#E2ECE7] text-[#172B27] text-xs font-bold hover:bg-[#F4F7F6]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-[#16866A] text-white text-xs font-bold hover:bg-[#116B55]"
                >
                  Create Account
                </Link>
              </div>
            ) : authenticatedUser ? (
              <>
                <Link
                  href={authenticatedUser.role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#172B27] text-white text-xs font-bold"
                >
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-center py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-[#E2ECE7] text-[#172B27] text-xs font-bold hover:bg-[#F4F7F6]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-[#16866A] text-white text-xs font-bold hover:bg-[#116965]"
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
    <footer className="border-t border-[#E2ECE7] bg-white text-[#64736D] mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand & Mission (md:col-span-5) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5 text-[#172B27] font-extrabold text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16866A] text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span>SomaUG Academic</span>
            </div>
            <p className="text-xs text-[#64736D] leading-relaxed max-w-sm">
              Study notes and revision guides authored by course lecturers and tutors. Preview sample pages before paying with mobile money.
            </p>
            <div className="text-xs text-[#89958F] pt-1 font-medium">
              Pay with mobile money (MTN or Airtel)
            </div>
          </div>

          {/* Quick Links (md:col-span-3) */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B27]">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-[#64736D] font-medium">
              <li>
                <Link href="/catalogue" className="hover:text-[#16866A] transition">
                  Explore Materials
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#16866A] transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/lecturer/apply" className="hover:text-[#16866A] transition">
                  For Lecturers
                </Link>
              </li>
              <li>
                <Link href="/d" className="hover:text-[#16866A] transition">
                  Scan Document QR
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Support (md:col-span-4) */}
          <div className="md:col-span-4 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B27]">
              Policies &amp; Support
            </h3>
            <ul className="space-y-2 text-xs text-[#64736D] font-medium">
              <li>
                <Link href="/terms" className="hover:text-[#16866A] transition">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#16866A] transition">
                  Privacy Policy (Uganda DPPA 2019)
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-[#16866A] transition">
                  Copyright &amp; 48-Hour Takedown Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-[#16866A] transition">
                  24-Hour Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#16866A] transition">
                  Contact Support (WhatsApp &amp; Email)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Independent Platform Disclaimer */}
        <div className="border-t border-[#E2ECE7] pt-6 space-y-3">
          <p className="text-xs leading-relaxed text-[#89958F] text-center max-w-4xl mx-auto">
            {SITE_COPY.footer.disclaimer}
          </p>
          <div className="text-center text-xs text-[#89958F]">
            {SITE_COPY.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
