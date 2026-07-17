"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  BookOpen, 
  Search, 
  GraduationCap, 
  CalendarDays, 
  ChevronRight, 
  FlaskConical,
  Download
} from "lucide-react";
import Link from "next/link";
import BookmarkButton from "@/components/BookmarkButton";

interface LabManual {
  id: string;
  title: string;
  experiment_number: string;
  aim: string;
  subject: string;
  year: number;
  course: string;
  category: string;
  file_url: string;
  created_at: string;
}

export default function LabsClient() {
  const [labs, setLabs] = useState<LabManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");

  useEffect(() => {
    async function fetchLabs() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("lab_manuals")
          .select("id, title, experiment_number, aim, subject, year, course, category, file_url, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setLabs(data as LabManual[]);
      } catch (err) {
        console.error("Error loading lab manuals:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLabs();
  }, []);

  // Filtered Lab Manuals
  const filteredLabs = useMemo(() => {
    return labs.filter((lab) => {
      const matchesSearch = 
        lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.aim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lab.experiment_number && lab.experiment_number.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCourse = selectedCourse === "" || lab.course === selectedCourse;
      const matchesYear = selectedYear === "" || lab.year === Number(selectedYear);

      return matchesSearch && matchesCourse && matchesYear;
    });
  }, [labs, searchQuery, selectedCourse, selectedYear]);

  // Determine period options
  const maxYearOptions = useMemo(() => {
    if (selectedCourse === "Pharm D") return 6;
    if (selectedCourse === "D Pharm") return 2;
    if (selectedCourse === "B Pharm") return 8; // semesters
    return 8;
  }, [selectedCourse]);

  const getPeriodLabel = (courseName: string) => {
    return courseName === "Pharm D" || courseName === "D Pharm" ? "Year" : "Semester";
  };

  return (
    <div className="pt-20 sm:pt-28 pb-16 min-h-screen bg-slate-50/70 relative">
      {/* Background Graphic decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[380px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-15%] w-[45%] aspect-square rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[-10%] w-[35%] aspect-square rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Title Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-bold text-cyan-650 uppercase tracking-widest">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Practical Laboratory Manuals</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Laboratory Manuals Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
            Prepare for your laboratory sessions with chemical formulas, procedures, aims, observations, and calculations.
          </p>
        </header>

        {/* Toolbar (Search & Filters) */}
        <section className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4 mb-8">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by experiment number, aim, chemical, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider mb-1.5 ml-1">Filter Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setSelectedYear(""); }}
                className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Courses</option>
                <option value="B Pharm">B.Pharm</option>
                <option value="Pharm D">Pharm.D</option>
                <option value="D Pharm">D.Pharm</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider mb-1.5 ml-1">Filter Year/Sem</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Periods</option>
                {Array.from({ length: maxYearOptions }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getPeriodLabel(selectedCourse || "B Pharm")} {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider mb-1.5 ml-1">Total Experiments</label>
              <div className="w-full bg-slate-50 border border-slate-200/40 rounded-xl p-2.5 text-xs text-slate-500 font-bold text-center sm:text-left">
                {filteredLabs.length} Experiment{filteredLabs.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </section>

        {/* Labs Listing */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-200/60 p-6 rounded-2xl space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200/60 rounded-3xl shadow-3xs">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No experiments match your selection</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              Try adjusting your course, period, or typing fewer search query keywords.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLabs.map((lab) => (
              <div 
                key={lab.id}
                className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:border-cyan-300 transition-all duration-200 shadow-2xs group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 gap-4"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  {/* Meta Tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {lab.experiment_number && (
                      <span className="bg-cyan-550 text-white text-[9px] font-black px-2 py-0.5 rounded border border-cyan-500 shadow-sm">
                        {lab.experiment_number}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                      <GraduationCap className="w-3 h-3 text-cyan-600" />
                      {lab.course}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                      <CalendarDays className="w-3 h-3 text-cyan-600" />
                      {getPeriodLabel(lab.course)} {lab.year}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded text-[9px] font-extrabold text-cyan-600 uppercase tracking-wide">
                      <BookOpen className="w-3 h-3" />
                      {lab.subject}
                    </span>
                  </div>

                  {/* Title & Aim */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-850 leading-relaxed pr-2">
                    {lab.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    <strong>Aim:</strong> {lab.aim}
                  </p>
                </div>

                {/* Actions (Bookmark + View) */}
                <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                  <BookmarkButton 
                    contentType="labs"
                    contentId={lab.id}
                    showText={false}
                    className="p-2.5 rounded-xl border border-slate-200"
                  />
                  
                  {lab.file_url && (
                    <a
                      href={lab.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-550 hover:text-cyan-600 hover:bg-slate-50 transition-colors"
                      title="Download Manual PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <Link
                    href={`/labs/${lab.id}`}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
                  >
                    <span>View Theory</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
