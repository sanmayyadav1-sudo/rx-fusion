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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quiz Questions</h1>
          <p className="text-xs text-slate-500">Manage pharmacy quiz questions, options, and explanations.</p>
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
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-500" />
              <span>{editingId ? "Edit Quiz Question" : "Add Quiz Question"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-xs text-red-650 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Question Text</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question here..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option A</label>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="Option A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option B</label>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Option B"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option C</label>
                  <input
                    type="text"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    placeholder="Option C"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option D</label>
                  <input
                    type="text"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    placeholder="Option D"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correct Option</label>
                  <select
                    value={correctOption}
                    onChange={(e) => setCorrectOption(e.target.value as "A" | "B" | "C" | "D")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded text-cyan-500 focus:ring-cyan-500"
                    />
                    Published
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Explanation</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the option is correct..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Pearl</label>
                <textarea
                  value={clinicalPearl}
                  onChange={(e) => setClinicalPearl(e.target.value)}
                  placeholder="Enter a useful clinical tip related to this question..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-55 hover:text-slate-850"
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
            placeholder="Search quiz questions, explanations, clinical pearls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-450 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <span className="text-xs">Loading quiz questions...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center text-slate-450">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-800">No questions found</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Try widening your search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 w-3/5">Question Details</th>
                  <th className="p-4 w-1/5 text-center">Correct Option</th>
                  <th className="p-4 w-1/10 text-center">Published</th>
                  <th className="p-4 w-1/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-800">{q.question}</div>
                      <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1 font-medium">
                        <span>A: {q.option_a}</span>
                        <span>B: {q.option_b}</span>
                        <span>C: {q.option_c}</span>
                        <span>D: {q.option_d}</span>
                      </div>
                      {q.explanation && (
                        <div className="text-[10px] text-slate-400 mt-1 leading-relaxed italic">
                          Explanation: {q.explanation}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-cyan-650 text-sm">{q.correct_option}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[10px] rounded-md font-bold border ${
                        q.is_published 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-red-50 text-red-650 border-red-150"
                      }`}>
                        {q.is_published ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(q)}
                          className="p-2 hover:bg-cyan-50 rounded-xl text-cyan-650 hover:text-cyan-750 transition-colors"
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
