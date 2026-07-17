"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Loader2, Search, AlertCircle, X, Check, HelpCircle } from "lucide-react";

interface QuestionBankItem {
  id: string;
  question: string;
  answer: string | null;
  course: "Pharm D" | "B Pharm" | "D Pharm";
  year: number;
  subject: string;
  topic: string | null;
  question_type: "LAQ" | "SAQ" | "MCQ" | "Short" | "Long";
  marks: number | null;
  is_published: boolean;
  created_at: string;
}

export default function QuestionBankCrud() {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterType, setFilterType] = useState("");

  // Form States (for Create/Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [course, setCourse] = useState<"Pharm D" | "B Pharm" | "D Pharm">("B Pharm");
  const [year, setYear] = useState(1);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questionType, setQuestionType] = useState<"LAQ" | "SAQ" | "MCQ" | "Short" | "Long">("Short");
  const [marks, setMarks] = useState<number | "">("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("question_bank")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setQuestions(data as QuestionBankItem[]);
    } catch (err) {
      console.error("Error loading question bank:", err);
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
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        question: questionText.trim(),
        answer: answerText.trim() || null,
        course,
        year: Number(year),
        subject: subject.trim(),
        topic: topic.trim() || null,
        question_type: questionType,
        marks: marks === "" ? null : Number(marks),
        is_published: isPublished,
      };

      if (editingId) {
        // Edit Mode
        const { error } = await supabase
          .from("question_bank")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from("question_bank")
          .insert([payload]);

        if (error) throw error;
      }

      resetForm();
      fetchQuestions();
    } catch (err: unknown) {
      console.error("Error saving question:", err);
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : err instanceof Error ? err.message : "An error occurred while saving.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (q: QuestionBankItem) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setAnswerText(q.answer || "");
    setCourse(q.course);
    setYear(q.year);
    setSubject(q.subject);
    setTopic(q.topic || "");
    setQuestionType(q.question_type);
    setMarks(q.marks !== null ? q.marks : "");
    setIsPublished(q.is_published);
    setShowForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question from the bank?")) return;

    try {
      const { error } = await supabase
        .from("question_bank")
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
    setCourse("B Pharm");
    setYear(1);
    setSubject("");
    setTopic("");
    setQuestionType("Short");
    setMarks("");
    setIsPublished(true);
    setShowForm(false);
    setError(null);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.answer && q.answer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = filterCourse === "" || q.course === filterCourse;
    const matchesYear = filterYear === "" || q.year === Number(filterYear);
    const matchesType = filterType === "" || q.question_type === filterType;

    return matchesSearch && matchesCourse && matchesYear && matchesType;
  });

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Question Bank</h1>
          <p className="text-sm text-slate-500 mt-1">Manage syllabus-based questions (LAQ, SAQ, MCQ) and model answers.</p>
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
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/60 text-white rounded-2xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto scrollbar-none animate-scale-up">
            <button
              onClick={resetForm}
              className="absolute top-5 right-5 p-2 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white transition-all duration-200 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>{editingId ? "Edit Question Details" : "Add Question Details"}</span>
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
                    onChange={(e) => setCourse(e.target.value as "Pharm D" | "B Pharm" | "D Pharm")}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                  >
                    <option value="B Pharm" className="bg-slate-900">B Pharm</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Pharmaceutics-I"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Tablets"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Question Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as "LAQ" | "SAQ" | "MCQ" | "Short" | "Long")}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                  >
                    <option value="Short" className="bg-slate-900">Short</option>
                    <option value="Long" className="bg-slate-900">Long</option>
                    <option value="LAQ" className="bg-slate-900">LAQ (Long Essay)</option>
                    <option value="SAQ" className="bg-slate-900">SAQ (Short Essay)</option>
                    <option value="MCQ" className="bg-slate-900">MCQ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Marks</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 5, 10"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div className="flex items-center pt-2 sm:pt-6">
                  <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded bg-slate-850 border-slate-700 text-cyan-500 focus:ring-0 focus:outline-none w-4 h-4 cursor-pointer"
                    />
                    <span>Publish Instantly</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Question</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question text..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Answer / Model Points (Optional)</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Enter outline answers or reference points..."
                  rows={4}
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
            placeholder="Search questions, subjects, topics, answers..."
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
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Types</option>
            <option value="Short" className="bg-slate-900">Short</option>
            <option value="Long" className="bg-slate-900">Long</option>
            <option value="LAQ" className="bg-slate-900">LAQ</option>
            <option value="SAQ" className="bg-slate-900">SAQ</option>
            <option value="MCQ" className="bg-slate-900">MCQ</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-semibold">Loading question bank...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/10 border-dashed border border-slate-850/60 rounded-2xl m-6">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-650 mb-2" />
            <p className="text-xs font-bold text-slate-400">No questions found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try widening your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                  <th className="p-4 w-1/4">Course & Subject</th>
                  <th className="p-4 w-2/5">Question / Details</th>
                  <th className="p-4 w-1/10 text-center">Type</th>
                  <th className="p-4 w-1/10 text-center">Marks</th>
                  <th className="p-4 w-1/10 text-center">Published</th>
                  <th className="p-4 w-1/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/20 transition-colors duration-150 group">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{q.course}</div>
                      <div className="text-[11px] text-cyan-455 font-bold mt-0.5">{q.subject}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Year/Sem {q.year}</div>
                    </td>
                    <td className="p-4 space-y-1.5">
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-50 transition-colors">{q.question}</div>
                      {q.topic && (
                        <div className="inline-flex text-[9px] bg-slate-800/60 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/30 font-bold uppercase tracking-wider">
                          Topic: {q.topic}
                        </div>
                      )}
                      {q.answer && (
                        <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                          <span className="font-bold text-slate-350">Key:</span> {q.answer}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-cyan-500/10 text-[10px] text-cyan-400 border border-cyan-500/20 rounded-full font-bold uppercase tracking-wider">
                        {q.question_type}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-300">{q.marks !== null ? `${q.marks}M` : "-"}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        q.is_published 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-slate-800/60 text-slate-400 border-slate-700/30"
                      }`}>
                        {q.is_published ? "Yes" : "No"}
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
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-455 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
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
