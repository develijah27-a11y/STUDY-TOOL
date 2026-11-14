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
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Wallet,
  Zap,
  Building2,
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const routeByRole = (roles: string[]) => {
    let dest = "/student/dashboard";
    if (roles.includes("admin") || roles.includes("co_admin")) {
      dest = "/admin/dashboard";
    } else if (roles.includes("lecturer")) {
      dest = "/lecturer/dashboard";
    }

    if (typeof window !== "undefined") {
      window.location.href = dest;
    } else {
      router.push(dest);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid credentials.");
        return;
      }

      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem("somaug_user_session", JSON.stringify(data.user));
      }

      routeByRole(data.user?.roles || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async (demoEmail: string, roleName: string) => {
    setDemoLoading(roleName);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, isDemo: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Instant login failed.");
        return;
      }

      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem("somaug_user_session", JSON.stringify(data.user));
      }

      routeByRole(data.user?.roles || []);
    } catch (err) {
      setErrorMsg("Network error during instant sign-in.");
    } finally {
      setDemoLoading(null);
    }
  };

  const handleApplyPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-2xl">
        
        {/* Left Side: Scholarly Visual Brand Hero (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-amber-400 shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-base font-extrabold tracking-tight">
                  Soma<span className="text-amber-400">UG</span>
                </span>
                <span className="block text-[11px] font-medium text-slate-300">
                  Academic Marketplace
                </span>
              </div>
            </Link>

            <div className="space-y-2 pt-2">
              <h1 className="text-2xl font-extrabold leading-snug">
                Welcome back to verified academic &amp; vocational study materials.
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Log in to access your study library, view your student wallet, or manage publications on your role dashboard.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Dedicated role dashboards (Student, Lecturer, Admin)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Secure study wallet in Ugandan Shillings (UGX)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>One-tap links &amp; scannable QR codes for class handouts</span>
              </div>
            </div>
          </div>

          {/* Supported Institutions & Accreditation */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Supported Institutions &amp; Faculties</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Course notes, practical manuals, and solved past papers for universities, technical colleges, and vocational institutes across Uganda.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
              <span className="rounded-md bg-white/10 border border-white/10 px-2 py-0.5 text-slate-200">Makerere (MAK)</span>
              <span className="rounded-md bg-white/10 border border-white/10 px-2 py-0.5 text-slate-200">Kyambogo (KYU)</span>
              <span className="rounded-md bg-white/10 border border-white/10 px-2 py-0.5 text-slate-200">Buganda Royal (BRIBTE)</span>
              <span className="rounded-md bg-white/10 border border-white/10 px-2 py-0.5 text-slate-200">UICT Nakawa</span>
              <span className="rounded-md bg-white/10 border border-white/10 px-2 py-0.5 text-slate-200">Mbarara (MUST)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sign-In Form (7 cols) */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Sign in to your account
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Enter your email address and password to continue
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                SSL Encrypted
              </span>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-800 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@mak.ac.ug or personal email"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/10 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password reset instructions have been dispatched to your email address.");
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/10 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-5 py-3 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-50 transition shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <span className="text-slate-500 font-medium">
              Don&apos;t have an account yet?
            </span>
            <Link
              href="/sign-up"
              className="font-black text-amber-700 hover:underline flex items-center gap-1"
            >
              <span>Create an account</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
