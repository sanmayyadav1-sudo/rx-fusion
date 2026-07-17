import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey || supabaseServiceKey === "placeholder-service-role-key") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error retrieving student profile:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ found: false });
    }

    // Update last_seen timestamp
    await supabase
      .from("student_profiles")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", profile.id);

    return NextResponse.json({ found: true, profile });
  } catch (err: unknown) {
    console.error("Exception in GET student profile:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, course, customCourse, currentYear, collegeName, mobileNumber, action } = body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    if (action === "login") {
      const { data: profile, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error("Database login query failed:", error);
        return NextResponse.json({ error: "Database query failed." }, { status: 500 });
      }

      if (!profile) {
        return NextResponse.json({ error: "No student account found with this email. Please register." }, { status: 404 });
      }

      // Update last_seen timestamp
      await supabase
        .from("student_profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", profile.id);

      return NextResponse.json({ success: true, profile });
    } else {
      // Register (insert or update on conflict)
      if (!fullName?.trim() || !course?.trim() || !currentYear?.trim() || !collegeName?.trim() || !mobileNumber?.trim()) {
        return NextResponse.json({ error: "All profile details are required for registration." }, { status: 400 });
      }

      // Check if email already exists
      const { data: existingProfile, error: getError } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (getError) {
        console.error("STUDENT PROFILE CHECK ERROR", {
          code: getError?.code,
          message: getError?.message,
          details: getError?.details,
          hint: getError?.hint,
          error: getError
        });
      }

      if (existingProfile) {
        // Retrieve and log in returning student, update last seen
        await supabase
          .from("student_profiles")
          .update({ last_seen: new Date().toISOString() })
          .eq("id", existingProfile.id);
        
        return NextResponse.json({ success: true, profile: existingProfile });
      }

      // Create new profile
      const { data: profile, error } = await supabase
        .from("student_profiles")
        .insert({
          full_name: fullName.trim(),
          course: course.trim(),
          custom_course: course === "Other" ? customCourse?.trim() || null : null,
          current_year: currentYear.trim(),
          college_name: collegeName.trim(),
          mobile_number: mobileNumber.trim(),
          email: normalizedEmail,
        })
        .select()
        .single();

      if (error) {
        console.error("STUDENT PROFILE SAVE ERROR", {
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          error
        });
        return NextResponse.json({ 
          error: `Failed to save profile: [${error.code}] ${error.message}` 
        }, { status: 500 });
      }

      return NextResponse.json({ success: true, profile });
    }
  } catch (err: unknown) {
    console.error("Exception in POST student profile:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
