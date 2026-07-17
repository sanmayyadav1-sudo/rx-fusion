"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, GraduationCap, MapPin, Building, Calendar, Info, 
  ExternalLink, Phone, Mail, ClipboardList, 
  Layers, BadgeAlert, Loader2, ShieldCheck
} from "lucide-react";

import BookmarkButton from "../../../components/BookmarkButton";

interface CollegeCourse {
  id: string;
  course_name: string;
  course_duration: string;
  intake: string;
  course_fee: string;
  eligibility: string;
  is_active: boolean;
}

interface College {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  overview: string;
  city: string;
  state: string;
  college_type: string;
  logo_url: string;
  address: string;
  official_website: string;
  admission_website: string;
  contact_number: string;
  admission_email: string;
  admission_status: string;
  admission_session: string;
  eligibility: string;
  admission_process: string;
  entrance_exam: string;
  fees_information: string;
  hostel_information: string;
  clinical_training_information: string;
  placement_information: string;
  pci_status: string;
  pci_reference_url: string;
  updated_at: string;
  college_courses: CollegeCourse[];
}

import { useAuth } from "@/context/AuthContext";

export default function CollegeDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const { profile } = useAuth();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log student activity
  useEffect(() => {
    if (college && profile) {
      fetch("/api/student/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          contentType: "colleges",
          contentId: college.id,
          contentTitle: college.name,
          contentUrl: `/colleges/${college.slug}`
        })
      }).catch(err => console.error("Error logging college view:", err));
    }
  }, [college, profile]);

  useEffect(() => {
    async function fetchCollegeDetails() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from("colleges")
          .select(`
            *,
            college_courses (*)
          `)
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle();

        if (dbError) throw dbError;
        if (data) {
          // Filter active courses
          const filteredData = {
            ...data,
            college_courses: (data.college_courses || []).filter((c: CollegeCourse) => c.is_active)
          };
          setCollege(filteredData as College);
        } else {
          setError("College profile not found.");
        }
      } catch (err) {
        console.error("Error fetching college details:", err);
        setError("An error occurred while loading this college's details.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchCollegeDetails();
    }
  }, [slug]);

  const getAdmissionStatusDisplay = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "admission_open" || s === "admission open") {
      return { label: "Admission Open", bg: "bg-emerald-50 text-emerald-600 border border-emerald-250", dot: "bg-emerald-500" };
    }
    if (s === "admission_closed" || s === "admission closed") {
      return { label: "Admission Closed", bg: "bg-rose-50 text-rose-600 border border-rose-255", dot: "bg-rose-500" };
    }
    if (s === "update_soon" || s === "admission update soon") {
      return { label: "Admission Update Soon", bg: "bg-amber-50 text-amber-600 border border-amber-255", dot: "bg-amber-500" };
    }
    if (s === "contact_college" || s === "contact college") {
      return { label: "Contact College", bg: "bg-sky-50 text-sky-600 border border-sky-255", dot: "bg-sky-500" };
    }
    return { label: "Not Updated", bg: "bg-slate-100 text-slate-600 border border-slate-205", dot: "bg-slate-400" };
  };

  const getPciStatusDisplay = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "verified_by_admin" || s === "verified by admin") {
      return { label: "Verified by Admin", color: "text-emerald-600 bg-emerald-50 border border-emerald-200" };
    }
    if (s === "verification_pending" || s === "verification pending") {
      return { label: "Verification Pending", color: "text-amber-600 bg-amber-50 border border-amber-200" };
    }
    return { label: "Not Updated", color: "text-slate-500 bg-slate-100 border border-slate-200" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-500 mt-2">Loading college profile...</p>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <BadgeAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">{error || "College Not Found"}</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The requested pharmacy college profile does not exist, is unpublished, or has been removed.
        </p>
        <Link
          href="/colleges"
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-all"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const statusInfo = getAdmissionStatusDisplay(college.admission_status);
  const pciInfo = getPciStatusDisplay(college.pci_status);
  const formattedLastUpdated = new Date(college.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pt-20 sm:pt-28 pb-16 min-h-screen bg-slate-50 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[35%] aspect-square rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[25%] aspect-square rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/colleges"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Colleges Directory
        </Link>

        {/* Hero Header block */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Logo */}
              <div className="w-20 h-20 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                {college.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={college.logo_url}
                    alt={college.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <GraduationCap className="w-10 h-10 text-cyan-500/40" />
                )}
              </div>
              {/* Core detail */}
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mb-2">
                  {college.college_type || "Other"}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {college.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold flex items-center gap-1.5 mt-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {college.city}, {college.state}
                </p>
              </div>
            </div>

            {/* Badges block */}
            <div className="flex flex-wrap md:flex-col items-start gap-2.5 md:items-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
              <BookmarkButton 
                contentType="colleges"
                contentId={college.id}
              />
              <span className={`text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${statusInfo.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} flex-shrink-0`} />
                {statusInfo.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PCI Status:</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${pciInfo.color}`}>
                  {pciInfo.label}
                </span>
              </div>
            </div>
          </div>

          {college.short_description && (
            <p className="text-sm text-slate-500 mt-6 pt-5 border-t border-slate-100 leading-relaxed italic">
              &ldquo;{college.short_description}&rdquo;
            </p>
          )}
        </div>

        {/* Grid for main details and sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            {college.overview && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-500" />
                  College Overview
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {college.overview}
                </p>
              </div>
            )}

            {/* Courses and Intake Table */}
            {college.college_courses && college.college_courses.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-500" />
                  Available Pharmacy Courses
                </h2>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pr-4">Course Name</th>
                        <th className="pb-3 px-4">Duration</th>
                        <th className="pb-3 px-4 text-center">Intake</th>
                        <th className="pb-3 pl-4 text-right">Approx Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {college.college_courses.map((course) => (
                        <tr key={course.id} className="hover:bg-slate-50/30">
                          <td className="py-3.5 pr-4 font-bold text-slate-800">{course.course_name}</td>
                          <td className="py-3.5 px-4 text-slate-550 font-semibold">{course.course_duration || "N/A"}</td>
                          <td className="py-3.5 px-4 text-slate-550 text-center font-semibold">{course.intake || "N/A"}</td>
                          <td className="py-3.5 pl-4 text-slate-700 text-right font-bold">{course.course_fee || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admission Information */}
            {(college.admission_session || college.eligibility || college.admission_process || college.entrance_exam) && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
                <h2 className="text-base sm:text-lg font-black text-slate-900 mb-2 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-cyan-500" />
                  Admission Details
                </h2>

                {college.admission_session && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Session</h3>
                    <p className="text-xs sm:text-sm font-bold text-cyan-600 bg-cyan-50/50 border border-cyan-100 px-3 py-1.5 rounded-lg inline-block">
                      {college.admission_session}
                    </p>
                  </div>
                )}

                {college.eligibility && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Eligibility Criteria</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {college.eligibility}
                    </p>
                  </div>
                )}

                {college.admission_process && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admission Process</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {college.admission_process}
                    </p>
                  </div>
                )}

                {college.entrance_exam && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Entrance Exams Accepted</h3>
                    <p className="text-xs sm:text-sm text-slate-650 leading-relaxed whitespace-pre-line font-medium bg-slate-50 border border-slate-150 p-3 rounded-xl">
                      {college.entrance_exam}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Additional Features (Fees, Hostel, Hospital, Placement) */}
            {(college.fees_information || college.hostel_information || college.clinical_training_information || college.placement_information) && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
                <h2 className="text-base sm:text-lg font-black text-slate-900 mb-2 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  Fees, Infrastructure & Placements
                </h2>

                {college.fees_information && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fees Structure Details</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {college.fees_information}
                    </p>
                  </div>
                )}

                {college.hostel_information && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hostel & Accommodations</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {college.hostel_information}
                    </p>
                  </div>
                )}

                {college.clinical_training_information && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hospital & Clinical Training</h3>
                    <p className="text-xs sm:text-sm text-slate-650 bg-sky-50/50 border border-sky-100 p-3 rounded-xl leading-relaxed whitespace-pre-line">
                      {college.clinical_training_information}
                    </p>
                  </div>
                )}

                {college.placement_information && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Placements & Career Scope</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {college.placement_information}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Contact, Website, PCI, Last Updated */}
          <div className="space-y-6">
            {/* Quick CTAs */}
            {(college.official_website || college.admission_website) && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
                {college.official_website && (
                  <a
                    href={college.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Visit Official Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {college.admission_website && (
                  <a
                    href={college.admission_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-cyan-500/10"
                  >
                    Visit Admission Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Contact Details Card */}
            {(college.contact_number || college.admission_email || college.address) && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 mb-4 pb-1 border-b border-slate-100">
                  Contact Information
                </h2>
                <div className="space-y-4 text-xs sm:text-sm">
                  {college.address && (
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-500 text-[10px] uppercase">College Address</h4>
                        <p className="text-slate-650 leading-relaxed mt-0.5">{college.address}</p>
                      </div>
                    </div>
                  )}

                  {college.contact_number && (
                    <div className="flex gap-2">
                      <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-500 text-[10px] uppercase">Phone / Contact</h4>
                        <a href={`tel:${college.contact_number}`} className="text-cyan-600 hover:underline font-semibold leading-relaxed mt-0.5 block">
                          {college.contact_number}
                        </a>
                      </div>
                    </div>
                  )}

                  {college.admission_email && (
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-500 text-[10px] uppercase">Admission Email</h4>
                        <a href={`mailto:${college.admission_email}`} className="text-cyan-600 hover:underline font-semibold leading-relaxed mt-0.5 block break-all">
                          {college.admission_email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PCI Reference Info */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 mb-3 pb-1 border-b border-slate-100">
                PCI Regulatory Status
              </h2>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-500">PCI Approval Status:</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${pciInfo.color}`}>
                    {pciInfo.label}
                  </span>
                </div>
                {college.pci_status.toLowerCase().includes("verified") && college.pci_reference_url ? (
                  <div>
                    <a
                      href={college.pci_reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-500 border border-cyan-100 bg-cyan-50/30 px-3 py-2 rounded-xl w-full justify-center transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      View PCI Reference
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Official PCI approval status documentation has not been linked for this academic year yet.
                  </p>
                )}
              </div>
            </div>

            {/* Last Updated Segment */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold">
                <Calendar className="w-4 h-4 text-slate-400" />
                Last updated:
              </span>
              <strong className="text-slate-700">{formattedLastUpdated}</strong>
            </div>
          </div>
        </div>

        {/* Disclaimer Card block */}
        <div className="mt-10 p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
            <strong className="text-slate-700">Important Disclaimer:</strong> College, course, fee, approval, and admission information may change. Students should verify the latest details from the official college website, admission authority, and Pharmacy Council of India before applying.
          </p>
        </div>
      </div>
    </div>
  );
}
