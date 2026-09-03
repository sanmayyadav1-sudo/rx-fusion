"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Loader2, Search, AlertCircle, X, Check, HelpCircle } from "lucide-react";

interface VivaQuestion {
  id: string;
  question: string;
  answer: string;
  subject: string;
  year: number;
  course: string;
  category: string;
  created_at: string;
}

export default function VivaCrud() {
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Form States (for Create/Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("B Pharm");
  const [year, setYear] = useState(1);
  const [category, setCategory] = useState("General");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("viva_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setQuestions(data as VivaQuestion[]);
    } catch (err) {
      console.error("Error loading viva questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionText.trim()) {
      setError("Please enter a question.");
      return;
    }
    if (!answerText.trim()) {
      setError("Please enter an answer.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        question: questionText.trim(),
        answer: answerText.trim(),
        subject: subject.trim(),
        course,
        year: Number(year),
        category: category.trim() || "General",
      };

      if (editingId) {
        // Edit Mode
        const { error } = await supabase
          .from("viva_questions")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from("viva_questions")
          .insert([payload]);

        if (error) throw error;
      }

      // Reset states
      resetForm();
      fetchQuestions();
    } catch (err: unknown) {
      console.error("Error saving question:", err);
      const msg = err instanceof Error ? err.message : "An error occurred while saving.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (q: VivaQuestion) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setAnswerText(q.answer);
    setSubject(q.subject);
    setCourse(q.course);
    setYear(q.year);
    setCategory(q.category);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const { error } = await supabase
        .from("viva_questions")
        .delete()
        .eq("id", deleteConfirmId);

      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Failed to delete question.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setQuestionText("");
    setAnswerText("");
    setSubject("");
    setCourse("B Pharm");
    setYear(1);
    setCategory("General");
    setShowForm(false);
    setError(null);
  };

  // Filter logic
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = filterCourse === "" || q.course === filterCourse;
    const matchesYear = filterYear === "" || q.year === Number(filterYear);

    return matchesSearch && matchesCourse && matchesYear;
  });

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Viva Questions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage pharmacy oral viva questions, categories, and answers.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/60 text-white rounded-2xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto scrollbar-none">
            <button
              onClick={resetForm}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 rounded-xl text-slate-350 hover:text-white transition-all duration-200 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>{editingId ? "Edit Viva Question" : "Add Viva Question"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-350 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                  >
                    <option value="B Pharm" className="bg-slate-900">B Pharm</option>
                    <option value="M Pharm" className="bg-slate-900">M Pharm</option>
                    <option value="Pharm D" className="bg-slate-900">Pharm D</option>
                    <option value="D Pharm" className="bg-slate-900">D Pharm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Year / Semester</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                  >
                    {Array.from({ length: course === "Pharm D" ? 6 : course === "D Pharm" ? 2 : 8 }).map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-slate-900">
                        {course === "Pharm D" || course === "D Pharm" ? `Year ${i + 1}` : `Semester ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Pharmacology"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Lab, Mechanism, General"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Question</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the viva question..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Answer</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Enter the descriptive correct answer..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Question</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-3 backdrop-blur-md shadow-xl shadow-slate-950/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search questions, subjects, answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Courses</option>
            <option value="B Pharm" className="bg-slate-900">B Pharm</option>
            <option value="Pharm D" className="bg-slate-900">Pharm D</option>
            <option value="D Pharm" className="bg-slate-900">D Pharm</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Years</option>
            <option value="1" className="bg-slate-900">Year/Sem 1</option>
            <option value="2" className="bg-slate-900">Year/Sem 2</option>
            <option value="3" className="bg-slate-900">Year/Sem 3</option>
            <option value="4" className="bg-slate-900">Year/Sem 4</option>
            <option value="5" className="bg-slate-900">Year/Sem 5</option>
            <option value="6" className="bg-slate-900">Year/Sem 6</option>
            <option value="7" className="bg-slate-900">Sem 7</option>
            <option value="8" className="bg-slate-900">Sem 8</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-semibold">Loading viva questions...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/10 border-dashed border border-slate-850/60 rounded-2xl m-6">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-650 mb-2" />
            <p className="text-xs font-bold text-slate-400">No viva questions found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try widening your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                  <th className="p-4 w-1/4">Course & Year</th>
                  <th className="p-4 w-1/5">Subject</th>
                  <th className="p-4 w-2/5">Question / Answer</th>
                  <th className="p-4 w-1/10">Category</th>
                  <th className="p-4 w-1/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/20 transition-colors duration-150 group">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{q.course}</div>
                      <div className="text-[10px] text-cyan-455 font-bold uppercase tracking-wider mt-1">Year/Sem {q.year}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-400">{q.subject}</td>
                    <td className="p-4 space-y-1.5">
                      <div className="font-bold text-slate-200 group-hover:text-cyan-50 transition-colors line-clamp-1">{q.question}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-medium">{q.answer}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-800/60 text-[10px] text-slate-400 border border-slate-700/30 rounded-full font-bold uppercase tracking-wider">
                        {q.category}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(q)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 border border-slate-800 hover:border-cyan-500/20 transition-all duration-150"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(q.id)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-450 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
                          title="Delete"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/60 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Delete Viva Question?</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Are you sure you want to delete this Viva question? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/80 text-slate-350 hover:text-white border border-slate-700/50 hover:border-slate-600 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-200 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
