"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Stethoscope, ArrowRight, Loader2, Calendar, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ClinicalCase } from "@/types/features";

const CATEGORIES = [
  "all",
  "Cardiology",
  "Neurology",
  "Nephrology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Oncology",
  "Infectious Diseases",
  "Psychiatry",
  "Dermatology",
  "Pediatrics",
  "Others"
];

export default function CasesClient() {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");

  useEffect(() => {
    async function fetchCases() {
      try {
        const { data, error } = await supabase
          .from("clinical_cases")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setCases(data as ClinicalCase[]);
      } catch (err) {
        console.error("Error loading clinical cases:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.chief_complaint && c.chief_complaint.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = selectedDept === "all" || c.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [cases, searchQuery, selectedDept]);

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 min-h-screen bg-slate-50 relative">
      {/* Background Graphic decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-15%] w-[40%] aspect-square rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-150 rounded-full px-4 py-1.5 mb-2">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-650 tracking-wide uppercase">
              Clinical Pharmacy
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Clinical Cases Study
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Analyze patient profiles, SOAP notes, drug therapy audits, therapeutic interventions, and pharmaceutical care discussions.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center max-w-4xl mx-auto justify-between border-b border-slate-200/80 pb-6 px-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Filter Department:</span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none flex-grow">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs bg-white border border-slate-250 text-slate-700 focus:outline-none focus:border-emerald-400 cursor-pointer shadow-xs font-semibold"
              >
                <option value="all">All Departments</option>
                {CATEGORIES.filter(d => d !== "all").map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clinical cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2.5 rounded-xl text-xs bg-white border border-slate-250 text-slate-800 placeholder:text-slate-450 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/5 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading cases data...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl max-w-xl mx-auto">
            <Stethoscope className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-850 font-bold">No clinical cases found.</p>
            <p className="text-xs text-slate-500 mt-1">Check back soon for new case reviews!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/60 hover:border-emerald-300 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-3xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Tag className="w-3 h-3" />
                      {c.department}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Patient: {c.gender}, {c.age} yrs
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Disease: <strong className="text-slate-700">{c.disease}</strong>
                  </p>
                  
                  {c.chief_complaint && (
                    <p className="text-xs text-slate-600 line-clamp-3 mt-4 leading-relaxed pl-3 border-l border-slate-200">
                      &ldquo;{c.chief_complaint.replace(/<[^>]*>/g, "")}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>

                  <Link
                    href={`/cases/${c.slug}`}
                    className="text-xs font-bold text-emerald-600 group-hover:text-emerald-500 transition-colors flex items-center gap-1"
                  >
                    <span>Analyze Case</span>
                    <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
