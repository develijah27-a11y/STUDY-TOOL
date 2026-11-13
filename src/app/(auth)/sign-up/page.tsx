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
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [role, setRole] = useState<"student" | "lecturer">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionId, setInstitutionId] = useState("11111111-1111-1111-1111-111111111111"); // MAK default
  const [department, setDepartment] = useState("");
  const [teachingRole, setTeachingRole] = useState("Lecturer");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

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
      }, 2000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Registration request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 md:p-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300">
            <GraduationCap className="h-4 w-4" />
            <span>Create Uganda Academic Marketplace Account</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Join SomaUG Academic Community
          </h1>
          <p className="text-xs text-slate-300">
            Select your account type below. Students enjoy instant document discovery and wallet
            checkout. Lecturers submit academic verification to publish and receive weekly mobile money payouts.
          </p>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 pt-2 max-w-sm">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === "student"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Student Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("lecturer")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === "lecturer"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Lecturer / Publisher</span>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="p-6 md:p-8 space-y-5 text-xs">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg} Redirecting...</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Grace Namukasa or Dr. David Okello"
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 outline-none focus:border-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {role === "lecturer" ? "Institutional Email (.ac.ug)" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.ac.ug or personal email"
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 outline-none focus:border-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 outline-none focus:border-slate-900"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary University</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2.5 font-medium outline-none"
                >
                  <option value="11111111-1111-1111-1111-111111111111">
                    Makerere University (MAK)
                  </option>
                  <option value="22222222-2222-2222-2222-222222222222">
                    Kyambogo University (KYU)
                  </option>
                  <option value="33333333-3333-3333-3333-333333333333">
                    Mbarara University (MUST)
                  </option>
                  <option value="44444444-4444-4444-4444-444444444444">
                    Uganda Christian University (UCU)
                  </option>
                  <option value="55555555-5555-5555-5555-555555555555">
                    Makerere University Business School (MUBS)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {role === "lecturer" && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <span className="font-bold text-slate-900 block border-b border-slate-200 pb-2">
                Lecturer Academic Appointment Details:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Faculty</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Department of Computer Science"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teaching Appointment</label>
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-5 py-3.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition"
          >
            <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </button>

          <div className="text-center pt-2">
            <span className="text-slate-500">Already registered? </span>
            <Link href="/sign-in" className="font-bold text-amber-800 hover:underline">
              Sign in to your account →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

