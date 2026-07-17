import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey || supabaseServiceKey === "placeholder-service-role-key") {
      return NextResponse.json({ error: "Internal Server Error: SUPABASE_SERVICE_ROLE_KEY is not configured" }, { status: 500 });
    }

    // Initialize service client to query profile data securely by-passing client RLS for the existence check
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const normalizedEmail = email.trim().toLowerCase();

    // Query profiles where email matches. We check if full_name is present (which indicates completed profile)
    const { data: profile, error } = await serviceSupabase
      .from("profiles")
      .select("id, full_name, email")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Error querying profiles for duplicate verification:", error.message);
      return NextResponse.json({ error: "Failed to verify registration state" }, { status: 500 });
    }

    // A profile exists only if we found a record and full_name is populated
    const exists = !!(profile && profile.full_name && profile.full_name.trim());

    return NextResponse.json({ exists });
  } catch (err) {
    console.error("Unexpected error in check-email API route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
