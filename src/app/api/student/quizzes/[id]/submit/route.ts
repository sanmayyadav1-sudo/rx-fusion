import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/authHelpers";
import { QuizService } from "@/lib/quizService";
import { QuestionResponse, CorrectOption } from "@/types/quiz";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await getAuthenticatedStudent(request);
    const quiz = await QuizService.getQuizById(params.id, true);

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.status === "closed") {
      return NextResponse.json({ error: "This quiz has closed and is no longer accepting submissions." }, { status: 400 });
    }

    // Check duplicate attempt if not allowed
    if (student && !quiz.allow_multiple_attempts) {
      const priorAttempts = await QuizService.getStudentAttempts(student.id, quiz.id);
      if (priorAttempts.length > 0) {
        return NextResponse.json(
          {
            error: "You have already submitted this quiz. Multiple attempts are not permitted for this examination.",
            previousAttempt: priorAttempts[0]
          },
          { status: 409 }
        );
      }
    }

    const body = await request.json();
    const { answers, timeTakenSeconds, startedAt, guestName } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers payload is missing or invalid." }, { status: 400 });
    }

    const studentName = student?.full_name || guestName?.trim() || "Student Participant";
    const questions = quiz.questions || [];

    let totalMarks = 0;
    let earnedScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    const evaluatedResponses: QuestionResponse[] = questions.map((q) => {
      const selected = (answers[q.id] as CorrectOption) || null;
      const questionMarks = q.marks ?? 1;
      totalMarks += questionMarks;

      const isCorrect = selected === q.correct_option;
      if (isCorrect) {
        earnedScore += questionMarks;
        correctCount++;
      } else if (selected) {
        incorrectCount++;
      }

      return {
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
        correctOption: q.correct_option,
        marksAwarded: isCorrect ? questionMarks : 0,
        explanation: q.explanation || null
      };
    });

    const percentage = totalMarks > 0 ? Math.round((earnedScore / totalMarks) * 100) : 0;
    const passed = percentage >= quiz.passing_percentage;

    const now = new Date().toISOString();
    const recordedAttempt = await QuizService.recordAttempt({
      quiz_id: quiz.id,
      student_id: student?.id || null,
      student_name: studentName,
      academic_year: quiz.academic_year,
      quiz_date: quiz.quiz_date,
      started_at: startedAt || now,
      submitted_at: now,
      time_taken_seconds: Number(timeTakenSeconds || 0),
      score: earnedScore,
      total_marks: totalMarks,
      percentage,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      total_questions: questions.length,
      status: "completed",
      responses: evaluatedResponses
    });

    return NextResponse.json({
      success: true,
      attempt: recordedAttempt,
      result: {
        score: earnedScore,
        totalMarks,
        percentage,
        passed,
        passingThreshold: quiz.passing_percentage,
        correctCount,
        incorrectCount,
        totalQuestions: questions.length,
        timeTakenSeconds: Number(timeTakenSeconds || 0),
        responses: evaluatedResponses,
        questionsWithAnswers: questions
      }
    });
  } catch (err: unknown) {
    console.error("Error submitting quiz attempt:", err);
    const msg = err instanceof Error ? err.message : "Failed to record quiz submission";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
