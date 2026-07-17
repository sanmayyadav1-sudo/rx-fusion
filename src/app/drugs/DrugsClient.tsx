"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Pill, ArrowRight, Loader2, Clock, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DrugOfTheDay } from "@/types/features";

export default function DrugsClient() {
  const [drugs, setDrugs] = useState<DrugOfTheDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    async function fetchDrugs() {
      try {
        const { data, error } = await supabase
          .from("drug_of_the_day")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setDrugs(data as DrugOfTheDay[]);
      } catch (err) {
        console.error("Error loading drugs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDrugs();
  }, []);

  // Extract unique drug classes for filtering
  const drugClasses = useMemo(() => {
    const classes = drugs.map((d) => d.drug_class).filter(Boolean);
    return ["all", ...Array.from(new Set(classes))].sort();
  }, [drugs]);

  // Today's featured drug (latest published drug)
  const featuredDrug = useMemo(() => {
    return drugs.length > 0 ? drugs[0] : null;
  }, [drugs]);

  // Archive drugs (excluding today's featured drug)
  const archiveDrugs = useMemo(() => {
    return drugs.length > 1 ? drugs.slice(1) : [];
  }, [drugs]);

  // Filtered archive drugs
  const filteredArchive = useMemo(() => {
    return archiveDrugs.filter((drug) => {
      const matchesSearch =
        drug.drug_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.drug_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (drug.moa && drug.moa.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesClass = selectedClass === "all" || drug.drug_class === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [archiveDrugs, searchQuery, selectedClass]);

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 min-h-screen bg-slate-50 relative">
      {/* Background Graphic decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-15%] w-[40%] aspect-square rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-150 rounded-full px-4 py-1.5 mb-2">
            <Pill className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold text-cyan-650 tracking-wide uppercase">
              Daily Pharmacology
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Drug of the Day
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Enhance your clinical pharmacology expertise. Explore mechanisms, side effects, contraindications, and exam-focused clinical pearls.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading pharmacology data...</p>
          </div>
        ) : drugs.length === 0 ? (
          <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl max-w-xl mx-auto">
            <Pill className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-800 font-bold">No drugs published yet.</p>
            <p className="text-xs text-slate-500 mt-1">Check back soon for daily pharmacy reviews!</p>
          </div>
        ) : (
          <>
            {/* Featured Showcase Drug */}
            {featuredDrug && !searchQuery && selectedClass === "all" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span>Today&apos;s Featured Drug</span>
                </h2>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 overflow-hidden relative hover:border-cyan-300 transition-all duration-300 shadow-xs">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                    {/* Image block */}
                    <div className="md:col-span-2 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-150 flex items-center justify-center">
                      {featuredDrug.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featuredDrug.image_url}
                          alt={featuredDrug.drug_name}
                          className="object-cover w-full h-full hover:scale-103 transition-transform duration-300"
                        />
                      ) : (
                        <Pill className="w-20 h-20 text-cyan-500/20" />
                      )}
                    </div>
                    {/* Info Block */}
                    <div className="md:col-span-3 space-y-5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-50 text-cyan-600 border border-cyan-100">
                          <Tag className="w-3.5 h-3.5" />
                          {featuredDrug.drug_class}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200/60">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(featuredDrug.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                          {featuredDrug.drug_name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Generic Name: <strong className="text-slate-700">{featuredDrug.generic_name}</strong>
                        </p>
                      </div>
                      {featuredDrug.moa && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Mechanism of Action</h4>
                          <p className="text-sm text-slate-650 leading-relaxed line-clamp-3">
                            {featuredDrug.moa.replace(/<[^>]*>/g, "")}
                          </p>
                        </div>
                      )}
                      <div className="pt-2">
                        <Link
                          href={`/drugs/${featuredDrug.slug}`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-cyan-500 text-white hover:bg-cyan-650 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                        >
                          Explore Drug Profile
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Archive Section */}
            <div className="space-y-8 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-t border-slate-200/80 pt-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Drug Archive</h2>
                  <p className="text-xs text-slate-500 mt-1">Browse and search all drug reviews in our repository.</p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search drugs archive..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-60 pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-slate-250 text-slate-800 placeholder:text-slate-450 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/5 transition-all shadow-xs"
                    />
                  </div>

                  {/* Filter Class */}
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs bg-white border border-slate-250 text-slate-700 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-xs font-medium"
                  >
                    <option value="all">All Drug Classes</option>
                    {drugClasses.filter((c) => c !== "all").map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Archive list grid */}
              {filteredArchive.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200 border-dashed rounded-xl">
                  <p className="text-sm text-slate-500">No drugs match your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArchive.map((drug) => (
                    <div
                      key={drug.id}
                      className="group flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/60 hover:border-cyan-300 hover:shadow-xs transition-all duration-300"
                    >
                      <div>
                        {/* Image zone */}
                        <div className="aspect-video bg-slate-50 border border-slate-150 rounded-xl mb-4 overflow-hidden flex items-center justify-center relative">
                          {drug.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={drug.image_url}
                              alt={drug.drug_name}
                              className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-300"
                            />
                          ) : (
                            <Pill className="w-10 h-10 text-cyan-500/20" />
                          )}
                          <span className="absolute top-3 left-3 bg-white/95 text-cyan-600 border border-cyan-150 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                            {drug.drug_class}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-800 line-clamp-1 leading-snug group-hover:text-cyan-600 transition-colors">
                          {drug.drug_name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          Generic: <strong className="text-slate-700">{drug.generic_name}</strong>
                        </p>
                        {drug.moa && (
                          <p className="text-xs text-slate-650 line-clamp-3 mt-3 leading-relaxed">
                            {drug.moa.replace(/<[^>]*>/g, "")}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between">
                        <Link
                          href={`/drugs/${drug.slug}`}
                          className="text-xs font-bold text-cyan-600 group-hover:text-cyan-500 transition-colors"
                        >
                          Read Full Profile
                        </Link>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
