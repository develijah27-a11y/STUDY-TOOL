import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, updateUserProfile, createSessionToken, findUserById } from "@/lib/auth/user-store";
import { dbStore } from "@/lib/db/in-memory-store";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("somaug_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = verifySessionToken(sessionCookie);
    if (!sessionUser) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const authoritativeUser = findUserById(sessionUser.id) || sessionUser;

    return NextResponse.json({
      success: true,
      user: {
        id: authoritativeUser.id,
        email: authoritativeUser.email,
        fullName: authoritativeUser.fullName,
        role: authoritativeUser.role,
        institutionId: authoritativeUser.institutionId,
        faculty: authoritativeUser.faculty,
        department: authoritativeUser.department,
        programmeId: authoritativeUser.programmeId,
        academicYear: authoritativeUser.academicYear,
        semester: authoritativeUser.semester,
        activeCourseUnits: authoritativeUser.activeCourseUnits || [],
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
    const sessionCookie = req.cookies.get("somaug_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const sessionUser = verifySessionToken(sessionCookie);
    if (!sessionUser) {
      return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
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
    const updatedUser = updateUserProfile(sessionUser.id, {
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
    const memProfile = dbStore.profiles.find((p) => p.id === sessionUser.id);
    if (memProfile) {
      if (fullName) memProfile.fullName = fullName.trim();
      if (institutionId) memProfile.institutionId = institutionId;
      if (programmeId) memProfile.programmeId = programmeId;
      if (academicYear) memProfile.academicYear = Number(academicYear);
      if (semester) memProfile.semester = Number(semester);
      memProfile.updatedAt = new Date().toISOString();
    }

    // 3. Background Supabase update
    try {
      const adminSb = createAdminClient();
      await adminSb.from("profiles").upsert({
        id: sessionUser.id,
        email: updatedUser.email,
        full_name: updatedUser.fullName,
        institution_id: updatedUser.institutionId || null,
        programme_id: updatedUser.programmeId || null,
        academic_year: updatedUser.academicYear || null,
        semester: updatedUser.semester || null,
        updated_at: new Date().toISOString(),
      });
    } catch (sbErr) {
      console.warn("Supabase background profile update:", sbErr);
    }

    // 4. Issue refreshed session cookie
    const newSessionToken = createSessionToken(updatedUser);
    const response = NextResponse.json({
      success: true,
      message: "Academic profile successfully saved to database.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        institutionId: updatedUser.institutionId,
        faculty: updatedUser.faculty,
        department: updatedUser.department,
        programmeId: updatedUser.programmeId,
        academicYear: updatedUser.academicYear,
        semester: updatedUser.semester,
        activeCourseUnits: updatedUser.activeCourseUnits || [],
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

