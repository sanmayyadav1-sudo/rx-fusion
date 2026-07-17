"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Loader2, Search, AlertCircle, X, Check, HelpCircle, FileText } from "lucide-react";

interface QuestionPaper {
  id: string;
  title: string;
  university: string;
  course: "Pharm D" | "B Pharm" | "D Pharm";
  year: number;
  subject: string;
  exam_year: number;
  exam_type: "Regular" | "Supplementary" | "Model" | "Internal";
  file_url: string;
  is_published: boolean;
  created_at: string;
}

export default function QuestionPapersCrud() {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
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
  const [title, setTitle] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState<"Pharm D" | "B Pharm" | "D Pharm">("B Pharm");
  const [year, setYear] = useState(1);
  const [subject, setSubject] = useState("");
  const [examYear, setExamYear] = useState<number | "">(new Date().getFullYear());
  const [examType, setExamType] = useState<"Regular" | "Supplementary" | "Model" | "Internal">("Regular");
  const [fileUrl, setFileUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("question_papers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setPapers(data as QuestionPaper[]);
    } catch (err) {
      console.error("Error loading question papers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!university.trim()) {
      setError("Please enter a university / board name.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!fileUrl.trim()) {
      setError("Please enter a file URL (PDF).");
      return;
    }
    if (examYear === "") {
      setError("Please enter the exam year.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        university: university.trim(),
        course,
        year: Number(year),
        subject: subject.trim(),
        exam_year: Number(examYear),
        exam_type: examType,
        file_url: fileUrl.trim(),
        is_published: isPublished,
      };

      if (editingId) {
        // Edit Mode
        const { error } = await supabase
          .from("question_papers")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from("question_papers")
          .insert([payload]);

        if (error) throw error;
      }

      resetForm();
      fetchPapers();
    } catch (err: unknown) {
      console.error("Error saving paper:", err);
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : err instanceof Error ? err.message : "An error occurred while saving.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (p: QuestionPaper) => {
    setEditingId(p.id);
    setTitle(p.title);
    setUniversity(p.university);
    setCourse(p.course);
    setYear(p.year);
    setSubject(p.subject);
    setExamYear(p.exam_year);
    setExamType(p.exam_type);
    setFileUrl(p.file_url);
    setIsPublished(p.is_published);
    setShowForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question paper?")) return;

    try {
      const { error } = await supabase
        .from("question_papers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchPapers();
    } catch (err) {
      console.error("Error deleting paper:", err);
      alert("Failed to delete paper.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setUniversity("");
    setCourse("B Pharm");
    setYear(1);
    setSubject("");
    setExamYear(new Date().getFullYear());
    setExamType("Regular");
    setFileUrl("");
    setIsPublished(true);
    setShowForm(false);
    setError(null);
  };

  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.university.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = filterCourse === "" || p.course === filterCourse;
    const matchesYear = filterYear === "" || p.year === Number(filterYear);
    const matchesType = filterType === "" || p.exam_type === filterType;

    return matchesSearch && matchesCourse && matchesYear && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Question Papers</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage syllabus PYQs (Previous Year Papers) and PDF links.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Paper</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto scrollbar-none">
            <button
              onClick={resetForm}
              className="absolute top-5 right-5 p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>{editingId ? "Edit Paper Details" : "Add Paper Details"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSavePaper} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pharmacology-II RGUHS 2024 Regular"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value as "Pharm D" | "B Pharm" | "D Pharm")}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="B Pharm" className="bg-slate-900">B Pharm</option>
                    <option value="Pharm D" className="bg-slate-900">Pharm D</option>
                    <option value="D Pharm" className="bg-slate-900">D Pharm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Year / Semester</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {Array.from({ length: course === "Pharm D" ? 6 : course === "D Pharm" ? 2 : 8 }).map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-slate-900">
                        {course === "Pharm D" || course === "D Pharm" ? `Year ${i + 1}` : `Semester ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Pharmacology-II"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">University / Board</label>
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. RGUHS University"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Exam Year</label>
                  <input
                    type="number"
                    required
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 2024"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as "Regular" | "Supplementary" | "Model" | "Internal")}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Regular" className="bg-slate-900">Regular</option>
                    <option value="Supplementary" className="bg-slate-900">Supplementary</option>
                    <option value="Model" className="bg-slate-900">Model</option>
                    <option value="Internal" className="bg-slate-900">Internal</option>
                  </select>
                </div>
                <div className="flex items-center pt-2 sm:pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500/20 w-4 h-4"
                    />
                    Published
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">File URL (PDF Link)</label>
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/papers/filename.pdf"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-md shadow-cyan-500/20 transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Paper</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-3 backdrop-blur-md shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search papers, subjects, universities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Courses</option>
            <option value="B Pharm" className="bg-slate-900">B Pharm</option>
            <option value="Pharm D" className="bg-slate-900">Pharm D</option>
            <option value="D Pharm" className="bg-slate-900">D Pharm</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
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
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Types</option>
            <option value="Regular" className="bg-slate-900">Regular</option>
            <option value="Supplementary" className="bg-slate-900">Supplementary</option>
            <option value="Model" className="bg-slate-900">Model</option>
            <option value="Internal" className="bg-slate-900">Internal</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-medium">Loading question papers...</span>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-200">No papers found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try widening your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-1/4">Course & Type</th>
                  <th className="p-4 w-2/5">Paper Details</th>
                  <th className="p-4 w-1/5">University / Year</th>
                  <th className="p-4 w-1/10 text-center">Published</th>
                  <th className="p-4 w-1/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPapers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{p.course}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Year/Sem {p.year}</div>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 bg-cyan-950/60 text-[9px] text-cyan-400 border border-cyan-800/50 rounded font-extrabold">
                          {p.exam_type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-100">{p.title}</div>
                      <div className="text-[11px] text-cyan-400 font-medium">{p.subject}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{p.file_url}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{p.university}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Exam Year: {p.exam_year}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[10px] rounded-md font-extrabold border ${
                        p.is_published 
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60" 
                          : "bg-red-950/60 text-red-400 border-red-800/60"
                      }`}>
                        {p.is_published ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 hover:bg-cyan-950/60 rounded-xl text-cyan-400 hover:text-cyan-300 border border-transparent hover:border-cyan-800/50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p.id)}
                          className="p-2 hover:bg-red-950/60 rounded-xl text-red-400 hover:text-red-300 border border-transparent hover:border-red-800/50 transition-colors"
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
