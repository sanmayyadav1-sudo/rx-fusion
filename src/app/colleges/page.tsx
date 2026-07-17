"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GraduationCap, Search, MapPin, Building, ArrowRight, ShieldCheck, XCircle, Info, RefreshCw } from "lucide-react";

interface CollegeCourse {
  course_name: string;
}

interface College {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  city: string;
  state: string;
  college_type: string;
  logo_url: string;
  admission_status: string;
  pci_status: string;
  pci_reference_url: string;
  college_courses: CollegeCourse[];
  updated_at: string;
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter states
  const [tempSearch, setTempSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [stateFilter, setStateFilter] = useState("All States");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(tempSearch);
    }, 250);
    return () => clearTimeout(handler);
  }, [tempSearch]);

  // Load published colleges
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("colleges")
        .select(`
          id, name, slug, short_description, city, state, college_type, logo_url, admission_status, pci_status, pci_reference_url, updated_at,
          college_courses (course_name)
        `)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (dbError) throw dbError;
      if (data) setColleges(data as unknown as College[]);
    } catch (err) {
      console.error("Error fetching colleges:", err);
      setError("Failed to load pharmacy colleges directory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setTempSearch("");
    setSearchQuery("");
    setCourseFilter("All Courses");
    setStateFilter("All States");
    setCityFilter("All Cities");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  // 1. Dynamic States list
  const states = useMemo(() => {
    const allStates = colleges.map((c) => c.state);
    return ["All States", ...Array.from(new Set(allStates))].sort();
  }, [colleges]);

  // 2. Dynamic Cities list (updates based on selected State)
  const cities = useMemo(() => {
    const filteredByState =
      stateFilter === "All States"
        ? colleges
        : colleges.filter((c) => c.state === stateFilter);
    const allCities = filteredByState.map((c) => c.city);
    return ["All Cities", ...Array.from(new Set(allCities))].sort();
  }, [colleges, stateFilter]);

  // Reset city filter if state changes and current city is not available in that state
  useEffect(() => {
    if (stateFilter !== "All States" && cityFilter !== "All Cities") {
      const cityExistsInState = colleges.some(
        (c) => c.state === stateFilter && c.city === cityFilter
      );
      if (!cityExistsInState) {
        setCityFilter("All Cities");
      }
    }
  }, [stateFilter, cityFilter, colleges]);

  // Admission status helper mapping
  const getAdmissionStatusDisplay = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "admission_open" || s === "admission open") {
      return { label: "Admission Open", bg: "bg-emerald-50 text-emerald-600 border-emerald-250", dot: "bg-emerald-500" };
    }
    if (s === "admission_closed" || s === "admission closed") {
      return { label: "Admission Closed", bg: "bg-rose-50 text-rose-600 border-rose-250", dot: "bg-rose-500" };
    }
    if (s === "update_soon" || s === "admission update soon") {
      return { label: "Admission Update Soon", bg: "bg-amber-50 text-amber-600 border-amber-250", dot: "bg-amber-500" };
    }
    if (s === "contact_college" || s === "contact college") {
      return { label: "Contact College", bg: "bg-sky-50 text-sky-600 border-sky-250", dot: "bg-sky-500" };
    }
    return { label: "Not Updated", bg: "bg-slate-100 text-slate-600 border-slate-205", dot: "bg-slate-400" };
  };

  // PCI status helper mapping
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

  // Filter Colleges
  const filteredColleges = useMemo(() => {
    return colleges.filter((c) => {
      // Search matching Name, City, State, or Course Name
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.college_courses.some((course) =>
          course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Course Filter
      const matchesCourse =
        courseFilter === "All Courses" ||
        c.college_courses.some((course) => course.course_name === courseFilter);

      // State Filter
      const matchesState = stateFilter === "All States" || c.state === stateFilter;

      // City Filter
      const matchesCity = cityFilter === "All Cities" || c.city === cityFilter;

      // College Type Filter
      const matchesType = typeFilter === "All" || c.college_type === typeFilter;

      // Admission Status Filter
      const statusDisplay = getAdmissionStatusDisplay(c.admission_status).label;
      const matchesStatus = statusFilter === "All" || statusDisplay === statusFilter;

      return matchesSearch && matchesCourse && matchesState && matchesCity && matchesType && matchesStatus;
    });
  }, [colleges, searchQuery, courseFilter, stateFilter, cityFilter, typeFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-28 pb-16">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[35%] aspect-square rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[25%] aspect-square rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Colleges page hero block */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[10px] sm:text-xs font-bold text-cyan-600 tracking-wider uppercase bg-cyan-50 border border-cyan-100 rounded-full px-3 py-1.5 mb-4 inline-block">
            Pharmacy College Explorer
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Find the Right Pharmacy College
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore pharmacy colleges and discover courses, admission information, and college details in one place.
          </p>
        </div>

        {/* Search & Filter system segment */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs mb-8">
          {/* Main search field */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search college, city, state, or course..."
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl text-sm font-medium text-slate-800 focus:outline-none transition-all"
            />
            {tempSearch && (
              <button
                onClick={() => setTempSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter dropdowns grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Filter 1: Course */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              >
                <option value="All Courses">All Courses</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="Pharm.D Post Baccalaureate">Pharm.D Post Baccalaureate</option>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
              </select>
            </div>

            {/* Filter 2: State */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              >
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: City */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              >
                {cities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 4: College Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              >
                <option value="All">All Types</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Deemed University">Deemed University</option>
                <option value="University Department">University Department</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Filter 5: Admission Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admission</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              >
                <option value="All">All Admission Status</option>
                <option value="Admission Open">Admission Open</option>
                <option value="Admission Closed">Admission Closed</option>
                <option value="Admission Update Soon">Admission Update Soon</option>
                <option value="Contact College">Contact College</option>
                <option value="Not Updated">Not Updated</option>
              </select>
            </div>
          </div>

          {/* Active filters and reset banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold">
              Found <strong className="text-cyan-600">{filteredColleges.length}</strong> colleges matching filters.
            </span>
            {(searchQuery || courseFilter !== "All Courses" || stateFilter !== "All States" || cityFilter !== "All Cities" || typeFilter !== "All" || statusFilter !== "All") && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Directory Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">{error}</h3>
            <button
              onClick={fetchColleges}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Colleges Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any pharmacy colleges matching your selected search query or active filter settings.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college) => {
              const statusInfo = getAdmissionStatusDisplay(college.admission_status);
              const pciInfo = getPciStatusDisplay(college.pci_status);
              const uniqueCourses = Array.from(
                new Set(college.college_courses?.map((course) => course.course_name) || [])
              );

              return (
                <div
                  key={college.id}
                  className="flex flex-col bg-white border border-slate-200/70 hover:border-cyan-300 hover:shadow-md rounded-2xl p-6 transition-all duration-300 group"
                >
                  {/* Top metadata block */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-2xs">
                      {college.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={college.logo_url}
                          alt={college.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <GraduationCap className="w-7 h-7 text-cyan-500/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-2 hover:text-cyan-600 transition-colors">
                        <Link href={`/colleges/${college.slug}`}>{college.name}</Link>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{college.city}, {college.state}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body & badges */}
                  <div className="space-y-3.5 flex-grow mb-5">
                    {/* College type */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
                      <span className="text-[10px] font-bold text-slate-650 bg-slate-150 border border-slate-200/50 px-2.5 py-0.5 rounded-sm">
                        {college.college_type || "Other"}
                      </span>
                    </div>

                    {/* Courses badge grid */}
                    {uniqueCourses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {uniqueCourses.map((c) => (
                          <span
                            key={c}
                            className="text-[9px] font-bold text-cyan-600 bg-cyan-50/50 border border-cyan-100 px-2 py-0.5 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] italic text-slate-400">Courses not updated yet.</p>
                    )}

                    {/* Short description */}
                    {college.short_description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {college.short_description}
                      </p>
                    )}

                    {/* PCI Approval status */}
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PCI:</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${pciInfo.color}`}>
                        {pciInfo.label}
                      </span>
                      {college.pci_status.toLowerCase().includes("verified") && college.pci_reference_url && (
                        <a
                          href={college.pci_reference_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-0.5 hover:underline"
                        >
                          <ShieldCheck className="w-3 h-3 text-cyan-500" />
                          Ref
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card bottom section */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusInfo.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} flex-shrink-0`} />
                      {statusInfo.label}
                    </span>
                    <Link
                      href={`/colleges/${college.slug}`}
                      className="text-xs font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      View College
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer Card block */}
        <div className="mt-12 p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
            <strong className="text-slate-700">Important Disclaimer:</strong> College, course, fee, approval, and admission information may change. Students should verify the latest details from the official college website, admission authority, and Pharmacy Council of India before applying.
          </p>
        </div>
      </div>
    </div>
  );
}
