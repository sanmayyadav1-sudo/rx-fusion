"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Trash2, Loader2, UploadCloud, Download, AlertCircle, CheckCircle2, Search, X } from "lucide-react";
import Link from "next/link";
import { getSubjectsByCourseAndYear } from "@/lib/subjects";
import { Subject } from "@/types/supabase";

interface Note {
  id: string;
  title: string;
  description: string;
  course: string;
  semester: number;
  subject: string;
  subject_id: string | null;
  file_url: string;
  category_id: string;
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function NotesCrud() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("B Pharm");
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectsForForm, setSubjectsForForm] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, []);

  useEffect(() => {
    async function loadFormSubjects() {
      setLoadingSubjects(true);
      setSubjectsForForm([]);
      setSubjectId("");
      setSubject("");
      try {
        const data = await getSubjectsByCourseAndYear(course, semester);
        setSubjectsForForm(data);
        if (data.length > 0) {
          setSubjectId(data[0].id);
          setSubject(data[0].subject_name);
        } else {
          setSubjectId("");
          setSubject("");
        }
      } catch (err) {
        console.error("Error loading subjects for note form:", err);
      } finally {
        setLoadingSubjects(false);
      }
    }
    loadFormSubjects();
  }, [course, semester]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setNotes(data as Note[]);
    } catch (err) {
      console.error("Error loading notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("type", "notes");

      if (error) throw error;

      let updatedData = data || [];

      // Check if "Authorize" and "Non Authorize" exist
      const hasAuthorize = updatedData.some(c => c.name.toLowerCase() === "authorize");
      const hasNonAuthorize = updatedData.some(c => c.name.toLowerCase() === "non-authorize" || c.name.toLowerCase() === "non authorize");

      if (!hasAuthorize || !hasNonAuthorize) {
        const toInsert = [];
        if (!hasAuthorize) {
          toInsert.push({ name: "Authorize", slug: "authorize", type: "notes" });
        }
        if (!hasNonAuthorize) {
          toInsert.push({ name: "Non Authorize", slug: "non-authorize", type: "notes" });
        }

        const { data: inserted, error: insertError } = await supabase
          .from("categories")
          .insert(toInsert)
          .select("id, name");

        if (!insertError && inserted) {
          updatedData = [...updatedData, ...inserted];
        } else if (insertError) {
          console.warn("Could not auto-seed default categories:", insertError.message);
        }
      }

      setCategories(updatedData as Category[]);
      if (updatedData.length > 0) {
        const defaultCat = updatedData.find(c => c.name.toLowerCase() === "authorize") || updatedData[0];
        setCategoryId(defaultCat.id);
      }
    } catch (err) {
      console.error("Error categories load:", err);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const MAX_SIZE_MB = 20;

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg("");

    if (!file || !title.trim() || !subjectId) {
      setError("Please specify a file and fill all fields (make sure a subject is selected).");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, PPT, PPTX, DOC, DOCX files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSaving(true);
    try {
      // 1. Upload File to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const sanitizedCourse = course.replace(/\s+/g, "_");
      const storagePath = `${sanitizedCourse}/sem_${semester}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Fetch Public Url for Note
      const { data: { publicUrl } } = supabase.storage
        .from("notes")
        .getPublicUrl(storagePath);

      // 3. Save details to database
      const { error: dbError } = await supabase
        .from("notes")
        .insert([{
          title,
          description,
          course,
          semester: Number(semester),
          subject,
          subject_id: subjectId || null,
          file_url: publicUrl,
          category_id: categoryId || null
        }]);

      if (dbError) throw dbError;

      // Success Reset
      setTitle("");
      setDescription("");
      setSubject("");
      setSubjectId("");
      setFile(null);
      setShowAddForm(false);
      fetchNotes();
      setSuccessMsg("Note uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred during file upload.";
      console.error(err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this lecture note?")) return;

    try {
      // Attempt storage cleanup first (non-blocking)
      try {
        const url = new URL(fileUrl);
        const pathMatch = url.pathname.match(/\/notes\/(.+)$/);
        if (pathMatch?.[1]) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          const { error: storageError } = await supabase.storage
            .from("notes")
            .remove([storagePath]);
          if (storageError) {
            console.warn("Storage cleanup failed:", storageError.message);
          }
        }
      } catch (e) {
        console.warn("Could not parse storage path from URL:", fileUrl, e);
      }

      // Always delete the DB record regardless of storage result
      const { error: dbError } = await supabase
        .from("notes")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setNotes(notes.filter((n) => n.id !== id));
    } catch {
      setError("Failed to delete note.");
    }
  };

  // Derive available subjects from currently course+semester filtered notes
  const availableSubjects = useMemo(() => {
    const subset = notes.filter(note => {
      const courseMatch = filterCourse === "all" || note.course === filterCourse;
      const semMatch = filterSemester === "all" ||
        String(note.semester) === filterSemester;
      return courseMatch && semMatch;
    });
    const subjects = subset
      .map(n => n.subject)
      .filter(Boolean) as string[];
    return subjects.filter((val, index, self) => self.indexOf(val) === index).sort();
  }, [notes, filterCourse, filterSemester]);

  // Final filtered notes — all 4 filters applied simultaneously
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const courseMatch = filterCourse === "all" || note.course === filterCourse;
      const semMatch = filterSemester === "all" ||
        String(note.semester) === filterSemester;
      const subjectMatch = filterSubject === "all" ||
        note.subject === filterSubject;
      const searchMatch = searchQuery.trim() === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase());
      return courseMatch && semMatch && subjectMatch && searchMatch;
    });
  }, [notes, filterCourse, filterSemester, filterSubject, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Notes Repository
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload, delete, and structure syllabus notes for B Pharm, Pharm D, and D Pharm.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Hide Form" : "Upload Note"}</span>
        </button>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-sm text-red-300 animate-fade-in max-w-3xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-sm text-emerald-400 animate-fade-in max-w-3xl">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Note Form */}
      {showAddForm && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 max-w-3xl animate-fade-in">
          <h2 className="text-md font-bold text-white mb-6">
            Upload New Lecture Material
          </h2>

          <form onSubmit={handleUploadAndSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                  placeholder="e.g. Pharmaceutics-I Lecture 3"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                >
                  <option value="Pharm D">Pharm D (Doctor of Pharmacy)</option>
                  <option value="B Pharm">B Pharm (Bachelor of Pharmacy)</option>
                  <option value="D Pharm">D Pharm (Diploma in Pharmacy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Semester / Year
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={course === "Pharm D" ? 6 : course === "D Pharm" ? 2 : 8}
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                {loadingSubjects ? (
                  <div className="flex items-center space-x-2 py-2.5 px-4 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading subjects...</span>
                  </div>
                ) : subjectsForForm.length === 0 ? (
                  <div className="py-2.5 px-4 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300">
                    No subjects for this year yet —{" "}
                    <Link href="/admin/subjects" className="font-bold underline text-cyan-400 hover:text-cyan-300">
                      add them in Manage Subjects
                    </Link>
                  </div>
                ) : (
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSubjectId(selectedId);
                      const selectedObj = subjectsForForm.find(s => s.id === selectedId);
                      if (selectedObj) {
                        setSubject(selectedObj.subject_name);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                  >
                    {subjectsForForm.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subject_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  PDF / PPT / DOCX File
                </label>
                <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-slate-700 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 group">
                  <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors mb-2" />
                  <span className="text-sm text-slate-500 group-hover:text-slate-300">
                    {file ? file.name : "Click to select file"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    required
                    accept=".pdf,.ppt,.pptx,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 resize-none"
                placeholder="Include lecture outlines, core drug structures, or reference links..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading file...</span>
                </>
              ) : (
                <span>Upload to Repository</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Filter Bar (Course → Semester → Subject) */}
      <div className="flex flex-wrap items-center gap-3 mb-6">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
            text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes by title..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
              bg-slate-800/60 border border-slate-700/60 text-white
              placeholder:text-slate-500 focus:outline-none
              focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10
              transition-all duration-200"
          />
        </div>

        {/* Course filter */}
        <select
          value={filterCourse}
          onChange={(e) => {
            setFilterCourse(e.target.value);
            setFilterSemester("all");
            setFilterSubject("all");
          }}
          className="px-3 py-2.5 rounded-xl text-sm bg-slate-800/60
            border border-slate-700/60 text-white focus:outline-none
            focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10
            transition-all duration-200 cursor-pointer"
        >
          <option value="all">All Courses</option>
          <option value="Pharm D">Pharm D</option>
          <option value="B Pharm">B Pharm</option>
          <option value="D Pharm">D Pharm</option>
        </select>

        {/* Semester/Year filter — dynamic based on selected course */}
        <select
          value={filterSemester}
          onChange={(e) => {
            setFilterSemester(e.target.value);
            setFilterSubject("all");
          }}
          disabled={filterCourse === "all"}
          className="px-3 py-2.5 rounded-xl text-sm bg-slate-800/60
            border border-slate-700/60 text-white focus:outline-none
            focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10
            transition-all duration-200 cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="all">All Years</option>
          {filterCourse === "Pharm D" &&
            [1,2,3,4,5,6].map(n => (
              <option key={n} value={String(n)}>Year {n}</option>
            ))
          }
          {filterCourse === "B Pharm" &&
            [1,2,3,4,5,6,7,8].map(n => (
              <option key={n} value={String(n)}>Semester {n}</option>
            ))
          }
          {filterCourse === "D Pharm" &&
            [1,2].map(n => (
              <option key={n} value={String(n)}>Year {n}</option>
            ))
          }
        </select>

        {/* Subject filter — derived from filtered notes */}
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          disabled={filterSemester === "all"}
          className="px-3 py-2.5 rounded-xl text-sm bg-slate-800/60
            border border-slate-700/60 text-white focus:outline-none
            focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10
            transition-all duration-200 cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="all">All Subjects</option>
          {availableSubjects.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        {/* Active filter count badge + Clear button */}
        {(filterCourse !== "all" || filterSemester !== "all" ||
          filterSubject !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setFilterCourse("all");
              setFilterSemester("all");
              setFilterSubject("all");
              setSearchQuery("");
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm
              font-medium text-red-400 bg-red-500/10 border border-red-500/20
              hover:bg-red-500/20 transition-all duration-200 whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}

        {/* Results count */}
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-auto">
          {filteredNotes.length} of {notes.length} notes
        </span>
      </div>

      {/* Active filter pills */}
      {(filterCourse !== "all" || filterSemester !== "all" || filterSubject !== "all") && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-500">Showing:</span>
          {filterCourse !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
              text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {filterCourse}
              <button onClick={() => {
                setFilterCourse("all");
                setFilterSemester("all");
                setFilterSubject("all");
              }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterSemester !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
              text-xs font-semibold bg-violet-500/10 text-violet-400
              border border-violet-500/20">
              {filterCourse === "B Pharm" ? "Sem" : "Year"} {filterSemester}
              <button onClick={() => {
                setFilterSemester("all");
                setFilterSubject("all");
              }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterSubject !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
              text-xs font-semibold bg-emerald-500/10 text-emerald-400
              border border-emerald-500/20">
              {filterSubject}
              <button onClick={() => setFilterSubject("all")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Notes Table list */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">No notes yet</p>
            <p className="text-xs text-slate-600 mt-1">
              Notes you upload will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Title", "Course & Sem", "Subject", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-4 first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors duration-150 group">
                    {/* Title cell */}
                    <td className="py-3.5 px-4 first:pl-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-sm font-semibold text-white group-hover:text-cyan-50 transition-colors line-clamp-1">
                          {note.title}
                        </span>
                      </div>
                    </td>
                    {/* Course badge — single line, no wrap */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                        {note.course} · Sem {note.semester}
                      </span>
                    </td>
                    {/* Subject */}
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-slate-400">{note.subject || "—"}</span>
                    </td>
                    {/* Actions — bigger tap targets */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <a href={note.file_url} target="_blank" rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 transition-all duration-150"
                          title="Download">
                          <Download className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDeleteNote(note.id, note.file_url)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all duration-150"
                          title="Delete">
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
