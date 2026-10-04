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
    const date = searchParams.get("date") || undefined;

    // Get all daily quizzes
    const allDaily = await QuizService.getAllQuizzes({
      academic_year: academic_year || undefined,
      is_daily: true,
      quiz_date: date
    });

    const attempts = await QuizService.getStudentAttempts();

    // Map participation counts to each daily quiz
    const enriched = allDaily.map(quiz => {
      const quizAttempts = attempts.filter(a => a.quiz_id === quiz.id);
      return {
        ...quiz,
        participation_count: quizAttempts.length
      };
    });

    // Group by Academic Year -> Date -> Quiz
    const grouped: Record<AcademicYear, Record<string, typeof enriched>> = {
      "1st Year": {},
      "2nd Year": {},
      "3rd Year": {},
      "4th Year": {},
      "5th Year": {}
    };

    enriched.forEach(quiz => {
      if (grouped[quiz.academic_year]) {
        if (!grouped[quiz.academic_year][quiz.quiz_date]) {
          grouped[quiz.academic_year][quiz.quiz_date] = [];
        }
        grouped[quiz.academic_year][quiz.quiz_date].push(quiz);
      }
    });

    return NextResponse.json({
      dailyQuizzes: enriched,
      grouped
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load daily quizzes";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const { action, copyFromDate, academic_year, quiz_date, allowDuplicate, ...quizData } = body;

    if (!academic_year || !ACADEMIC_YEARS.includes(academic_year)) {
      return NextResponse.json({ error: "Valid academic year required." }, { status: 400 });
    }

    const targetDate = quiz_date || new Date().toISOString().split("T")[0];

    // Check for duplicate daily quiz on the same year & date
    if (!allowDuplicate) {
      const existing = await QuizService.getAllQuizzes({
        academic_year,
        is_daily: true,
        quiz_date: targetDate
      });
      if (existing.length > 0) {
        return NextResponse.json(
          {
            error: `A daily quiz for ${academic_year} on ${targetDate} already exists: "${existing[0].title}". You can edit the existing quiz or choose "Allow alternate daily quiz".`,
            isDuplicate: true,
            existingQuizId: existing[0].id
          },
          { status: 409 }
        );
      }
    }

    // Action 1: Copy from yesterday or specific date
    if (action === "copy_from_date") {
      const sourceDate = copyFromDate || new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const sourceQuizzes = await QuizService.getAllQuizzes({
        academic_year,
        is_daily: true,
        quiz_date: sourceDate
      });

      if (sourceQuizzes.length === 0) {
        return NextResponse.json({ error: `No source daily quiz found for ${academic_year} on ${sourceDate}` }, { status: 404 });
      }

      const sourceQuiz = await QuizService.getQuizById(sourceQuizzes[0].id, true);
      if (!sourceQuiz) {
        return NextResponse.json({ error: "Source quiz not found" }, { status: 404 });
      }

      const newQuiz = await QuizService.saveQuiz({
        title: `${sourceQuiz.title} (${targetDate})`,
        academic_year,
        subject: sourceQuiz.subject,
        topic: sourceQuiz.topic,
        description: sourceQuiz.description,
        difficulty: sourceQuiz.difficulty,
        quiz_date: targetDate,
        time_limit_mins: sourceQuiz.time_limit_mins,
        passing_percentage: sourceQuiz.passing_percentage,
        status: "draft",
        is_daily: true,
        is_leaderboard_enabled: sourceQuiz.is_leaderboard_enabled,
        allow_multiple_attempts: sourceQuiz.allow_multiple_attempts,
        author: auth.adminUser.email?.split("@")[0] || "RxFusion Admin"
      });

      // Copy questions
      if (sourceQuiz.questions && sourceQuiz.questions.length > 0) {
        for (let i = 0; i < sourceQuiz.questions.length; i++) {
          const q = sourceQuiz.questions[i];
          await QuizService.saveQuestion({
            quiz_id: newQuiz.id,
            question: q.question,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: q.correct_option,
            explanation: q.explanation,
            clinical_pearl: q.clinical_pearl,
            image_url: q.image_url,
            marks: q.marks,
            difficulty: q.difficulty,
            order_index: i,
            is_published: true
          });
        }
      }

      return NextResponse.json({ success: true, quiz: newQuiz, message: `Successfully cloned daily quiz from ${sourceDate}` });
    }

    // Standard create daily quiz
    const saved = await QuizService.saveQuiz({
      ...quizData,
      academic_year,
      quiz_date: targetDate,
      is_daily: true,
      status: quizData.status || "draft",
      author: auth.adminUser.email?.split("@")[0] || "RxFusion Admin"
    });

    return NextResponse.json({ success: true, quiz: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process daily quiz request";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
