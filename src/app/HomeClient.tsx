"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  ArrowRight, 
  FolderOpen,
  Zap,
  Pill,
  ChevronRight,
  BookMarked,
  Newspaper,
  Stethoscope,
  HelpCircle,
  Calculator,
  Layers,
  Sparkles
} from "lucide-react";
import { DrugOfTheDay, ClinicalCase } from "@/types/features";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Note {
  id: string;
  title: string;
  course: string;
  semester: number;
  subject: string;
  file_url: string;
  created_at: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  featured_image: string;
  published_date: string;
}

interface HomeCollege {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  college_type: string;
  logo_url: string;
  admission_status: string;
  pci_status: string;
  short_description: string;
  college_courses: { course_name: string }[];
}

export default function Home() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [latestNotes, setLatestNotes] = useState<Note[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [drugOfTheDay, setDrugOfTheDay] = useState<DrugOfTheDay | null>(null);
  const [latestCases, setLatestCases] = useState<ClinicalCase[]>([]);
  const [featuredColleges, setFeaturedColleges] = useState<HomeCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const handlePreviewClick = (note: Note) => {
    if (authLoading) return;
    if (!profile) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    router.push(`/notes/view/${note.id}`);
  };

  const hasNotes = loading || latestNotes.length > 0;
  const hasBlogs = loading || latestBlogs.length > 0;
  const showSection = hasNotes || hasBlogs;

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: notesData } = await supabase
          .from("notes")
          .select("id, title, course, semester, subject, file_url, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        const { data: blogsData } = await supabase
          .from("blogs")
          .select("id, title, slug, featured_image, published_date")
          .order("published_date", { ascending: false })
          .limit(3);

        const { data: drugData } = await supabase
          .from("drug_of_the_day")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: casesData } = await supabase
          .from("clinical_cases")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(3);

        const { data: collegesData } = await supabase
          .from("colleges")
          .select(`
            id, name, slug, city, state, college_type, logo_url, admission_status, pci_status, short_description,
            college_courses (course_name)
          `)
          .eq("is_featured", true)
          .eq("is_published", true)
          .order("display_order", { ascending: true })
          .limit(6);

        if (notesData) setLatestNotes(notesData as Note[]);
        if (blogsData) setLatestBlogs(blogsData as Blog[]);
        if (drugData) setDrugOfTheDay(drugData as DrugOfTheDay);
        if (casesData) setLatestCases(casesData as ClinicalCase[]);
        if (collegesData) setFeaturedColleges(collegesData as unknown as HomeCollege[]);
      } catch (err) {
        console.error("Error fetching homepage details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden relative">
      {/* Background Graphic elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] aspect-square rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[30%] aspect-square rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-hidden rx-watermark">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-150 rounded-full px-3 py-1.5 mb-6 max-w-full">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold text-cyan-650 tracking-wider uppercase truncate">
            Syllabus-Aligned Resources
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4 max-w-3xl px-2">
          Fuel Your Pharmacy Journey With{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-500">
            RxFusion
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed mb-8 px-4">
          Access curated lecture notes, syllabus resources, lab manuals, and tutorials — structured for Pharm.D, B.Pharm, and D.Pharm students.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 w-full px-4">
          <a
            href="/notes"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4" />
            Browse Notes
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/resources"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all duration-200"
          >
            <FolderOpen className="w-4 h-4" />
            Syllabus Library
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-6 sm:gap-12 max-w-xs mx-auto w-full px-4 pt-4 border-t border-slate-200/60">
          {[
            { value: "100%", label: "Syllabus Focused" },
            { value: "3", label: "Pharmacy Streams" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg sm:text-xl font-black text-slate-800">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-slate-555 mt-0.5 leading-normal">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Discovery Rows Section */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Discover RxFusion</h2>
            <p className="text-sm text-slate-500">Everything you need for your pharmacy learning journey.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { title: "Pharmacy Notes", path: "/notes", desc: "Lecture notes by course and year", icon: <FileText className="w-5 h-5 text-cyan-500" /> },
              { title: "Drug of the Day", path: "/drugs", desc: "Pharmacology & clinical drug insights", icon: <Pill className="w-5 h-5 text-emerald-500" /> },
              { title: "Clinical Cases", path: "/cases", desc: "Patient cases & clinical discussions", icon: <Stethoscope className="w-5 h-5 text-indigo-500" /> },
              { title: "Pharmacy Blogs", path: "/blogs", desc: "Scientific articles & updates", icon: <BookOpen className="w-5 h-5 text-violet-500" /> },
              { title: "Latest News", path: "/news", desc: "Global pharma news & updates", icon: <Newspaper className="w-5 h-5 text-rose-500" /> },
              { title: "Student Resources", path: "/resources", desc: "Syllabus details & circular manuals", icon: <BookMarked className="w-5 h-5 text-sky-500" /> }
            ].map((item) => (
              <Link
                key={item.title}
                href={item.path}
                className="group flex items-center justify-between p-4 bg-white border border-slate-200/50 hover:border-cyan-300 rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-50 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RxFusion Student Tools Section */}
      <section className="py-14 px-4 bg-gradient-to-tr from-slate-50 to-cyan-50/20 border-y border-slate-250/40 relative">
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-cyan-550/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-100/50 border border-cyan-200 text-[10px] font-bold text-cyan-750 uppercase tracking-widest">
              RXFUSION STUDENT TOOLS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Everything You Need for Your Pharmacy Journey
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Study smarter with pharmacy notes, drug information, viva preparation, clinical tools, quizzes, and exam resources.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Drug Database", path: "/drugs", desc: "Generic profile search, drug class, MoA & counselling", icon: <Pill className="w-5 h-5 text-emerald-500" /> },
              { name: "Viva Questions", path: "/viva", desc: "Interactive oral preparation with exam answers & pearls", icon: <HelpCircle className="w-5 h-5 text-cyan-600" /> },
              { name: "Daily Quiz", path: "/quiz", desc: "Challenge yourself with daily pharma MCQs and track streaks", icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
              { name: "Clinical Tools", path: "/clinical-tools", desc: "BMI, BSA, CrCl, and pediatric dose calculators", icon: <Calculator className="w-5 h-5 text-sky-500" /> },
              { name: "Question Bank", path: "/question-bank", desc: "Chapter-wise long/short university exam questions", icon: <Layers className="w-5 h-5 text-indigo-500" /> },
              { name: "Question Papers", path: "/question-papers", desc: "University previous year questions (PYQs) downloads", icon: <FileText className="w-5 h-5 text-violet-500" /> },
              { name: "Flashcards", path: "/flashcards", desc: "Interactive term definitions deck & learned tracking", icon: <BookMarked className="w-5 h-5 text-rose-500" /> },
              { name: "Pharmacy Colleges", path: "/colleges", desc: "Search course structures, intakes & admissions", icon: <GraduationCap className="w-5 h-5 text-cyan-550" /> }
            ].map((tool) => (
              <Link
                key={tool.name}
                href={tool.path}
                className="group flex flex-col justify-between p-5 bg-white border border-slate-200/60 hover:border-cyan-300 hover:shadow-md rounded-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-cyan-50 transition-colors">
                    {tool.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-850 group-hover:text-cyan-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[10px] leading-relaxed text-slate-450 font-semibold line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-slate-100 text-[10px] sm:text-xs font-bold text-cyan-600 group-hover:text-cyan-500 transition-all">
                  <span>Explore tool</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Select Course Section */}
      <section className="py-12 px-4 bg-slate-100/50 border-y border-slate-200/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-cyan-600 uppercase tracking-widest mb-2">
              Course Streams
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Select Your Course
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Browse notes organized by year and semester for your pharmacy academic journey.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pharm.D card */}
            <Link
              href="/notes/Pharm%20D"
              className="group relative flex flex-col p-6 rounded-2xl bg-white border border-slate-200/60 hover:border-cyan-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition-colors">
                <GraduationCap className="w-5 h-5 text-cyan-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-0.5">Pharm.D</h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">Doctor of Pharmacy</p>
              <span className="inline-flex items-center self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600 border border-cyan-100 mb-4">
                6 Years (Annual System)
              </span>
              <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">
                Access academic material, reference sheets, clinical records, and pharmaceutical logs for Doctor of Pharmacy.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-cyan-600 group-hover:text-cyan-500 transition-colors">
                  Explore Lecture Notes
                </span>
                <ArrowRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>

            {/* B.Pharm card */}
            <Link
              href="/notes/B%20Pharm"
              className="group relative flex flex-col p-6 rounded-2xl bg-white border border-slate-200/60 hover:border-violet-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-4 group-hover:bg-violet-500 transition-colors">
                <BookOpen className="w-5 h-5 text-violet-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-0.5">B.Pharm</h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">Bachelor of Pharmacy</p>
              <span className="inline-flex items-center self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 border border-violet-100 mb-4">
                8 Semesters (4 Years)
              </span>
              <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">
                Access notes for organic chemistry, pharmacology, pharmacognosy, pharmaceutics, and jurisprudence.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-violet-600 group-hover:text-violet-500 transition-colors">
                  Explore Lecture Notes
                </span>
                <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>

            {/* D.Pharm card */}
            <Link
              href="/notes/D%20Pharm"
              className="group relative flex flex-col p-6 rounded-2xl bg-white border border-slate-200/60 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                <FileText className="w-5 h-5 text-emerald-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-0.5">D.Pharm</h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">Diploma in Pharmacy</p>
              <span className="inline-flex items-center self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4">
                2 Years
              </span>
              <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">
                2-year foundation course notes covering basic pharmacology, biochemistry, health education, and pharmacy laws.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-500 transition-colors">
                  Explore Lecture Notes
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Colleges Section */}
      {featuredColleges.length > 0 && (
        <section className="py-16 px-4 bg-white border-y border-slate-200/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
              <div>
                <p className="text-xs font-semibold text-cyan-600 uppercase tracking-widest mb-2">
                  Pharmacy College Explorer
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Find Your Pharmacy College
                </h2>
                <p className="text-slate-550 text-sm max-w-xl leading-relaxed">
                  Discover pharmacy colleges, courses, and admission information with RxFusion.
                </p>
              </div>
              <Link
                href="/colleges"
                className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                Explore All Colleges
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredColleges.map((college) => {
                // Admission status helper mapping
                const getAdmissionStatusDisplay = (status: string) => {
                  switch (status?.toLowerCase()) {
                    case "admission_open":
                    case "admission open":
                      return { label: "Admission Open", bg: "bg-emerald-50 text-emerald-600 border-emerald-200" };
                    case "admission_closed":
                    case "admission closed":
                      return { label: "Admission Closed", bg: "bg-rose-50 text-rose-600 border-rose-200" };
                    case "update_soon":
                    case "admission update soon":
                      return { label: "Admission Update Soon", bg: "bg-amber-50 text-amber-600 border-amber-200" };
                    case "contact_college":
                    case "contact college":
                      return { label: "Contact College", bg: "bg-sky-50 text-sky-600 border-sky-200" };
                    default:
                      return { label: "Not Updated", bg: "bg-slate-100 text-slate-650 border-slate-200" };
                  }
                };

                const statusInfo = getAdmissionStatusDisplay(college.admission_status);
                const uniqueCourses = Array.from(
                  new Set(college.college_courses?.map((c) => c.course_name) || [])
                );

                return (
                  <div
                    key={college.id}
                    className="flex flex-col bg-slate-50/50 border border-slate-200/60 hover:border-cyan-300 hover:bg-white hover:shadow-md rounded-2xl p-6 transition-all duration-300 relative group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {/* Logo container */}
                      <div className="w-14 h-14 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 bg-white overflow-hidden shadow-2xs">
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
                      {/* Name and Type */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-2 hover:text-cyan-600 transition-colors">
                          <Link href={`/colleges/${college.slug}`}>{college.name}</Link>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          {college.city}, {college.state}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 flex-1">
                      <div className="flex flex-wrap gap-1.5 mb-3 items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Type:
                        </span>
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded-sm">
                          {college.college_type || "Other"}
                        </span>
                      </div>
                      {uniqueCourses.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {uniqueCourses.map((c) => (
                            <span
                              key={c}
                              className="text-[9px] font-bold text-cyan-600 bg-cyan-50/70 border border-cyan-100 px-2 py-0.5 rounded-full"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      {college.short_description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {college.short_description}
                        </p>
                      )}
                    </div>

                    {/* Admission Status & view */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.bg}`}
                      >
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
          </div>
        </section>
      )}

      {/* Start Learning for Free Promo Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white border border-slate-200 p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-4">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">Start Learning for Free</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Download Any 2 Notes Free</h2>
            <p className="text-slate-550 text-sm max-w-md mx-auto leading-relaxed mb-6">
              Explore RxFusion pharmacy notes and download your first 2 notes for free. Need more? Contact RxFusion for additional access.
            </p>
            <Link
              href="/notes"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              Browse Free Notes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Drug of the Day Section */}
      {drugOfTheDay && (
        <section className="py-12 px-4 bg-slate-100/50 border-y border-slate-200/40">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-cyan-600 uppercase tracking-widest mb-1.5">
                Featured Pharmacology
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Drug of the Day
              </h2>
            </div>

            {/* Drug Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs hover:border-cyan-300 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                {/* Left: Image (2 cols) */}
                <div className="md:col-span-2 aspect-video md:aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-150">
                  {drugOfTheDay.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={drugOfTheDay.image_url}
                      alt={drugOfTheDay.drug_name}
                      className="object-cover w-full h-full hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <Pill className="w-12 h-12 text-cyan-500/40" />
                  )}
                </div>
                {/* Right: Info (3 cols) */}
                <div className="md:col-span-3 space-y-4 text-left">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-600 border border-cyan-100 mb-2">
                      {drugOfTheDay.drug_class}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">
                      {drugOfTheDay.drug_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Generic Name: <strong className="text-slate-700">{drugOfTheDay.generic_name}</strong>
                    </p>
                  </div>
                  {drugOfTheDay.moa && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {drugOfTheDay.moa.replace(/<[^>]*>/g, "")}
                    </p>
                  )}
                  <Link
                    href={`/drugs/${drugOfTheDay.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-cyan-500 text-white hover:bg-cyan-600 shadow-xs transition-all duration-200"
                  >
                    Read More
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Clinical Cases Section */}
      {latestCases.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
                  Clinical Practice
                </p>
                <h2 className="text-2xl font-bold text-slate-900">Latest Clinical Cases</h2>
              </div>
              <Link href="/cases" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-cyan-500 transition-colors">
                View all cases <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestCases.map((c) => (
                <div
                  key={c.id}
                  className="group flex flex-col p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {c.department}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{c.gender}, {c.age} years</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors mb-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Disease: <strong className="text-slate-700">{c.disease}</strong>
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
                    <Link
                      href={`/cases/${c.slug}`}
                      className="text-xs font-bold text-emerald-600 group-hover:text-emerald-500 transition-colors"
                    >
                      Read More
                    </Link>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Uploads & Blogs */}
      {showSection && (
        <>
          {/* Recent Notes Section */}
          {hasNotes && (
            <section className="py-12 px-4 bg-slate-100/50 border-t border-slate-200/40">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs font-semibold text-cyan-600 uppercase tracking-widest mb-1">
                      Latest Additions
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900">Recent Notes Uploaded</h2>
                  </div>
                  <Link href="/notes" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-cyan-500 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
                    ))
                  ) : latestNotes.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">No notes uploaded yet. Check back soon!</p>
                    </div>
                  ) : (
                    latestNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => handlePreviewClick(note)}
                        className="group flex flex-col p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-xs transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {note.course}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">Sem {note.semester}</span>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-cyan-600 transition-colors">
                              {note.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Latest Pharmacy Insights (Blogs) Section */}
          {hasBlogs && (
            <section className="py-16 px-4 bg-slate-50 border-t border-slate-200/40">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs font-semibold text-violet-650 uppercase tracking-widest mb-1">
                      Insights & Reviews
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900">Latest Pharmacy Insights</h2>
                  </div>
                  <Link href="/blogs" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-cyan-500 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="h-40 bg-white border border-slate-200 rounded-xl animate-pulse" />
                    ))
                  ) : latestBlogs.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">No blogs posted yet. Scientific reviews coming soon!</p>
                    </div>
                  ) : (
                    latestBlogs.map((blog) => (
                      <Link
                        key={blog.id}
                        href={`/blogs/${blog.slug}`}
                        className="group flex flex-col p-5 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-xs transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0 mb-4 text-left">
                          <p className="text-[10px] text-slate-500 font-bold mb-1.5">
                            {new Date(blog.published_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-violet-600 transition-colors">
                            {blog.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                          <span className="text-xs font-bold text-violet-600 group-hover:text-violet-500 transition-colors">
                            Read Article
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-violet-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}
      {/* NotePreviewModal has been removed in favor of the controlled in-site viewer */}
    </main>
  );
}
