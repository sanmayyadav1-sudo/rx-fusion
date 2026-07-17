"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Tag
} from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";

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

export default function FlashcardsPage() {
  const { profile } = useAuth();
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

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

  // Reset indices and shuffles when base cards filter changes
  const activeDeck = useMemo(() => {
    const filtered = flashcards.filter((card) => {
      const matchesSearch = 
        card.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.topic && card.topic.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCourse = selectedCourse === "" || card.course === selectedCourse;
      const matchesYear = selectedYear === "" || card.year === Number(selectedYear);
      const matchesSubject = selectedSubject === "" || card.subject === selectedSubject;
      const matchesCategory = selectedCategory === "" || card.category === selectedCategory;

      return matchesSearch && matchesCourse && matchesYear && matchesSubject && matchesCategory;
    });

    if (isShuffled) {
      // Keep existing shuffle deck order if we are already shuffled, but filter it
      return shuffledCards.filter(c => filtered.some(f => f.id === c.id));
    }
    return filtered;
  }, [flashcards, searchQuery, selectedCourse, selectedYear, selectedSubject, selectedCategory, isShuffled, shuffledCards]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCourse, selectedYear, selectedSubject, selectedCategory, searchQuery]);

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
      // Optimistic local state update
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
        // revert if failed
        setLearnedIds(prev => prev.filter(id => id !== currentCard.id));
      }
    } catch (err) {
      console.error(err);
      setLearnedIds(prev => prev.filter(id => id !== currentCard.id));
    } finally {
      setMarkingLearned(false);
    }
  };

  // Filter lists derivations
  const courses = useMemo(() => Array.from(new Set(flashcards.map(c => c.course))).sort(), [flashcards]);
  const subjects = useMemo(() => {
    const list = flashcards.filter(c => selectedCourse === "" || c.course === selectedCourse).map(c => c.subject);
    return Array.from(new Set(list)).sort();
  }, [flashcards, selectedCourse]);

  const categories = useMemo(() => {
    const list = flashcards.map(c => c.category).filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [flashcards]);

  const maxYearOptions = selectedCourse === "Pharm D" ? 6 : selectedCourse === "D Pharm" ? 2 : 4;
  const periodLabel = selectedCourse === "B Pharm" ? "Semester" : "Year";

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
              Memorize drug parameters, pharmaceutical calculations, and biological pathways through active recall.
            </p>
          </header>

          {/* Filters Bar */}
          <section className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search flashcards term, keywords, or subject..."
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
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 text-xs text-slate-650 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Flashcard Showcase Card */}
          {loading ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-2" />
              <p className="text-sm text-slate-500">Loading flashcards...</p>
            </div>
          ) : activeDeck.length === 0 ? (
            <div className="py-20 text-center bg-white border border-slate-200/60 rounded-3xl shadow-3xs">
              <HelpCircle className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No flashcards match selection</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Adjust the course, year, or subject filters to locate cards.
              </p>
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
        </div>
      </main>

    </div>
  );
}
