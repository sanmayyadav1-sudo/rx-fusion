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

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Viva question?")) return;

    try {
      const { error } = await supabase
        .from("viva_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Failed to delete question.");
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Viva Questions</h1>
          <p className="text-xs text-slate-500">Manage pharmacy oral viva questions and answers.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-500" />
              <span>{editingId ? "Edit Viva Question" : "Add Viva Question"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-xs text-red-650 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-850 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="B Pharm">B Pharm</option>
                    <option value="Pharm D">Pharm D</option>
                    <option value="D Pharm">D Pharm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Year / Semester</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  >
                    {Array.from({ length: course === "Pharm D" ? 6 : course === "D Pharm" ? 2 : 8 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{course === "Pharm D" || course === "D Pharm" ? `Year ${i + 1}` : `Semester ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Pharmacology"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Lab, Mechanism, General"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Question</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the viva question..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Answer</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Enter the descriptive correct answer..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold disabled:bg-cyan-300"
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
      <div className="bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search questions, subjects, answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-650 focus:outline-none"
          >
            <option value="">All Courses</option>
            <option value="B Pharm">B Pharm</option>
            <option value="Pharm D">Pharm D</option>
            <option value="D Pharm">D Pharm</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-650 focus:outline-none"
          >
            <option value="">All Years</option>
            <option value="1">Year/Sem 1</option>
            <option value="2">Year/Sem 2</option>
            <option value="3">Year/Sem 3</option>
            <option value="4">Year/Sem 4</option>
            <option value="5">Year/Sem 5</option>
            <option value="6">Year/Sem 6</option>
            <option value="7">Sem 7</option>
            <option value="8">Sem 8</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-450 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <span className="text-xs">Loading viva questions...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center text-slate-450">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-800">No questions found</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Try widening your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 w-1/4">Course & Year</th>
                  <th className="p-4 w-1/5">Subject</th>
                  <th className="p-4 w-2/5">Question / Answer</th>
                  <th className="p-4 w-1/10">Category</th>
                  <th className="p-4 w-1/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{q.course}</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Year/Sem {q.year}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{q.subject}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 line-clamp-1">{q.question}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{q.answer}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 rounded-md font-bold border border-slate-200/50">
                        {q.category}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(q)}
                          className="p-2 hover:bg-cyan-50 rounded-xl text-cyan-650 hover:text-cyan-700 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(q.id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-650 hover:text-red-700 transition-colors"
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
    </div>
  );
}
