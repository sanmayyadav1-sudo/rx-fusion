"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Share2, Pill, BookOpen, AlertCircle, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DrugOfTheDay } from "@/types/features";
import { useAuth } from "@/context/AuthContext";

import BookmarkButton from "../../../components/BookmarkButton";

export default function DrugDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const { profile } = useAuth();
  const [drug, setDrug] = useState<DrugOfTheDay | null>(null);
  const [relatedDrugs, setRelatedDrugs] = useState<DrugOfTheDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Log student activity
  useEffect(() => {
    if (drug && profile) {
      fetch("/api/student/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          contentType: "drugs",
          contentId: drug.id,
          contentTitle: drug.drug_name,
          contentUrl: `/drugs/${drug.slug}`
        })
      }).catch(err => console.error("Error logging drug view:", err));
    }
  }, [drug, profile]);

  useEffect(() => {
    async function fetchDrugDetails() {
      try {
        // Fetch current drug details
        const { data, error } = await supabase
          .from("drug_of_the_day")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        if (data) {
          const fetchedDrug = data as DrugOfTheDay;
          setDrug(fetchedDrug);

          // Fetch related drugs in the same class (exclude current drug)
          const { data: related } = await supabase
            .from("drug_of_the_day")
            .select("*")
            .eq("drug_class", fetchedDrug.drug_class)
            .eq("status", "published")
            .neq("id", fetchedDrug.id)
            .limit(3);

          if (related) setRelatedDrugs(related as DrugOfTheDay[]);
        }
      } catch (err) {
        console.error("Error fetching drug details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchDrugDetails();
    }
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${drug?.drug_name} - Drug Profile`,
        text: `Check out the pharmacological review of ${drug?.drug_name} (${drug?.generic_name}) on RxFusion!`,
        url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-500 mt-2">Loading drug profile...</p>
      </div>
    );
  }

  if (!drug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Drug Profile Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The requested drug profile does not exist or has been removed.
        </p>
        <Link
          href="/drugs"
          className="px-5 py-2.5 bg-cyan-500 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors"
        >
          Back to Drug Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 min-h-screen bg-slate-50 relative">
      {/* Background Graphic decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/drugs"
          className="breadcrumb inline-flex items-center text-xs font-bold text-slate-500 hover:text-cyan-600 transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Drugs Archive</span>
        </Link>

        {/* Action Bar */}
        <div className="no-print flex justify-end gap-3 mb-6">
          <BookmarkButton 
            contentType="drugs"
            contentId={drug.id}
          />
          <button
            onClick={handleShare}
            className="share-button flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-650 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-350 transition-all duration-200 shadow-xs"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-650">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-500" />
                <span>Share Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-10 space-y-8 shadow-xs">
          {/* Showcase Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start pb-8 border-b border-slate-150">
            {/* Image section */}
            <div className="md:col-span-2 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-150">
              {drug.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={drug.image_url}
                  alt={drug.drug_name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Pill className="w-16 h-16 text-cyan-500/20" />
              )}
            </div>

            {/* Info details */}
            <div className="md:col-span-3 space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-cyan-50 text-cyan-600 border border-cyan-150">
                {drug.drug_class}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {drug.drug_name}
              </h1>

              <p className="text-sm text-slate-500 font-semibold">
                Generic Name: <strong className="text-slate-800">{drug.generic_name}</strong>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(drug.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-slate-400" />
                  By {drug.author}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-6">
            {/* Mechanism of Action */}
            {drug.moa && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  <span>Mechanism of Action (MOA)</span>
                </h2>
                <div 
                  className="text-sm text-slate-650 leading-relaxed pl-6 border-l-2 border-cyan-200"
                  dangerouslySetInnerHTML={{ __html: drug.moa.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Therapeutic Uses */}
            {drug.uses && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  <span>Therapeutic Uses</span>
                </h2>
                <div 
                  className="text-sm text-slate-650 leading-relaxed pl-6 border-l-2 border-cyan-200"
                  dangerouslySetInnerHTML={{ __html: drug.uses.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Side Effects */}
            {drug.side_effects && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-cyan-500" />
                  <span>Side Effects</span>
                </h2>
                <div 
                  className="text-sm text-slate-650 leading-relaxed pl-6 border-l-2 border-cyan-200"
                  dangerouslySetInnerHTML={{ __html: drug.side_effects.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Contraindications */}
            {drug.contraindications && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-red-650 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Contraindications</span>
                </h2>
                <div 
                  className="text-sm text-slate-650 leading-relaxed pl-6 border-l-2 border-red-200"
                  dangerouslySetInnerHTML={{ __html: drug.contraindications.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Drug Interactions */}
            {drug.interactions && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2">
                  <Pill className="w-4 h-4 text-cyan-500" />
                  <span>Drug Interactions</span>
                </h2>
                <div 
                  className="text-sm text-slate-650 leading-relaxed pl-6 border-l-2 border-cyan-200"
                  dangerouslySetInnerHTML={{ __html: drug.interactions.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Clinical Pearl */}
            {drug.clinical_pearl && (
              <div className="print-section space-y-2 bg-cyan-50/20 border border-cyan-150 p-5 rounded-2xl shadow-3xs">
                <h2 className="text-xs font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                  <span>Clinical Pearl</span>
                </h2>
                <div 
                  className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: drug.clinical_pearl.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Viva Questions */}
            {drug.viva_questions && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-violet-650 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-500" />
                  <span>Viva & Oral Exam Questions</span>
                </h2>
                <div 
                  className="text-sm text-slate-650 leading-relaxed pl-6 border-l-2 border-violet-200"
                  dangerouslySetInnerHTML={{ __html: drug.viva_questions.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Exam Point */}
            {drug.exam_point && (
              <div className="print-section space-y-2 bg-sky-50/20 border border-sky-150 p-5 rounded-2xl shadow-3xs">
                <h2 className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-500" />
                  <span>Key Exam Concept</span>
                </h2>
                <div 
                  className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: drug.exam_point.replace(/\n/g, "<br />") }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Drugs Section */}
        {relatedDrugs.length > 0 && (
          <div className="no-print pt-10 border-t border-slate-200 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Related Drugs</h2>
              <p className="text-xs text-slate-500 mt-1">Explore other drugs in the same class ({drug.drug_class}).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedDrugs.map((rd) => (
                <Link
                  key={rd.id}
                  href={`/drugs/${rd.slug}`}
                  className="group flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/60 hover:border-cyan-300 hover:shadow-xs transition-all duration-300"
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-600 border border-cyan-100 px-2.5 py-0.5 rounded-md">
                      {rd.drug_class}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-3 group-hover:text-cyan-650 transition-colors line-clamp-1">
                      {rd.drug_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      Generic: {rd.generic_name}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-cyan-600 mt-4 group-hover:text-cyan-500 flex items-center gap-1">
                    <span>View Profile</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
