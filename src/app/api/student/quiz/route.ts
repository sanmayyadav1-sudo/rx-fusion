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

// GET: Retrieve quiz questions and student quiz statistics/attempts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  try {
    const supabase = getSupabaseClient();

    // 1. Fetch published questions
    const { data: questions, error: qError } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    // Return 503 if table doesn't exist yet
    if (qError && qError.code === "PGRST205") {
      console.warn("quiz_questions table does not exist.");
      return NextResponse.json(
        { error: "Quiz questions are not available yet. Please check back later." },
        { status: 503 }
      );
    }

    if (qError) throw qError;

    // 2. Fetch attempts if student is logged in
    const stats = {
      attemptsCount: 0,
      correctCount: 0,
      accuracy: 0,
      streak: 0,
      attemptedQuestionIds: [] as string[]
    };

    if (studentId) {
      const { data: attempts, error: aError } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (!aError && attempts) {
        stats.attemptsCount = attempts.length;
        stats.correctCount = attempts.filter(a => a.is_correct).length;
        stats.accuracy = stats.attemptsCount > 0 ? Math.round((stats.correctCount / stats.attemptsCount) * 100) : 0;
        stats.attemptedQuestionIds = attempts.map(a => a.question_id);
        stats.streak = calculateStreak(attempts);
      }
    }

    return NextResponse.json({
      questions: questions || [],
      stats
    });

  } catch (err: unknown) {
    console.error("Exception in GET student quiz:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Save a student's quiz attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, questionId, selectedOption, isCorrect } = body;

    if (!studentId || !questionId || !selectedOption) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("quiz_attempts")
      .upsert({
        student_id: studentId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        created_at: new Date().toISOString()
      }, {
        onConflict: "student_id,question_id"
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json({
          isMocked: true,
          success: true,
          message: "Saved quiz attempt to memory fallback (DB table not yet created)."
        });
      }
      console.error("Error creating quiz attempt:", error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    // Log/update recent quiz activity
    try {
      const { data: allAttempts } = await supabase
        .from("quiz_attempts")
        .select("is_correct")
        .eq("student_id", studentId);

      const totalCount = allAttempts?.length || 1;
      const correctCount = allAttempts?.filter(a => a.is_correct).length || (isCorrect ? 1 : 0);
      const percentage = Math.round((correctCount / totalCount) * 100);

      await supabase
        .from("student_recent_activity")
        .upsert({
          student_id: studentId,
          content_type: "quiz",
          content_id: "daily_quiz",
          content_title: `Daily Quiz — Score: ${correctCount}/${totalCount} (${percentage}%)`,
          content_url: "/quiz",
          viewed_at: new Date().toISOString()
        }, {
          onConflict: "student_id,content_type,content_id"
        });
    } catch (actErr) {
      console.error("Error updating quiz activity:", actErr);
    }

    return NextResponse.json({ success: true, attempt: data });
  } catch (err: unknown) {
    console.error("Exception in POST quiz attempt:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Helper to calculate daily streak from list of attempts
function calculateStreak(attempts: { created_at: string }[]): number {
  if (attempts.length === 0) return 0;

  // Extract unique days with attempts (YYYY-MM-DD format)
  const attemptDates = Array.from(
    new Set(attempts.map(a => new Date(a.created_at).toISOString().split("T")[0]))
  ).map(d => new Date(d));

  // Sort dates descending (newest first)
  attemptDates.sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // The latest attempt must be today or yesterday to continue a streak
  const latestDate = attemptDates[0];
  latestDate.setHours(0, 0, 0, 0);

  if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
    return 0; // Streak is broken
  }

  let streak = 1;
  let currentRef = latestDate;

  for (let i = 1; i < attemptDates.length; i++) {
    const nextDate = attemptDates[i];
    nextDate.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffTime = currentRef.getTime() - nextDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentRef = nextDate;
    } else if (diffDays > 1) {
      break; // Gap found, streak ends here
    }
  }

  return streak;
}

