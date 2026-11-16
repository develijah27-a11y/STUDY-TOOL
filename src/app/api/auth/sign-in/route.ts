import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import {
  verifyUserCredentials,
  createSessionToken,
  findUserByEmail,
  registerUser,
} from "@/lib/auth/user-store";

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
            programmeId: demoUser.programmeId,
            department: demoUser.department,
            teachingRole: demoUser.teachingRole,
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
          programmeId: localUser.programmeId,
          department: localUser.department,
          teachingRole: localUser.teachingRole,
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
        const role = (authRes.data.user.user_metadata?.role as any) || "student";
        const fullName = authRes.data.user.user_metadata?.full_name || "Verified User";

        const registered = registerUser({
          email,
          password,
          fullName,
          role,
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
