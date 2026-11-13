import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Sliding Window Rate Limiting (Brute-force protection: max 5 attempts per IP per minute)
    const rateCheck = checkRateLimit(req, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many sign-in attempts. Please wait ${Math.ceil(
            rateCheck.resetInMs / 1000
          )} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // 2. Authenticate through Supabase Auth (Argon2 / Bcrypt secure password hashing)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password credentials." },
        { status: 401 }
      );
    }

    // 3. Fetch verified user profile & system roles securely
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", data.user.id).single(),
      supabase.from("user_roles").select("role").eq("user_id", data.user.id),
    ]);

    const roles = rolesRes.data?.map((r) => r.role) || ["student"];

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        roles,
      },
      profile: profileRes.data || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
