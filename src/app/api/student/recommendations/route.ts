import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getServiceSupabaseClient } from "@/lib/authHelpers";
import { normalizeCourseName, getSemestersForCourseYear } from "@/lib/courseHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request);
  if (auth.errorResponse) return auth.errorResponse;
  const student = auth.student;

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "6", 10);

  // Use student's authenticated profile course and year, or search parameters override if matching
  const rawCourse = searchParams.get("course") || student.course;
  const currentYear = searchParams.get("currentYear") || student.current_year;

  if (!rawCourse || !currentYear) {
    return NextResponse.json({ recommendations: [] });
  }

  const courseDbValue = normalizeCourseName(rawCourse);
  const semesters = getSemestersForCourseYear(courseDbValue, currentYear);

  if (!courseDbValue || semesters.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }

  try {
    const supabase = getServiceSupabaseClient();
    const { data: recommendations, error } = await supabase
      .from("notes")
      .select("*, subjects(subject_name)")
      .eq("course", courseDbValue)
      .in("semester", semesters)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching note recommendations:", error);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    return NextResponse.json({ recommendations: recommendations || [] });
  } catch (err: unknown) {
    console.error("Exception in GET recommendations:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
