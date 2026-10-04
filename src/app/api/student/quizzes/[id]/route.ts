import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/authHelpers";
import { QuizService } from "@/lib/quizService";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await getAuthenticatedStudent(request);
    const quiz = await QuizService.getQuizById(params.id, true);

    if (!quiz || (quiz.status !== "published" && quiz.status !== "closed")) {
      return NextResponse.json({ error: "Quiz not found or not currently available." }, { status: 404 });
    }

    // Check if student already attempted and multiple attempts are disallowed
    let previousAttempt = null;
    let hasAttempted = false;
    if (student) {
      const attempts = await QuizService.getStudentAttempts(student.id, quiz.id);
      if (attempts.length > 0) {
        hasAttempted = true;
        previousAttempt = attempts[0];
      }
    }

    // Sanitized questions - DO NOT expose correct answers or explanations before submission!
    const sanitizedQuestions = (quiz.questions || []).map((q, idx) => ({
      id: q.id,
      order_index: q.order_index ?? idx,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      image_url: q.image_url || null,
      marks: q.marks ?? 1,
      difficulty: q.difficulty || "Medium"
    }));

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        academic_year: quiz.academic_year,
        subject: quiz.subject,
        topic: quiz.topic,
        description: quiz.description,
        difficulty: quiz.difficulty,
        quiz_date: quiz.quiz_date,
        time_limit_mins: quiz.time_limit_mins,
        passing_percentage: quiz.passing_percentage,
        is_daily: quiz.is_daily,
        is_leaderboard_enabled: quiz.is_leaderboard_enabled,
        allow_multiple_attempts: quiz.allow_multiple_attempts,
        status: quiz.status,
        total_questions: sanitizedQuestions.length,
        questions: sanitizedQuestions
      },
      hasAttempted,
      previousAttempt,
      student: student ? { id: student.id, name: student.full_name, email: student.email } : null
    });
  } catch (err: unknown) {
    console.error("Error fetching quiz for student:", err);
    const msg = err instanceof Error ? err.message : "Failed to load quiz";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
