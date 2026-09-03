"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  GraduationCap, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const { user, profile, signOut, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in as admin
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (profile?.role === "admin") {
          window.location.href = searchParams.get("redirectTo") || "/admin/dashboard";
        } else {
          setError("Access denied. This account is not authorized as an RxFusion administrator.");
          signOut();
        }
      }
    }
  }, [user, profile, authLoading, searchParams, signOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions
    setError(null);
    setMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        console.error("Supabase Admin Sign In Error:", authError);
        const errMsg = authError.message || "";
        const errCode = authError.code || "";
        
        if (errCode === "email_not_confirmed" || errMsg.toLowerCase().includes("confirm")) {
          setError("Please confirm your email address before signing in.");
        } else if (errCode === "invalid_credentials" || errMsg.toLowerCase().includes("invalid") || errMsg.toLowerCase().includes("incorrect")) {
          setError("Invalid admin email or password.");
        } else {
          setError(errMsg || "Unable to sign in right now. Please check your network and credentials.");
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Verify role mapping in public profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Admin role verification query error:", profileError);
          await supabase.auth.signOut();
          setError(`Unable to verify administrator access: ${profileError.message}`);
          setLoading(false);
          return;
        }

        if (profileData?.role !== "admin") {
          console.error("Access denied. User role is not admin.", profileData);
          await supabase.auth.signOut();
          setError("Access denied. This account is not authorized as an RxFusion administrator.");
          setLoading(false);
          return;
        }

        setMessage("Welcome back! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = searchParams.get("redirectTo") || "/admin/dashboard";
        }, 500);
      }
    } catch (err: unknown) {
      console.error("Admin sign in exception:", err);
      const msg = err instanceof Error ? err.message : "Unable to sign in right now. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in relative z-10">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow visual accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand/Heading block */}
        <div className="text-center mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center space-x-2 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-450 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            RxFusion Admin
          </h1>
          <p className="text-xs text-slate-500 mt-2 px-2 leading-relaxed font-medium">
            Administrator access
          </p>
        </div>

        {/* Message notification banners */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/30 flex items-start space-x-2.5 text-xs text-red-400 relative z-10" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/30 flex items-start space-x-2.5 text-xs text-cyan-400 relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-cyan-500 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Form Entry */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 text-left">
          
          {/* EMAIL FIELD */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
                placeholder="Enter admin email"
                disabled={loading}
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
                placeholder="Enter admin password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-cyan-500/20 active:translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Return to homepage */}
        <div className="mt-6 text-center border-t border-slate-800/60 pt-4 relative z-10">
          <Link
            href="/"
            className="text-xs font-medium text-slate-500 hover:text-cyan-400 transition-colors"
          >
            ← Return to RxFusion homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-500 mt-2">Loading Administrator Portal...</p>
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
