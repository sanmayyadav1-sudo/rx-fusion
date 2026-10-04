"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Trophy, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  ChevronRight,
  Flame,
  Award,
  History,
  Percent
} from "lucide-react";
import { Quiz, AcademicYear, ACADEMIC_YEARS, QuizAttempt } from "@/types/quiz";

export default function StudentQuizHubPage() {
  const { profile, user, loading: authLoading } = useAuth();

  // Selected Academic Year
  const [selectedYear, setSelectedYear] = useState<AcademicYear>("3rd Year");

  // Quiz Data
  const [todayDailyQuiz, setTodayDailyQuiz] = useState<Quiz | null>(null);
  const [previousDailyQuizzes, setPreviousDailyQuizzes] = useState<Quiz[]>([]);
  const [regularQuizzes, setRegularQuizzes] = useState<Quiz[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [completedAttempts, setCompletedAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"daily" | "all" | "history">("daily");

  // Sync default selected year with student's profile if available
  useEffect(() => {
    if (profile?.current_year && ACADEMIC_YEARS.includes(profile.current_year as AcademicYear)) {
      setSelectedYear(profile.current_year as AcademicYear);
    }
  }, [profile]);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/quizzes?year=${encodeURIComponent(selectedYear)}`);
      if (!res.ok) throw new Error("Failed to load quizzes");
      const data = await res.json();

      setTodayDailyQuiz(data.todayDailyQuiz || null);
      setPreviousDailyQuizzes(data.previousDailyQuizzes || []);
      setRegularQuizzes(data.regularQuizzes || []);
      setUpcomingQuizzes(data.upcomingQuizzes || []);
      setCompletedAttempts(data.completedAttempts || []);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the quiz service. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (authLoading) return;
    fetchQuizzes();
  }, [authLoading, fetchQuizzes]);

  // Derived user statistics
  const totalCompleted = completedAttempts.length;
  const avgAccuracy = totalCompleted > 0
    ? Math.round(completedAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalCompleted)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-900">
      <main className="flex-grow pt-24 sm:pt-28 pb-16 relative">
        {/* Glow graphics background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 relative">
          
          {/* Header */}
          <header className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[10px] font-bold text-cyan-700 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>RxFusion Clinical & Academic Examination Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Year-Wise Pharmacy Quizzes & Daily Challenges
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Curated multiple-choice questions for Pharm.D, B.Pharm, and D.Pharm students. Test clinical concepts, drug mechanisms, and therapeutic guidelines daily.
            </p>
          </header>

          {/* Academic Year Selector Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <GraduationCap className="w-4 h-4 text-cyan-600" />
                <span>Academic Year:</span>
              </div>

              {/* Year Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {ACADEMIC_YEARS.map((year) => {
                  const isSelected = selectedYear === year;
                  const isStudentYear = profile?.current_year === year;
                  return (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/20"
                          : "bg-slate-100 text-slate-650 hover:bg-slate-200"
                      }`}
                    >
                      <span>{year}</span>
                      {isStudentYear && (
                        <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold uppercase ${
                          isSelected ? "bg-white/20 text-white" : "bg-cyan-100 text-cyan-800"
                        }`}>
                          My Year
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Student Quick Performance Ribbon (if logged in) */}
          {user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center gap-3 border-r border-slate-100 last:border-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <Trophy className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</p>
                  <p className="text-base font-extrabold text-slate-800">{totalCompleted} Quizzes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:border-r border-slate-100 last:border-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Percent className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Accuracy</p>
                  <p className="text-base font-extrabold text-slate-800">{avgAccuracy}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-r border-slate-100 last:border-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Flame className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Streak</p>
                  <p className="text-base font-extrabold text-slate-800">{totalCompleted > 0 ? "Active" : "Start Today"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 last:border-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Year</p>
                  <p className="text-base font-extrabold text-slate-800">{selectedYear}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-3 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("daily")}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all relative ${
                activeTab === "daily"
                  ? "text-cyan-600 border-b-2 border-cyan-500"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Quizzes</span>
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all relative ${
                activeTab === "all"
                  ? "text-cyan-600 border-b-2 border-cyan-500"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subject Examinations ({regularQuizzes.length})</span>
            </button>

            {user && (
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all relative ${
                  activeTab === "history"
                    ? "text-cyan-600 border-b-2 border-cyan-500"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <History className="w-4 h-4" />
                <span>My Results ({completedAttempts.length})</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <span className="text-xs font-semibold">Loading {selectedYear} quizzes...</span>
            </div>
          ) : error ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">{error}</p>
              <button
                onClick={fetchQuizzes}
                className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-xl text-xs font-bold hover:bg-cyan-600"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">

              {/* TAB 1: DAILY QUIZZES */}
              {activeTab === "daily" && (
                <div className="space-y-8">
                  {/* Today's Daily Quiz Spotlight */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                        Today&apos;s Daily Quiz — {selectedYear}
                      </h2>
                    </div>

                    {todayDailyQuiz ? (
                      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                          <div className="space-y-3 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {todayDailyQuiz.academic_year}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                                {todayDailyQuiz.subject}
                              </span>
                              {todayDailyQuiz.topic && (
                                <span className="text-xs text-slate-400 font-semibold">• {todayDailyQuiz.topic}</span>
                              )}
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                              {todayDailyQuiz.title}
                            </h3>

                            {todayDailyQuiz.description && (
                              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                {todayDailyQuiz.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                              <div className="flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-cyan-400" />
                                <span className="font-semibold text-white">{todayDailyQuiz.questions_count ?? 0} Questions</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span>{todayDailyQuiz.time_limit_mins > 0 ? `${todayDailyQuiz.time_limit_mins} Mins Limit` : "Untimed"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Trophy className="w-4 h-4 text-cyan-400" />
                                <span>Pass: {todayDailyQuiz.passing_percentage}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 w-full lg:w-auto">
                            <Link
                              href={`/quiz/${todayDailyQuiz.id}`}
                              className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-95 hover:-translate-y-0.5"
                            >
                              <span>Start Today&apos;s Quiz</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-2">
                        <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-1" />
                        <h4 className="text-sm font-bold text-slate-800">No Daily Quiz Published Today for {selectedYear}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          The faculty updates daily pharmacy tests by morning. You can practice previous daily challenges below or explore subject tests.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Previous Daily Quizzes Organized by Date (Requirement 2 & 12) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-4 h-4 text-cyan-600" />
                        <span>Previous Daily Quizzes ({selectedYear})</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-semibold">Organized by date</span>
                    </div>

                    {previousDailyQuizzes.length === 0 ? (
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 text-center text-slate-500 text-xs">
                        No previous daily quizzes in the archive for {selectedYear}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {previousDailyQuizzes.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-cyan-650 bg-cyan-50 px-2 py-0.5 rounded-md">
                                  {quiz.quiz_date}
                                </span>
                                <span className="text-slate-400 font-medium">
                                  {quiz.difficulty}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-650 transition-colors line-clamp-2">
                                {quiz.title}
                              </h4>

                              <p className="text-xs text-slate-500 line-clamp-1">
                                {quiz.subject} {quiz.topic ? `• ${quiz.topic}` : ""}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 font-medium">
                                {quiz.questions_count ?? 0} Qs • {quiz.time_limit_mins} mins
                              </span>

                              <Link
                                href={`/quiz/${quiz.id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"
                              >
                                <span>Attempt</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SUBJECT EXAMINATIONS & MODULES */}
              {activeTab === "all" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Available Subject Examinations ({selectedYear})
                  </h3>

                  {regularQuizzes.length === 0 ? (
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-8 text-center text-slate-500 text-xs">
                      No standalone subject examinations currently available for {selectedYear}. Please check the daily quiz tab.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {regularQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                        >
                          <div className="space-y-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-650">
                              {quiz.subject}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-650 transition-colors">
                              {quiz.title}
                            </h4>
                            {quiz.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {quiz.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-medium">
                              {quiz.questions_count ?? 0} Qs • {quiz.time_limit_mins} mins
                            </span>
                            <Link
                              href={`/quiz/${quiz.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"
                            >
                              <span>Take Quiz</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {upcomingQuizzes.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-200/50">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        <span>Upcoming Scheduled Quizzes ({selectedYear})</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingQuizzes.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="bg-white/80 border border-dashed border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60">
                                Opens on {quiz.quiz_date}
                              </span>
                              <h5 className="text-sm font-bold text-slate-800 pt-1">{quiz.title}</h5>
                              <p className="text-xs text-slate-500">{quiz.subject}</p>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {quiz.questions_count ?? 0} Questions • {quiz.time_limit_mins} mins
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STUDENT RESULT HISTORY */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    My Previous Results & Performance
                  </h3>

                  {completedAttempts.length === 0 ? (
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-8 text-center text-slate-500 text-xs">
                      You haven&apos;t completed any quizzes yet. Take today&apos;s daily quiz to see your score analysis here!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-all shadow-3xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">
                                {attempt.quiz?.title || "Pharmacy Quiz"}
                              </h4>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                attempt.percentage >= (attempt.quiz?.passing_percentage ?? 50)
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {attempt.percentage >= (attempt.quiz?.passing_percentage ?? 50) ? "PASSED" : "FAILED"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500">
                              {attempt.academic_year} • Attempted on {new Date(attempt.submitted_at).toLocaleDateString()} at {new Date(attempt.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-center">
                            <div className="text-right">
                              <div className="text-base font-black text-slate-900">
                                {attempt.score} / {attempt.total_marks}
                              </div>
                              <div className="text-[11px] font-bold text-cyan-600">
                                {attempt.percentage}% Score
                              </div>
                            </div>

                            <Link
                              href={`/quiz/${attempt.quiz_id}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Review
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
