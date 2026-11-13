import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    const {
      email,
      password,
      fullName,
      role = "student",
      institutionId,
      programmeId,
      academicYear,
      semester,
      department,
      teachingRole,
    } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required." },
        { status: 400 }
      );
    }

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create user account." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    const now = new Date().toISOString();

    // 2. Insert Profile record
    await adminSupabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      institution_id: institutionId || null,
      programme_id: programmeId || null,
      academic_year: academicYear || null,
      semester: semester || null,
      created_at: now,
      updated_at: now,
    });

    // 3. Assign Role (Student or Lecturer)
    await adminSupabase.from("user_roles").upsert({
      user_id: userId,
      role: role === "lecturer" ? "lecturer" : "student",
      created_at: now,
    });

    // 4. If Lecturer: create lecturer application profile in 'submitted' status
    if (role === "lecturer" && institutionId) {
      await adminSupabase.from("lecturer_profiles").upsert({
        user_id: userId,
        full_name: fullName,
        institution_id: institutionId,
        department: department || "General Faculty",
        teaching_role: teachingRole || "Lecturer",
        institutional_email: email.endsWith(".ac.ug") ? email : null,
        verification_status: "submitted",
        created_at: now,
        updated_at: now,
      });
    }

    // 5. Initialize Empty Student/Lecturer Wallet
    const walletType = role === "lecturer" ? "lecturer" : "student";
    const ledgerCode = role === "lecturer" ? "2020-LECTURER-PAYABLES" : "2010-STUDENT-WALLETS";
    const { data: ledgerAcc } = await adminSupabase
      .from("ledger_accounts")
      .select("id")
      .eq("code", ledgerCode)
      .single();

    await adminSupabase.from("wallet_accounts").upsert({
      user_id: userId,
      wallet_type: walletType,
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

    return NextResponse.json({
      success: true,
      user: authData.user,
      message:
        role === "lecturer"
          ? "Lecturer account created and application submitted for academic verification."
          : "Student account created successfully. You can now fund your wallet via MTN/Airtel Money.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Account registration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

