import { NextRequest, NextResponse } from "next/server";
import { QuizService } from "@/lib/quizService";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await QuizService.getQuizById(params.id, false);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (!quiz.is_leaderboard_enabled) {
      return NextResponse.json({
        enabled: false,
        message: "Leaderboard is disabled for this quiz by the course administrator."
      });
    }

    const leaderboard = await QuizService.getLeaderboard(params.id);

    return NextResponse.json({
      enabled: true,
      quizTitle: quiz.title,
      academicYear: quiz.academic_year,
      leaderboard
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load leaderboard";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
