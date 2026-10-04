"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Copy, 
  Trash2, 
  Edit2, 
  Clock, 
  Users, 
  Layers, 
  Loader2, 
  AlertCircle, 
  Check, 
  X, 
  CalendarDays,
  FolderTree
} from "lucide-react";
import { Quiz, AcademicYear, ACADEMIC_YEARS, QuizStatus, DifficultyLevel } from "@/types/quiz";

export default function DailyQuizAdminPage() {
  const [grouped, setGrouped] = useState<Record<AcademicYear, Record<string, Quiz[]>>>({
    "1st Year": {},
    "2nd Year": {},
    "3rd Year": {},
    "4th Year": {},
    "5th Year": {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Year Selection
  const [activeYear, setActiveYear] = useState<AcademicYear>("3rd Year");
  const [dateFilter, setDateFilter] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [allowAlternate, setAllowAlternate] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    academic_year: "3rd Year" as AcademicYear,
    subject: "",
    topic: "",
    description: "",
    difficulty: "Medium" as DifficultyLevel,
    quiz_date: new Date().toISOString().split("T")[0],
    time_limit_mins: 15,
    passing_percentage: 50,
    status: "published" as QuizStatus,
    is_leaderboard_enabled: true
  });

  const fetchDailyQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/daily-quiz");
      if (!res.ok) throw new Error("Failed to load daily quizzes");
      const data = await res.json();
      if (data.grouped) setGrouped(data.grouped);
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to load daily quizzes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyQuizzes();
  }, [fetchDailyQuizzes]);

  const handleOpenCreateToday = () => {
    setEditingQuizId(null);
    setAllowAlternate(false);
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      title: `${activeYear} Daily Challenge – ${today}`,
      academic_year: activeYear,
      subject: "",
      topic: "",
      description: "Daily examination to reinforce essential clinical and pharmacological knowledge.",
      difficulty: "Medium",
      quiz_date: today,
      time_limit_mins: 15,
      passing_percentage: 60,
      status: "published",
      is_leaderboard_enabled: true
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenScheduleFuture = () => {
    setEditingQuizId(null);
    setAllowAlternate(false);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setFormData({
      title: `${activeYear} Daily Challenge – ${tomorrow}`,
      academic_year: activeYear,
      subject: "",
      topic: "",
      description: "Scheduled daily test.",
      difficulty: "Medium",
      quiz_date: tomorrow,
      time_limit_mins: 15,
      passing_percentage: 60,
      status: "scheduled",
      is_leaderboard_enabled: true
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (q: Quiz) => {
    setEditingQuizId(q.id);
    setAllowAlternate(true);
    setFormData({
      title: q.title,
      academic_year: q.academic_year,
      subject: q.subject,
      topic: q.topic || "",
      description: q.description || "",
      difficulty: q.difficulty,
      quiz_date: q.quiz_date,
      time_limit_mins: q.time_limit_mins,
      passing_percentage: q.passing_percentage,
      status: q.status,
      is_leaderboard_enabled: q.is_leaderboard_enabled
    });
    setError(null);
    setShowModal(true);
  };

  const handleCopyYesterday = async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    if (!confirm(`Copy yesterday's (${yesterday}) ${activeYear} daily quiz as today's starting template?`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/daily-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "copy_from_date",
          copyFromDate: yesterday,
          quiz_date: today,
          academic_year: activeYear,
          allowDuplicate: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to copy yesterday's quiz");
      }
      alert(`Success: Copied quiz for ${today}! Edit questions in Quiz Management if needed.`);
      fetchDailyQuizzes();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error copying yesterday's quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDailyQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.subject.trim()) {
      setError("Title and Subject are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingQuizId) {
        // Edit existing
        const res = await fetch(`/api/admin/quizzes/${editingQuizId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            is_daily: true
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update daily quiz");
      } else {
        // Create new daily quiz
        const res = await fetch("/api/admin/daily-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            allowDuplicate: allowAlternate
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create daily quiz");
      }

      setShowModal(false);
      fetchDailyQuizzes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving daily quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete daily quiz "${title}"?`)) return;
    try {
      await fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" });
      fetchDailyQuizzes();
    } catch {
      alert("Failed to delete quiz");
    }
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    const nextStatus = quiz.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchDailyQuizzes();
    } catch {
      alert("Status toggle failed");
    }
  };

  const currentYearDates = grouped[activeYear] || {};
  const sortedDates = Object.keys(currentYearDates).sort((a, b) => b.localeCompare(a));
  const filteredDates = dateFilter ? sortedDates.filter(d => d.includes(dateFilter)) : sortedDates;

  return (
    <div className="space-y-6 text-slate-200 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Daily Quiz System</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Year-Wise + Day-Wise
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organized hierarchy: Academic Year &rarr; Date &rarr; Daily Quiz with duplication guard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyYesterday}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
            title="Clone yesterday's quiz structure into today"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Copy Yesterday&apos;s Quiz</span>
          </button>

          <button
            onClick={handleOpenScheduleFuture}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Schedule Future Quiz</span>
          </button>

          <button
            onClick={handleOpenCreateToday}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Today&apos;s Quiz</span>
          </button>
        </div>
      </div>

      {/* Academic Year Tabs (Requirement 2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
        {ACADEMIC_YEARS.map(year => {
          const isActive = activeYear === year;
          const count = Object.keys(grouped[year] || {}).length;
          return (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/40 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              <span>{year}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-cyan-500/30 text-cyan-200" : "bg-slate-800 text-slate-500"}`}>
                {count} Days
              </span>
            </button>
          );
        })}
      </div>

      {/* Date Search / Filter */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          <span>Hierarchy Tree: <strong className="text-white">{activeYear}</strong> &rarr; Dates &rarr; Daily Challenges</span>
        </div>
        <div className="relative w-full sm:w-64">
          <CalendarIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter by date (YYYY-MM-DD)..."
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Hierarchical Year -> Date -> Quiz View */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
          <span className="text-xs">Loading daily quiz timeline...</span>
        </div>
      ) : filteredDates.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-6">
          <CalendarDays className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-300">No daily quizzes found for {activeYear}</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Click &quot;Create Today&apos;s Quiz&quot; or &quot;Schedule Future Quiz&quot; above to set up daily challenges.</p>
          <button
            onClick={handleOpenCreateToday}
            className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-xs font-bold hover:bg-cyan-400"
          >
            Create First Daily Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDates.map((dateStr) => {
            const dateQuizzes = currentYearDates[dateStr] || [];
            const isToday = dateStr === new Date().toISOString().split("T")[0];
            const isFuture = dateStr > new Date().toISOString().split("T")[0];

            return (
              <div
                key={dateStr}
                className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-md shadow-xl shadow-slate-950/20 space-y-4"
              >
                {/* Date header node */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isToday
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : isFuture
                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">{dateStr}</h3>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950 uppercase tracking-widest">
                            TODAY
                          </span>
                        )}
                        {isFuture && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-950 text-sky-400 border border-sky-800 text-[9px] uppercase tracking-wider">
                            SCHEDULED FUTURE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {dateQuizzes.length} Daily Quiz{dateQuizzes.length !== 1 ? "zes" : ""} registered
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quizzes on this date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dateQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300">
                            {quiz.title}
                          </h4>
                          <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                            {quiz.subject} {quiz.topic ? `• ${quiz.topic}` : ""}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                          quiz.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : quiz.status === "scheduled"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {quiz.status}
                        </span>
                      </div>

                      {quiz.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/40 pt-2.5">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-slate-300">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            {quiz.questions_count ?? 0} Questions
                          </span>
                          <span>• {quiz.time_limit_mins} mins</span>
                          <span>• {quiz.difficulty}</span>
                        </div>

                        <div className="flex items-center gap-1 font-bold text-cyan-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>{(quiz as Quiz & { participation_count?: number }).participation_count ?? 0} attempts</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => handleTogglePublish(quiz)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        >
                          {quiz.status === "published" ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          onClick={() => handleOpenEdit(quiz)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 border border-slate-700"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(quiz.id, quiz.title)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / SCHEDULE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <CalendarIcon className="w-4 h-4" />
              <span>{editingQuizId ? "Edit Daily Quiz" : "Configure Daily Quiz"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveDailyQuiz} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Daily Quiz Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 3rd Year Daily Challenge – Antibiotic Regimens"
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Academic Year</label>
                  <select
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value as AcademicYear })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 cursor-pointer"
                  >
                    {ACADEMIC_YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quiz Date *</label>
                  <input
                    type="date"
                    value={formData.quiz_date}
                    onChange={(e) => setFormData({ ...formData, quiz_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Pharmacology"
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Autonomic Nervous System"
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Limit (mins)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.time_limit_mins}
                    onChange={(e) => setFormData({ ...formData, time_limit_mins: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as QuizStatus })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700"
                  >
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Brief Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical objectives for today..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 resize-none"
                />
              </div>

              {!editingQuizId && (
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowAlternate}
                      onChange={(e) => setAllowAlternate(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-amber-500"
                    />
                    <span>Allow Alternate Quiz if date already has a quiz</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingQuizId ? "Save Changes" : "Save Daily Quiz"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
