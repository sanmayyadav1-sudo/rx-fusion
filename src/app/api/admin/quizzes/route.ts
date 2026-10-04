import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authHelpers";
import { QuizService } from "@/lib/quizService";
import { ACADEMIC_YEARS, AcademicYear } from "@/types/quiz";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const academic_year = searchParams.get("academic_year") as AcademicYear | null;
    const is_daily = searchParams.has("is_daily") ? searchParams.get("is_daily") === "true" : undefined;
    const status = searchParams.get("status") || undefined;
    const quiz_date = searchParams.get("quiz_date") || undefined;

    const quizzes = await QuizService.getAllQuizzes({
      academic_year: academic_year || undefined,
      is_daily,
      status,
      quiz_date
    });

    return NextResponse.json({ quizzes });
  } catch (err: unknown) {
    console.error("Error in GET /api/admin/quizzes:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const {
      title,
      academic_year,
      subject,
      topic,
      description,
      difficulty,
      quiz_date,
      start_time,
      end_time,
      time_limit_mins,
      passing_percentage,
      status,
      is_daily,
      is_leaderboard_enabled,
      allow_multiple_attempts
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Quiz title is required." }, { status: 400 });
    }
    if (!academic_year || !ACADEMIC_YEARS.includes(academic_year)) {
      return NextResponse.json({ error: `Valid academic year required: ${ACADEMIC_YEARS.join(", ")}` }, { status: 400 });
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }
    if (!quiz_date) {
      return NextResponse.json({ error: "Quiz date is required." }, { status: 400 });
    }

    const saved = await QuizService.saveQuiz({
      title: title.trim(),
      academic_year,
      subject: subject.trim(),
      topic: topic?.trim() || null,
      description: description?.trim() || null,
      difficulty: difficulty || "Medium",
      quiz_date,
      start_time: start_time || null,
      end_time: end_time || null,
      time_limit_mins: Number(time_limit_mins ?? 15),
      passing_percentage: Math.min(100, Math.max(1, Number(passing_percentage ?? 50))),
      status: status || "draft",
      is_daily: !!is_daily,
      is_leaderboard_enabled: is_leaderboard_enabled !== false,
      allow_multiple_attempts: !!allow_multiple_attempts,
      author: auth.adminUser.email?.split("@")[0] || "RxFusion Admin"
    });

    return NextResponse.json({ success: true, quiz: saved });
  } catch (err: unknown) {
    console.error("Error in POST /api/admin/quizzes:", err);
    const msg = err instanceof Error ? err.message : "Failed to create quiz";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
