"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  role: "admin" | "user";
  updated_at: string;
  full_name?: string | null;
  course?: string | null;
  custom_course?: string | null;
  current_year?: string | null;
  college_name?: string | null;
  mobile_number?: string | null;
  free_downloads_used?: number;
  download_limit?: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  setStudentProfile: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  setStudentProfile: () => {},
});

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const setStudentProfile = (p: Profile | null) => {
    setProfile(p);
    if (p) {
      setUser({
        id: p.id,
        email: p.email,
        aud: "authenticated",
        role: "authenticated",
      } as unknown as User);
      setCookie("rxfusion_student_email", p.email);
    } else {
      setUser(null);
      deleteCookie("rxfusion_student_email");
    }
  };

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      // 1. Check if standard Supabase Auth session exists
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!active) return;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Fetch standard profile
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentSession.user.id)
            .single();

          if (data && !error && active) {
            setProfile(data as Profile);
          }
        } catch (err) {
          console.error("Standard profile fetch failed:", err);
        }
        setLoading(false);
      } else {
        // 2. Check for student profile cookie session
        const studentEmail = getCookie("rxfusion_student_email");
        if (studentEmail) {
          try {
            const res = await fetch(`/api/auth/student?email=${encodeURIComponent(studentEmail)}`);
            if (res.ok && active) {
              const data = await res.json();
              if (data.found && data.profile) {
                const p = data.profile;
                setProfile({
                  id: p.id,
                  email: p.email,
                  role: "user",
                  full_name: p.full_name,
                  course: p.course,
                  custom_course: p.custom_course,
                  current_year: p.current_year,
                  college_name: p.college_name,
                  mobile_number: p.mobile_number,
                  free_downloads_used: p.free_downloads_used,
                  download_limit: p.download_limit,
                  updated_at: p.updated_at,
                });
                setUser({
                  id: p.id,
                  email: p.email,
                  aud: "authenticated",
                  role: "authenticated",
                } as unknown as User);
              } else {
                deleteCookie("rxfusion_student_email");
                setProfile(null);
                setUser(null);
              }
            } else {
            }
          } catch (err) {
            console.error("Student profile fetch failed:", err);
          }
        } else {
        }
        setLoading(false);
      }
    }

    initializeAuth();

    // Listen for standard Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!active) return;
        
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          setLoading(true);
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", newSession.user.id)
              .single();
            if (data && !error && active) {
              setProfile(data as Profile);
            }
          } catch (err) {
            console.error("Standard profile fetch change failed:", err);
          }
          setLoading(false);
        } else {
          if (event === "SIGNED_OUT") {
            deleteCookie("rxfusion_student_email");
            setSession(null);
            setUser(null);
            setProfile(null);
          } else {
            const studentEmail = getCookie("rxfusion_student_email");
            if (!studentEmail) {
              setSession(null);
              setUser(null);
              setProfile(null);
            }
          }
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    deleteCookie("rxfusion_student_email");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        signOut,
        setStudentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
