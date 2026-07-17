"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Search, BookOpen, FileText, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Note {
  id: string;
  title: string;
  course: string;
  semester: number;
  subject: string;
}

interface NotesPageProps {
  pharmDCount?: number;
  bPharmCount?: number;
  dPharmCount?: number;
}

export default function NotesPage({
  pharmDCount = 0,
  bPharmCount = 0,
  dPharmCount = 0,
}: NotesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllNotes() {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("id, title, course, semester, subject")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setNotes(data as Note[]);
      } catch (err) {
        console.error("Error fetching notes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllNotes();
  }, []);

  const courses = [
    {
      name: "Pharm D",
      fullName: "Doctor of Pharmacy",
      duration: "6 Years (Annual System)",
      description: "Access academic material, reference sheets, clinical records, and pharmaceutical logs for Doctor of Pharmacy.",
      accent: "cyan",
      textColor: "text-cyan-600",
      borderColor: "hover:border-cyan-300",
      notesCount: pharmDCount,
    },
    {
      name: "B Pharm",
      fullName: "Bachelor of Pharmacy",
      duration: "8 Semesters (4 Years)",
      description: "Access notes for chemistry, pharmacology, pharmacognosy, pharmaceutics, and jurisprudence.",
      accent: "violet",
      textColor: "text-violet-600",
      borderColor: "hover:border-violet-300",
      notesCount: bPharmCount,
    },
    {
      name: "D Pharm",
      fullName: "Diploma in Pharmacy",
      duration: "2 Years",
      description: "Quick reference logs, basic pharmaceutics notes, first-aid guides, and pharmaceutical math details.",
      accent: "emerald",
      textColor: "text-emerald-600",
      borderColor: "hover:border-emerald-300",
      notesCount: dPharmCount,
    },
  ];

  // Filter notes by query
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.subject.toLowerCase().includes(query) ||
      note.course.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 pt-20 sm:pt-24 bg-slate-50">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] aspect-square rounded-full bg-cyan-500/5 blur-[80px]" />
      </div>

      <div className="space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="relative text-center py-8 mb-4 overflow-hidden">
          {/* Eyebrow label */}
          <div className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-100 rounded-full px-3.5 py-1 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-bold text-cyan-600 tracking-wide uppercase">
              Free Study Material
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Pharmacy Lecture Notes
          </h1>
          <p className="text-slate-550 text-sm sm:text-base max-w-xl mx-auto leading-relaxed px-2">
            Select your course stream below to browse notes organized by year and subject.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-lg mx-auto mb-8 px-2">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes by title, subject, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 transition-all duration-200 shadow-xs"
          />
        </div>

        {/* Search Results vs Courses Selection */}
        {searchQuery ? (
          <div className="space-y-6 px-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-850">
              Search Results ({filteredNotes.length})
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">No notes matched your search query. Try another keyword.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-5 bg-white border border-slate-200/60 rounded-2xl flex flex-col justify-between hover:border-cyan-300 transition-colors shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full border border-cyan-100">
                          {note.course}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Sem {note.semester}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-2 line-clamp-1">
                        {note.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        Subject: {note.subject}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <Link
                        href={`/notes/${encodeURIComponent(note.course)}`}
                        className="flex items-center space-x-1 text-xs font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                      >
                        <span>Access Material</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Courses Grid selection */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch px-2">
            {courses.map((course) => {
              const streamStyles: Record<string, { icon: React.ReactNode }> = {
                "Pharm D": {
                  icon: <GraduationCap className="w-6 h-6 text-cyan-500" />
                },
                "B Pharm": {
                  icon: <BookOpen className="w-6 h-6 text-violet-500" />
                },
                "D Pharm": {
                  icon: <FileText className="w-6 h-6 text-emerald-500" />
                }
              };
              const style = streamStyles[course.name] || {
                icon: <GraduationCap className="w-6 h-6 text-cyan-500" />
              };
              
              return (
                <Link
                  key={course.name}
                  href={`/notes/${encodeURIComponent(course.name)}`}
                  className={`group relative flex flex-col p-6 rounded-2xl bg-white border border-slate-200/60 ${course.borderColor} hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-slate-100 transition-colors duration-200`}>
                    {style.icon}
                  </div>

                  {/* Course name */}
                  <h2 className="text-lg font-bold text-slate-800 mb-0.5 transition-colors duration-200">
                    {course.name}
                  </h2>

                  {/* Full name subtitle */}
                  <p className="text-xs font-semibold text-slate-500 mb-3">{course.fullName}</p>

                  {/* Duration badge */}
                  <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-650 border border-slate-200/40 mb-4">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </span>

                  {/* Count badge */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.notesCount ?? 0} notes available</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
                    {course.description}
                  </p>

                  {/* Footer row — divider + CTA */}
                  <div className="border-t border-slate-100 pt-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${course.textColor} transition-colors duration-200`}>
                        View Semester Folders
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/40 flex items-center justify-center group-hover:bg-slate-200 transition-all duration-200">
                        <ArrowRight className={`w-3.5 h-3.5 ${course.textColor} transition-colors duration-200`} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
