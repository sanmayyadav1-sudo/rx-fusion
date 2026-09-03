import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

// GET: Retrieve the authenticated student's bookmarks
export async function GET(request: NextRequest) {
  const auth = await requireStudent(request);
  if (auth.errorResponse) return auth.errorResponse;
  const student = auth.student;

  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("contentType");

  try {
    const supabase = getServiceSupabaseClient();
    
    let query = supabase
      .from("student_bookmarks")
      .select("*")
      .eq("student_id", student.id);

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

    // Resolve metadata details for each bookmark item
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

// POST: Add a new bookmark for the authenticated student
export async function POST(request: NextRequest) {
  try {
    const auth = await requireStudent(request);
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student;

    const body = await request.json();
    const { contentType, contentId } = body;

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Missing contentType or contentId." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    const { data, error } = await supabase
      .from("student_bookmarks")
      .insert({
        student_id: student.id,
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
      return NextResponse.json({ error: "Failed to save bookmark." }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookmark: data });
  } catch (err: unknown) {
    console.error("Exception in POST bookmark:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove a bookmark for the authenticated student
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireStudent(request);
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student;

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");
    const contentId = searchParams.get("contentId");

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Missing required query parameters." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    const { error } = await supabase
      .from("student_bookmarks")
      .delete()
      .eq("student_id", student.id)
      .eq("content_type", contentType)
      .eq("content_id", contentId);

    if (error) {
      console.error("Error deleting bookmark:", error);
      return NextResponse.json({ error: "Failed to remove bookmark." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Exception in DELETE bookmark:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
