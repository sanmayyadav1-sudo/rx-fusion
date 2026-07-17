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

  // Check initial bookmark state
  useEffect(() => {
    if (authLoading) return;
    if (!profile || !contentId) {
      setIsBookmarked(false);
      return;
    }

    async function checkBookmarkStatus() {
      setChecking(true);
      try {
        const res = await fetch(`/api/student/bookmarks?studentId=${profile?.id}&contentType=${contentType}`);
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
    try {
      if (isBookmarked) {
        // DELETE bookmark request
        const res = await fetch(
          `/api/student/bookmarks?studentId=${profile.id}&contentType=${contentType}&contentId=${contentId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setIsBookmarked(false);
        } else {
          console.error("Failed to delete bookmark");
        }
      } else {
        // POST bookmark request
        const res = await fetch("/api/student/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: profile.id,
            contentType,
            contentId
          })
        });
        if (res.ok) {
          setIsBookmarked(true);
        } else {
          console.error("Failed to create bookmark");
        }
      }
    } catch (err) {
      console.error("Error toggling bookmark status:", err);
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
  );
}
