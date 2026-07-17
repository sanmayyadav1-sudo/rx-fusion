"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Announcement } from "@/types/features";
import { X, FileText, ExternalLink, Megaphone } from "lucide-react";

export default function AnnouncementPopup() {
  const pathname = usePathname();
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dontShowAgainRef = useRef(dontShowAgain);

  // Sync ref with state changes to prevent effect re-triggering
  useEffect(() => {
    dontShowAgainRef.current = dontShowAgain;
  }, [dontShowAgain]);

  const handleClose = useCallback((id: string, oncePerSession: boolean) => {
    if (dontShowAgainRef.current) {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`rx_ann_dismiss_today_${id}`, todayStr);
    }

    if (oncePerSession) {
      sessionStorage.setItem(`rx_ann_dismiss_session_${id}`, "true");
    }

    setIsOpen(false);
    
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }
  }, []);

  useEffect(() => {
    // Skip rendering popup on admin dashboard, login page, or admin access page
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/login") || pathname?.startsWith("/rx-admin-access")) {
      setIsOpen(false);
      return;
    }

    async function checkAnnouncements() {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;
        if (!data || data.length === 0) return;

        const now = new Date();

        // 1. Filter announcements by dates
        const validAnnouncements = (data as Announcement[]).filter((ann) => {
          const start = ann.start_date ? new Date(ann.start_date) : null;
          const end = ann.end_date ? new Date(ann.end_date) : null;
          return (!start || start <= now) && (!end || end >= now);
        });

        if (validAnnouncements.length === 0) return;

        // 2. Sort by priority and created_at
        // Weight mapping: high = 3, medium = 2, low = 1
        const priorityWeights = { high: 3, medium: 2, low: 1 };
        
        validAnnouncements.sort((a, b) => {
          const weightA = priorityWeights[a.priority] || 2;
          const weightB = priorityWeights[b.priority] || 2;

          if (weightA !== weightB) {
            return weightB - weightA; // Higher priority first
          }
          // Breaking ties with newest created_at first
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        // 3. Select highest priority announcement
        const topAnnouncement = validAnnouncements[0];

        // 4. Verify display rules (Local Storage & Session Storage)
        const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        
        // Check "Don't show again today"
        const localDismissKey = `rx_ann_dismiss_today_${topAnnouncement.id}`;
        const hasDismissedToday = localStorage.getItem(localDismissKey) === todayStr;

        // Check "Show only once per session"
        const sessionDismissKey = `rx_ann_dismiss_session_${topAnnouncement.id}`;
        const hasDismissedSession = sessionStorage.getItem(sessionDismissKey) === "true";

        if (hasDismissedToday || hasDismissedSession) {
          return;
        }

        // 5. Eligible announcement found
        setActiveAnnouncement(topAnnouncement);
        setIsOpen(true);

        // 6. Handle auto-hide duration if configured
        if (topAnnouncement.auto_hide_duration && topAnnouncement.auto_hide_duration > 0) {
          if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
          
          autoHideTimerRef.current = setTimeout(() => {
            handleClose(topAnnouncement.id, topAnnouncement.show_once_per_session);
          }, topAnnouncement.auto_hide_duration * 1000);
        }

      } catch (err) {
        console.error("Error checking announcements popup:", err);
      }
    }

    checkAnnouncements();

    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
    };
  }, [pathname, handleClose]);

  if (!isOpen || !activeAnnouncement) return null;

  const typeStyles = {
    important_notice: "bg-red-500/10 text-red-400 border-red-500/20 indicator-red-500",
    exam_update: "bg-blue-500/10 text-blue-400 border-blue-500/20 indicator-blue-500",
    new_notes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 indicator-emerald-500",
    news_update: "bg-purple-500/10 text-purple-400 border-purple-500/20 indicator-purple-500",
    event: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 indicator-yellow-500",
    announcement: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 indicator-cyan-500",
    general: "bg-slate-800 text-slate-400 border-slate-700 indicator-slate-500"
  };

  const currentStyles = typeStyles[activeAnnouncement.type] || typeStyles.general;
  const indicatorColorClass = currentStyles.split(" ").find(c => c.startsWith("indicator-"))?.replace("indicator-", "bg-") || "bg-cyan-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 animate-fade-in">
        
        {/* Dynamic Category Color Header Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${indicatorColorClass}`} />

        {/* Close Button */}
        <button
          onClick={() => handleClose(activeAnnouncement.id, activeAnnouncement.show_once_per_session)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          aria-label="Close Announcement"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="space-y-4 pt-1">
          {/* Category Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${currentStyles.replace(/indicator-\w+/g, "")}`}>
            <Megaphone className="w-3.5 h-3.5" />
            {activeAnnouncement.type.replace(/_/g, " ")}
          </span>

          {/* Title */}
          <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
            {activeAnnouncement.title}
          </h2>

          {/* Banner Image */}
          {activeAnnouncement.banner_url && (
            <div className="w-full aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeAnnouncement.banner_url}
                alt={activeAnnouncement.title}
                className="object-cover w-full h-full"
                loading="eager"
              />
            </div>
          )}

          {/* Message Text */}
          <div 
            className="text-sm text-slate-400 leading-relaxed max-h-40 overflow-y-auto pr-1"
            dangerouslySetInnerHTML={{ __html: activeAnnouncement.message.replace(/\n/g, "<br />") }}
          />

          {activeAnnouncement.pdf_url && (
            <a
              href={activeAnnouncement.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-350 hover:bg-slate-900 transition-all"
            >
              <FileText className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span className="truncate">View Circular Document (PDF)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto text-emerald-500" />
            </a>
          )}

          {/* Primary Call-to-Action Link */}
          {activeAnnouncement.button_url && (
            <a
              href={activeAnnouncement.button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl font-bold text-sm bg-cyan-500 text-white hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200"
            >
              <span>{activeAnnouncement.button_text || "Learn More"}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-800/85 pt-4 text-xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-400 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-850 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Don&apos;t Show Again Today</span>
          </label>
        </div>
      </div>
    </div>
  );
}
