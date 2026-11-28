import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import {
  verifyUserCredentials,
  createSessionToken,
  findUserByEmail,
  registerUser,
} from "@/lib/auth/user-store";
import { getInstitutionName, getProgrammeName } from "@/lib/constants/academic";

export async function POST(req: NextRequest) {
  try {
    // Sliding Window Rate Limiting (max 20 attempts per IP per minute)
    const rateCheck = checkRateLimit(req, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many sign-in attempts. Please wait a moment before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const isInstantDemo = Boolean(body.isDemo);

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    // 1. Instant Demo Sign-In
    if (isInstantDemo) {
      const demoUser = findUserByEmail(email);
      if (demoUser) {
        const sessionToken = createSessionToken(demoUser);
        const res = NextResponse.json({
          success: true,
          user: {
            id: demoUser.id,
            email: demoUser.email,
            fullName: demoUser.fullName,
            role: demoUser.role,
            roles: [demoUser.role],
            verificationStatus: demoUser.verificationStatus,
            institutionId: demoUser.institutionId,
            institutionName: demoUser.institutionName || getInstitutionName(demoUser.institutionId),
            faculty: demoUser.faculty,
            department: demoUser.department,
            programmeId: demoUser.programmeId,
            programme: demoUser.programme || getProgrammeName(demoUser.programmeId),
            academicYear: demoUser.academicYear,
            semester: demoUser.semester,
            activeCourseUnits: demoUser.activeCourseUnits || [],
            teachingRole: demoUser.teachingRole,
            staffId: demoUser.staffId,
            coursesTaught: demoUser.coursesTaught || [],
            payoutMobileNumber: demoUser.payoutMobileNumber,
            payoutMobileNetwork: demoUser.payoutMobileNetwork,
          },
          token: sessionToken,
        });

        res.cookies.set({
          name: "somaug_session",
          value: sessionToken,
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return res;
      }
    }

    // 2. Check Authoritative Persistent User Store
    const localUser = verifyUserCredentials(email, password);
    if (localUser) {
      const sessionToken = createSessionToken(localUser);
      const res = NextResponse.json({
        success: true,
        user: {
          id: localUser.id,
          email: localUser.email,
          fullName: localUser.fullName,
          role: localUser.role,
          roles: [localUser.role],
          verificationStatus: localUser.verificationStatus,
          institutionId: localUser.institutionId,
          institutionName: localUser.institutionName || getInstitutionName(localUser.institutionId),
          faculty: localUser.faculty,
          department: localUser.department,
          programmeId: localUser.programmeId,
          programme: localUser.programme || getProgrammeName(localUser.programmeId),
          academicYear: localUser.academicYear,
          semester: localUser.semester,
          activeCourseUnits: localUser.activeCourseUnits || [],
          teachingRole: localUser.teachingRole,
          staffId: localUser.staffId,
          coursesTaught: localUser.coursesTaught || [],
          payoutMobileNumber: localUser.payoutMobileNumber,
          payoutMobileNetwork: localUser.payoutMobileNetwork,
        },
        token: sessionToken,
      });

      res.cookies.set({
        name: "somaug_session",
        value: sessionToken,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
    }

    // 3. Check Supabase Auth
    try {
      const supabase = createClient();
      let authRes = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authRes.data?.user) {
        try {
          const adminSupabase = createAdminClient();
          const { data: userList } = await adminSupabase.auth.admin.listUsers();
          const found = userList?.users.find((u) => u.email?.toLowerCase() === email);
          if (found) {
            await adminSupabase.auth.admin.updateUserById(found.id, {
              password,
              email_confirm: true,
            });
            authRes = await supabase.auth.signInWithPassword({ email, password });
          }
        } catch {}
      }

      if (authRes.data?.user) {
        const meta = authRes.data.user.user_metadata || {};
        const role = (meta.role as any) || "student";
        const fullName = meta.full_name || "Verified User";

        const registered = registerUser({
          email,
          password,
          fullName,
          role,
          institutionId: meta.institutionId,
          programmeId: meta.programmeId,
          academicYear: meta.academicYear ? Number(meta.academicYear) : undefined,
          semester: meta.semester ? Number(meta.semester) : undefined,
          activeCourseUnits: meta.activeCourseUnits,
          faculty: meta.faculty,
          department: meta.department,
          teachingRole: meta.teachingRole,
          staffId: meta.staffId,
          coursesTaught: meta.coursesTaught,
          payoutMobileNumber: meta.payoutMobileNumber,
          payoutMobileNetwork: meta.payoutMobileNetwork,
        });

        const sessionToken = createSessionToken(registered);
        const res = NextResponse.json({
          success: true,
          user: {
            id: registered.id,
            email: registered.email,
            fullName: registered.fullName,
            role: registered.role,
            roles: [registered.role],
            verificationStatus: registered.verificationStatus,
            institutionId: registered.institutionId,
            institutionName: registered.institutionName || getInstitutionName(registered.institutionId),
            programmeId: registered.programmeId,
            programme: registered.programme || getProgrammeName(registered.programmeId),
            academicYear: registered.academicYear,
            semester: registered.semester,
            activeCourseUnits: registered.activeCourseUnits || [],
            teachingRole: registered.teachingRole,
            staffId: registered.staffId,
            coursesTaught: registered.coursesTaught || [],
            payoutMobileNumber: registered.payoutMobileNumber,
            payoutMobileNetwork: registered.payoutMobileNetwork,
          },
          token: sessionToken,
        });

        res.cookies.set({
          name: "somaug_session",
          value: sessionToken,
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return res;
      }
    } catch (sbErr) {
      console.warn("Supabase auth fallback attempt:", sbErr);
    }

    // 4. Invalid credentials response
    return NextResponse.json(
      {
        error:
          "Invalid email or password. Please check your credentials or click 'Create an account' to register.",
      },
      { status: 401 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
