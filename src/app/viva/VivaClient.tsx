"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  GraduationCap, 
  CalendarDays, 
  ChevronDown, 
  ChevronUp
} from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";

interface VivaQuestion {
  id: string;
  question: string;
  answer: string;
  subject: string;
  year: number;
  course: string;
  category: string;
  created_at: string;
}

export default function VivaClient() {
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");

  // Track expanded answers (accordion state)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchVivaQuestions() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("viva_questions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setQuestions(data as VivaQuestion[]);
      } catch (err) {
        console.error("Error loading viva questions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVivaQuestions();
  }, []);

  const toggleAnswer = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };


  // Filtered Viva Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourse = selectedCourse === "" || q.course === selectedCourse;
      const matchesYear = selectedYear === "" || q.year === Number(selectedYear);

      return matchesSearch && matchesCourse && matchesYear;
    });
  }, [questions, searchQuery, selectedCourse, selectedYear]);

  // Determine period count based on course
  const maxYearOptions = useMemo(() => {
    if (selectedCourse === "Pharm D") return 6;
    if (selectedCourse === "D Pharm") return 2;
    if (selectedCourse === "B Pharm") return 8; // semesters
    return 8; // fallback
  }, [selectedCourse]);

  const getPeriodLabel = (courseName: string) => {
    return courseName === "Pharm D" || courseName === "D Pharm" ? "Year" : "Semester";
  };

  return (
    <div className="pt-20 sm:pt-28 pb-16 min-h-screen bg-slate-50/70 relative">
      {/* Background Graphic decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[380px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-15%] w-[45%] aspect-square rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[35%] aspect-square rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Title Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-bold text-cyan-650 uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Oral Exams Companion</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Pharmacy Viva Q&amp;A Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
            Master your laboratory and clinical viva examinations with syllabus-aligned oral questions and correct explanations.
          </p>
        </header>

        {/* Toolbar (Search & Filters) */}
        <section className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4 mb-8">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by topic, drug name, question keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Filter Course</label>
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
              <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Filter Year/Sem</label>
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
              <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Total Found</label>
              <div className="w-full bg-slate-50 border border-slate-200/40 rounded-xl p-2.5 text-xs text-slate-500 font-bold text-center sm:text-left">
                {filteredQuestions.length} Question{filteredQuestions.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </section>

        {/* Questions Listing */}
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
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200/60 rounded-3xl shadow-3xs">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No questions match your selection</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              Try adjusting your course, period, or typing fewer search query keywords.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isExpanded = !!expandedIds[q.id];
              return (
                <div 
                  key={q.id}
                  className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:border-cyan-300 transition-all duration-200 shadow-2xs group"
                >
                  {/* Card Header row */}
                  <div className="p-5 sm:p-6 flex justify-between items-start gap-4">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                          <GraduationCap className="w-3 h-3 text-cyan-600" />
                          {q.course}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                          <CalendarDays className="w-3 h-3 text-cyan-600" />
                          {getPeriodLabel(q.course)} {q.year}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded text-[9px] font-extrabold text-cyan-600 uppercase tracking-wide">
                          <BookOpen className="w-3 h-3" />
                          {q.subject}
                        </span>
                        <span className="bg-slate-50 text-slate-400 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-slate-150">
                          {q.category}
                        </span>
                      </div>

                      {/* Question Text */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-850 leading-relaxed pr-2">
                        {q.question}
                      </h3>
                    </div>

                    {/* Bookmark actions */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <BookmarkButton 
                        contentType="viva"
                        contentId={q.id}
                        showText={false}
                        className="p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  {/* Expand/Collapse Accordion Trigger */}
                  <div className="border-t border-slate-100">
                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="w-full px-5 sm:px-6 py-3.5 bg-slate-50/50 hover:bg-slate-50 text-left flex justify-between items-center text-xs font-bold text-cyan-650 group-hover:text-cyan-700 transition-colors"
                    >
                      <span>{isExpanded ? "Hide Answer Explanation" : "Reveal Correct Answer"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cyan-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-450 group-hover:text-cyan-500 transition-colors shrink-0" />
                      )}
                    </button>

                    {/* Revealable Answer explanation */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 bg-cyan-50/20 border-t border-slate-100 animate-fade-in text-slate-700 text-xs sm:text-sm leading-relaxed border-l-2 border-l-cyan-500">
                        <div className="font-bold text-slate-800 mb-2">Explanation:</div>
                        <p className="whitespace-pre-line">{q.answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
