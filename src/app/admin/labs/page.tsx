"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Loader2, Search, AlertCircle, X, Check, BookOpen } from "lucide-react";

interface LabManual {
  id: string;
  title: string;
  experiment_number: string;
  aim: string;
  requirements: string;
  principle: string;
  procedure: string;
  observations: string;
  calculations: string;
  results: string;
  subject: string;
  year: number;
  course: string;
  category: string;
  file_url: string;
  created_at: string;
}

export default function LabManualsCrud() {
  const [labs, setLabs] = useState<LabManual[]>([]);
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
  const [title, setTitle] = useState("");
  const [experimentNumber, setExperimentNumber] = useState("");
  const [aim, setAim] = useState("");
  const [requirements, setRequirements] = useState("");
  const [principle, setPrinciple] = useState("");
  const [procedure, setProcedure] = useState("");
  const [observations, setObservations] = useState("");
  const [calculations, setCalculations] = useState("");
  const [results, setResults] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("B Pharm");
  const [year, setYear] = useState(1);
  const [category, setCategory] = useState("General");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lab_manuals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setLabs(data as LabManual[]);
    } catch (err) {
      console.error("Error loading lab manuals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLab = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter an experiment title.");
      return;
    }
    if (!aim.trim()) {
      setError("Please enter an aim.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        experiment_number: experimentNumber.trim() || null,
        aim: aim.trim(),
        requirements: requirements.trim() || null,
        principle: principle.trim() || null,
        procedure: procedure.trim() || null,
        observations: observations.trim() || null,
        calculations: calculations.trim() || null,
        results: results.trim() || null,
        subject: subject.trim(),
        course,
        year: Number(year),
        category: category.trim() || "General",
        file_url: fileUrl.trim() || null,
      };

      if (editingId) {
        // Edit Mode
        const { error } = await supabase
          .from("lab_manuals")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from("lab_manuals")
          .insert([payload]);

        if (error) throw error;
      }

      // Reset states
      resetForm();
      fetchLabs();
    } catch (err: unknown) {
      console.error("Error saving lab manual:", err);
      const msg = err instanceof Error ? err.message : "An error occurred while saving.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (lab: LabManual) => {
    setEditingId(lab.id);
    setTitle(lab.title);
    setExperimentNumber(lab.experiment_number || "");
    setAim(lab.aim);
    setRequirements(lab.requirements || "");
    setPrinciple(lab.principle || "");
    setProcedure(lab.procedure || "");
    setObservations(lab.observations || "");
    setCalculations(lab.calculations || "");
    setResults(lab.results || "");
    setSubject(lab.subject);
    setCourse(lab.course);
    setYear(lab.year);
    setCategory(lab.category);
    setFileUrl(lab.file_url || "");
    setShowForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lab manual?")) return;

    try {
      const { error } = await supabase
        .from("lab_manuals")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchLabs();
    } catch (err) {
      console.error("Error deleting lab manual:", err);
      alert("Failed to delete lab manual.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setExperimentNumber("");
    setAim("");
    setRequirements("");
    setPrinciple("");
    setProcedure("");
    setObservations("");
    setCalculations("");
    setResults("");
    setSubject("");
    setCourse("B Pharm");
    setYear(1);
    setCategory("General");
    setFileUrl("");
    setShowForm(false);
    setError(null);
  };

  // Filter logic
  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.aim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lab.experiment_number && lab.experiment_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = filterCourse === "" || lab.course === filterCourse;
    const matchesYear = filterYear === "" || lab.year === Number(filterYear);

    return matchesSearch && matchesCourse && matchesYear;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Laboratory Manuals</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage pharmacy laboratory experiments, theories, and procedures.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experiment</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto scrollbar-none">
            <button
              onClick={resetForm}
              className="absolute top-5 right-5 p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>{editingId ? "Edit Experiment Manual" : "Add Experiment Manual"}</span>
            </h3>

            {error && (
              <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveLab} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Pharmaceutics"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Experiment No.</label>
                  <input
                    type="text"
                    value={experimentNumber}
                    onChange={(e) => setExperimentNumber(e.target.value)}
                    placeholder="e.g. Experiment 1"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Chemistry, Formulations"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Manual PDF Link (URL)</label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="e.g. https://storage.com/manual.pdf"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Experiment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Preparation of Simple Syrup IP"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Aim</label>
                <textarea
                  value={aim}
                  onChange={(e) => setAim(e.target.value)}
                  placeholder="State the objective/aim of the experiment..."
                  rows={2}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Apparatus, Glassware, Chemicals needed..."
                  rows={2}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Principle / Theory</label>
                <textarea
                  value={principle}
                  onChange={(e) => setPrinciple(e.target.value)}
                  placeholder="Chemical reactions, calculations basis, or theory..."
                  rows={3}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Procedure</label>
                <textarea
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  placeholder="Step-by-step experiment execution steps..."
                  rows={3}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Observations</label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observation tables, data..."
                    rows={2}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Calculations</label>
                  <textarea
                    value={calculations}
                    onChange={(e) => setCalculations(e.target.value)}
                    placeholder="Factor calculations, formulas..."
                    rows={2}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Results</label>
                  <textarea
                    value={results}
                    onChange={(e) => setResults(e.target.value)}
                    placeholder="Experiment result statement..."
                    rows={2}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-500"
                  />
                </div>
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
                      <span>Save Experiment</span>
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
            placeholder="Search experiments, aims, subjects..."
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
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-medium">Loading laboratory manuals...</span>
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-200">No experiments found</p>
            <p className="text-[11px] text-slate-500 mt-1">Add manuals or adjust filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-1/5">Course & Year</th>
                  <th className="p-4 w-1/5">Subject</th>
                  <th className="p-4 w-2/5">Experiment details</th>
                  <th className="p-4 w-1/10">Category</th>
                  <th className="p-4 w-1/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLabs.map((lab) => (
                  <tr key={lab.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{lab.course}</div>
                      <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Year/Sem {lab.year}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-300">{lab.subject}</td>
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-100 line-clamp-1">
                        {lab.experiment_number ? `${lab.experiment_number}: ` : ""}{lab.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        <strong className="text-slate-300">Aim:</strong> {lab.aim}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-800 text-[10px] text-slate-300 rounded-md font-bold border border-slate-700/80">
                        {lab.category}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(lab)}
                          className="p-2 hover:bg-cyan-950/60 rounded-xl text-cyan-400 hover:text-cyan-300 border border-transparent hover:border-cyan-800/50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(lab.id)}
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
