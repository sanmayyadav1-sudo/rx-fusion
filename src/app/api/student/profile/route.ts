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

function normalizeCourseName(courseStr: string): string {
  if (!courseStr) return courseStr;
  const trimmed = courseStr.trim();
  const lower = trimmed.toLowerCase().replace(/\./g, "");
  if (lower === "pharm d" || lower === "pharmd") return "Pharm D";
  if (lower === "b pharm" || lower === "bpharm") return "B Pharm";
  if (lower === "d pharm" || lower === "dpharm") return "D Pharm";
  if (lower === "m pharm" || lower === "mpharm") return "M Pharm";
  return trimmed;
}

// PUT: Update student profile details
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, fullName, course, customCourse, currentYear, collegeName, mobileNumber } = body;

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required." }, { status: 400 });
    }

    if (!fullName?.trim() || !course?.trim() || !currentYear?.trim() || !collegeName?.trim() || !mobileNumber?.trim()) {
      return NextResponse.json({ error: "All profile details are required." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const normalizedCourse = normalizeCourseName(course);

    const { data: updatedProfile, error } = await supabase
      .from("student_profiles")
      .update({
        full_name: fullName.trim(),
        course: normalizedCourse,
        custom_course: course === "Other" ? customCourse?.trim() || null : null,
        current_year: currentYear.trim(),
        college_name: collegeName.trim(),
        mobile_number: mobileNumber.trim(),
        updated_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      })
      .eq("id", studentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating student profile:", error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    console.error("Exception in PUT student profile:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
