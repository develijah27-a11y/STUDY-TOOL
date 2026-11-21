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
  const [institutionId, setInstitutionId] = useState("inst-mak");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [programmeId, setProgrammeId] = useState("prog-bsse");
  const [academicYear, setAcademicYear] = useState<number>(2);
  const [semester, setSemester] = useState<number>(1);
  const [activeCourseUnits, setActiveCourseUnits] = useState("CSC 2101, BIT 1202");
  const [teachingRole, setTeachingRole] = useState("Lecturer");
  const [staffId, setStaffId] = useState("");
  const [coursesTaught, setCoursesTaught] = useState("CSC 2101");
  const [payoutMobileNumber, setPayoutMobileNumber] = useState("");
  const [payoutMobileNetwork, setPayoutMobileNetwork] = useState<"MTN" | "AIRTEL">("MTN");
  const [agreeTerms, setAgreeTerms] = useState(false);

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

    if (!agreeTerms) {
      setErrorMsg("Please accept the Terms of Use and Privacy Policy.");
      setLoading(false);
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMsg("Please ensure password meets the security requirements below.");
      setLoading(false);
      return;
    }

    try {
      const parsedUnits = activeCourseUnits
        .split(",")
        .map((u) => u.trim().toUpperCase())
        .filter(Boolean);

      const parsedCourses = coursesTaught
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);

      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          institutionId,
          faculty: faculty.trim() || undefined,
          department: department.trim() || undefined,
          programmeId: role === "student" ? programmeId : undefined,
          academicYear: role === "student" ? Number(academicYear) : undefined,
          semester: role === "student" ? Number(semester) : undefined,
          activeCourseUnits: role === "student" ? parsedUnits : undefined,
          teachingRole: role === "lecturer" ? teachingRole : undefined,
          staffId: role === "lecturer" ? staffId.trim() || undefined : undefined,
          coursesTaught: role === "lecturer" ? parsedCourses : undefined,
          payoutMobileNumber: role === "lecturer" ? payoutMobileNumber.trim() || undefined : undefined,
          payoutMobileNetwork: role === "lecturer" ? payoutMobileNetwork : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to create account.");
        return;
      }

      if (typeof window !== "undefined" && data.user) {
        const fullUser = {
          ...data.user,
          institutionId,
          programmeId,
          academicYear,
          semester,
          selectedCourses: parsedUnits,
          activeCourseUnits: parsedUnits,
        };
        localStorage.setItem("somaug_user_session", JSON.stringify(fullUser));
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        const dest = role === "lecturer" ? "/lecturer/dashboard" : "/student/dashboard";
        if (typeof window !== "undefined") {
          window.location.href = dest;
        } else {
          router.push(dest);
        }
      }, 800);
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
                <span className="block text-xs font-medium text-slate-300">
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
                  ? "Access lecture notes."
                  : "Publish course materials."}
              </h1>
              <p className="text-xs text-slate-300">
                {role === "student"
                  ? "Preview sample pages and unlock with mobile money."
                  : "Upload notes and withdraw earnings directly."}
              </p>
            </div>

            {/* Role Switcher in Left Hero */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
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

          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-xs text-slate-400">
            🔒 Encrypted communication · Data handled under Uganda DPPA 2019.
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
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {role === "lecturer" ? "Academic Institution" : "University / Vocational Institute"}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <select
                      value={institutionId}
                      onChange={(e) => setInstitutionId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0B192C] outline-none transition font-medium"
                    >
                      <optgroup label="Universities">
                        <option value="inst-mak">Makerere University (MAK)</option>
                        <option value="inst-kyu">Kyambogo University (KYU)</option>
                        <option value="inst-must">Mbarara University of Science &amp; Tech (MUST)</option>
                        <option value="inst-ucu">Uganda Christian University (UCU)</option>
                        <option value="inst-mubs">Makerere University Business School (MUBS)</option>
                      </optgroup>
                      <optgroup label="Technical &amp; Vocational Institutes">
                        <option value="inst-uict">Uganda Institute of ICT (UICT Nakawa)</option>
                        <option value="inst-bribte">Buganda Royal Institute (BRIBTE)</option>
                        <option value="inst-kpm">Kampala Polytechnic Mengo (KPM)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              {/* Student Academic Verification Profile (Institution, Faculty, Department, Programme, Year, Semester, Active Course Units) */}
              {role === "student" && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-[#147D78]" />
                      <span>Academic Enrolment &amp; Active Course Units:</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Verified Matching
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Faculty / School</label>
                      <input
                        type="text"
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        placeholder="e.g. School of Computing & IT, Faculty of Law"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#147D78]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science, Accounting, Law"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#147D78]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block font-bold text-slate-700 mb-1">Programme of Study</label>
                      <select
                        value={programmeId}
                        onChange={(e) => setProgrammeId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none"
                      >
                        <option value="prog-bsse">B.Sc. Software Engineering</option>
                        <option value="prog-bcs">B.Sc. Computer Science</option>
                        <option value="prog-bit">Bachelor of Information Technology</option>
                        <option value="prog-bba">Bachelor of Business Admin (BBA)</option>
                        <option value="prog-bee">B.Sc. Electrical Engineering</option>
                        <option value="prog-bce">B.Sc. Civil Engineering</option>
                        <option value="prog-llb">Bachelor of Laws (LLB)</option>
                        <option value="prog-voc-elec">National Cert. Electrical Installation</option>
                        <option value="prog-voc-auto">Automotive &amp; Power Mechanics</option>
                        <option value="prog-other">Other Academic / Vocational Course</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Year of Study</label>
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none"
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                        <option value={5}>Year 5</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none"
                      >
                        <option value={1}>Semester I</option>
                        <option value={2}>Semester II</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Active Course Units (Current Semester)
                    </label>
                    <input
                      type="text"
                      value={activeCourseUnits}
                      onChange={(e) => setActiveCourseUnits(e.target.value)}
                      placeholder="e.g. CSC 2101, BIT 1202, SE 2103 (comma separated)"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#147D78]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-xs text-slate-500">Active Tags:</span>
                      {activeCourseUnits
                        .split(",")
                        .map((u) => u.trim().toUpperCase())
                        .filter(Boolean)
                        .map((unit) => (
                          <span
                            key={unit}
                            className="inline-flex items-center rounded bg-teal-100 text-[#147D78] px-2 py-0.5 text-xs font-mono font-bold border border-teal-200"
                          >
                            {unit}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              )}

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
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
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
                    Teaching Appointment &amp; Payout Setup:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Faculty / School *</label>
                      <input
                        type="text"
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        placeholder="e.g. Faculty of Technology, School of Law"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#147D78]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department *</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science, Accounting"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#147D78]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Academic Title</label>
                      <select
                        value={teachingRole}
                        onChange={(e) => setTeachingRole(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      >
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Senior Lecturer">Senior Lecturer</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Assistant Lecturer">Assistant Lecturer</option>
                        <option value="Teaching Assistant">Teaching Assistant / Tutor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Staff ID / Staff Number</label>
                      <input
                        type="text"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        placeholder="e.g. MAK/STAFF/2021/04"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#147D78]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Courses Taught</label>
                    <input
                      type="text"
                      value={coursesTaught}
                      onChange={(e) => setCoursesTaught(e.target.value)}
                      placeholder="e.g. CSC 2101, CSC 3102 (comma separated)"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#147D78]"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="block font-bold text-slate-800 mb-2">Mobile Money Payout Destination (Direct Withdrawals):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Network</label>
                        <select
                          value={payoutMobileNetwork}
                          onChange={(e) => setPayoutMobileNetwork(e.target.value as "MTN" | "AIRTEL")}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                        >
                          <option value="MTN">MTN Mobile Money</option>
                          <option value="AIRTEL">Airtel Money</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={payoutMobileNumber}
                          onChange={(e) => setPayoutMobileNumber(e.target.value)}
                          placeholder="e.g. 0772 123 456"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-[#147D78]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mandatory Consent Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#147D78] focus:ring-[#147D78]"
                />
                <span className="leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="font-bold underline text-teal-700 hover:text-teal-900">
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="font-bold underline text-teal-700 hover:text-teal-900">
                    Privacy Policy
                  </Link>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreeTerms}
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
