import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  const supabase = getServiceSupabaseClient();

  try {
    const [
      { count: studentsCount },
      { count: notesCount },
      { count: casesCount },
      { count: blogsCount },
      { count: drugsCount },
      { count: downloadsCount },
      { data: studentsList },
      { data: notesList },
      { data: casesList },
      { data: blogsList },
      { data: drugsList }
    ] = await Promise.all([
      supabase.from("student_profiles").select("*", { count: "exact", head: true }),
      supabase.from("notes").select("*", { count: "exact", head: true }).eq("course", "Pharm D"),
      supabase.from("clinical_cases").select("*", { count: "exact", head: true }),
      supabase.from("blogs").select("*", { count: "exact", head: true }),
      supabase.from("drug_of_the_day").select("*", { count: "exact", head: true }),
      supabase.from("note_downloads").select("*", { count: "exact", head: true }),
      supabase.from("student_profiles").select("id, full_name, email, current_year, college_name, mobile_number, free_downloads_used, download_limit, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("notes").select("id, title, subject, semester, file_url, created_at").eq("course", "Pharm D").order("created_at", { ascending: false }).limit(50),
      supabase.from("clinical_cases").select("id, slug, title, department, disease, status, created_at").order("created_at", { ascending: false }),
      supabase.from("blogs").select("id, slug, title, author, published_date").order("published_date", { ascending: false }),
      supabase.from("drug_of_the_day").select("id, slug, drug_name, generic_name, drug_class").order("drug_name", { ascending: true })
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        students: studentsCount || 0,
        notes: notesCount || 0,
        cases: casesCount || 0,
        blogs: blogsCount || 0,
        drugs: drugsCount || 0,
        downloads: downloadsCount || 0,
      },
      students: studentsList || [],
      notes: notesList || [],
      cases: casesList || [],
      blogs: blogsList || [],
      drugs: drugsList || [],
    });
  } catch (err: unknown) {
    console.error("Admin overview API error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

