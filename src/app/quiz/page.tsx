"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Percent, 
  Flame, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  AlertCircle,
  Lightbulb
} from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  clinical_pearl: string;
}

interface QuizStats {
  attemptsCount: number;
  correctCount: number;
  accuracy: number;
  streak: number;
  attemptedQuestionIds: string[];
}

export default function DailyQuizPage() {
  const { profile, loading: authLoading } = useAuth();
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [stats, setStats] = useState<QuizStats>({
    attemptsCount: 0,
    correctCount: 0,
    accuracy: 0,
    streak: 0,
    attemptedQuestionIds: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local list of attempts in current session (used for mock fallback)
  const [localAttempts, setLocalAttempts] = useState<Record<string, { selected: "A" | "B" | "C" | "D"; isCorrect: boolean }>>({});

  const fetchQuizData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const studentParam = profile ? `?studentId=${profile.id}` : "";
      const res = await fetch(`/api/student/quiz${studentParam}`);
      if (!res.ok) throw new Error("Failed to load quiz details");
      const data = await res.json();
      
      setQuestions(data.questions || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to connect to the quiz service. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (authLoading) return;
    fetchQuizData();
  }, [authLoading, fetchQuizData]);

  const handleOptionSelect = (option: "A" | "B" | "C" | "D") => {
    if (submitted || isAlreadyAttempted) return;
    setSelectedOption(option);
  };

  const currentQuestion = questions[currentIndex];
  
  const isAlreadyAttempted = currentQuestion 
    ? stats.attemptedQuestionIds.includes(currentQuestion.id) || !!localAttempts[currentQuestion.id]
    : false;

  const getAttemptDetails = () => {
    if (!currentQuestion) return null;
    if (stats.attemptedQuestionIds.includes(currentQuestion.id)) {
      // It was attempted previously, but we don't have the exact option in GET stats array. 
      // Let's fallback to showing the correct answer highlighted.
      return {
        selected: currentQuestion.correct_option, // assume correct for display or just reveal answer
        isCorrect: true,
        isPast: true
      };
    }
    const local = localAttempts[currentQuestion.id];
    if (local) {
      return {
        selected: local.selected,
        isCorrect: local.isCorrect,
        isPast: false
      };
    }
    return null;
  };

  const handleSubmitAnswer = async () => {
    if (!profile) {
      // Prompt login or show warning
      alert("Please log in to submit your answer and save your learning progress.");
      return;
    }
    if (!currentQuestion || !selectedOption || submitted || isAlreadyAttempted) return;

    setIsSubmitting(true);
    const isCorrect = selectedOption === currentQuestion.correct_option;

    try {
      // Optimistic update of local attempt
      setLocalAttempts(prev => ({
        ...prev,
        [currentQuestion.id]: { selected: selectedOption, isCorrect }
      }));
      setSubmitted(true);

      const res = await fetch("/api/student/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          questionId: currentQuestion.id,
          selectedOption,
          isCorrect
        })
      });

      if (res.ok) {
        // Refresh stats
        const studentParam = profile ? `?studentId=${profile.id}` : "";
        const statRes = await fetch(`/api/student/quiz${studentParam}`);
        if (statRes.ok) {
          const data = await statRes.json();
          if (data.stats) {
            setStats(data.stats);
          }
        }
      }
    } catch (err) {
      console.error("Failed to submit attempt:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset page state on question index change
  useEffect(() => {
    setSelectedOption(null);
    setSubmitted(false);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <main className="flex-grow pt-20 sm:pt-28 pb-16 relative">
        {/* Glow graphics background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 relative">
          
          {/* Header */}
          <header className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-150 text-[10px] font-bold text-cyan-650 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Pharmacy Challenge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Test Your Pharmacy Knowledge
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Solve clinical and pharmacological multiple-choice questions daily to build diagnostic and exam readiness.
            </p>
          </header>

          {/* Stats Bar */}
          {profile && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-200/60 p-5 rounded-3xl shadow-xs">
              <div className="flex items-center gap-3 border-r border-slate-100 last:border-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-550">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attempted</p>
                  <p className="text-base font-extrabold text-slate-800">{stats.attemptsCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:border-r border-slate-100 last:border-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Correct</p>
                  <p className="text-base font-extrabold text-slate-800">{stats.correctCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-r border-slate-100 last:border-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accuracy</p>
                  <p className="text-base font-extrabold text-slate-800">{stats.accuracy}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 last:border-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Streak</p>
                  <p className="text-base font-extrabold text-slate-800">{stats.streak} Day{stats.streak !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </section>
          )}

          {loading ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-2" />
              <p className="text-sm text-slate-500 font-medium">Loading challenge question...</p>
            </div>
          ) : error || questions.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 text-center max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No active quiz questions found</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Please check back later or contact admin support.
              </p>
              <button 
                onClick={fetchQuizData}
                className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Question Main Panel */}
              <section className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-[10px] font-extrabold bg-cyan-550 text-white px-2.5 py-1 rounded-md tracking-wider">
                      QUESTION {currentIndex + 1} OF {questions.length}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <BookmarkButton 
                        contentType="quiz"
                        contentId={currentQuestion.id}
                        showText={false}
                        className="p-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-850 leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {[
                      { key: "A", val: currentQuestion.option_a },
                      { key: "B", val: currentQuestion.option_b },
                      { key: "C", val: currentQuestion.option_c },
                      { key: "D", val: currentQuestion.option_d }
                    ].map((opt) => {
                      const isSelected = selectedOption === opt.key;
                      const attempt = getAttemptDetails();
                      
                      let optionStyle = "border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/10 text-slate-700 bg-slate-50/50";
                      
                      if (attempt) {
                        const isCorrectOption = opt.key === currentQuestion.correct_option;
                        const isSelectedOption = opt.key === attempt.selected;
                        
                        if (isCorrectOption) {
                          optionStyle = "border-emerald-250 bg-emerald-50 text-emerald-700 font-semibold";
                        } else if (isSelectedOption && !attempt.isCorrect) {
                          optionStyle = "border-red-200 bg-red-50 text-red-650 font-semibold";
                        } else {
                          optionStyle = "border-slate-100 bg-white text-slate-400 opacity-60";
                        }
                      } else if (isSelected) {
                        optionStyle = "border-cyan-500 bg-cyan-50/40 text-cyan-700 font-semibold ring-2 ring-cyan-500/10";
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={submitted || isAlreadyAttempted}
                          onClick={() => handleOptionSelect(opt.key as "A" | "B" | "C" | "D")}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 text-xs sm:text-sm flex items-start gap-3 active:scale-99 ${optionStyle}`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors shrink-0 ${
                            isSelected || (attempt && opt.key === currentQuestion.correct_option)
                              ? "bg-cyan-500 border-cyan-500 text-white"
                              : "bg-white border-slate-250 text-slate-500"
                          }`}>
                            {opt.key}
                          </span>
                          <span className="flex-1 mt-0.5">{opt.val}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Submission Row */}
                  {!submitted && !isAlreadyAttempted && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption || isSubmitting}
                        className="px-6 py-3 bg-cyan-550 hover:bg-cyan-600 disabled:bg-cyan-500/60 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all active:scale-98 flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Submit Answer</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Question Paper-like controls */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-6">
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-xl text-xs font-bold text-slate-650 flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex === questions.length - 1}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-xl text-xs font-bold text-slate-650 flex items-center gap-1 transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </section>

              {/* Explanations & Pearls Sidebar */}
              <section className="space-y-6">
                
                {/* Immediate result display card */}
                {(submitted || isAlreadyAttempted) && (
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs space-y-5 animate-fade-in">
                    <div className="flex items-center gap-2">
                      {getAttemptDetails()?.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                          <h4 className="text-sm sm:text-base font-extrabold text-emerald-700">Correct Answer!</h4>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                          <h4 className="text-sm sm:text-base font-extrabold text-red-650">Incorrect Answer</h4>
                        </>
                      )}
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-slate-650">
                      <div>
                        <span className="font-bold text-slate-800">Correct Option: </span>
                        <strong className="text-cyan-650 font-extrabold">{currentQuestion.correct_option}</strong>
                      </div>
                      
                      {currentQuestion.explanation && (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <p className="font-bold text-slate-800">Explanation</p>
                          <p className="leading-relaxed text-slate-500 font-semibold">{currentQuestion.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Daily Clinical Pearl card */}
                {currentQuestion.clinical_pearl && (submitted || isAlreadyAttempted) && (
                  <div className="bg-gradient-to-tr from-cyan-50/50 to-sky-50/50 border border-cyan-150 p-6 rounded-3xl shadow-3xs space-y-3 animate-fade-in">
                    <h4 className="text-xs font-bold text-cyan-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-cyan-600" />
                      <span>Clinical Pearl 💡</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {currentQuestion.clinical_pearl}
                    </p>
                  </div>
                )}

                {/* Info Disclaimer */}
                <div className="bg-slate-100/50 border border-slate-200/50 p-5 rounded-3xl text-[10px] text-slate-450 leading-relaxed space-y-2">
                  <p className="font-bold text-slate-700 uppercase tracking-wider">Educational Disclaimer</p>
                  <p>
                    Daily challenges are designed purely for academic practice and preparation. Dose metrics, drug selections, and clinical decisions must be cross-referenced with official treatment guidelines in professional practice.
                  </p>
                </div>

              </section>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
