"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/catalogue", label: "Catalogue", icon: Search },
    { href: "/student/library", label: "Study Library", icon: Library },
    { href: "/student/wallet", label: "Student Wallet", icon: Wallet },
    { href: "/student/profile", label: "Academic Profile", icon: UserCheck },
    { href: "/lecturer/dashboard", label: "Lecturer Hub", icon: UploadCloud },
    { href: "/collections/MAK-CSC2101-2026", label: "WhatsApp Packs", icon: Share2 },
    { href: "/admin/dashboard", label: "Admin & Audit", icon: ShieldCheck },
  ];

  return (
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

      {/* Mobile horizontal navigation bar optimized for Android screens */}
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
              <li>Makerere Business School (MUBS)</li>
              <li>Uganda Christian University (UCU)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Platform Journeys
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalogue" className="hover:text-white">
                  Browse Course Materials
                </Link>
              </li>
              <li>
                <Link href="/student/profile" className="hover:text-white">
                  Student Academic Profile
                </Link>
              </li>
              <li>
                <Link href="/student/wallet" className="hover:text-white">
                  Student Wallet &amp; Receipts
                </Link>
              </li>
              <li>
                <Link href="/lecturer/apply" className="hover:text-white">
                  Lecturer Verification Application
                </Link>
              </li>
              <li>
                <Link href="/lecturer/dashboard" className="hover:text-white">
                  Lecturer Publishing &amp; Payouts
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white">
                  Comptroller &amp; Reconciliation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Financial &amp; DRM Integrity
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every purchase executes inside an atomic double-entry ledger transaction. Protected
              PDF pages verify entitlement server-side and embed personalized buyer watermarks.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SomaUG Academic Marketplace. All financial operations in exact integer UGX.
        </div>
      </div>
    </footer>
  );
}
