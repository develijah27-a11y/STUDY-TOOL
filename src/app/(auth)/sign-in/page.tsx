"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("namukasa.grace@students.mak.ac.ug");
  const [password, setPassword] = useState("••••••••••••");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("admin")) {
      router.push("/admin/dashboard");
    } else if (email.includes("prof") || email.includes("dr")) {
      router.push("/lecturer/dashboard");
    } else {
      router.push("/catalogue");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl">
        {/* Left Brand Panel */}
        <div className="bg-gradient-to-br from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-amber-300">
              <GraduationCap className="h-4 w-4" />
              <span>SomaUG Academic Authentication</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-snug">
              Trusted Access for Ugandan Students &amp; University Lecturers
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Browse the academic catalogue freely before registration, or sign in to fund your
              student wallet, purchase verified lecture materials, and sync reading annotations across devices.
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-white/15 text-xs">
            <p className="font-bold text-amber-300">Quick Role Session Presets:</p>
            <button
              type="button"
              onClick={() => setEmail("namukasa.grace@students.mak.ac.ug")}
              className="w-full text-left rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 flex items-center justify-between"
            >
              <span>Student (Grace — Makerere BSSE)</span>
              <span className="text-[10px] text-amber-300 font-mono">UGX 25,000</span>
            </button>
            <button
              type="button"
              onClick={() => setEmail("prof.okello@cis.mak.ac.ug")}
              className="w-full text-left rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 flex items-center justify-between"
            >
              <span>Verified Lecturer (Assoc. Prof. Okello)</span>
              <span className="text-[10px] text-emerald-300 font-mono">Approved</span>
            </button>
            <button
              type="button"
              onClick={() => setEmail("admin@ugandastudy.ug")}
              className="w-full text-left rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 flex items-center justify-between"
            >
              <span>Comptroller / Administrator</span>
              <span className="text-[10px] text-blue-300 font-mono">Full Audit</span>
            </button>
          </div>
        </div>

        {/* Right Sign-In Form */}
        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Sign In to Your Account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Secured by Supabase Auth &amp; Server-Side Row-Level Security
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                University or Personal Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-4 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              <span>Continue to Platform</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
            <Link
              href="/student/profile"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                Configure Student Academic Profile
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <Link
              href="/lecturer/apply"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                Apply for Lecturer Verification
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

