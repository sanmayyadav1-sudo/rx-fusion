import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authHelpers";
import { QuizService } from "@/lib/quizService";
import { AcademicYear } from "@/types/quiz";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const academic_year = searchParams.get("year") as AcademicYear | null;
    const subject = searchParams.get("subject") || undefined;
    const date = searchParams.get("date") || undefined;
    const quiz_id = searchParams.get("quiz_id") || undefined;
    const search_student = searchParams.get("student") || undefined;
    const student_id = searchParams.get("student_id") || undefined;

    // If requesting specific student performance history:
    if (student_id || (search_student && searchParams.get("mode") === "student_detail")) {
      const allAttempts = await QuizService.getStudentAttempts(student_id || undefined);
      const studentAttempts = search_student
        ? allAttempts.filter(a => a.student_name.toLowerCase().includes(search_student.toLowerCase()))
        : allAttempts;

      return NextResponse.json({
        studentAttempts,
        summary: {
          totalAttempts: studentAttempts.length,
          avgPercentage: studentAttempts.length > 0 ? Math.round(studentAttempts.reduce((s, a) => s + a.percentage, 0) / studentAttempts.length) : 0,
          highestScore: studentAttempts.length > 0 ? Math.max(...studentAttempts.map(a => a.score)) : 0
        }
      });
    }

    const summary = await QuizService.getAnalytics({
      academic_year: academic_year || undefined,
      subject,
      date,
      quiz_id,
      search_student
    });

    const recentAttempts = await QuizService.getStudentAttempts(undefined, quiz_id);

    return NextResponse.json({
      summary,
      recentAttempts: recentAttempts.slice(0, 50)
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
