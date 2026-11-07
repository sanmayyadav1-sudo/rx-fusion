import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const subject = searchParams.get("subject");

    const supabase = getServiceSupabaseClient();

    let notesQuery = supabase
      .from("notes")
      .select("id, title, description, subject, semester, course, created_at, file_url")
      .eq("course", "Pharm D")
      .order("created_at", { ascending: false });

    if (year) {
      notesQuery = notesQuery.eq("semester", parseInt(year, 10));
    }

    if (subject) {
      notesQuery = notesQuery.ilike("subject", `%${subject}%`);
    }

    const { data: notes, error: notesError } = await notesQuery;

    if (notesError) {
      console.error("Error fetching notes:", notesError);
      return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }

    // Fetch subjects
    let subjectsQuery = supabase
      .from("subjects")
      .select("id, name, code, year_number, semester_number, total_credits, syllabus_url")
      .order("year_number", { ascending: true })
      .order("name", { ascending: true });

    if (year) {
      subjectsQuery = subjectsQuery.eq("year_number", parseInt(year, 10));
    }

    const { data: subjects } = await subjectsQuery;

    // Fetch question banks
    let qbQuery = supabase
      .from("question_bank")
      .select("id, question, subject, course, year, created_at")
      .order("created_at", { ascending: false });

    if (year) {
      qbQuery = qbQuery.eq("year", parseInt(year, 10));
    }
    const { data: questionBanks } = await qbQuery;

    // Fetch flashcards
    let fcQuery = supabase
      .from("flashcards")
      .select("id, term, definition, subject, course, year, created_at")
      .order("created_at", { ascending: false });

    if (year) {
      fcQuery = fcQuery.eq("year", parseInt(year, 10));
    }
    const { data: flashcards } = await fcQuery;

    // Fetch past papers
    let ppQuery = supabase
      .from("question_papers")
      .select("id, title, subject, course, year, exam_year, file_url, created_at")
      .order("created_at", { ascending: false });

    if (year) {
      ppQuery = ppQuery.eq("year", parseInt(year, 10));
    }
    const { data: questionPapers } = await ppQuery;

    return NextResponse.json({
      success: true,
      notes: notes || [],
      subjects: subjects || [],
      questionBanks: questionBanks || [],
      flashcards: flashcards || [],
      questionPapers: questionPapers || [],
    });
  } catch (err: unknown) {
    console.error("Academic notes API error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

