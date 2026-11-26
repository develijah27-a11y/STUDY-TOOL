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
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-orange-500 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-200">
            <HardDrive className="h-4 w-4" />
            <span>Stored Notes</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Offline Library</h1>
          <p className="text-xs text-sky-100 font-medium">
            Saved on this device for zero-data reading anywhere.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/library"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>My Library</span>
          </Link>
        </div>
      </div>

      {/* Offline View Component */}
      <OfflineLibraryView studentId={studentId} />
    </div>
  );
}

