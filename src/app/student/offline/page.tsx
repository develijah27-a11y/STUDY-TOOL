"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, HardDrive, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import OfflineLibraryView from "@/components/offline/offline-library-view";

export default function StudentOfflinePage() {
  const [studentId, setStudentId] = useState("user-student-1");
  const [studentName, setStudentName] = useState("Student");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("somaug_user_session");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.id) setStudentId(u.id);
        if (u.fullName) setStudentName(u.fullName);
      }
    } catch {}
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#142B45] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E9B949]">
            <HardDrive className="h-4 w-4" />
            <span>Encrypted Offline Library</span>
          </div>
          <h1 className="text-2xl font-black">{studentName}&apos;s Downloaded Study Materials</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            All materials below are stored locally as authenticated AES-GCM encrypted chunks. You can read them completely without an internet connection or mobile data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/library"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Library</span>
          </Link>
        </div>
      </div>

      {/* Offline View Component */}
      <OfflineLibraryView studentId={studentId} />
    </div>
  );
}
