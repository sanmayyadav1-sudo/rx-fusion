"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Loader2, Search, AlertCircle, X, Check, HelpCircle, FileText, ExternalLink } from "lucide-react";

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Question Papers</h1>
          <p className="text-xs text-slate-500">Manage syllabus PYQs (Previous Year Papers) and PDF links.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Paper</span>
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
              <FileText className="w-4 h-4 text-cyan-500" />
              <span>{editingId ? "Edit Paper Details" : "Add Paper Details"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-xs text-red-655 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSavePaper} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pharmacology-II RGUHS 2024 Regular"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value as "Pharm D" | "B Pharm" | "D Pharm")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
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
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Pharmacology-II"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">University / Board</label>
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. RGUHS University"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Exam Year</label>
                  <input
                    type="number"
                    required
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 2024"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as "Regular" | "Supplementary" | "Model" | "Internal")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Supplementary">Supplementary</option>
                    <option value="Model">Model</option>
                    <option value="Internal">Internal</option>
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">File URL (PDF Link)</label>
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/papers/filename.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-855 focus:outline-none focus:border-cyan-500 font-mono"
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
      <div className="bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search papers, subjects, universities..."
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
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-650 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="Regular">Regular</option>
            <option value="Supplementary">Supplementary</option>
            <option value="Model">Model</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-450 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <span className="text-xs">Loading question papers...</span>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="py-20 text-center text-slate-450">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-800">No papers found</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Try widening your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 w-1/4">Course & Type</th>
                  <th className="p-4 w-2/5">Paper Details</th>
                  <th className="p-4 w-1/5">University / Year</th>
                  <th className="p-4 w-1/10 text-center">Published</th>
                  <th className="p-4 w-1/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPapers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{p.course}</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{p.exam_type}</div>
                      <div className="text-[9px] text-slate-450 mt-0.5">Year/Sem {p.year}</div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-800">{p.title}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{p.subject}</div>
                      <a
                        href={p.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-cyan-650 hover:underline font-mono"
                      >
                        <span>PDF link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">{p.university}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Exam Year: {p.exam_year}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[10px] rounded-md font-bold border ${
                        p.is_published 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-red-50 text-red-650 border-red-150"
                      }`}>
                        {p.is_published ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 hover:bg-cyan-55 rounded-xl text-cyan-650 hover:text-cyan-750 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p.id)}
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
