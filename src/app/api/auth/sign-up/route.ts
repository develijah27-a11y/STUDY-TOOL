import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { registerUser, createSessionToken } from "@/lib/auth/user-store";
import { dbStore } from "@/lib/db/in-memory-store";

// Validates passwords: min 6 characters
function isSufficientPassword(password: string): boolean {
  return password.length >= 6;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting for account creation: max 15 registrations per IP per 5 minutes
    const rateCheck = checkRateLimit(req, 15, 300000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many registration attempts from this network. Please wait a few minutes.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const role = body.role === "lecturer" ? "lecturer" : "student";

    const {
      institutionId,
      programmeId,
      academicYear,
      semester,
      department,
      teachingRole,
    } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Full legal name, email address, and password are required." },
        { status: 400 }
      );
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    // Password validation (min 6 characters)
    if (!isSufficientPassword(password)) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    // 2. Persist account in authoritative local user store
    const localUser = registerUser({
      email,
      password,
      fullName,
      role,
      institutionId,
      programmeId,
      academicYear: academicYear ? Number(academicYear) : undefined,
      semester: semester ? Number(semester) : undefined,
      department: department?.trim(),
      teachingRole: teachingRole?.trim(),
    });

    const userId = localUser.id;
    const now = new Date().toISOString();

    // 3. Initialize in in-memory store so all queries resolve
    dbStore.profiles.push({
      id: userId,
      email,
      fullName,
      institutionId: institutionId || "inst-mak",
      programmeId: programmeId || "prog-bsse",
      academicYear: academicYear ? Number(academicYear) : 1,
      semester: semester ? Number(semester) : 1,
      createdAt: now,
      updatedAt: now,
    });

    dbStore.userRoles.set(userId, [role]);

    // Initialize UGX wallet
    dbStore.walletAccounts.push({
      id: `wal-${userId}`,
      userId,
      walletType: role,
      currency: "UGX",
      ledgerAccountId: role === "lecturer" ? "acc-2020-lecturer-payables" : "acc-2010-student-wallets",
      spendableBalanceUGX: 0,
      reservedBalanceUGX: 0,
      pinHash: "pin_hashed_1234",
      pinAttempts: 0,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Also register in Supabase Auth with pre-confirmed email (bypasses email confirmation gate)
    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
      });

      await Promise.allSettled([
        adminSupabase.from("profiles").upsert({
          id: userId,
          email,
          full_name: fullName,
          institution_id: institutionId || null,
          programme_id: programmeId || null,
          academic_year: academicYear ? Number(academicYear) : null,
          semester: semester ? Number(semester) : null,
          created_at: now,
          updated_at: now,
        }),
        adminSupabase.from("user_roles").upsert({
          user_id: userId,
          role,
          created_at: now,
        }),
      ]);
    } catch (sbErr) {
      console.warn("Supabase background registration fallback:", sbErr);
    }

    // 5. Create session token and HTTP-only cookie
    const sessionToken = createSessionToken(localUser);

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: localUser.email,
        fullName: localUser.fullName,
        role: localUser.role,
        roles: [localUser.role],
        institutionId: localUser.institutionId,
        programmeId: localUser.programmeId,
      },
      token: sessionToken,
      message:
        role === "lecturer"
          ? "Lecturer account created successfully. Welcome to SomaUG Academic!"
          : "Student account created successfully! You are now signed in.",
    });

    response.cookies.set({
      name: "somaug_session",
      value: sessionToken,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Account registration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
