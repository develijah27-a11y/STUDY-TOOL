"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  History,
  Plus,
  X,
} from "lucide-react";

export default function StudentAcademicProfilePage() {
  const [studentName, setStudentName] = useState("Student");
  const [institution, setInstitution] = useState("inst-mak");
  const [programme, setProgramme] = useState("prog-bsse");
  const [academicYear, setAcademicYear] = useState(2);
  const [semester, setSemester] = useState(1);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([
    "CSC 2101",
    "BSSE 3102",
  ]);
  const [customCourseInput, setCustomCourseInput] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.fullName) setStudentName(u.fullName);
        if (u.institutionId) setInstitution(u.institutionId);
        if (u.programmeId) setProgramme(u.programmeId);
        if (Array.isArray(u.selectedCourses) && u.selectedCourses.length > 0) {
          setSelectedCourses(u.selectedCourses);
        }
      }
    } catch { }
  }, []);

  const handleAddCourseUnit = () => {
    const trimmed = customCourseInput.trim().toUpperCase();
    if (trimmed && !selectedCourses.includes(trimmed)) {
      setSelectedCourses([...selectedCourses, trimmed]);
      setCustomCourseInput("");
    }
  };

  const removeCourse = (code: string) => {
    setSelectedCourses(selectedCourses.filter((c) => c !== code));
  };

  const toggleCourse = (code: string) => {
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cached = localStorage.getItem("somaug_user_session");
      const current = cached ? JSON.parse(cached) : {};
      const updated = {
        ...current,
        fullName: studentName,
        institutionId: institution,
        programmeId: programme,
        academicYear,
        semester,
        selectedCourses,
      };
      localStorage.setItem("somaug_user_session", JSON.stringify(updated));
    } catch {}

    setSavedMessage(
      "Academic profile updated! Catalogue rankings and recommendations now prioritize your active course units."
    );
    setTimeout(() => setSavedMessage(null), 4000);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      <div className="rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#162942] to-[#1E3E62] text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Student Academic Profile</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              {studentName} — Academic Profile
            </h1>
            <p className="text-xs text-slate-300">
              Customize your institution, programme, and active course units to prioritize relevant
              course notes and past papers. You can update your preferences anytime.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shrink-0"
          >
            <span>Explore Matched Catalogue</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-5 w-5 text-amber-600" />
            <span>Current Semester Enrolment (Optional)</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  University / Institution
                </label>
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-medium"
                >
                  <optgroup label="Universities">
                    <option value="inst-mak">Makerere University (MAK)</option>
                    <option value="inst-kyu">Kyambogo University (KYU)</option>
                    <option value="inst-must">Mbarara University of Science &amp; Tech (MUST)</option>
                    <option value="inst-ucu">Uganda Christian University (UCU)</option>
                    <option value="inst-mubs">Makerere University Business School (MUBS)</option>
                    <option value="inst-kiu">Kampala International University (KIU)</option>
                  </optgroup>
                  <optgroup label="Vocational &amp; Technical Institutes">
                    <option value="inst-bribte">Buganda Royal Institute (BRIBTE)</option>
                    <option value="inst-uict">UICT Nakawa</option>
                    <option value="inst-kpm">Kampala Polytechnic Mengo (KPM)</option>
                    <option value="inst-htti">Hotel &amp; Tourism Training Institute (HTTI Jinja)</option>
                    <option value="inst-ymca">YMCA Comprehensive Institute Kampala</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Degree Programme
                </label>
                <select
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-medium"
                >
                  <option value="prog-bsse">BSSE — B.Sc. Software Engineering</option>
                  <option value="prog-bcs">BCS — B.Sc. Computer Science</option>
                  <option value="prog-llb">LLB — Bachelor of Laws</option>
                  <option value="prog-bba">BBA — Bachelor of Business Administration</option>
                  <option value="prog-beng">BENG — B.Eng. Civil &amp; Building</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-medium"
                >
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Semester / Term
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-medium"
                >
                  <option value={1}>Semester I</option>
                  <option value={2}>Semester II</option>
                  <option value={3}>Recess / Term III</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Active Course Units (Enrolled Semester Units)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Type your current course unit codes to prioritize matching notes, past papers, and compendiums.
                </p>

                {/* Course Unit Input Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCourseInput}
                    onChange={(e) => setCustomCourseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCourseUnit();
                      }
                    }}
                    placeholder="Type course unit (e.g. CSC 2101, LAW 2105, BRIBTE EE 1101)..."
                    className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-[#147D78] focus:ring-2 focus:ring-[#147D78]/20 outline-none uppercase placeholder:normal-case"
                  />
                  <button
                    type="button"
                    onClick={handleAddCourseUnit}
                    disabled={!customCourseInput.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B45] hover:bg-[#147D78] disabled:opacity-40 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Unit</span>
                  </button>
                </div>
              </div>

              {/* Active Enrolled Course Unit Badges */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Your Enrolled Course Units ({selectedCourses.length}):
                </span>
                {selectedCourses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No course units enrolled yet. Type a course unit above or click suggestions below.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedCourses.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B45] text-white px-3 py-1.5 text-xs font-mono font-bold shadow-xs"
                      >
                        <span>{code}</span>
                        <button
                          type="button"
                          onClick={() => removeCourse(code)}
                          className="p-0.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition"
                          title={`Remove ${code}`}
                          aria-label={`Remove ${code}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Faculty Suggestions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Popular Course Suggestions (Click to Add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "CSC 2101",
                    "BSSE 3102",
                    "LAW 2105",
                    "ACC 1102",
                    "CIV 2201",
                    "MED 2104",
                    "EE 1101",
                    "TLC 1204",
                    "AUT 2102",
                  ].map((code) => {
                    const active = selectedCourses.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleCourse(code)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold border transition ${
                          active
                            ? "bg-teal-50 text-[#147D78] border-[#147D78]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {active ? "✓ " : "+ "}
                        {code}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {savedMessage && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{savedMessage}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[#0B192C] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Save Academic Profile
              </button>
              <Link
                href="/catalogue"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Skip for now →
              </Link>
            </div>
          </form>
        </div>

        {/* Preserved Academic History Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="h-4 w-4 text-amber-600" />
            <span>Preserved Academic History</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your previous semesters are preserved so you can always revisit foundational course
            materials and past examination guides.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
              <span className="font-bold text-slate-900 block">
                Year 2, Semester I (Current — 2026/2027)
              </span>
              <span className="text-slate-600 block">
                Makerere University • BSSE • CSC 2101, BSSE 3102
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
              <span className="font-bold text-slate-800 block">
                Year 1, Semester II (Completed — 2025/2026)
              </span>
              <span className="text-slate-500 block">
                Makerere University • BSSE • BSSE 1204, MTH 1101
              </span>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline pt-1"
              >
                <BookOpen className="h-3 w-3" />
                View Year 1 Materials
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

