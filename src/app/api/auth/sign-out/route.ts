import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut().catch(() => {});
  } catch {
    // Ignore Supabase sign out error
  }

  const response = NextResponse.json({ success: true, message: "Signed out successfully." });
  response.cookies.delete("somaug_session");
  return response;
}
