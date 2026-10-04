import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authHelpers";
import { QuizService } from "@/lib/quizService";
import { CorrectOption } from "@/types/quiz";

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
    return NextResponse.json({ questions: quiz.questions || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load questions";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
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

    const body = await request.json();
    const {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation,
      clinical_pearl,
      image_url,
      marks,
      difficulty,
      order_index
    } = body;

    // Strict validation
    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question text is required." }, { status: 400 });
    }
    if (!option_a?.trim() || !option_b?.trim() || !option_c?.trim() || !option_d?.trim()) {
      return NextResponse.json({ error: "All 4 options (A, B, C, D) are required." }, { status: 400 });
    }
    if (!correct_option || !["A", "B", "C", "D"].includes(correct_option)) {
      return NextResponse.json({ error: "Exactly one valid correct answer (A, B, C, or D) must be selected." }, { status: 400 });
    }

    const existingCount = quiz.questions?.length || 0;
    const newQuestion = await QuizService.saveQuestion({
      quiz_id: params.id,
      question: question.trim(),
      option_a: option_a.trim(),
      option_b: option_b.trim(),
      option_c: option_c.trim(),
      option_d: option_d.trim(),
      correct_option: correct_option as CorrectOption,
      explanation: explanation?.trim() || null,
      clinical_pearl: clinical_pearl?.trim() || null,
      image_url: image_url?.trim() || null,
      marks: Number(marks ?? 1),
      difficulty: difficulty || "Medium",
      order_index: order_index !== undefined ? Number(order_index) : existingCount,
      is_published: true
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to add question";
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
    const body = await request.json();

    // Check for reorder action
    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      await QuizService.reorderQuestions(params.id, body.orderedIds);
      return NextResponse.json({ success: true, message: "Questions reordered successfully" });
    }

    // Individual question update
    const { id, question, correct_option } = body;
    if (!id) {
      return NextResponse.json({ error: "Question ID required" }, { status: 400 });
    }
    if (question && !question.trim()) {
      return NextResponse.json({ error: "Question text cannot be empty." }, { status: 400 });
    }
    if (correct_option && !["A", "B", "C", "D"].includes(correct_option)) {
      return NextResponse.json({ error: "Invalid correct option." }, { status: 400 });
    }

    const updated = await QuizService.saveQuestion({
      ...body,
      quiz_id: params.id
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update question";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const questionId = request.nextUrl.searchParams.get("questionId");
    if (!questionId) {
      return NextResponse.json({ error: "Question ID required" }, { status: 400 });
    }
    await QuizService.deleteQuestion(questionId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete question";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
