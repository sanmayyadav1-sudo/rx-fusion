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
  const rawCourse = searchParams.get("course");
  const currentYear = searchParams.get("currentYear");
  const limit = parseInt(searchParams.get("limit") || "6", 10);

  if (!rawCourse || !currentYear) {
    return NextResponse.json({ error: "Missing course or currentYear parameter." }, { status: 400 });
  }

  // Normalize course name to match DB ('Pharm D', 'B Pharm', 'D Pharm')
  let courseDbValue = "";
  const normalizedLower = rawCourse.toLowerCase().replace(/\./g, "");
  
  if (normalizedLower.includes("pharm d") || normalizedLower.includes("pharmd")) {
    courseDbValue = "Pharm D";
  } else if (normalizedLower.includes("b pharm") || normalizedLower.includes("bpharm")) {
    courseDbValue = "B Pharm";
  } else if (normalizedLower.includes("d pharm") || normalizedLower.includes("dpharm")) {
    courseDbValue = "D Pharm";
  } else {
    // Unsupported or "Other" course - return empty recommendation set
    return NextResponse.json({ recommendations: [] });
  }

  // Map year option string to semester numbers
  let semesters: number[] = [];
  const yearStr = currentYear.toLowerCase();

  if (courseDbValue === "Pharm D") {
    if (yearStr.includes("1st")) semesters = [1];
    else if (yearStr.includes("2nd")) semesters = [2];
    else if (yearStr.includes("3rd")) semesters = [3];
    else if (yearStr.includes("4th")) semesters = [4];
    else if (yearStr.includes("5th")) semesters = [5];
    else if (yearStr.includes("6th") || yearStr.includes("internship")) semesters = [6];
  } else if (courseDbValue === "D Pharm") {
    if (yearStr.includes("1st")) semesters = [1];
    else if (yearStr.includes("2nd")) semesters = [2];
  } else if (courseDbValue === "B Pharm") {
    if (yearStr.includes("1st")) semesters = [1, 2];
    else if (yearStr.includes("2nd")) semesters = [3, 4];
    else if (yearStr.includes("3rd")) semesters = [5, 6];
    else if (yearStr.includes("4th")) semesters = [7, 8];
  }

  if (semesters.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }

  try {
    const supabase = getSupabaseClient();
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

    return NextResponse.json({ recommendations });
  } catch (err: unknown) {
    console.error("Exception in GET recommendations:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
