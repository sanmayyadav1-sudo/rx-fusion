"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Trophy, 
  CheckCircle, 
  Search, 
  Loader2, 
  BookOpen, 
  GraduationCap, 
  Eye, 
  X
} from "lucide-react";
import { QuizAnalyticsSummary, QuizAttempt, ACADEMIC_YEARS } from "@/types/quiz";

export default function QuizAnalyticsAdminPage() {
  const [summary, setSummary] = useState<QuizAnalyticsSummary | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchStudent, setSearchStudent] = useState("");

  // Student Detail Modal
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const [studentAttempts, setStudentAttempts] = useState<QuizAttempt[]>([]);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Attempt Responses Modal
  const [viewingAttempt, setViewingAttempt] = useState<QuizAttempt | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterYear !== "all") params.set("year", filterYear);
      if (filterSubject) params.set("subject", filterSubject);
      if (filterDate) params.set("date", filterDate);
      if (searchStudent) params.set("student", searchStudent);

      const res = await fetch(`/api/admin/quiz-analytics?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();
      setSummary(data.summary);
      setRecentAttempts(data.recentAttempts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterYear, filterSubject, filterDate, searchStudent]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleOpenStudentDetail = async (studentName: string) => {
    setSelectedStudentName(studentName);
    setLoadingStudent(true);
    try {
      const res = await fetch(`/api/admin/quiz-analytics?mode=student_detail&student=${encodeURIComponent(studentName)}`);
      const data = await res.json();
      setStudentAttempts(data.studentAttempts || []);
    } catch {
      alert("Failed to load student quiz history");
    } finally {
      setLoadingStudent(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-200 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Quiz Analytics & Student Tracking</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/30">
              Live Metrics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated performance metrics, year-wise distribution, and individual student attempt records.
          </p>
        </div>
      </div>

      {/* Filters (Requirement 4: Year -> Date -> Subject -> Quiz) */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-3 backdrop-blur-md shadow-xl shadow-slate-950/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student name..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">All Academic Years</option>
            {ACADEMIC_YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-violet-500"
            title="Filter by Date"
          />

          <input
            type="text"
            placeholder="Subject filter..."
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-36 px-3 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-violet-500"
          />

          {(filterYear !== "all" || filterDate || filterSubject || searchStudent) && (
            <button
              onClick={() => {
                setFilterYear("all");
                setFilterDate("");
                setFilterSubject("");
                setSearchStudent("");
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-2" />
          <span className="text-xs">Generating analytics & student reports...</span>
        </div>
      ) : !summary ? (
        <div className="py-16 text-center text-slate-500">No analytics data available.</div>
      ) : (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-violet-400 mb-1">{summary.totalAttempts}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Quiz Attempts</div>
              <div className="text-[10px] text-slate-500 mt-1">{summary.totalParticipants} Unique Students</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-cyan-400 mb-1">{summary.averagePercentage}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Accuracy</div>
              <div className="text-[10px] text-slate-500 mt-1">Average Score: {summary.averageScore} marks</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-emerald-400 mb-1">{summary.passPercentage}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pass Percentage</div>
              <div className="text-[10px] text-slate-500 mt-1">Highest: {summary.highestScore} | Lowest: {summary.lowestScore}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-amber-400 mb-1">{summary.totalQuizzes}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Quizzes</div>
              <div className="text-[10px] text-slate-500 mt-1">Across 5 Academic Years</div>
            </div>
          </div>

          {/* Breakdown Sections: Year-wise & Subject-wise */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Year-wise Participation */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Year-Wise Participation</h3>
              </div>
              <div className="space-y-3">
                {summary.yearWiseParticipation.map(item => {
                  const maxAttempts = Math.max(...summary.yearWiseParticipation.map(x => x.attempts), 1);
                  const barWidth = Math.round((item.attempts / maxAttempts) * 100);
                  return (
                    <div key={item.year} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.year}</span>
                        <span className="text-cyan-400 font-bold">{item.attempts} attempts ({item.count} quizzes)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, barWidth)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject-Wise Performance */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <BookOpen className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Subject-Wise Performance</h3>
              </div>
              {summary.subjectWisePerformance.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No subject attempts recorded yet.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {summary.subjectWisePerformance.map(item => (
                    <div key={item.subject} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-white">{item.subject}</div>
                        <div className="text-[10px] text-slate-400">{item.attempts} student attempts</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-violet-400">{item.averagePercentage}%</div>
                        <div className="text-[9px] text-slate-500">Average score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quiz-Wise Performance Table */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/20">
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>Quiz-Wise Performance Breakdown</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                    <th className="p-4">Quiz</th>
                    <th className="p-4 text-center">Year</th>
                    <th className="p-4 text-center">Attempts</th>
                    <th className="p-4 text-center">Avg Score</th>
                    <th className="p-4 text-center">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {summary.quizWisePerformance.map((q) => (
                    <tr key={q.quizId} className="hover:bg-slate-800/20">
                      <td className="p-4">
                        <div className="font-bold text-white">{q.title}</div>
                        <div className="text-[11px] text-slate-400">{q.subject}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300">
                          {q.academicYear}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-white">{q.attempts}</td>
                      <td className="p-4 text-center text-cyan-400 font-bold">{q.averageScore}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.passPercentage >= 60 ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                        }`}>
                          {q.passPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Attempt History Records */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/20">
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Student Attempt Records & Responses</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Click any student name to inspect their full quiz history.</p>
              </div>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="py-12 text-center text-slate-500">No attempts found for selected filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Academic Year</th>
                      <th className="p-4 text-center">Date / Time Taken</th>
                      <th className="p-4 text-center">Score / Total</th>
                      <th className="p-4 text-center">Accuracy</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Responses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentAttempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-800/20">
                        <td className="p-4">
                          <button
                            onClick={() => handleOpenStudentDetail(attempt.student_name)}
                            className="font-bold text-white hover:text-cyan-400 text-left underline decoration-slate-700 underline-offset-2 transition-colors"
                          >
                            {attempt.student_name}
                          </button>
                        </td>

                        <td className="p-4 text-slate-400">{attempt.academic_year}</td>

                        <td className="p-4 text-center text-[11px] text-slate-400">
                          <div>{attempt.quiz_date}</div>
                          <div className="text-[10px] text-slate-500">{attempt.time_taken_seconds} seconds</div>
                        </td>

                        <td className="p-4 text-center font-bold text-white">
                          {attempt.score} / {attempt.total_marks}
                        </td>

                        <td className="p-4 text-center">
                          <span className="font-extrabold text-cyan-400">{attempt.percentage}%</span>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            attempt.percentage >= (attempt.quiz?.passing_percentage ?? 50)
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {attempt.percentage >= (attempt.quiz?.passing_percentage ?? 50) ? "PASS" : "FAIL"}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setViewingAttempt(attempt)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 inline-flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Responses</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT PERFORMANCE DETAIL MODAL */}
      {selectedStudentName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudentName(null)}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                Student Quiz History
              </span>
              <h2 className="text-lg font-bold text-white">{selectedStudentName}</h2>
            </div>

            {loadingStudent ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
                <span className="text-xs">Loading student quiz records...</span>
              </div>
            ) : studentAttempts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recorded attempts for this student.</p>
            ) : (
              <div className="space-y-3">
                {studentAttempts.map((att) => (
                  <div key={att.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white">{att.quiz?.title || "Pharmacy Quiz"}</h4>
                        <p className="text-[10px] text-cyan-400">{att.academic_year} • {att.quiz_date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-white">{att.score} / {att.total_marks}</span>
                        <div className="text-[10px] font-bold text-cyan-400">{att.percentage}%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/40 pt-2">
                      <span>Time: {att.time_taken_seconds}s</span>
                      <span className="text-emerald-400">{att.correct_count} Correct</span>
                      <span className="text-rose-400">{att.incorrect_count} Incorrect</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUESTION-LEVEL RESPONSES MODAL */}
      {viewingAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingAttempt(null)}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                Attempt Question-by-Question Breakdown
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {viewingAttempt.student_name} — Score: {viewingAttempt.score}/{viewingAttempt.total_marks} ({viewingAttempt.percentage}%)
              </h2>
            </div>

            <div className="space-y-3">
              {(viewingAttempt.responses || []).map((resp, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    resp.isCorrect
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : "bg-rose-500/5 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-300">Question #{idx + 1}</span>
                    <span className={resp.isCorrect ? "text-emerald-400" : "text-rose-400"}>
                      {resp.isCorrect ? "Correct (+1)" : "Incorrect"}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center gap-4">
                    <span>Student Selected: <strong className="text-white">{resp.selectedOption || "None"}</strong></span>
                    {resp.correctOption && (
                      <span>Correct Answer: <strong className="text-emerald-400">{resp.correctOption}</strong></span>
                    )}
                  </div>

                  {resp.explanation && (
                    <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                      {resp.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
