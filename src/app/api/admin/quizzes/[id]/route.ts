import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authHelpers";
import { QuizService } from "@/lib/quizService";
import { ACADEMIC_YEARS, AcademicYear } from "@/types/quiz";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const quiz = await QuizService.getQuizById(params.id, true);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json({ quiz });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load quiz";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const existing = await QuizService.getQuizById(params.id, true);
    if (!existing) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const body = await request.json();

    // If publishing, validate questions
    if (body.status === "published") {
      const questions = existing.questions || [];
      if (questions.length === 0) {
        return NextResponse.json(
          { error: "Cannot publish an empty quiz. Please add at least one question." },
          { status: 400 }
        );
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.correct_option || !["A", "B", "C", "D"].includes(q.correct_option)) {
          return NextResponse.json(
            { error: `Question #${i + 1} ("${q.question.slice(0, 30)}...") does not have a valid correct answer assigned.` },
            { status: 400 }
          );
        }
      }
    }

    if (body.academic_year && !ACADEMIC_YEARS.includes(body.academic_year as AcademicYear)) {
      return NextResponse.json({ error: "Invalid academic year" }, { status: 400 });
    }

    const updated = await QuizService.saveQuiz({
      ...existing,
      ...body,
      id: params.id,
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, quiz: updated });
  } catch (err: unknown) {
    console.error("Error updating quiz:", err);
    const msg = err instanceof Error ? err.message : "Failed to update quiz";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await QuizService.deleteQuiz(params.id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete quiz";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
