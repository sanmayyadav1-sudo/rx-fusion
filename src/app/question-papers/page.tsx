"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Search, 
  BookOpen, 
  CalendarDays, 
  Download, 
  Eye, 
  MapPin, 
  FileDown
} from "lucide-react";

interface QuestionPaper {
  id: string;
  title: string;
  university: string;
  course: string;
  year: number;
  subject: string;
  exam_year: number;
  exam_type: string;
  file_url: string;
}

export default function QuestionPapersPage() {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedExamYear, setSelectedExamYear] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("question_papers")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      setPapers((data as QuestionPaper[]) || []);
    } catch (err) {
      console.error("Error loading question papers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique filters options
  const universities = useMemo(() => {
    return Array.from(new Set(papers.map((p) => p.university))).sort();
  }, [papers]);

  const courses = useMemo(() => {
    return Array.from(new Set(papers.map((p) => p.course))).sort();
  }, [papers]);

  const examYears = useMemo(() => {
    return Array.from(new Set(papers.map((p) => String(p.exam_year)))).sort((a, b) => Number(b) - Number(a));
  }, [papers]);

  const examTypes = useMemo(() => {
    return Array.from(new Set(papers.map((p) => p.exam_type))).sort();
  }, [papers]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.university.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUniversity = selectedUniversity === "" || p.university === selectedUniversity;
      const matchesCourse = selectedCourse === "" || p.course === selectedCourse;
      const matchesYear = selectedYear === "" || p.year === Number(selectedYear);
      const matchesExamYear = selectedExamYear === "" || String(p.exam_year) === selectedExamYear;
      const matchesType = selectedType === "" || p.exam_type === selectedType;

      return matchesSearch && matchesUniversity && matchesCourse && matchesYear && matchesExamYear && matchesType;
    });
  }, [papers, searchQuery, selectedUniversity, selectedCourse, selectedYear, selectedExamYear, selectedType]);

  const maxYearOptions = selectedCourse === "Pharm D" ? 6 : selectedCourse === "D Pharm" ? 2 : 4;
  const periodLabel = selectedCourse === "B Pharm" ? "Semester" : "Year";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <main className="flex-grow pt-20 sm:pt-28 pb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[380px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-15%] w-[45%] aspect-square rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute bottom-[5%] right-[-10%] w-[35%] aspect-square rounded-full bg-sky-500/5 blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <header className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-bold text-cyan-650 uppercase tracking-widest">
              <FileDown className="w-3.5 h-3.5" />
              <span>PYQs Exam Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Previous Year Question Papers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Download board and university question papers for Pharm.D, B.Pharm, and D.Pharm.
            </p>
          </header>

          {/* Filter Bar */}
          <section className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search by paper title, subject, or university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">University</label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Boards</option>
                  {universities.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => { setSelectedCourse(e.target.value); setSelectedYear(""); }}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">{periodLabel}</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: maxYearOptions }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{periodLabel} {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Exam Year</label>
                <select
                  value={selectedExamYear}
                  onChange={(e) => setSelectedExamYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Years</option>
                  {examYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Types</option>
                  {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-200/60 h-44 rounded-3xl" />
              ))}
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="py-20 text-center bg-white border border-slate-200/60 rounded-3xl shadow-3xs">
              <FileText className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No question papers found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Adjust your selectors or check back later. We add previous papers regularly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPapers.map((paper) => (
                <div 
                  key={paper.id}
                  className="bg-white border border-slate-200/60 hover:border-cyan-300 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-cyan-50 text-cyan-600 border border-cyan-100 px-2 py-0.5 rounded-md">
                        {paper.course}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        Exam Year: {paper.exam_year}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-cyan-600 transition-colors">
                      {paper.title}
                    </h3>

                    <div className="space-y-1.5 pt-2 text-[11px] text-slate-500 font-semibold border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{paper.university}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Subject: {paper.subject}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{paper.course === "B Pharm" ? "Semester" : "Year"} {paper.year} • {paper.exam_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-50">
                    <a
                      href={paper.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 hover:text-slate-900 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-550" />
                      <span>View</span>
                    </a>
                    <a
                      href={paper.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-500 hover:bg-cyan-650 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 shadow-sm active:translate-y-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
