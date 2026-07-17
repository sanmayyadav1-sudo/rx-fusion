"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Shield, KeyRound, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const { profile } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updating) return;
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setUpdating(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update password.";
      setError(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Portal Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your administrator session security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg font-bold">
              {profile?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{profile?.email}</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">
                <Shield className="w-3 h-3" /> ADMIN
              </span>
            </div>
          </div>
          {/* User ID — displayed in styled monospace container */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              User ID
            </p>
            <p className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-2 rounded-lg truncate">
              {profile?.id}
            </p>
          </div>
        </div>

        {/* Password Update Form */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span>Update Password</span>
          </h2>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-start space-x-2.5 text-sm text-emerald-400 mb-5">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 flex items-start space-x-2.5 text-sm text-red-400 mb-5">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 pr-10"
                  placeholder="Minimum 6 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 pr-10"
                  placeholder="Re-enter new password"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Change Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
