"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  HelpCircle,
  Shuffle,
  CheckCircle,
  HelpCircle as FlipIcon,
  Tag,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  FolderOpen,
  Layers,
  BookMarked
} from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
import { 
  getYearsForCourse, 
  getCourseFullName, 
  getCourseShortName, 
  getYearLabel, 
  normalizeCourseName 
} from "@/lib/courseHelpers";

interface Flashcard {
  id: string;
  term: string;
  definition: string;
  course: string;
  year: number;
  subject: string;
  category: string | null;
  topic: string | null;
}

// Canonical base courses supported by RxFusion
const DEFAULT_COURSES = ["Pharm D", "B Pharm", "D Pharm", "M Pharm"];

function FlashcardsContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Read URL search params
  const courseParam = searchParams.get("course");
  const yearParam = searchParams.get("year");
  const subjectParam = searchParams.get("subject");

  const selectedCourse = courseParam ? normalizeCourseName(courseParam) : null;
  const selectedYear = yearParam ? Number(yearParam) : null;
  const selectedSubject = subjectParam ? subjectParam.trim() : null;

  const [searchQuery, setSearchQuery] = useState("");

  // Quiz deck state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [markingLearned, setMarkingLearned] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const fetchLearnedStatus = async () => {
      try {
        const res = await fetch(`/api/student/flashcards?studentId=${profile.id}`);
        if (res.ok) {
          const data = await res.json();
          setLearnedIds(data.learnedIds || []);
        }
      } catch (err) {
        console.error("Failed to load learned states:", err);
      }
    };
    fetchLearnedStatus();
  }, [profile]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (dbError && dbError.code === "PGRST205") {
        console.warn("flashcards table does not exist.");
        return;
      }

      if (dbError) throw dbError;
      setFlashcards((data as Flashcard[]) || []);
    } catch (err) {
      console.error("Error loading flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update state via URL search params
  const updateNavigation = (c: string | null, y: number | null, s: string | null) => {
    const params = new URLSearchParams();
    if (c) params.set("course", c);
    if (y !== null && y !== undefined) params.set("year", String(y));
    if (s) params.set("subject", s);

    const queryString = params.toString();
    router.push(`/flashcards${queryString ? `?${queryString}` : ""}`);
  };

  // Discover all available courses (Default canonical + any present in DB flashcards)
  const availableCourses = useMemo(() => {
    const dbCourses = Array.from(new Set(flashcards.map(f => normalizeCourseName(f.course)))).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_COURSES, ...dbCourses]));
    return combined;
  }, [flashcards]);

  // Derived available years for selected course
  const availableYearsForCourse = useMemo(() => {
    if (!selectedCourse) return [];
    return getYearsForCourse(selectedCourse);
  }, [selectedCourse]);

  // Subjects available for selected course + year
  const availableSubjectsForYear = useMemo(() => {
    if (!selectedCourse || selectedYear === null) return [];
    
    const forCourseAndYear = flashcards.filter(c => 
      normalizeCourseName(c.course) === selectedCourse && 
      Number(c.year) === Number(selectedYear)
    );

    const subjectNames = Array.from(new Set(forCourseAndYear.map(c => c.subject))).sort();
    return subjectNames.map(s => {
      const count = forCourseAndYear.filter(c => c.subject === s).length;
      return { name: s, count };
    });
  }, [flashcards, selectedCourse, selectedYear]);

  // Active deck of cards for selected course + year + subject
  const activeDeck = useMemo(() => {
    if (!selectedCourse || selectedYear === null || !selectedSubject) return [];

    const filtered = flashcards.filter(card => {
      const matchesCourse = normalizeCourseName(card.course) === selectedCourse;
      const matchesYear = Number(card.year) === Number(selectedYear);
      const matchesSubject = card.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesSearch = searchQuery === "" ||
        card.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.topic && card.topic.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCourse && matchesYear && matchesSubject && matchesSearch;
    });

    if (isShuffled) {
      return shuffledCards.filter(c => filtered.some(f => f.id === c.id));
    }
    return filtered;
  }, [flashcards, selectedCourse, selectedYear, selectedSubject, searchQuery, isShuffled, shuffledCards]);

  // Reset deck position when subject, year, or search changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
  }, [selectedCourse, selectedYear, selectedSubject, searchQuery]);

  // Log activity when entering a subject deck
  const logDeckActivity = useCallback(async (courseName: string, year: number, subjectName: string) => {
    if (!profile) return;
    try {
      await fetch("/api/student/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          contentType: "flashcards",
          contentId: `flashcards-${courseName}-${year}-${subjectName}`,
          contentTitle: `${getCourseShortName(courseName)} ${getYearLabel(year, courseName)} — ${subjectName} Flashcards`,
          contentUrl: `/flashcards?course=${encodeURIComponent(courseName)}&year=${year}&subject=${encodeURIComponent(subjectName)}`
        })
      });
    } catch (err) {
      console.error("Error logging flashcard activity:", err);
    }
  }, [profile]);

  const handleSelectSubject = (subjectName: string) => {
    if (selectedCourse && selectedYear !== null) {
      logDeckActivity(selectedCourse, selectedYear, subjectName);
    }
    updateNavigation(selectedCourse, selectedYear, subjectName);
  };

  const handleNext = () => {
    if (currentIndex < activeDeck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    if (isShuffled) {
      setIsShuffled(false);
    } else {
      const shuffled = [...activeDeck].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkAsLearned = async () => {
    if (!profile) {
      alert("Please log in to track your learning milestones.");
      return;
    }
    const currentCard = activeDeck[currentIndex];
    if (!currentCard || learnedIds.includes(currentCard.id) || markingLearned) return;

    setMarkingLearned(true);
    try {
      setLearnedIds(prev => [...prev, currentCard.id]);
      const res = await fetch("/api/student/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          flashcardId: currentCard.id
        })
      });

      if (!res.ok) {
        setLearnedIds(prev => prev.filter(id => id !== currentCard.id));
      }
    } catch (err) {
      console.error(err);
      setLearnedIds(prev => prev.filter(id => id !== currentCard.id));
    } finally {
      setMarkingLearned(false);
    }
  };

  const currentCard = activeDeck[currentIndex];
  const isLearned = currentCard ? learnedIds.includes(currentCard.id) : false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <main className="flex-grow pt-20 sm:pt-28 pb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[380px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-15%] w-[45%] aspect-square rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute bottom-[5%] right-[-10%] w-[35%] aspect-square rounded-full bg-sky-500/5 blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header */}
          <header className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-bold text-cyan-650 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Micro-Learning Flashcards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pharmacy Flashcards
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Memorize drug mechanisms, clinical definitions, and pharmacological parameters step by step across pharmacy courses.
            </p>
          </header>

          {/* Breadcrumb Navigation Bar */}
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200/60 p-3 rounded-2xl shadow-xs">
            <button
              onClick={() => updateNavigation(null, null, null)}
              className={`hover:text-cyan-600 transition-colors flex items-center gap-1 ${!selectedCourse ? "text-cyan-600 font-bold" : ""}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>

            {selectedCourse && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                <button
                  onClick={() => updateNavigation(selectedCourse, null, null)}
                  className={`hover:text-cyan-600 transition-colors ${selectedYear === null ? "text-cyan-600 font-bold" : ""}`}
                >
                  {getCourseShortName(selectedCourse)}
                </button>
              </>
            )}

            {selectedCourse && selectedYear !== null && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                <button
                  onClick={() => updateNavigation(selectedCourse, selectedYear, null)}
                  className={`hover:text-cyan-600 transition-colors ${!selectedSubject ? "text-cyan-600 font-bold" : ""}`}
                >
                  {getYearLabel(selectedYear, selectedCourse)}
                </button>
              </>
            )}

            {selectedCourse && selectedYear !== null && selectedSubject && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                <span className="text-slate-850 font-bold">{selectedSubject}</span>
              </>
            )}
          </nav>

          {loading ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-2" />
              <p className="text-sm text-slate-500 font-medium">Loading flashcards directory...</p>
            </div>

          ) : !selectedCourse ? (

            /* STEP 1: SELECT COURSE */
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-cyan-500" />
                  <span>Step 1 — Select Course</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">Select your pharmacy program</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableCourses.map((c) => {
                  const cardsInCourse = flashcards.filter(f => normalizeCourseName(f.course) === c);
                  const subjectsCount = new Set(cardsInCourse.map(f => f.subject)).size;
                  const fullName = getCourseFullName(c);
                  
                  return (
                    <button
                      key={c}
                      onClick={() => updateNavigation(c, null, null)}
                      className="p-5 bg-white border border-slate-200/60 hover:border-cyan-400 rounded-3xl text-left shadow-xs hover:shadow-md transition-all group duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-2xl bg-cyan-50 group-hover:bg-cyan-500 text-cyan-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                          <Layers className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
                          {fullName}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          {cardsInCourse.length} Flashcards • {subjectsCount} Subjects
                        </p>
                      </div>

                      <div className="mt-5 flex items-center text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition-transform gap-1">
                        <span>Explore {getCourseShortName(c)} Flashcards</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

          ) : selectedYear === null ? (

            /* STEP 2: SELECT YEAR */
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateNavigation(null, null, null)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Back to Courses"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-cyan-500" />
                    <span>Step 2 — Select Academic Year ({getCourseShortName(selectedCourse)})</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableYearsForCourse.map((y: number) => {
                  const cardsInYear = flashcards.filter(f => 
                    normalizeCourseName(f.course) === selectedCourse && Number(f.year) === y
                  );
                  const subjectsCount = new Set(cardsInYear.map(f => f.subject)).size;
                  
                  return (
                    <button
                      key={y}
                      onClick={() => updateNavigation(selectedCourse, y, null)}
                      className="p-5 bg-white border border-slate-200/60 hover:border-cyan-400 rounded-3xl text-left shadow-xs hover:shadow-md transition-all group duration-200"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 group-hover:bg-cyan-500 text-cyan-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
                        {getYearLabel(y, selectedCourse)}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        {cardsInYear.length} Flashcards • {subjectsCount} Subjects
                      </p>
                      <div className="mt-4 flex items-center text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition-transform gap-1">
                        <span>Select Year</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

          ) : selectedSubject === null ? (

            /* STEP 3: SELECT SUBJECT */
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateNavigation(selectedCourse, null, null)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Back to Years"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-cyan-500" />
                    <span>Step 3 — Select Subject ({getCourseShortName(selectedCourse)} — {getYearLabel(selectedYear, selectedCourse)})</span>
                  </h2>
                </div>
              </div>

              {availableSubjectsForYear.length === 0 ? (
                <div className="py-16 text-center bg-white border border-slate-200/60 rounded-3xl shadow-3xs p-6 space-y-3">
                  <HelpCircle className="w-12 h-12 text-slate-350 mx-auto" />
                  <p className="text-base font-bold text-slate-800">No flashcards available for this year yet.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Flashcards for {getCourseShortName(selectedCourse)} {getYearLabel(selectedYear, selectedCourse)} are currently being curated. Please check back soon!
                  </p>
                  <button
                    onClick={() => updateNavigation(selectedCourse, null, null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-200 transition-colors mt-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Choose Another Year</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableSubjectsForYear.map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => handleSelectSubject(sub.name)}
                      className="p-5 bg-white border border-slate-200/60 hover:border-cyan-400 rounded-3xl text-left shadow-xs hover:shadow-md transition-all group duration-200 flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-slate-450 font-semibold">
                          {sub.count} Cards Available
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-cyan-50 text-slate-400 group-hover:text-cyan-600 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

          ) : (

            /* STEP 4: STUDY FLASHCARD DECK */
            <section className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/60 p-4 rounded-3xl shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateNavigation(selectedCourse, selectedYear, null)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Back to Subjects"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md">
                      {getCourseShortName(selectedCourse)} • {getYearLabel(selectedYear, selectedCourse)}
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                      {selectedSubject}
                    </h2>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search in this deck..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200/50 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
                  />
                </div>
              </div>

              {activeDeck.length === 0 ? (
                <div className="py-16 text-center bg-white border border-slate-200/60 rounded-3xl shadow-3xs p-6 space-y-3">
                  <HelpCircle className="w-12 h-12 text-slate-350 mx-auto" />
                  <p className="text-base font-bold text-slate-800">No flashcards available for this subject yet.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching for another keyword or select a different subject.
                  </p>
                  <button
                    onClick={() => updateNavigation(selectedCourse, selectedYear, null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-200 transition-colors mt-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Choose Another Subject</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Interactive Flipping Card Container */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="perspective-1000 w-full min-h-[280px] sm:min-h-[320px] cursor-pointer relative select-none"
                  >
                    {/* Inner Card Wrapper with Flip transformation */}
                    <div 
                      className={`w-full h-full min-h-[280px] sm:min-h-[320px] absolute inset-0 transition-transform duration-500 transform-style-3d border border-slate-200/60 rounded-3xl bg-white shadow-xs p-6 sm:p-10 flex flex-col justify-between items-center text-center ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* FRONT VIEW */}
                      <div className={`w-full h-full flex flex-col justify-between items-center backface-hidden ${isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                        <div className="w-full flex justify-between items-center text-slate-400">
                          <span className="text-[10px] font-extrabold uppercase bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                            {currentCard.subject}
                          </span>
                          <span className="text-[10px] font-bold">
                            {currentIndex + 1} / {activeDeck.length}
                          </span>
                        </div>

                        <div className="my-auto space-y-4 max-w-xl">
                          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                            {currentCard.term}
                          </h3>
                          {currentCard.topic && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 border border-cyan-150 rounded-xl text-xs font-bold text-cyan-600">
                              <Tag className="w-3.5 h-3.5" />
                              {currentCard.topic}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-t border-slate-100/60 pt-4 w-full justify-center">
                          <FlipIcon className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Tap Card to Reveal Definition</span>
                        </div>
                      </div>

                      {/* BACK VIEW */}
                      <div className={`w-full h-full flex flex-col justify-between items-center backface-hidden rotate-y-180 ${isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                        <div className="w-full flex justify-between items-center text-slate-400">
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md">
                            Answer Definition
                          </span>
                          <span className="text-[10px] font-bold">
                            {currentIndex + 1} / {activeDeck.length}
                          </span>
                        </div>

                        <div className="my-auto max-w-xl text-center space-y-3">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meaning</p>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-semibold whitespace-pre-line">
                            {currentCard.definition}
                          </p>
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-t border-slate-100/60 pt-4 w-full justify-center">
                          <FlipIcon className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Tap to Flip Back</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/60 px-5 py-4 rounded-3xl shadow-xs">
                    
                    {/* Shuffle / Randomizer */}
                    <button
                      onClick={handleShuffle}
                      className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        isShuffled 
                          ? "bg-cyan-50 border-cyan-200 text-cyan-600 font-extrabold shadow-3xs" 
                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                      }`}
                      title="Randomize Deck Order"
                    >
                      <Shuffle className="w-4 h-4 shrink-0" />
                      <span>Shuffle</span>
                    </button>

                    {/* Card Scrolling Navigator */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                      </button>
                      <span className="text-xs font-bold text-slate-500 px-1">
                        {currentIndex + 1} / {activeDeck.length}
                      </span>
                      <button
                        onClick={handleNext}
                        disabled={currentIndex === activeDeck.length - 1}
                        className="p-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>

                    {/* Bookmark & Learned state */}
                    <div className="flex items-center gap-2">
                      <BookmarkButton 
                        contentType="flashcards"
                        contentId={currentCard.id}
                        showText={true}
                        className="border-slate-200"
                      />
                      <button
                        disabled={isLearned || markingLearned}
                        onClick={handleMarkAsLearned}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                          isLearned
                            ? "bg-emerald-50 border-emerald-150 text-emerald-600 font-extrabold"
                            : "bg-cyan-500 hover:bg-cyan-650 text-white border-cyan-500"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{isLearned ? "Learned" : "Mark as Learned"}</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}
            </section>

          )}
        </div>
      </main>
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    }>
      <FlashcardsContent />
    </Suspense>
  );
}
