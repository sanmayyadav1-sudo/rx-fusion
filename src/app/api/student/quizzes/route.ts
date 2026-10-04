import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/authHelpers";
import { QuizService } from "@/lib/quizService";
import { ACADEMIC_YEARS, AcademicYear, QuizAttempt } from "@/types/quiz";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const student = await getAuthenticatedStudent(request);
    const searchParams = request.nextUrl.searchParams;

    // Determine target academic year:
    // If student has a profile with current_year, use it; otherwise fallback to param or "1st Year"
    let targetYear: AcademicYear = "1st Year";
    if (student?.current_year && ACADEMIC_YEARS.includes(student.current_year as AcademicYear)) {
      targetYear = student.current_year as AcademicYear;
    } else if (searchParams.get("year") && ACADEMIC_YEARS.includes(searchParams.get("year") as AcademicYear)) {
      targetYear = searchParams.get("year") as AcademicYear;
    }

    const todayDate = new Date().toISOString().split("T")[0];

    // Fetch published quizzes for this year ONLY
    const yearQuizzes = await QuizService.getAllQuizzes({
      academic_year: targetYear,
      status: "published"
    });

    // Also fetch scheduled quizzes if student wants to see "Upcoming"
    const scheduledQuizzes = await QuizService.getAllQuizzes({
      academic_year: targetYear,
      status: "scheduled"
    });

    // Find Today's Daily Quiz
    const todayDailyQuiz = yearQuizzes.find(
      q => q.is_daily && q.quiz_date === todayDate
    ) || null;

    // Previous daily quizzes (daily quizzes where date < today or other past dates)
    const previousDailyQuizzes = yearQuizzes.filter(
      q => q.is_daily && q.quiz_date !== todayDate
    ).sort((a, b) => b.quiz_date.localeCompare(a.quiz_date));

    // Subject/Regular quizzes (non-daily)
    const regularQuizzes = yearQuizzes.filter(q => !q.is_daily);

    // Completed quizzes by this student
    let studentAttempts: QuizAttempt[] = [];
    if (student) {
      studentAttempts = await QuizService.getStudentAttempts(student.id);
    }

    return NextResponse.json({
      academicYear: targetYear,
      studentName: student?.full_name || null,
      todayDailyQuiz,
      previousDailyQuizzes,
      regularQuizzes,
      upcomingQuizzes: scheduledQuizzes,
      completedAttempts: studentAttempts
    });
  } catch (err: unknown) {
    console.error("Error in GET /api/student/quizzes:", err);
    const msg = err instanceof Error ? err.message : "Failed to load quizzes";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
