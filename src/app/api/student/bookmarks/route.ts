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

// GET: Retrieve a student's bookmarks (and resolve metadata)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const contentType = searchParams.get("contentType");

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId parameter." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from("student_bookmarks")
      .select("*")
      .eq("student_id", studentId);

    if (contentType && contentType !== "all") {
      query = query.eq("content_type", contentType);
    }

    const { data: bookmarks, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error retrieving bookmarks:", error);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    if (!bookmarks || bookmarks.length === 0) {
      return NextResponse.json({ bookmarks: [] });
    }

    // Resolve details for each bookmark type
    const resolvedBookmarks = await Promise.all(
      bookmarks.map(async (b) => {
        let details: Record<string, unknown> | null = null;

        try {
          if (b.content_type === "notes") {
            const { data } = await supabase
              .from("notes")
              .select("id, title, course, semester, subject")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data;
          } else if (b.content_type === "drugs") {
            const { data } = await supabase
              .from("drug_of_the_day")
              .select("id, drug_name, generic_name, drug_class, slug")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data;
          } else if (b.content_type === "cases") {
            const { data } = await supabase
              .from("clinical_cases")
              .select("id, title, department, disease, slug")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data;
          } else if (b.content_type === "blogs") {
            const { data } = await supabase
              .from("blogs")
              .select("id, title, slug")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data;
          } else if (b.content_type === "colleges") {
            const { data } = await supabase
              .from("colleges")
              .select("id, name, city, state, slug")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data;
          } else if (b.content_type === "viva") {
            const { data } = await supabase
              .from("viva_questions")
              .select("id, question, subject, course, year")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data ? { 
              title: data.question, 
              subject: data.subject, 
              course: data.course, 
              semester: data.year 
            } : null;
          } else if (b.content_type === "labs") {
            const { data } = await supabase
              .from("lab_manuals")
              .select("id, title, experiment_number, aim, subject, course, year")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data ? { 
              title: data.title, 
              experiment_number: data.experiment_number, 
              aim: data.aim, 
              subject: data.subject, 
              course: data.course, 
              semester: data.year 
            } : null;
          } else if (b.content_type === "quiz") {
            const { data } = await supabase
              .from("quiz_questions")
              .select("id, question")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data ? { 
              title: data.question 
            } : null;
          } else if (b.content_type === "question_bank") {
            const { data } = await supabase
              .from("question_bank")
              .select("id, question, subject, course, year")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data ? { 
              title: data.question, 
              subject: data.subject, 
              course: data.course, 
              semester: data.year 
            } : null;
          } else if (b.content_type === "question_papers") {
            const { data } = await supabase
              .from("question_papers")
              .select("id, title, subject, course, year")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data ? { 
              title: data.title, 
              subject: data.subject, 
              course: data.course, 
              semester: data.year 
            } : null;
          } else if (b.content_type === "flashcards") {
            const { data } = await supabase
              .from("flashcards")
              .select("id, term, definition, subject, course, year")
              .eq("id", b.content_id)
              .maybeSingle();
            details = data ? { 
              title: data.term, 
              definition: data.definition, 
              subject: data.subject, 
              course: data.course, 
              semester: data.year 
            } : null;
          }
        } catch (resolveErr) {
          console.error(`Failed to resolve metadata for content_id ${b.content_id}:`, resolveErr);
        }

        return {
          ...b,
          resolvedDetails: details
        };
      })
    );

    return NextResponse.json({ bookmarks: resolvedBookmarks });
  } catch (err: unknown) {
    console.error("Exception in GET bookmarks:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Add a new bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, contentType, contentId } = body;

    if (!studentId || !contentType || !contentId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("student_bookmarks")
      .insert({
        student_id: studentId,
        content_type: contentType,
        content_id: contentId
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Content is already bookmarked." }, { status: 409 });
      }
      console.error("Error creating bookmark:", error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookmark: data });
  } catch (err: unknown) {
    console.error("Exception in POST bookmark:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove a bookmark
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const contentType = searchParams.get("contentType");
    const contentId = searchParams.get("contentId");

    if (!studentId || !contentType || !contentId) {
      return NextResponse.json({ error: "Missing required query parameters." }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("student_bookmarks")
      .delete()
      .eq("student_id", studentId)
      .eq("content_type", contentType)
      .eq("content_id", contentId);

    if (error) {
      console.error("Error deleting bookmark:", error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Exception in DELETE bookmark:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
