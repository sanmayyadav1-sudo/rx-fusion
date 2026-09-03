import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getServiceSupabaseClient } from "@/lib/authHelpers";
import { normalizeCourseName } from "@/lib/courseHelpers";

export const dynamic = "force-dynamic";

// PUT: Update student profile details for the authenticated student
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireStudent(request);
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student;

    const body = await request.json();
    const { fullName, course, customCourse, currentYear, collegeName, mobileNumber } = body;

    if (!fullName?.trim() || !course?.trim() || !currentYear?.trim() || !collegeName?.trim() || !mobileNumber?.trim()) {
      return NextResponse.json({ error: "All profile details are required." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();
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
      .eq("id", student.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating student profile:", error);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    console.error("Exception in PUT student profile:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
