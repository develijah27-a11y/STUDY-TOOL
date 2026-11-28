import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/auth/user-store";
import { getInstitutionName, getProgrammeName } from "@/lib/constants/academic";

export async function GET(req: NextRequest) {
  try {
    // 1. Check primary persistent session cookie
    const sessionCookie = req.cookies.get("somaug_session")?.value;
    if (sessionCookie) {
      const user = verifySessionToken(sessionCookie);
      if (user) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            roles: [user.role],
            institutionId: user.institutionId,
            institutionName: user.institutionName || getInstitutionName(user.institutionId),
            faculty: user.faculty,
            department: user.department,
            programmeId: user.programmeId,
            programme: user.programme || getProgrammeName(user.programmeId),
            academicYear: user.academicYear,
            semester: user.semester,
            activeCourseUnits: user.activeCourseUnits || [],
            selectedCourses: user.activeCourseUnits || [],
            teachingRole: user.teachingRole,
            staffId: user.staffId,
            coursesTaught: user.coursesTaught || [],
            payoutMobileNumber: user.payoutMobileNumber,
            payoutMobileNetwork: user.payoutMobileNetwork,
            verificationStatus: user.verificationStatus,
          },
        });
      }
    }

    // 2. Check Supabase auth as fallback
    try {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        const meta = user.user_metadata || {};
        const role = meta.role || "student";
        const instId = meta.institutionId || "inst-mak";
        const progId = meta.programmeId || "prog-bsse";
        return NextResponse.json({
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: meta.full_name || "Verified User",
            role,
            roles: [role],
            institutionId: instId,
            institutionName: meta.institutionName || getInstitutionName(instId),
            programmeId: progId,
            programme: meta.programme || getProgrammeName(progId),
            academicYear: meta.academicYear ? Number(meta.academicYear) : 1,
            semester: meta.semester ? Number(meta.semester) : 1,
            activeCourseUnits: meta.activeCourseUnits || [],
            selectedCourses: meta.activeCourseUnits || [],
            faculty: meta.faculty,
            department: meta.department,
            teachingRole: meta.teachingRole,
            staffId: meta.staffId,
            coursesTaught: meta.coursesTaught || [],
            payoutMobileNumber: meta.payoutMobileNumber,
            payoutMobileNetwork: meta.payoutMobileNetwork,
            verificationStatus: meta.verificationStatus || "registered",
          },
        });
      }
    } catch {
      // Supabase unavailable, continue to unauthenticated response
    }

    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Session error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
