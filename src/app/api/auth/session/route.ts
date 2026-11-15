import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/auth/user-store";

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
            programmeId: user.programmeId,
            department: user.department,
            teachingRole: user.teachingRole,
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
        const role = user.user_metadata?.role || "student";
        return NextResponse.json({
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || "Verified User",
            role,
            roles: [role],
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
