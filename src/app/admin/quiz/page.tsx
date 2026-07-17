"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Loader2, Search, AlertCircle, X, Check, HelpCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
  clinical_pearl: string | null;
  is_published: boolean;
  created_at: string;
}

export default function QuizCrud() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Form States (for Create/Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [explanation, setExplanation] = useState("");
  const [clinicalPearl, setClinicalPearl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setQuestions(data as QuizQuestion[]);
    } catch (err) {
      console.error("Error loading quiz questions:", err);
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
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError("Please fill out all options.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        question: questionText.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
        correct_option: correctOption,
        explanation: explanation.trim() || null,
        clinical_pearl: clinicalPearl.trim() || null,
        is_published: isPublished,
      };

      if (editingId) {
        // Edit Mode
        const { error } = await supabase
          .from("quiz_questions")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from("quiz_questions")
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

  const handleEditClick = (q: QuizQuestion) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setOptionA(q.option_a);
    setOptionB(q.option_b);
    setOptionC(q.option_c);
    setOptionD(q.option_d);
    setCorrectOption(q.correct_option);
    setExplanation(q.explanation || "");
    setClinicalPearl(q.clinical_pearl || "");
    setIsPublished(q.is_published);
    setShowForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Quiz question?")) return;

    try {
      const { error } = await supabase
        .from("quiz_questions")
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
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setExplanation("");
    setClinicalPearl("");
    setIsPublished(true);
    setShowForm(false);
    setError(null);
  };

  const filteredQuestions = questions.filter((q) => {
    return (
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.clinical_pearl && q.clinical_pearl.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Quiz Questions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage pharmacy quiz questions, options, explanations, and pearls.</p>
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
              <span>{editingId ? "Edit Quiz Question" : "Add Quiz Question"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Question Text</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question here..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Option A</label>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="Option A"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Option B</label>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Option B"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Option C</label>
                  <input
                    type="text"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    placeholder="Option C"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Option D</label>
                  <input
                    type="text"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    placeholder="Option D"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Correct Option</label>
                  <select
                    value={correctOption}
                    onChange={(e) => setCorrectOption(e.target.value as "A" | "B" | "C" | "D")}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                  >
                    <option value="A" className="bg-slate-900">A</option>
                    <option value="B" className="bg-slate-900">B</option>
                    <option value="C" className="bg-slate-900">C</option>
                    <option value="D" className="bg-slate-900">D</option>
                  </select>
                </div>
                <div className="flex items-center pt-2 sm:pt-6">
                  <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 focus:outline-none w-4 h-4 cursor-pointer"
                    />
                    <span>Publish Instantly</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Explanation</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the option is correct..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Clinical Pearl</label>
                <textarea
                  value={clinicalPearl}
                  onChange={(e) => setClinicalPearl(e.target.value)}
                  placeholder="Enter a useful clinical tip related to this question..."
                  rows={2}
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
            placeholder="Search quiz questions, explanations, clinical pearls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
          />
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-semibold">Loading quiz questions...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/10 border-dashed border border-slate-800/60 rounded-2xl m-6">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">No questions found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try widening your search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                  <th className="p-4 w-3/5">Question Details</th>
                  <th className="p-4 w-1/5 text-center">Correct Option</th>
                  <th className="p-4 w-1/10 text-center">Published</th>
                  <th className="p-4 w-1/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/20 transition-colors duration-150 group">
                    <td className="p-4 space-y-2">
                      <div className="font-bold text-slate-200 group-hover:text-cyan-50 transition-colors">{q.question}</div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                        <span><strong className="text-cyan-400">A:</strong> {q.option_a}</span>
                        <span><strong className="text-cyan-400">B:</strong> {q.option_b}</span>
                        <span><strong className="text-cyan-400">C:</strong> {q.option_c}</span>
                        <span><strong className="text-cyan-400">D:</strong> {q.option_d}</span>
                      </div>
                      {q.explanation && (
                        <div className="text-[11px] text-slate-400 italic font-medium pt-1">
                          <span className="font-bold text-slate-300 not-italic">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center font-black text-cyan-400 text-base">{q.correct_option}</td>
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
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
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
