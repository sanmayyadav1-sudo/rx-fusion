"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Search, 
  FolderOpen, 
  Calendar, 
  BookOpen, 
  Eye, 
  CalendarDays, 
  X, 
  ChevronRight 
} from "lucide-react";
import Link from "next/link";
import WhatsappPopup from "../../../components/whatsapp-popup";
import BookmarkButton from "../../../components/BookmarkButton";
import { useAuth } from "@/context/AuthContext";

// Skeleton card component
const NoteCardSkeleton = () => (
  <div className="animate-pulse flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
    <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
    <div className="w-24 h-8 bg-slate-100 rounded-lg" />
  </div>
);

interface Note {
  id: string;
  title: string;
  course: string;
  semester: number;
  subject: string;
  description: string;
  file_url: string;
  created_at: string;
  subjects: {
    subject_name: string;
  } | null;
}

export default function CourseNotesPage() {
  const params = useParams();
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  
  const rawCourse = params.course ? decodeURIComponent(params.course as string) : "";
  const course = ["Pharm D", "B Pharm", "D Pharm"].includes(rawCourse) ? rawCourse : "B Pharm";
  
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handlePreviewClick = (note: Note) => {
    if (authLoading) return;
    if (!profile) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    router.push(`/notes/view/${note.id}`);
  };

  // Download actions state
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  
  // Determine label naming conventions based on course type
  const isAnnual = course === "Pharm D" || course === "D Pharm";
  const periodLabel = isAnnual ? "Year" : "Semester";
  const periodCount = course === "Pharm D" ? 6 : course === "D Pharm" ? 2 : 8;

  useEffect(() => {
    async function fetchCourseNotes() {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*, subjects(subject_name)")
          .eq("course", course)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setAllNotes(data as Note[]);
      } catch (err) {
        console.error("Error fetching course notes:", err);
      } finally {
        setLoading(false);
      }
    }

    if (course) {
      setLoading(true);
      fetchCourseNotes();
    }
  }, [course]);

  // Derived available subjects from notes dynamically
  const availableSubjects = useMemo(() => {
    const subset = allNotes.filter(note => {
      if (selectedYear === null) return true;
      return String(note.semester) === String(selectedYear);
    });
    const subjects = subset
      .map(n => n.subject)
      .filter(Boolean) as string[];
    return subjects.filter((val, index, self) => self.indexOf(val) === index).sort();
  }, [allNotes, selectedYear]);

  // Reset subject filter when selectedYear changes
  useEffect(() => {
    setSelectedSubject(null);
  }, [selectedYear]);

  // Final filtered notes
  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => {
      const yearMatch = selectedYear === null ||
        String(note.semester) === String(selectedYear);
      const subjectMatch = selectedSubject === null ||
        note.subject === selectedSubject;
      const searchMatch = searchQuery.trim() === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return yearMatch && subjectMatch && searchMatch;
    });
  }, [allNotes, selectedYear, selectedSubject, searchQuery]);



  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="relative rounded-2xl p-6 overflow-hidden bg-white border border-slate-200/60 shadow-xs">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-4">
            <Link href="/notes" className="hover:text-cyan-500 transition-colors uppercase tracking-wider">All Courses</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-650 uppercase tracking-wider">{course}</span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{course} Study Folder</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Curriculum resources for {course} students
                </p>
              </div>
            </div>

            {/* Stats chips */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-center min-w-20">
                <div className="text-lg font-bold text-cyan-600">{allNotes.length}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Total Notes</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-center min-w-20">
                <div className="text-lg font-bold text-emerald-600">{periodCount}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Study {periodLabel}s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Secure Document Access Grid */}

        {/* Filters and List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Period & Subject Selectors Sidebar */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-cyan-500" />
                <span>Filter by {periodLabel}</span>
              </h3>

              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => setSelectedYear(null)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                    selectedYear === null
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  All {periodLabel}s
                </button>

                {Array.from({ length: periodCount }, (_, i) => i + 1).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedYear(period)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                      selectedYear === period
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    {periodLabel} {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Subject */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-bold text-slate-900">Filter by Subject</span>
              </div>

              <button
                onClick={() => setSelectedSubject(null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold
                  transition-all duration-150
                  ${selectedSubject === null
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 hover:text-slate-800"
                  }`}
              >
                All Subjects
              </button>

              {availableSubjects.length === 0 ? (
                <div className="flex flex-col items-center py-4 px-2 text-center mt-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {selectedYear === null
                      ? "No subjects added yet"
                      : `No subjects for Year ${selectedYear} yet`}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {availableSubjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold
                        transition-all duration-150
                        ${selectedSubject === subject
                          ? "bg-cyan-500 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search and Materials list */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search inside ${course} notes...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 placeholder:text-slate-450 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 transition-all duration-200 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {selectedSubject && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-500 font-semibold">Filtered by:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                  text-xs font-semibold bg-cyan-50 text-cyan-600 border border-cyan-150">
                  <BookOpen className="w-3.5 h-3.5" />
                  {selectedSubject}
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="ml-1 hover:text-cyan-800 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
                <span className="text-xs text-slate-500">
                  — {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Notes List grid */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <NoteCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-2xl w-full bg-white">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  No notes found
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {selectedSubject
                    ? `No notes found for "${selectedSubject}"${selectedYear ? ` in Year ${selectedYear}` : ""}.`
                    : "No notes match your current filters."
                  }
                </p>
                {(selectedSubject || selectedYear) && (
                  <button
                    onClick={() => { setSelectedSubject(null); setSelectedYear(null); }}
                    className="mt-4 text-xs font-bold text-cyan-600 hover:text-cyan-500 underline transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : selectedYear === null ? (
              // Grouped view
              (() => {
                const groupedNotes = filteredNotes.reduce((acc, note) => {
                  const year = note.semester ?? "Other";
                  if (!acc[year]) acc[year] = [];
                  acc[year].push(note);
                  return acc;
                }, {} as Record<string | number, typeof filteredNotes>);

                const sortedYears = Object.keys(groupedNotes)
                  .sort((a, b) => Number(a) - Number(b));

                return (
                  <div className="space-y-6 px-1">
                    {sortedYears.map((year) => (
                      <div key={year} className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2 bg-slate-100/50 border border-slate-200/40 rounded-lg px-3 py-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-cyan-600" />
                            <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
                              {periodLabel} {year}
                            </span>
                          </div>
                          <div className="flex-1 h-px bg-slate-200/50" />
                          <span className="text-xs text-slate-500 font-semibold">
                            {groupedNotes[year].length} note{groupedNotes[year].length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {groupedNotes[year].map((note) => (
                            <div
                              key={note.id}
                              className="group relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200/60 bg-white hover:border-cyan-300 transition-all duration-200 shadow-xs"
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              
                              <div className="min-w-0 flex items-start space-x-3.5">
                                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-100 transition-colors duration-200 border border-cyan-100/30">
                                  <FileText className="w-5 h-5 text-cyan-500" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">
                                      {periodLabel} {note.semester}
                                    </span>
                                    <span className="text-xs text-slate-500 truncate">
                                      {note.subjects?.subject_name || note.subject}
                                    </span>
                                  </div>
                                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-1.5">
                                    {note.title}
                                  </h3>
                                  {note.description && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                      {note.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                                <BookmarkButton
                                  contentType="notes"
                                  contentId={note.id}
                                  showText={false}
                                  className="p-2.5 rounded-xl shrink-0"
                                />
                                <button
                                  onClick={() => handlePreviewClick(note)}
                                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:translate-y-0.5"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Preview</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              // Flat view
              <div className="space-y-3 px-1">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="group relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200/60 bg-white hover:border-cyan-300 transition-all duration-200 shadow-xs"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    
                    <div className="min-w-0 flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-100 transition-colors duration-200 border border-cyan-100/30">
                        <FileText className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">
                            {periodLabel} {note.semester}
                          </span>
                          <span className="text-xs text-slate-500 truncate">
                            {note.subjects?.subject_name || note.subject}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-1.5">
                          {note.title}
                        </h3>
                        {note.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {note.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                      <BookmarkButton
                        contentType="notes"
                        contentId={note.id}
                        showText={false}
                        className="p-2.5 rounded-xl shrink-0"
                      />
                      <button
                        onClick={() => handlePreviewClick(note)}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:translate-y-0.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* NotePreviewModal has been removed in favor of the controlled in-site viewer */}

      <WhatsappPopup
        isOpen={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        profile={profile}
      />
    </div>
  );
}
