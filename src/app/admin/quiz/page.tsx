"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  Eye, 
  Clock, 
  Loader2, 
  Search, 
  AlertCircle, 
  X, 
  Check, 
  HelpCircle,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Quiz, QuizQuestion, AcademicYear, ACADEMIC_YEARS, QuizStatus, DifficultyLevel, CorrectOption } from "@/types/quiz";

export default function QuizManagementPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quiz Modal (Create / Edit)
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    academic_year: "1st Year" as AcademicYear,
    subject: "",
    topic: "",
    description: "",
    difficulty: "Medium" as DifficultyLevel,
    quiz_date: new Date().toISOString().split("T")[0],
    time_limit_mins: 15,
    passing_percentage: 50,
    status: "draft" as QuizStatus,
    is_daily: false,
    is_leaderboard_enabled: true,
    allow_multiple_attempts: false
  });

  // Question Management Modal
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A" as CorrectOption,
    explanation: "",
    clinical_pearl: "",
    image_url: "",
    marks: 1,
    difficulty: "Medium" as DifficultyLevel
  });

  // Preview Modal
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/quizzes");
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to load quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Open Quiz Modal
  const handleOpenCreateQuiz = () => {
    setEditingQuizId(null);
    setQuizForm({
      title: "",
      academic_year: (selectedYear !== "all" ? selectedYear : "1st Year") as AcademicYear,
      subject: "",
      topic: "",
      description: "",
      difficulty: "Medium",
      quiz_date: new Date().toISOString().split("T")[0],
      time_limit_mins: 15,
      passing_percentage: 50,
      status: "draft",
      is_daily: false,
      is_leaderboard_enabled: true,
      allow_multiple_attempts: false
    });
    setError(null);
    setShowQuizModal(true);
  };

  const handleOpenEditQuiz = (q: Quiz) => {
    setEditingQuizId(q.id);
    setQuizForm({
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
      is_daily: q.is_daily,
      is_leaderboard_enabled: q.is_leaderboard_enabled,
      allow_multiple_attempts: q.allow_multiple_attempts
    });
    setError(null);
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!quizForm.title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }
    if (!quizForm.subject.trim()) {
      setError("Please specify the pharmacy subject.");
      return;
    }

    setSaving(true);
    try {
      const url = editingQuizId ? `/api/admin/quizzes/${editingQuizId}` : "/api/admin/quizzes";
      const method = editingQuizId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save quiz");
      }

      setShowQuizModal(false);
      fetchQuizzes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving quiz";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" and all its questions?`)) return;
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchQuizzes();
    } catch {
      alert("Failed to delete quiz.");
    }
  };

  const handleDuplicateQuiz = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/quizzes/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Duplicate failed");
      fetchQuizzes();
    } catch {
      alert("Failed to duplicate quiz.");
    }
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    const newStatus: QuizStatus = quiz.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update publish state");
        return;
      }
      fetchQuizzes();
    } catch {
      alert("Error toggling publish status.");
    }
  };

  // -----------------------------------------------------------------
  // Questions Management Sub-flow
  // -----------------------------------------------------------------
  const handleOpenQuestions = async (quiz: Quiz) => {
    setActiveQuizForQuestions(quiz);
    setLoadingQuestions(true);
    setShowQuestionForm(false);
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}/questions`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      explanation: "",
      clinical_pearl: "",
      image_url: "",
      marks: 1,
      difficulty: "Medium"
    });
    setShowQuestionForm(true);
  };

  const handleOpenEditQuestion = (q: QuizQuestion) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation || "",
      clinical_pearl: q.clinical_pearl || "",
      image_url: q.image_url || "",
      marks: q.marks ?? 1,
      difficulty: q.difficulty || "Medium"
    });
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizForQuestions) return;

    if (!questionForm.question.trim()) {
      alert("Question text is required.");
      return;
    }
    if (!questionForm.option_a.trim() || !questionForm.option_b.trim() || !questionForm.option_c.trim() || !questionForm.option_d.trim()) {
      alert("All 4 options (A, B, C, D) are required.");
      return;
    }
    if (!["A", "B", "C", "D"].includes(questionForm.correct_option)) {
      alert("Please select exactly one valid correct answer.");
      return;
    }

    setSaving(true);
    try {
      const url = `/api/admin/quizzes/${activeQuizForQuestions.id}/questions`;
      const method = editingQuestionId ? "PUT" : "POST";
      const payload = editingQuestionId
        ? { id: editingQuestionId, ...questionForm }
        : questionForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save question failed");

      setShowQuestionForm(false);
      // Refresh questions
      const qRes = await fetch(`/api/admin/quizzes/${activeQuizForQuestions.id}/questions`);
      const qData = await qRes.json();
      setQuestions(qData.questions || []);
      fetchQuizzes();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving question");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!activeQuizForQuestions) return;
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/quizzes/${activeQuizForQuestions.id}/questions?questionId=${questionId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete question failed");
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      fetchQuizzes();
    } catch {
      alert("Failed to delete question.");
    }
  };

  const handleMoveQuestion = async (index: number, direction: "up" | "down") => {
    if (!activeQuizForQuestions) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const copy = [...questions];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setQuestions(copy);

    try {
      await fetch(`/api/admin/quizzes/${activeQuizForQuestions.id}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: copy.map(q => q.id)
        })
      });
    } catch {
      // Ignore
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    if (selectedYear !== "all" && q.academic_year !== selectedYear) return false;
    if (selectedStatus !== "all" && q.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      const match =
        q.title.toLowerCase().includes(s) ||
        q.subject.toLowerCase().includes(s) ||
        (q.topic && q.topic.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Year-Wise Quiz Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              1st – 5th Year
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, schedule, configure, and reorder pharmacy examination modules and quizzes.
          </p>
        </div>

        <button
          onClick={handleOpenCreateQuiz}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-3 backdrop-blur-md shadow-xl shadow-slate-950/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, subject, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all"
          />
        </div>

        {/* Academic Year Selector */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0 hidden sm:block" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
          >
            <option value="all">All Academic Years</option>
            {ACADEMIC_YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-semibold">Loading academic quizzes...</span>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/10 border-dashed border border-slate-800/60 rounded-2xl m-6">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">No quizzes found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try changing filters or create a new quiz for this academic year.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                  <th className="p-4">Quiz Title & Topic</th>
                  <th className="p-4 text-center">Year</th>
                  <th className="p-4 text-center">Questions</th>
                  <th className="p-4 text-center">Time / Pass</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-800/20 transition-colors duration-150 group">
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                          {quiz.title}
                        </span>
                        {quiz.is_daily && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            Daily Quiz
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span className="text-cyan-400 font-semibold">{quiz.subject}</span>
                        {quiz.topic && <span>• {quiz.topic}</span>}
                        <span>• Date: {quiz.quiz_date}</span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-800/80 text-cyan-400 border border-slate-700/60">
                        {quiz.academic_year}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenQuestions(quiz)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold transition-all text-xs"
                        title="Manage Questions"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{quiz.questions_count ?? 0} Qs</span>
                      </button>
                    </td>

                    <td className="p-4 text-center text-[11px] text-slate-400 space-y-0.5">
                      <div>{quiz.time_limit_mins > 0 ? `${quiz.time_limit_mins} mins` : "Untimed"}</div>
                      <div className="text-slate-500 font-medium">Pass: {quiz.passing_percentage}%</div>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(quiz)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider transition-all ${
                          quiz.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : quiz.status === "scheduled"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20"
                            : quiz.status === "closed"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-slate-800/60 text-slate-400 border-slate-700/40 hover:bg-slate-800"
                        }`}
                        title="Click to toggle Draft / Published"
                      >
                        {quiz.status === "published" && <Check className="w-3 h-3" />}
                        {quiz.status === "scheduled" && <Clock className="w-3 h-3" />}
                        <span>{quiz.status}</span>
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/admin/quizzes/${quiz.id}`);
                              if (res.ok) {
                                const data = await res.json();
                                if (data.quiz) setPreviewQuiz(data.quiz);
                              }
                            } catch {
                              alert("Unable to load preview.");
                            }
                          }}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-sky-500/10 hover:text-sky-400 text-slate-400 border border-slate-800 hover:border-sky-500/20 transition-all"
                          title="Preview Quiz"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDuplicateQuiz(quiz.id)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-violet-500/10 hover:text-violet-400 text-slate-400 border border-slate-800 hover:border-violet-500/20 transition-all"
                          title="Duplicate Quiz"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditQuiz(quiz)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 border border-slate-800 hover:border-cyan-500/20 transition-all"
                          title="Edit Quiz Settings"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT QUIZ MODAL */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowQuizModal(false)}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>{editingQuizId ? "Edit Quiz Specification" : "Create New Year-Wise Quiz"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quiz Title</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  placeholder="e.g., Pharmacokinetics & Therapeutic Drug Monitoring"
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Academic Year</label>
                  <select
                    value={quizForm.academic_year}
                    onChange={(e) => setQuizForm({ ...quizForm, academic_year: e.target.value as AcademicYear })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    {ACADEMIC_YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={quizForm.subject}
                    onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                    placeholder="e.g., Pharmacology-II"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Topic / Sub-category</label>
                  <input
                    type="text"
                    value={quizForm.topic}
                    onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                    placeholder="e.g., Clearance & Half-life"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Difficulty</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value as DifficultyLevel })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description / Learning Objectives</label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  placeholder="Outline key learning objectives for students taking this quiz..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quiz Date</label>
                  <input
                    type="date"
                    value={quizForm.quiz_date}
                    onChange={(e) => setQuizForm({ ...quizForm, quiz_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Time Limit (mins)</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={quizForm.time_limit_mins}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit_mins: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Passing Threshold (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quizForm.passing_percentage}
                    onChange={(e) => setQuizForm({ ...quizForm, passing_percentage: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                  <select
                    value={quizForm.status}
                    onChange={(e) => setQuizForm({ ...quizForm, status: e.target.value as QuizStatus })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Live for Students)</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="closed">Closed (No submissions)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 sm:pt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={quizForm.is_daily}
                      onChange={(e) => setQuizForm({ ...quizForm, is_daily: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                    <span>Mark as Daily Quiz</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={quizForm.is_leaderboard_enabled}
                      onChange={(e) => setQuizForm({ ...quizForm, is_leaderboard_enabled: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                    <span>Enable Public Leaderboard</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={quizForm.allow_multiple_attempts}
                      onChange={(e) => setQuizForm({ ...quizForm, allow_multiple_attempts: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                    <span>Allow Retakes (Multiple Attempts)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingQuizId ? "Update Quiz" : "Create Quiz"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTIONS MANAGEMENT MODAL */}
      {activeQuizForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-4xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveQuizForQuestions(null)}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                {activeQuizForQuestions.academic_year} • {activeQuizForQuestions.subject}
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Questions for: {activeQuizForQuestions.title}
              </h2>
            </div>

            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-slate-400">
                Total Questions: <strong className="text-white">{questions.length}</strong>
              </p>
              {!showQuestionForm && (
                <button
                  onClick={handleOpenAddQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              )}
            </div>

            {/* Inline Question Add/Edit Form */}
            {showQuestionForm && (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 mb-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <h4 className="text-xs font-bold text-cyan-300">
                    {editingQuestionId ? "Edit Question" : "Add New Question"}
                  </h4>
                  <button onClick={() => setShowQuestionForm(false)} className="text-slate-400 hover:text-white text-xs">
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveQuestion} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Question Text *
                    </label>
                    <textarea
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                      placeholder="Enter pharmacy question..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Option A *</label>
                      <input
                        type="text"
                        value={questionForm.option_a}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Option B *</label>
                      <input
                        type="text"
                        value={questionForm.option_b}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Option C *</label>
                      <input
                        type="text"
                        value={questionForm.option_c}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Option D *</label>
                      <input
                        type="text"
                        value={questionForm.option_d}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                        Correct Answer (Exactly One) *
                      </label>
                      <select
                        value={questionForm.correct_option}
                        onChange={(e) => setQuestionForm({ ...questionForm, correct_option: e.target.value as CorrectOption })}
                        className="w-full px-3 py-2 rounded-lg text-xs text-emerald-300 font-bold bg-slate-900 border border-emerald-500/40 cursor-pointer"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Marks</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={questionForm.marks}
                        onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Difficulty</label>
                      <select
                        value={questionForm.difficulty}
                        onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value as DifficultyLevel })}
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Explanation</label>
                    <textarea
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                      placeholder="Explanation revealed to students after quiz submission..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clinical Pearl</label>
                      <input
                        type="text"
                        value={questionForm.clinical_pearl}
                        onChange={(e) => setQuestionForm({ ...questionForm, clinical_pearl: e.target.value })}
                        placeholder="Key memory hook or clinical tip..."
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Optional Diagram/Image URL</label>
                      <input
                        type="text"
                        value={questionForm.image_url}
                        onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-slate-900 border border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      {saving ? "Saving..." : editingQuestionId ? "Update Question" : "Add to Quiz"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Questions List */}
            {loadingQuestions ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
                <span className="text-xs">Loading questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-dashed border-slate-700 text-slate-400">
                <p className="text-xs font-bold">No questions added to this quiz yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Click &quot;Add Question&quot; above to populate this examination.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row justify-between gap-3 group hover:border-slate-600 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-black border border-cyan-800/50">
                          Q{idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white">{q.question}</h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
                        <span className={q.correct_option === "A" ? "text-emerald-400 font-bold" : "text-slate-400"}>
                          A: {q.option_a}
                        </span>
                        <span className={q.correct_option === "B" ? "text-emerald-400 font-bold" : "text-slate-400"}>
                          B: {q.option_b}
                        </span>
                        <span className={q.correct_option === "C" ? "text-emerald-400 font-bold" : "text-slate-400"}>
                          C: {q.option_c}
                        </span>
                        <span className={q.correct_option === "D" ? "text-emerald-400 font-bold" : "text-slate-400"}>
                          D: {q.option_d}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-3 pt-1">
                        <span className="text-emerald-400 font-bold">Correct: {q.correct_option}</span>
                        <span>• Marks: {q.marks ?? 1}</span>
                        <span>• {q.difficulty}</span>
                        {q.explanation && <span className="italic truncate max-w-xs">• {q.explanation}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:self-center">
                      <button
                        onClick={() => handleMoveQuestion(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(idx, "down")}
                        disabled={idx === questions.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 ml-1"
                        title="Edit Question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewQuiz(null)}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                Student Examination Preview Mode
              </span>
              <h2 className="text-lg font-bold text-white">{previewQuiz.title}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {previewQuiz.academic_year} • {previewQuiz.subject} • Passing: {previewQuiz.passing_percentage}% • {previewQuiz.time_limit_mins} mins
              </p>
            </div>

            <div className="space-y-4">
              {(previewQuiz.questions || []).map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300">Question {idx + 1} of {(previewQuiz.questions || []).length}</span>
                    <span className="text-slate-400 text-[10px]">{q.marks ?? 1} Mark(s)</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{q.question}</p>

                  <div className="space-y-1.5 pt-1">
                    {[
                      { key: "A", val: q.option_a },
                      { key: "B", val: q.option_b },
                      { key: "C", val: q.option_c },
                      { key: "D", val: q.option_d }
                    ].map(opt => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                          opt.key === q.correct_option
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold"
                            : "bg-slate-800/30 border-slate-700/40 text-slate-300"
                        }`}
                      >
                        <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black bg-slate-700">
                          {opt.key}
                        </span>
                        <span>{opt.val}</span>
                        {opt.key === q.correct_option && (
                          <span className="ml-auto text-[10px] uppercase font-bold text-emerald-400">Correct Answer</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 bg-slate-900/60 rounded-lg text-[11px] text-slate-400 mt-2">
                      <strong className="text-slate-300">Explanation: </strong>
                      {q.explanation}
                    </div>
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
