"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  GraduationCap, 
  CalendarDays, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  BookMarked
} from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";

interface QuestionItem {
  id: string;
  question: string;
  answer: string | null;
  course: string;
  year: number;
  subject: string;
  topic: string | null;
  question_type: string;
  marks: number | null;
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("question_bank")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (dbError && dbError.code === "PGRST205") {
        console.warn("question_bank table does not exist.");
        return;
      }

      if (dbError) throw dbError;
      setQuestions((data as QuestionItem[]) || []);
    } catch (err) {
      console.error("Error loading question bank:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Extract unique courses, subjects and types for filtering
  const courses = useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.course))).sort();
  }, [questions]);

  const subjects = useMemo(() => {
    const list = questions
      .filter((q) => selectedCourse === "" || q.course === selectedCourse)
      .map((q) => q.subject);
    return Array.from(new Set(list)).sort();
  }, [questions, selectedCourse]);

  const questionTypes = useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.question_type))).sort();
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.answer && q.answer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCourse = selectedCourse === "" || q.course === selectedCourse;
      const matchesYear = selectedYear === "" || q.year === Number(selectedYear);
      const matchesType = selectedType === "" || q.question_type === selectedType;
      const matchesSubject = selectedSubject === "" || q.subject === selectedSubject;

      return matchesSearch && matchesCourse && matchesYear && matchesType && matchesSubject;
    });
  }, [questions, searchQuery, selectedCourse, selectedYear, selectedType, selectedSubject]);

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
              <BookMarked className="w-3.5 h-3.5" />
              <span>Academic Syllabus Archive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pharmacy Question Bank
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Explore university and board-level pharmacy questions structured for D.Pharm, B.Pharm, and Pharm.D streams.
            </p>
          </header>

          {/* Filter Bar Card */}
          <section className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search by topic, subject, or question keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Stream</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => { setSelectedCourse(e.target.value); setSelectedYear(""); setSelectedSubject(""); }}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Streams</option>
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
                  <option value="">All Periods</option>
                  {Array.from({ length: maxYearOptions }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{periodLabel} {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Question Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Types</option>
                  {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Results Listing */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-200/60 p-6 rounded-2xl space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-20 text-center bg-white border border-slate-200/60 rounded-3xl shadow-3xs">
              <HelpCircle className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No questions found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Adjust your course, semester, subject, or search terms to find matching contents.
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
                    <div className="p-5 sm:p-6 flex justify-between items-start gap-4">
                      <div className="space-y-2.5 flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-650 uppercase tracking-wide">
                            <GraduationCap className="w-3 h-3 text-cyan-600" />
                            {q.course}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-650 uppercase tracking-wide">
                            <CalendarDays className="w-3 h-3 text-cyan-600" />
                            {q.course === "B Pharm" ? "Sem" : "Yr"} {q.year}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded text-[9px] font-extrabold text-cyan-600 uppercase tracking-wide">
                            <BookOpen className="w-3 h-3" />
                            {q.subject}
                          </span>
                          {q.topic && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                              <Tag className="w-3 h-3 text-slate-400" />
                              {q.topic}
                            </span>
                          )}
                          {q.marks && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                              {q.marks} Marks
                            </span>
                          )}
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200/50">
                            {q.question_type}
                          </span>
                        </div>

                        {/* Question Text */}
                        <h3 className="text-sm sm:text-base font-bold text-slate-850 leading-relaxed pr-2">
                          {q.question}
                        </h3>
                      </div>

                      {/* Bookmark / Save */}
                      <div className="shrink-0">
                        <BookmarkButton 
                          contentType="question_bank"
                          contentId={q.id}
                          showText={false}
                          className="p-2.5 border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Answer Accordion */}
                    {q.answer && (
                      <div className="border-t border-slate-100">
                        <button
                          onClick={() => toggleAnswer(q.id)}
                          className="w-full px-5 sm:px-6 py-3.5 bg-slate-50/50 hover:bg-slate-50 text-left flex justify-between items-center text-xs font-bold text-cyan-650 group-hover:text-cyan-700 transition-colors"
                        >
                          <span>{isExpanded ? "Hide Answer Details" : "Reveal Answer Details"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-cyan-500 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-450 group-hover:text-cyan-500 transition-colors shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="p-5 sm:p-6 bg-cyan-50/20 border-t border-slate-100 animate-fade-in text-slate-700 text-xs sm:text-sm leading-relaxed border-l-2 border-l-cyan-500">
                            <div className="font-bold text-slate-800 mb-2">Answer Solution:</div>
                            <p className="whitespace-pre-line">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
