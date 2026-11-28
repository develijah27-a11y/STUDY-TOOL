import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, updateUserProfile, createSessionToken, findUserById } from "@/lib/auth/user-store";
import { dbStore } from "@/lib/db/in-memory-store";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getInstitutionName, getProgrammeName } from "@/lib/constants/academic";

export async function GET(req: NextRequest) {
  try {
    let authoritativeUser: any = null;

    // 1. Try local session cookie
    const sessionCookie = req.cookies.get("somaug_session")?.value;
    if (sessionCookie) {
      const sessionUser = verifySessionToken(sessionCookie);
      if (sessionUser) {
        authoritativeUser = findUserById(sessionUser.id) || sessionUser;
      }
    }

    // 2. Fallback to Supabase auth if session cookie is absent
    if (!authoritativeUser) {
      try {
        const supabase = createClient();
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          const meta = sbUser.user_metadata || {};
          authoritativeUser = {
            id: sbUser.id,
            email: sbUser.email || "",
            fullName: meta.full_name || "Verified Student",
            role: meta.role || "student",
            institutionId: meta.institutionId,
            faculty: meta.faculty,
            department: meta.department,
            programmeId: meta.programmeId,
            academicYear: meta.academicYear ? Number(meta.academicYear) : 1,
            semester: meta.semester ? Number(meta.semester) : 1,
            activeCourseUnits: meta.activeCourseUnits || [],
            verificationStatus: meta.verificationStatus || "registered",
          };
        }
      } catch {}
    }

    if (!authoritativeUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instName = authoritativeUser.institutionName || getInstitutionName(authoritativeUser.institutionId);
    const progName = authoritativeUser.programme || getProgrammeName(authoritativeUser.programmeId);

    return NextResponse.json({
      success: true,
      user: {
        id: authoritativeUser.id,
        email: authoritativeUser.email,
        fullName: authoritativeUser.fullName,
        role: authoritativeUser.role,
        institutionId: authoritativeUser.institutionId,
        institutionName: instName,
        faculty: authoritativeUser.faculty,
        department: authoritativeUser.department,
        programmeId: authoritativeUser.programmeId,
        programme: progName,
        academicYear: authoritativeUser.academicYear,
        semester: authoritativeUser.semester,
        activeCourseUnits: authoritativeUser.activeCourseUnits || [],
        selectedCourses: authoritativeUser.activeCourseUnits || [],
        verificationStatus: authoritativeUser.verificationStatus,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Profile retrieval error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    let userId = "";
    let userEmail = "";

    const sessionCookie = req.cookies.get("somaug_session")?.value;
    if (sessionCookie) {
      const sessionUser = verifySessionToken(sessionCookie);
      if (sessionUser) {
        userId = sessionUser.id;
        userEmail = sessionUser.email;
      }
    }

    if (!userId) {
      try {
        const supabase = createClient();
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          userId = sbUser.id;
          userEmail = sbUser.email || "";
        }
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      institutionId,
      faculty,
      department,
      programmeId,
      academicYear,
      semester,
      activeCourseUnits,
    } = body;

    const parsedUnits = Array.isArray(activeCourseUnits)
      ? activeCourseUnits.map((u: string) => String(u).trim().toUpperCase()).filter(Boolean)
      : typeof activeCourseUnits === "string"
      ? activeCourseUnits.split(",").map((u) => u.trim().toUpperCase()).filter(Boolean)
      : undefined;

    // 1. Update in authoritative user store
    const updatedUser = updateUserProfile(userId, {
      fullName: fullName !== undefined ? String(fullName) : undefined,
      institutionId: institutionId !== undefined ? String(institutionId) : undefined,
      faculty: faculty !== undefined ? String(faculty) : undefined,
      department: department !== undefined ? String(department) : undefined,
      programmeId: programmeId !== undefined ? String(programmeId) : undefined,
      academicYear: academicYear !== undefined ? Number(academicYear) : undefined,
      semester: semester !== undefined ? Number(semester) : undefined,
      activeCourseUnits: parsedUnits,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // 2. Synchronize in-memory store
    const memProfile = dbStore.profiles.find((p) => p.id === userId);
    if (memProfile) {
      if (fullName) memProfile.fullName = fullName.trim();
      if (institutionId) memProfile.institutionId = institutionId;
      if (programmeId) memProfile.programmeId = programmeId;
      if (academicYear) memProfile.academicYear = Number(academicYear);
      if (semester) memProfile.semester = Number(semester);
      memProfile.updatedAt = new Date().toISOString();
    }

    // 3. Background Supabase update for metadata persistence
    try {
      const adminSb = createAdminClient();
      const { data: userList } = await adminSb.auth.admin.listUsers();
      const found = userList?.users.find((u) => u.email?.toLowerCase() === (userEmail || updatedUser.email).toLowerCase());
      if (found) {
        await adminSb.auth.admin.updateUserById(found.id, {
          user_metadata: {
            ...found.user_metadata,
            full_name: updatedUser.fullName,
            institutionId: updatedUser.institutionId,
            institutionName: updatedUser.institutionName || getInstitutionName(updatedUser.institutionId),
            programmeId: updatedUser.programmeId,
            programme: updatedUser.programme || getProgrammeName(updatedUser.programmeId),
            academicYear: updatedUser.academicYear,
            semester: updatedUser.semester,
            activeCourseUnits: updatedUser.activeCourseUnits,
            faculty: updatedUser.faculty,
            department: updatedUser.department,
          },
        });
      }
    } catch (sbErr) {
      console.warn("Supabase background profile update:", sbErr);
    }

    // 4. Issue refreshed session cookie
    const newSessionToken = createSessionToken(updatedUser);
    const instName = updatedUser.institutionName || getInstitutionName(updatedUser.institutionId);
    const progName = updatedUser.programme || getProgrammeName(updatedUser.programmeId);

    const response = NextResponse.json({
      success: true,
      message: "Academic profile successfully saved to database.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        institutionId: updatedUser.institutionId,
        institutionName: instName,
        faculty: updatedUser.faculty,
        department: updatedUser.department,
        programmeId: updatedUser.programmeId,
        programme: progName,
        academicYear: updatedUser.academicYear,
        semester: updatedUser.semester,
        activeCourseUnits: updatedUser.activeCourseUnits || [],
        selectedCourses: updatedUser.activeCourseUnits || [],
      },
    });

    response.cookies.set({
      name: "somaug_session",
      value: newSessionToken,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

