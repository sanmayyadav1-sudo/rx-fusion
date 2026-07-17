"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Share2, Stethoscope, FileText, CheckCircle2, AlertCircle, Loader2, Tag, Paperclip, Pill } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ClinicalCase } from "@/types/features";
import { useAuth } from "@/context/AuthContext";

import BookmarkButton from "../../../components/BookmarkButton";

export default function CaseDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const { profile } = useAuth();
  const [item, setItem] = useState<ClinicalCase | null>(null);
  const [relatedCases, setRelatedCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Log student activity
  useEffect(() => {
    if (item && profile) {
      fetch("/api/student/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          contentType: "cases",
          contentId: item.id,
          contentTitle: item.title,
          contentUrl: `/cases/${item.slug}`
        })
      }).catch(err => console.error("Error logging case view:", err));
    }
  }, [item, profile]);

  useEffect(() => {
    async function fetchCaseDetails() {
      try {
        const { data, error } = await supabase
          .from("clinical_cases")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        if (data) {
          const fetchedCase = data as ClinicalCase;
          setItem(fetchedCase);

          // Fetch related cases in same department
          const { data: related } = await supabase
            .from("clinical_cases")
            .select("*")
            .eq("department", fetchedCase.department)
            .eq("status", "published")
            .neq("id", fetchedCase.id)
            .limit(3);

          if (related) setRelatedCases(related as ClinicalCase[]);
        }
      } catch (err) {
        console.error("Error fetching case details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchCaseDetails();
    }
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${item?.title} - Clinical Case`,
        text: `Check out the SOAP analysis of "${item?.title}" case on RxFusion!`,
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
        <Loader2 className="w-8 h-8 text-emerald-555 animate-spin" />
        <p className="text-sm text-slate-500 mt-2">Loading clinical case file...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Clinical Case Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The requested clinical case review does not exist or has been removed.
        </p>
        <Link
          href="/cases"
          className="px-5 py-2.5 bg-emerald-555 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
        >
          Back to Case Studies
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 min-h-screen bg-slate-50 relative">
      {/* Background Graphic decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/cases"
          className="breadcrumb inline-flex items-center text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Case Studies</span>
        </Link>

        {/* Action Bar */}
        <div className="no-print flex justify-end gap-3 mb-6">
          <BookmarkButton 
            contentType="cases"
            contentId={item.id}
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
                <Share2 className="w-4 h-4 text-emerald-500" />
                <span>Share Case</span>
              </>
            )}
          </button>
        </div>

        {/* Detail Panel */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-10 space-y-10 shadow-xs">
          {/* Case Header Details */}
          <div className="border-b border-slate-150 pb-8 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-150">
                <Tag className="w-3.5 h-3.5" />
                {item.department}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-105 text-slate-500 border border-slate-200/60">
                Patient: {item.gender}, {item.age} Years Old
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Published: {new Date(item.created_at).toLocaleDateString()}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                Reviewer: {item.author}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-bold">Disease: {item.disease}</span>
            </div>
          </div>

          {/* SOAP Notes Dashboard */}
          <div className="print-section space-y-4 bg-slate-50 border border-slate-200/60 p-5 sm:p-6 rounded-2xl">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
              <FileText className="w-4 h-4" />
              <span>SOAP Chart Notes</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subjective */}
              {item.subjective && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Subjective (S)</h3>
                  <div 
                    className="text-xs sm:text-sm text-slate-650 leading-relaxed pl-3 border-l-2 border-emerald-250"
                    dangerouslySetInnerHTML={{ __html: item.subjective.replace(/\n/g, "<br />") }}
                  />
                </div>
              )}
              {/* Objective */}
              {item.objective && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Objective (O)</h3>
                  <div 
                    className="text-xs sm:text-sm text-slate-650 leading-relaxed pl-3 border-l-2 border-emerald-250"
                    dangerouslySetInnerHTML={{ __html: item.objective.replace(/\n/g, "<br />") }}
                  />
                </div>
              )}
              {/* Assessment */}
              {item.assessment && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Assessment (A)</h3>
                  <div 
                    className="text-xs sm:text-sm text-slate-650 leading-relaxed pl-3 border-l-2 border-emerald-250"
                    dangerouslySetInnerHTML={{ __html: item.assessment.replace(/\n/g, "<br />") }}
                  />
                </div>
              )}
              {/* Plan */}
              {item.plan && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Plan (P)</h3>
                  <div 
                    className="text-xs sm:text-sm text-slate-650 leading-relaxed pl-3 border-l-2 border-emerald-250"
                    dangerouslySetInnerHTML={{ __html: item.plan.replace(/\n/g, "<br />") }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Case History & Clinical Content */}
          <div className="space-y-8">
            {/* Chief Complaint */}
            {item.chief_complaint && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-555" />
                  <span>Chief Complaint</span>
                </h2>
                <div 
                  className="text-sm text-slate-650 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.chief_complaint.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* History of Present Illness */}
            {item.history && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-555" />
                  <span>History of Present Illness</span>
                </h2>
                <div 
                  className="text-sm text-slate-650 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.history.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Medication History */}
            {item.medication_history && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-555" />
                  <span>Previous Medication History</span>
                </h2>
                <div 
                  className="text-sm text-slate-655 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.medication_history.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Clinical Findings */}
            {item.findings && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-555" />
                  <span>Clinical / Lab Findings</span>
                </h2>
                <div 
                  className="text-sm text-slate-655 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.findings.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Diagnosis */}
            {item.diagnosis && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Definitive Diagnosis</span>
                </h2>
                <div 
                  className="text-sm text-slate-655 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.diagnosis.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Treatment Plan */}
            {item.treatment && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-555" />
                  <span>Treatment Plan</span>
                </h2>
                <div 
                  className="text-sm text-slate-655 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.treatment.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Monitoring Parameters */}
            {item.monitoring && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-555" />
                  <span>Monitoring Parameters</span>
                </h2>
                <div 
                  className="text-sm text-slate-655 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.monitoring.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Outcome */}
            {item.outcome && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Patient Outcome</span>
                </h2>
                <div 
                  className="text-sm text-slate-655 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.outcome.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Discussion & Therapeutic Rationale */}
            {item.discussion && (
              <div className="print-section space-y-2">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-555" />
                  <span>Clinical Discussion & Rationale</span>
                </h2>
                <div 
                  className="text-sm text-slate-655 leading-relaxed pl-6 border-l-2 border-emerald-200/60"
                  dangerouslySetInnerHTML={{ __html: item.discussion.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Learning Points & Clinical Pearls */}
            {item.learning_points && (
              <div className="print-section space-y-2 bg-emerald-50/20 border border-emerald-150 p-5 rounded-2xl">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Case Learning Points & Pearls</span>
                </h2>
                <div 
                  className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: item.learning_points.replace(/\n/g, "<br />") }}
                />
              </div>
            )}

            {/* Attachments Section */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="no-print space-y-3 pt-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lab Reports & Attachments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.attachments.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-xs font-bold text-emerald-650 transition-all rounded-xl shadow-xs"
                    >
                      <Paperclip className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                      <span className="truncate">View Attachment {i + 1}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Cases Section */}
        {relatedCases.length > 0 && (
          <div className="no-print pt-10 border-t border-slate-200 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Related Cases</h2>
              <p className="text-xs text-slate-500 mt-1">Explore other case studies in the same department ({item.department}).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCases.map((rc) => (
                <Link
                  key={rc.id}
                  href={`/cases/${rc.slug}`}
                  className="group flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/60 hover:border-emerald-300 hover:shadow-xs transition-all duration-300"
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-md">
                      {rc.department}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-3 group-hover:text-emerald-650 transition-colors line-clamp-2">
                      {rc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      Disease: {rc.disease}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-4 group-hover:text-emerald-500 flex items-center gap-1">
                    <span>Analyze Case</span>
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
