"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { getSubjectsByCourseAndYear, createSubject, deleteSubject } from "@/lib/subjects";
import { Subject } from "@/types/supabase";

export default function ManageSubjects() {
  const [course, setCourse] = useState("B Pharm");
  const [yearNumber, setYearNumber] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Determine max years/semesters based on course
  const getMaxYears = (c: string) => {
    const n = c.toLowerCase().replace(/[\s.]/g, "");
    if (n.includes("dpharm")) return 2;
    if (n.includes("bpharm")) return 8;
    if (n.includes("pharmd")) return 6;
    return 6;
  };
  const getPeriodLabel = (c: string) => {
    const n = c.toLowerCase().replace(/[\s.]/g, "");
    return n.includes("bpharm") ? "Semester" : "Year";
  };
  const maxYears = getMaxYears(course);
  const periodLabel = getPeriodLabel(course);

  // Adjust yearNumber if it exceeds the new course's max
  useEffect(() => {
    if (yearNumber > maxYears) {
      setYearNumber(1);
    }
  }, [course, maxYears, yearNumber]);

  // Fetch subjects whenever course or year changes
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getSubjectsByCourseAndYear(course, yearNumber);
      setSubjects(data);
    } catch (err) {
      console.error("Error loading subjects:", err);
      setErrorMessage("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }, [course, yearNumber]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMsg("");
    try {
      const addedName = newSubjectName.trim();
      await createSubject(course, yearNumber, addedName);
      setNewSubjectName("");
      await fetchSubjects();
      setSuccessMsg(`Subject "${addedName}" added successfully.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error adding subject:", err);
      const pgError = err as { code?: string };
      if (pgError.code === "23505") { // unique constraint violation
        setErrorMessage("A subject with this name already exists for this year/semester.");
      } else {
        setErrorMessage("Failed to add subject.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    setErrorMessage(null);
    setSuccessMsg("");
    try {
      await deleteSubject(id);
      await fetchSubjects();
    } catch (err) {
      console.error("Error deleting subject:", err);
      const errorMsg = err instanceof Error ? err.message : "";
      if (errorMsg === "Cannot delete subject with linked notes") {
        setErrorMessage("This subject has notes linked to it. Remove or reassign those notes first.");
      } else {
        setErrorMessage("Failed to delete subject.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Manage Subjects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add or remove subjects for Pharm D, B Pharm, and D Pharm to configure notes filtering and structure.
          </p>
        </div>
      </div>

      {/* Error feedback */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-300 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Action Restricted</p>
            <p className="mt-0.5 text-xs text-red-400">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left selector — 2 cols */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 h-fit">
          <h2 className="text-md font-bold text-white flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Select Stream</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 cursor-pointer"
              >
                <option value="Pharm D" className="bg-slate-900">Pharm D (Doctor of Pharmacy)</option>
                <option value="B Pharm" className="bg-slate-900">B Pharm (Bachelor of Pharmacy)</option>
                <option value="D Pharm" className="bg-slate-900">D Pharm (Diploma in Pharmacy)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {periodLabel}
              </label>
              <select
                value={yearNumber}
                onChange={(e) => setYearNumber(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 cursor-pointer"
              >
                {Array.from({ length: maxYears }, (_, i) => i + 1).map((val) => (
                  <option key={val} value={val} className="bg-slate-900">
                    {periodLabel} {val}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right subjects panel — 3 cols */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-md font-bold text-white mb-6">
            Subjects for {course} — {periodLabel} {yearNumber}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-400">No subjects yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Subjects you add will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6">
              {subjects.map(subject => (
                <div key={subject.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 group">
                  <span className="text-sm text-white">{subject.subject_name}</span>
                  <button onClick={() => handleDeleteSubject(subject.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add subject inline row */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
            <form onSubmit={handleAddSubject} className="flex gap-2 w-full">
              <input
                type="text"
                required
                placeholder="e.g. Pharmacology-I"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={saving || !newSubjectName.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Subject
              </button>
            </form>
          </div>
          {successMsg && (
            <p className="text-sm text-emerald-400 font-medium mt-3 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
