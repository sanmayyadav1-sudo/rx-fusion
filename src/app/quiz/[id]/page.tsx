"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Loader2, 
  Trophy, 
  RotateCcw, 
  ShieldCheck, 
  ArrowLeft, 
  Lightbulb, 
  X,
  Check
} from "lucide-react";
import { Quiz, QuizQuestion, CorrectOption, LeaderboardEntry, QuestionResponse, QuizAttempt } from "@/types/quiz";

interface QuizSubmittedResult {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  passingThreshold: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  responses: QuestionResponse[];
  questionsWithAnswers?: QuizQuestion[];
}

interface QuizDetailResponse {
  quiz: Quiz & { questions: (Omit<QuizQuestion, "correct_option" | "explanation" | "clinical_pearl"> & { marks: number })[] };
  hasAttempted: boolean;
  previousAttempt: QuizAttempt | null;
  student: { id: string; name: string; email: string } | null;
}

export default function TakeQuizPage() {
  const params = useParams();
  const quizId = params?.id as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizDetailResponse | null>(null);

  // State for guest name if student is not logged in
  const [guestName, setGuestName] = useState("");

  // Quiz taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, CorrectOption>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Results State (post submission)
  const [submittedResult, setSubmittedResult] = useState<QuizSubmittedResult | null>(null);

  // Leaderboard Modal State
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load quiz");
      }
      const data: QuizDetailResponse = await res.json();
      setQuizData(data);

      // If student previously attempted and multiple attempts disallowed
      if (data.hasAttempted && !data.quiz.allow_multiple_attempts && data.previousAttempt) {
        setSubmittedResult({
          score: data.previousAttempt.score,
          totalMarks: data.previousAttempt.total_marks,
          percentage: data.previousAttempt.percentage,
          passed: data.previousAttempt.percentage >= data.quiz.passing_percentage,
          passingThreshold: data.quiz.passing_percentage,
          correctCount: data.previousAttempt.correct_count,
          incorrectCount: data.previousAttempt.incorrect_count,
          totalQuestions: data.previousAttempt.total_questions,
          timeTakenSeconds: data.previousAttempt.time_taken_seconds,
          responses: data.previousAttempt.responses
        });
      }

      // Initialize Timer if time limit is configured (> 0)
      if (data.quiz.time_limit_mins > 0 && !data.hasAttempted) {
        setTimeRemaining(data.quiz.time_limit_mins * 60);
      }
      setStartedAt(new Date().toISOString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error connecting to quiz server");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Handle Countdown Timer
  useEffect(() => {
    if (timeRemaining === null || submittedResult) return;

    if (timeRemaining <= 0) {
      // Auto-submit when time expires
      handleSubmitQuiz(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, submittedResult]);

  const handleSelectOption = (questionId: string, option: CorrectOption) => {
    if (submittedResult) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitQuiz = async (isTimeOut = false) => {
    if (isSubmitting || submittedResult) return;
    setShowConfirmModal(false);
    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const timeLimitSecs = (quizData?.quiz.time_limit_mins || 0) * 60;
    const timeTaken = timeLimitSecs > 0 && timeRemaining !== null
      ? Math.max(1, timeLimitSecs - timeRemaining)
      : Math.round((Date.now() - new Date(startedAt || Date.now()).getTime()) / 1000);

    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: selectedAnswers,
          timeTakenSeconds: timeTaken,
          startedAt,
          guestName: guestName.trim() || undefined,
          isTimeOut
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSubmittedResult(data.result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to record submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchLeaderboard = async () => {
    setShowLeaderboard(true);
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/leaderboard`);
      const data = await res.json();
      setLeaderboardData(data.leaderboard || []);
    } catch {
      alert("Failed to load leaderboard");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-700">Preparing test questions...</p>
        <p className="text-xs text-slate-500">Checking academic year security and question bank</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Quiz Unavailable</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{error || "The requested examination could not be loaded."}</p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quiz Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  const { quiz } = quizData;
  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  // -------------------------------------------------------------
  // POST-SUBMISSION RESULTS VIEW (Requirement 3)
  // -------------------------------------------------------------
  if (submittedResult) {
    const passed = submittedResult.passed;
    return (
      <div className="min-h-screen bg-slate-50 pt-20 sm:pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Top Scorecard Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-5 animate-scale-up">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              passed ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"
            }`}>
              {passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>

            <div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {passed ? "CONGRATULATIONS — PASSED" : "ASSESSMENT INCOMPLETE — NEEDS REVIEW"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
                {quiz.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Passing Threshold: {submittedResult.passingThreshold}% • Time Taken: {submittedResult.timeTakenSeconds}s
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{submittedResult.score} / {submittedResult.totalMarks}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</span>
                <p className={`text-xl font-black mt-0.5 ${passed ? "text-emerald-600" : "text-rose-600"}`}>
                  {submittedResult.percentage}%
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Correct Answers</span>
                <p className="text-xl font-black text-emerald-600 mt-0.5">{submittedResult.correctCount}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Incorrect</span>
                <p className="text-xl font-black text-rose-600 mt-0.5">{submittedResult.incorrectCount}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {quiz.is_leaderboard_enabled && (
                <button
                  onClick={handleFetchLeaderboard}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  <span>View Leaderboard</span>
                </button>
              )}

              {quiz.allow_multiple_attempts && (
                <button
                  onClick={() => {
                    setSubmittedResult(null);
                    setSelectedAnswers({});
                    setCurrentIndex(0);
                    if (quiz.time_limit_mins > 0) setTimeRemaining(quiz.time_limit_mins * 60);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
              )}

              <Link
                href="/quiz"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quiz Hub</span>
              </Link>
            </div>
          </div>

          {/* Detailed Question Explanations & Review (Revealed only after submission) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              <span>Question-by-Question Review & Clinical Explanations</span>
            </h3>

            {(submittedResult.responses || []).map((resp: QuestionResponse, idx: number) => {
              const q = submittedResult.questionsWithAnswers?.find((item: QuizQuestion) => item.id === resp.questionId) || questions[idx];
              return (
                <div
                  key={resp.questionId || idx}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-3xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                      QUESTION {idx + 1}
                    </span>
                    <span className={`text-xs font-extrabold flex items-center gap-1 ${
                      resp.isCorrect ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {resp.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{resp.isCorrect ? "Correct (+1)" : "Incorrect"}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                    {q?.question}
                  </h4>

                  {/* Options review */}
                  <div className="space-y-2">
                    {[
                      { key: "A", val: q?.option_a },
                      { key: "B", val: q?.option_b },
                      { key: "C", val: q?.option_c },
                      { key: "D", val: q?.option_d }
                    ].map(opt => {
                      const isCorrect = opt.key === (resp.correctOption || q?.correct_option);
                      const isSelected = opt.key === resp.selectedOption;

                      let style = "border-slate-100 bg-slate-50/50 text-slate-600";
                      if (isCorrect) {
                        style = "border-emerald-300 bg-emerald-50 text-emerald-900 font-bold";
                      } else if (isSelected && !resp.isCorrect) {
                        style = "border-rose-300 bg-rose-50 text-rose-900 font-semibold";
                      }

                      return (
                        <div key={opt.key} className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${style}`}>
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                            isCorrect ? "bg-emerald-600 text-white" : isSelected ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                            {opt.key}
                          </span>
                          <span className="flex-1">{opt.val}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                              Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="text-[10px] font-extrabold uppercase text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Clinical Pearl */}
                  {(resp.explanation || q?.explanation) && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
                      <strong className="text-slate-800 text-[11px] uppercase tracking-wide block">Explanation</strong>
                      <p className="text-slate-600 leading-relaxed font-normal">{resp.explanation || q?.explanation}</p>
                    </div>
                  )}

                  {q?.clinical_pearl && (
                    <div className="p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs space-y-1">
                      <strong className="text-amber-800 text-[11px] uppercase tracking-wide flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Clinical Pearl</span>
                      </strong>
                      <p className="text-amber-900 leading-relaxed font-normal">{q.clinical_pearl}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* LEADERBOARD MODAL */}
          {showLeaderboard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto space-y-4">
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center space-y-1 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 mx-auto flex items-center justify-center mb-1">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">Quiz Leaderboard</h3>
                  <p className="text-xs text-slate-500">{quiz.title}</p>
                </div>

                {loadingLeaderboard ? (
                  <div className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-600 mx-auto mb-2" />
                    <span className="text-xs font-semibold">Loading top participants...</span>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">No student rankings recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboardData.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          entry.rank === 1
                            ? "bg-amber-50/60 border-amber-200"
                            : entry.rank === 2
                            ? "bg-slate-100/70 border-slate-200"
                            : entry.rank === 3
                            ? "bg-orange-50/60 border-orange-200"
                            : "bg-white border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                            entry.rank === 1 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                            {entry.rank}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{entry.student_name}</div>
                            <div className="text-[10px] text-slate-400">{entry.time_taken_seconds}s time taken</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-slate-900">{entry.score}/{entry.total_marks}</span>
                          <div className="text-[10px] font-bold text-violet-600">{entry.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE QUIZ TAKING INTERFACE (Mobile-First)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-cyan-500/20">
      
      {/* Top Mobile-Sticky Examination Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/quiz"
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Exit Examination"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Question Counter */}
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
              {quiz.subject}
            </div>
          </div>

          {/* Countdown Timer when enabled */}
          {timeRemaining !== null ? (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
              timeRemaining < 120
                ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse"
                : "bg-cyan-50 text-cyan-700 border border-cyan-200"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          ) : (
            <div className="w-8" /> // spacer
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1 mt-2.5">
          <div
            className="bg-cyan-500 h-1 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Examination Content */}
      <main className="flex-grow pt-24 pb-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Guest Name input if user is not authenticated */}
          {!user && (
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-amber-900">
                <span className="font-bold">Guest Mode: </span>
                <span>Enter your display name to record your attempt or </span>
                <Link href="/login" className="underline font-bold text-amber-950">login</Link> to save progress.
              </div>
              <input
                type="text"
                placeholder="Student Display Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full sm:w-48 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold focus:outline-none"
              />
            </div>
          )}

          {currentQuestion ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Question metadata badge */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                  {currentQuestion.marks} Mark{currentQuestion.marks !== 1 ? "s" : ""} • {currentQuestion.difficulty}
                </span>

                <span className="text-[11px] font-semibold text-slate-400">
                  Answered: {answeredCount} / {questions.length}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Optional Diagram / Image */}
              {currentQuestion.image_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-72">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentQuestion.image_url}
                    alt="Question Diagram"
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              {/* 4 Touch-Friendly Options */}
              <div className="space-y-3">
                {[
                  { key: "A", val: currentQuestion.option_a },
                  { key: "B", val: currentQuestion.option_b },
                  { key: "C", val: currentQuestion.option_c },
                  { key: "D", val: currentQuestion.option_d }
                ].map((opt) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.key as CorrectOption)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm flex items-start gap-3 active:scale-99 ${
                        isSelected
                          ? "bg-cyan-50 border-cyan-500 text-cyan-950 font-semibold ring-2 ring-cyan-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-cyan-300 text-slate-700"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                        isSelected
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {opt.key}
                      </span>
                      <span className="flex-1 mt-0.5">{opt.val}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No questions found in this quiz.</div>
          )}

        </div>
      </main>

      {/* Bottom Sticky Mobile Navigation & Submit Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Quick Question Jump Buttons */}
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-xs scrollbar-none">
            {questions.map((q, idx) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-cyan-500 text-white"
                      : isAnswered
                      ? "bg-cyan-100 text-cyan-800"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* CONFIRMATION MODAL BEFORE FINAL SUBMISSION (Requirement 3) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Confirm Final Submission?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                You have answered <strong className="text-slate-800">{answeredCount} of {questions.length}</strong> questions.
                Once submitted, your answers will be graded immediately.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Review Answers
              </button>

              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
