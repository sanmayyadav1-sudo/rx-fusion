"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  FileText, 
  Pill, 
  Activity, 
  BookOpen, 
  Newspaper, 
  FolderOpen, 
  School, 
  Loader2, 
  Sparkles, 
  Command,
  HelpCircle,
  FlaskConical
} from "lucide-react";

interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}

interface SearchResults {
  notes?: SearchResultItem[];
  drugs?: SearchResultItem[];
  cases?: SearchResultItem[];
  blogs?: SearchResultItem[];
  news?: SearchResultItem[];
  resources?: SearchResultItem[];
  colleges?: SearchResultItem[];
  viva?: SearchResultItem[];
  labs?: SearchResultItem[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SUGGESTIONS = [
  { text: "Pharm.D Notes", query: "Pharm D" },
  { text: "Proton Pump Inhibitors", query: "pantoprazole" },
  { text: "BMI Calculator", query: "BMI" },
  { text: "JSS College", query: "JSS" },
  { text: "Clinical Cases", query: "peptic" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search logic
  useEffect(() => {
    if (!isOpen) return;
    
    // Auto-focus input when opened
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    if (query.trim().length < 2) {
      setResults({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || {});
        }
      } catch (err) {
        console.error("Error executing search:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, isOpen]);

  // Handle click outside & keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Lock screen scroll
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasResults = Object.values(results).some(arr => arr && arr.length > 0);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "notes": return <FileText className="w-4 h-4 text-cyan-500" />;
      case "drugs": return <Pill className="w-4 h-4 text-emerald-500" />;
      case "cases": return <Activity className="w-4 h-4 text-violet-500" />;
      case "blogs": return <BookOpen className="w-4 h-4 text-slate-500" />;
      case "news": return <Newspaper className="w-4 h-4 text-amber-500" />;
      case "resources": return <FolderOpen className="w-4 h-4 text-blue-500" />;
      case "colleges": return <School className="w-4 h-4 text-cyan-600" />;
      case "viva": return <HelpCircle className="w-4 h-4 text-sky-500" />;
      case "labs": return <FlaskConical className="w-4 h-4 text-emerald-500" />;
      default: return <FileText className="w-4 h-4 text-cyan-500" />;
    }
  };

  const handleResultClick = (url: string) => {
    router.push(url);
    onClose();
    setQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog container */}
      <div className="bg-white border border-slate-200/80 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[75vh] animate-fade-in">
        {/* Search Input bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search RxFusion (notes, drugs, cases, colleges...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-slate-800 placeholder-slate-400/85 focus:outline-none bg-transparent py-1"
          />
          {loading && (
            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin shrink-0" />
          )}
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {query.trim().length < 2 ? (
            /* Suggestions view when query is empty */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Try searching for</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {POPULAR_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.text}
                    onClick={() => setQuery(sug.query)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-600 hover:bg-cyan-50/40 hover:border-cyan-200 hover:text-cyan-650 transition-all active:scale-98"
                  >
                    <Search className="w-3 h-3" />
                    <span>{sug.text}</span>
                  </button>
                ))}
              </div>
              
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Command className="w-3 h-3" />
                <span>Tip: Press <strong>Ctrl + K</strong> anywhere to search instantly.</span>
              </div>
            </div>
          ) : loading && !hasResults ? (
            /* Loading state */
            <div className="py-12 flex flex-col justify-center items-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
              <span className="text-xs">Searching databases...</span>
            </div>
          ) : hasResults ? (
            /* Search results list */
            <div className="space-y-6">
              {Object.entries(results).map(([category, items]) => {
                if (!items || items.length === 0) return null;
                return (
                  <div key={category} className="space-y-2.5">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      {getCategoryIcon(category)}
                      <span>{category}</span>
                    </h3>
                    <div className="space-y-2">
                      {items.map((item: SearchResultItem) => (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick(item.url)}
                          className="w-full text-left p-3 hover:bg-slate-50 border border-slate-100 hover:border-cyan-150 rounded-2xl flex justify-between items-center group transition-all"
                        >
                          <div className="space-y-1 pr-4">
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-cyan-650 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-450 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-100/50 px-2 py-0.5 rounded-md shrink-0">
                            {item.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty results state */
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Check spelling or try a different generic drug name, college city, or note topic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
