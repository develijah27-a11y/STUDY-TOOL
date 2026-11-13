import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const [profileRes, rolesRes, lecturerRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("lecturer_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    const roles = rolesRes.data?.map((r) => r.role) || ["student"];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        roles,
        profile: profileRes.data || null,
        lecturerProfile: lecturerRes.data || null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Session error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

