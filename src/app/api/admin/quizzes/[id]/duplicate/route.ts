import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authHelpers";
import { QuizService } from "@/lib/quizService";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const duplicated = await QuizService.duplicateQuiz(params.id);
    if (!duplicated) {
      return NextResponse.json({ error: "Source quiz not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, quiz: duplicated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to duplicate quiz";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
