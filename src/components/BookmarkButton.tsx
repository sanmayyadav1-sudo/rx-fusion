"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  contentType: "notes" | "drugs" | "cases" | "blogs" | "colleges" | "viva" | "labs" | "quiz" | "question_bank" | "question_papers" | "flashcards";
  contentId: string;
  className?: string;
  showText?: boolean;
}

export default function BookmarkButton({ 
  contentType, 
  contentId, 
  className = "", 
  showText = true 
}: BookmarkButtonProps) {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check initial bookmark state for authenticated user
  useEffect(() => {
    if (authLoading) return;
    if (!profile || !contentId) {
      setIsBookmarked(false);
      return;
    }

    async function checkBookmarkStatus() {
      setChecking(true);
      try {
        const res = await fetch(`/api/student/bookmarks?contentType=${contentType}`);
        if (res.ok) {
          const data = await res.json();
          const bookmarksList = data.bookmarks || [];
          const found = bookmarksList.some((b: { content_id: string }) => b.content_id === contentId);
          setIsBookmarked(found);
        }
      } catch (err) {
        console.error("Error checking bookmark status:", err);
      } finally {
        setChecking(false);
      }
    }

    checkBookmarkStatus();
  }, [profile, contentId, contentType, authLoading]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (authLoading || toggling) return;

    // Redirect to login if user is not authenticated
    if (!profile) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    setToggling(true);
    setErrorMessage(null);
    const previousState = isBookmarked;

    try {
      if (isBookmarked) {
        // Optimistic update
        setIsBookmarked(false);
        const res = await fetch(
          `/api/student/bookmarks?contentType=${contentType}&contentId=${encodeURIComponent(contentId)}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          setIsBookmarked(previousState);
          const data = await res.json().catch(() => ({}));
          setErrorMessage(data.error || "Failed to remove bookmark");
          setTimeout(() => setErrorMessage(null), 3000);
        }
      } else {
        // Optimistic update
        setIsBookmarked(true);
        const res = await fetch("/api/student/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType,
            contentId
          })
        });
        if (!res.ok) {
          setIsBookmarked(previousState);
          const data = await res.json().catch(() => ({}));
          setErrorMessage(data.error || "Failed to save bookmark");
          setTimeout(() => setErrorMessage(null), 3000);
        }
      }
    } catch (err) {
      console.error("Error toggling bookmark status:", err);
      setIsBookmarked(previousState);
      setErrorMessage("Network error");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setToggling(false);
    }
  };

  const buttonStyle = `inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 duration-200 ${
    isBookmarked
      ? "bg-cyan-50 border-cyan-200 text-cyan-600 shadow-3xs"
      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-350"
  } ${className}`;

  return (
    <div className="inline-relative flex flex-col items-center">
      <button
        onClick={handleToggleBookmark}
        disabled={checking || toggling}
        className={buttonStyle}
        title={isBookmarked ? "Saved to your dashboard" : "Save to your dashboard"}
      >
        {checking || toggling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        ) : (
          <Bookmark 
            className={`w-3.5 h-3.5 transition-colors ${
              isBookmarked ? "fill-cyan-500 text-cyan-500" : "text-slate-400"
            }`} 
          />
        )}
        {showText && (
          <span>{isBookmarked ? "Saved" : "Save"}</span>
        )}
      </button>

      {errorMessage && (
        <span className="absolute bottom-full mb-1 text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded shadow-xs whitespace-nowrap animate-fade-in z-20">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
