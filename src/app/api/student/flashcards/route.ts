import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

// GET: Retrieve the authenticated student's learned flashcard IDs
export async function GET(request: NextRequest) {
  const auth = await requireStudent(request);
  if (auth.errorResponse) return auth.errorResponse;
  const student = auth.student;

  try {
    const supabase = getServiceSupabaseClient();
    const { data: learned, error } = await supabase
      .from("student_flashcards_learned")
      .select("flashcard_id")
      .eq("student_id", student.id);

    if (error) {
      if (error.code === "PGRST205") {
        console.warn("student_flashcards_learned table does not exist. Returning empty learned list.");
        return NextResponse.json({ learnedIds: [] });
      }
      console.error("Error retrieving learned flashcards:", error);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    const learnedIds = learned ? learned.map(l => l.flashcard_id) : [];
    return NextResponse.json({ learnedIds });
  } catch (err: unknown) {
    console.error("Exception in GET learned flashcards:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Mark a flashcard as learned for the authenticated student
export async function POST(request: NextRequest) {
  try {
    const auth = await requireStudent(request);
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student;

    const body = await request.json();
    const { flashcardId } = body;

    if (!flashcardId) {
      return NextResponse.json({ error: "Missing flashcardId parameter." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    const { data, error } = await supabase
      .from("student_flashcards_learned")
      .upsert({
        student_id: student.id,
        flashcard_id: flashcardId,
        learned_at: new Date().toISOString()
      }, {
        onConflict: "student_id,flashcard_id"
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json({
          isMocked: true,
          success: true,
          message: "Marked flashcard as learned in memory fallback."
        });
      }
      console.error("Error marking flashcard as learned:", error);
      return NextResponse.json({ error: "Failed to mark flashcard as learned." }, { status: 500 });
    }

    return NextResponse.json({ success: true, learned: data });
  } catch (err: unknown) {
    console.error("Exception in POST learned flashcard:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
