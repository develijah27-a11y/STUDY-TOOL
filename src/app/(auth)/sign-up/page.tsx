"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [role, setRole] = useState<"student" | "lecturer">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [institutionId, setInstitutionId] = useState("11111111-1111-1111-1111-111111111111"); // MAK default
  const [department, setDepartment] = useState("");
  const [teachingRole, setTeachingRole] = useState("Lecturer");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live password validation checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMsg("Please ensure password meets the security requirements below.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          institutionId,
          department: role === "lecturer" ? department : undefined,
          teachingRole: role === "lecturer" ? teachingRole : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to create account.");
        return;
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        if (role === "lecturer") {
          router.push("/lecturer/apply");
        } else {
          router.push("/catalogue");
        }
      }, 1500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Registration request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-2xl">
        
        {/* Left Side: Role Explanation & Trust Banner (5 cols) */}
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Join Ugandan Academic Network</span>
              </span>
              <h1 className="text-2xl font-extrabold leading-snug">
                {role === "student"
                  ? "Discover verified study packs & lecture notes."
                  : "Publish educational materials & earn net royalties."}
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                {role === "student"
                  ? "Search by course unit (e.g. CSC 2101), deposit via MTN/Airtel Money, and unlock permanent study access."
                  : "Submit academic verification, organize WhatsApp course packs, and receive weekly payouts."}
              </p>
            </div>

            {/* Role Switcher in Left Hero */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                Choose Account Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    role === "student"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("lecturer")}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    role === "lecturer"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Lecturer</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-[11px] text-slate-400">
            🔒 Protected by Row Level Security and double-entry accounting.
          </div>
        </div>

        {/* Right Side: Enhanced Registration Form (7 cols) */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {role === "student" ? "Create Student Account" : "Lecturer Registration"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {role === "student"
                    ? "Takes less than 1 minute • No upfront payment needed"
                    : "Requires academic appointment verification"}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-800 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{successMsg} Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Grace Namukasa or Dr. David Okello"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/10 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {role === "lecturer" ? "Institutional Email" : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === "lecturer" ? "name@mak.ac.ug" : "name@email.com"}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/10 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Primary University</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <select
                      value={institutionId}
                      onChange={(e) => setInstitutionId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0B192C] outline-none transition font-medium"
                    >
                      <option value="11111111-1111-1111-1111-111111111111">Makerere University (MAK)</option>
                      <option value="22222222-2222-2222-2222-222222222222">Kyambogo University (KYU)</option>
                      <option value="33333333-3333-3333-3333-333333333333">Mbarara University (MUST)</option>
                      <option value="44444444-4444-4444-4444-444444444444">Uganda Christian Univ (UCU)</option>
                      <option value="55555555-5555-5555-5555-555555555555">Makerere Business School (MUBS)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/10 outline-none transition font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicators */}
                <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-700 font-bold" : ""}`}>
                    {hasMinLength ? "✓" : "•"} Min 8 characters
                  </span>
                  <span className={`flex items-center gap-1 ${hasLetter ? "text-emerald-700 font-bold" : ""}`}>
                    {hasLetter ? "✓" : "•"} Contains letter
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-700 font-bold" : ""}`}>
                    {hasNumber ? "✓" : "•"} Contains number
                  </span>
                </div>
              </div>

              {/* Extra Lecturer Details */}
              {role === "lecturer" && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                  <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1.5">
                    Teaching Appointment Details:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Academic Title</label>
                      <select
                        value={teachingRole}
                        onChange={(e) => setTeachingRole(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-medium"
                      >
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Senior Lecturer">Senior Lecturer</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Assistant Lecturer">Assistant Lecturer</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-[#162942] active:scale-[0.99] disabled:opacity-50 transition"
              >
                <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-extrabold text-[#0B192C] hover:underline">
              Sign in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
