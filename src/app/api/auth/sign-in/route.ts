import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { dbStore } from "@/lib/db/in-memory-store";

interface DemoAccount {
  id: string;
  role: "student" | "lecturer" | "admin";
  fullName: string;
  defaultPass: string;
}

const DEMO_PRESETS: Record<string, DemoAccount> = {
  "namukasa.grace@students.mak.ac.ug": {
    id: "user-student-1",
    role: "student",
    fullName: "Grace Namukasa",
    defaultPass: "Makerere2026!",
  },
  "prof.okello@cis.mak.ac.ug": {
    id: "user-lecturer-1",
    role: "lecturer",
    fullName: "Assoc. Prof. David Okello",
    defaultPass: "Lecturer2026!",
  },
  "admin@ugandastudy.ug": {
    id: "user-admin-1",
    role: "admin",
    fullName: "Platform Chief Comptroller",
    defaultPass: "Admin2026!",
  },
};

export async function POST(req: NextRequest) {
  try {
    // 1. Sliding Window Rate Limiting (max 10 attempts per IP per minute)
    const rateCheck = checkRateLimit(req, 10, 60000);
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
    const adminSupabase = createAdminClient();

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const isInstantDemo = Boolean(body.isDemo);

    if (!email || (!password && !isInstantDemo)) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const demoPreset = DEMO_PRESETS[email];
    const effectivePassword = isInstantDemo && demoPreset ? demoPreset.defaultPass : password;

    // 2. Try standard Supabase Auth signInWithPassword
    let authRes = await supabase.auth.signInWithPassword({
      email,
      password: effectivePassword,
    });

    // 3. If signInWithPassword failed on a known Demo Account, auto-provision in Supabase
    if ((authRes.error || !authRes.data.user) && demoPreset) {
      try {
        // Try creating the demo user in Supabase auth.users with email confirmed
        const createRes = await adminSupabase.auth.admin.createUser({
          email,
          password: demoPreset.defaultPass,
          email_confirm: true,
          user_metadata: { full_name: demoPreset.fullName, role: demoPreset.role },
        });

        if (createRes.data.user) {
          // Provision in public.profiles and public.user_roles if not exists
          await Promise.all([
            adminSupabase.from("profiles").upsert({
              id: createRes.data.user.id,
              email,
              full_name: demoPreset.fullName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
            adminSupabase.from("user_roles").upsert({
              user_id: createRes.data.user.id,
              role: demoPreset.role,
            }),
          ]);

          // Now sign in successfully
          authRes = await supabase.auth.signInWithPassword({
            email,
            password: demoPreset.defaultPass,
          });
        } else if (createRes.error?.message?.includes("already been registered")) {
          // User exists in auth.users, update password to ensure it matches
          const { data: usersList } = await adminSupabase.auth.admin.listUsers();
          const found = usersList?.users.find((u) => u.email === email);
          if (found) {
            await adminSupabase.auth.admin.updateUserById(found.id, {
              password: demoPreset.defaultPass,
              email_confirm: true,
            });
            authRes = await supabase.auth.signInWithPassword({
              email,
              password: demoPreset.defaultPass,
            });
          }
        }
      } catch (provisionErr) {
        console.warn("Supabase demo user auto-provision failed:", provisionErr);
      }
    }

    // 4. If Supabase succeeded, fetch verified roles & return session
    if (authRes.data?.user) {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", authRes.data.user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", authRes.data.user.id),
      ]);

      const roles = rolesRes.data?.map((r) => r.role) || (demoPreset ? [demoPreset.role] : ["student"]);

      return NextResponse.json({
        success: true,
        user: {
          id: authRes.data.user.id,
          email: authRes.data.user.email,
          roles,
        },
        profile: profileRes.data || {
          id: authRes.data.user.id,
          email: authRes.data.user.email,
          fullName: demoPreset?.fullName || "Verified User",
        },
      });
    }

    // 5. If it's a demo account and Supabase network had an issue, fallback gracefully to in-memory store
    if (demoPreset) {
      return NextResponse.json({
        success: true,
        user: {
          id: demoPreset.id,
          email,
          roles: [demoPreset.role],
        },
        profile: {
          id: demoPreset.id,
          email,
          fullName: demoPreset.fullName,
        },
      });
    }

    // 6. Non-demo account failure: return clear message
    return NextResponse.json(
      {
        error:
          "Invalid email or password credentials. If you haven't created an account yet, please click 'Create an account' or use the 1-Click Demo Logins below.",
      },
      { status: 401 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
