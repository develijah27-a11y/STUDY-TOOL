import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/auth/rate-limit";

// Validates strong passwords: min 8 characters, at least 1 number, and 1 letter
function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting for account creation: max 5 registrations per IP per 5 minutes
    const rateCheck = checkRateLimit(req, 5, 300000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many registration attempts from this network. Please wait a few minutes.",
        },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const adminSupabase = createAdminClient();

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

    // Enforce Password Strength (Part XV Security)
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and contain both letters and numbers.",
        },
        { status: 400 }
      );
    }

    // 2. Register user through Supabase Auth (Argon2 / Scrypt hashing)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Registration failed. Please try again." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    const now = new Date().toISOString();

    // 3. Insert Profile Record using elevated admin client (bypasses bootstrap RLS safely)
    await adminSupabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      institution_id: institutionId || null,
      programme_id: programmeId || null,
      academic_year: academicYear ? Number(academicYear) : null,
      semester: semester ? Number(semester) : null,
      created_at: now,
      updated_at: now,
    });

    // 4. Assign Verified Role (Student or Lecturer)
    await adminSupabase.from("user_roles").upsert({
      user_id: userId,
      role,
      created_at: now,
    });

    // 5. If Lecturer: create lecturer application profile in 'submitted' status
    if (role === "lecturer" && institutionId) {
      await adminSupabase.from("lecturer_profiles").upsert({
        user_id: userId,
        full_name: fullName,
        institution_id: institutionId,
        department: department?.trim() || "General Academic Faculty",
        teaching_role: teachingRole?.trim() || "Lecturer",
        institutional_email: email.endsWith(".ac.ug") ? email : null,
        verification_status: "submitted",
        created_at: now,
        updated_at: now,
      });
    }

    // 6. Initialize Internal UGX Wallet Account linked to Double-Entry Ledger
    const ledgerCode = role === "lecturer" ? "2020-LECTURER-PAYABLES" : "2010-STUDENT-WALLETS";
    const { data: ledgerAcc } = await adminSupabase
      .from("ledger_accounts")
      .select("id")
      .eq("code", ledgerCode)
      .single();

    await adminSupabase.from("wallet_accounts").upsert({
      user_id: userId,
      wallet_type: role,
      currency: "UGX",
      ledger_account_id: ledgerAcc?.id || null,
      spendable_balance_ugx: 0,
      reserved_balance_ugx: 0,
      pin_hash: "pin_hashed_1234",
      pin_attempts: 0,
      is_locked: false,
      created_at: now,
      updated_at: now,
    });

    // 7. Audit Log
    await adminSupabase.from("admin_audit_logs").insert({
      admin_id: userId,
      action: `USER_REGISTRATION_${role.toUpperCase()}`,
      target_type: "user",
      target_id: userId,
      changes: { email, role, institutionId },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        role,
      },
      message:
        role === "lecturer"
          ? "Lecturer account created and application submitted for academic verification."
          : "Student account created successfully. You can now deposit UGX and explore materials.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Account registration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
