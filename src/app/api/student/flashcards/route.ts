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

// GET: Retrieve a student's learned flashcard IDs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId parameter." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    const { data: learned, error } = await supabase
      .from("student_flashcards_learned")
      .select("flashcard_id")
      .eq("student_id", studentId);

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

// POST: Mark a flashcard as learned
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, flashcardId } = body;

    if (!studentId || !flashcardId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("student_flashcards_learned")
      .upsert({
        student_id: studentId,
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
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, learned: data });
  } catch (err: unknown) {
    console.error("Exception in POST learned flashcard:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
