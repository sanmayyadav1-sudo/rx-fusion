"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, FlaskConical, Calendar, GraduationCap, 
  BookOpen, ClipboardList, Settings, CheckCircle, 
  AlertCircle, Loader2, Download, Share2, ClipboardCheck
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import BookmarkButton from "@/components/BookmarkButton";

interface LabManual {
  id: string;
  title: string;
  experiment_number: string;
  aim: string;
  requirements: string;
  principle: string;
  procedure: string;
  observations: string;
  calculations: string;
  results: string;
  subject: string;
  year: number;
  course: string;
  category: string;
  file_url: string;
  created_at: string;
}

interface LabDetailClientProps {
  id: string;
}

export default function LabDetailClient({ id }: LabDetailClientProps) {
  const { profile } = useAuth();
  const [lab, setLab] = useState<LabManual | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Log activity
  useEffect(() => {
    if (lab && profile) {
      fetch("/api/student/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          contentType: "labs",
          contentId: lab.id,
          contentTitle: `${lab.experiment_number ? `${lab.experiment_number}: ` : ""}${lab.title}`,
          contentUrl: `/labs/${lab.id}`
        })
      }).catch(err => console.error("Error logging lab manual view:", err));
    }
  }, [lab, profile]);

  useEffect(() => {
    async function fetchLabDetails() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("lab_manuals")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) setLab(data as LabManual);
      } catch (err) {
        console.error("Error fetching lab details:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchLabDetails();
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-500 mt-2">Loading manual details...</p>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Manual Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The requested laboratory experiment manual does not exist or has been removed.
        </p>
        <Link
          href="/labs"
          className="px-5 py-2.5 bg-cyan-500 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const periodLabel = lab.course === "Pharm D" || lab.course === "D Pharm" ? "Year" : "Semester";

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 min-h-screen bg-slate-50 relative">
      {/* Background Graphic decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/labs"
          className="breadcrumb inline-flex items-center text-xs font-bold text-slate-500 hover:text-cyan-600 transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Manuals Directory</span>
        </Link>

        {/* Action Bar */}
        <div className="no-print flex justify-end gap-3 mb-6">
          <BookmarkButton 
            contentType="labs"
            contentId={lab.id}
          />
          
          {lab.file_url && (
            <a
              href={lab.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-650 hover:text-cyan-600 hover:bg-slate-50 hover:border-cyan-200 transition-all duration-200 shadow-xs"
            >
              <Download className="w-4 h-4 text-cyan-500" />
              <span>Download PDF</span>
            </a>
          )}

          <button
            onClick={handleShare}
            className="share-button flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-650 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-350 transition-all duration-200 shadow-xs"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-650">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-500" />
                <span>Share URL</span>
              </>
            )}
          </button>
        </div>

        {/* Main Content card */}
        <article className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-8">
          
          {/* Header Metadata info */}
          <header className="space-y-4 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {lab.experiment_number && (
                <span className="px-3 py-1 rounded-full bg-cyan-600 text-white text-[10px] font-black uppercase tracking-wider">
                  {lab.experiment_number}
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
                {lab.course}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                {periodLabel} {lab.year}
              </span>
              <span className="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-cyan-600 uppercase">
                <BookOpen className="w-3.5 h-3.5" />
                {lab.subject}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {lab.title}
            </h1>
          </header>

          {/* Aim block */}
          <section className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-cyan-500" />
              <span>Aim of the Experiment</span>
            </h2>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              {lab.aim}
            </p>
          </section>

          {/* Detailed Experiment parameters grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Left and Middle column: Principle & Procedure */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Principle/Theory */}
              {lab.principle && (
                <section className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-cyan-500" />
                    <span>Principle / Theory</span>
                  </h3>
                  <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white border border-slate-100 rounded-xl p-4.5">
                    {lab.principle}
                  </div>
                </section>
              )}

              {/* Procedure */}
              {lab.procedure && (
                <section className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-cyan-500" />
                    <span>Step-by-Step Procedure</span>
                  </h3>
                  <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white border border-slate-100 rounded-xl p-4.5">
                    {lab.procedure}
                  </div>
                </section>
              )}
            </div>

            {/* Right sidebar column: Requirements, calculations, results */}
            <div className="space-y-6">
              
              {/* Requirements */}
              {lab.requirements && (
                <section className="bg-slate-50/50 border border-slate-200/40 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-cyan-500" />
                    <span>Requirements</span>
                  </h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line">
                    {lab.requirements}
                  </p>
                </section>
              )}

              {/* Observations */}
              {lab.observations && (
                <section className="bg-slate-50/50 border border-slate-200/40 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-cyan-500" />
                    <span>Observations</span>
                  </h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line">
                    {lab.observations}
                  </p>
                </section>
              )}

              {/* Calculations */}
              {lab.calculations && (
                <section className="bg-cyan-50/15 border border-cyan-100/50 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-600 flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-cyan-500" />
                    <span>Calculations</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-mono bg-white/60 p-2.5 rounded-lg border border-cyan-50/30">
                    {lab.calculations}
                  </p>
                </section>
              )}

              {/* Results */}
              {lab.results && (
                <section className="bg-emerald-50/15 border border-emerald-100/50 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Report / Results</span>
                  </h3>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-bold">
                    {lab.results}
                  </p>
                </section>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
