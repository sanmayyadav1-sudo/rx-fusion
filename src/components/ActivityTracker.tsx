"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const THROTTLE_TIME = 60 * 1000; // 1 minute in milliseconds

export default function ActivityTracker() {
  const { user } = useAuth();
  const pathname = usePathname();
  const lastUpdateRef = useRef<number>(0);

  const reportActivity = useCallback(async () => {
    if (!user) return;
    
    const now = Date.now();
    if (now - lastUpdateRef.current < THROTTLE_TIME) {
      return; // Throttled: Avoid excessive Supabase DB writes
    }
    
    lastUpdateRef.current = now;

    try {
      // Call the secure RPC function to update last_seen
      const { error } = await supabase.rpc("update_last_seen");
      if (error) {
        console.error("Error reporting activity presence:", error.message);
      }
    } catch (err) {
      console.error("Failed to report user presence:", err);
    }
  }, [user]);

  // 1. Trigger activity update on initial load and whenever user/pathname changes
  useEffect(() => {
    if (user) {
      reportActivity();
    }
  }, [user, pathname, reportActivity]);

  // 2. Trigger on returning to tab, and set up a heartbeat interval
  useEffect(() => {
    if (!user) return;

    // Listen for tab focus/visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reportActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Heartbeat every 2 minutes while active
    const interval = setInterval(() => {
      reportActivity();
    }, 2 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [user, reportActivity]);

  return null; // This is a headless logic component
}
