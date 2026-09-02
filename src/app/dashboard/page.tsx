"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Pill, 
  Bookmark, 
  Activity, 
  Sparkles, 
  User, 
  Phone, 
  School, 
  Edit2, 
  Compass, 
  ChevronRight, 
  Clock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Calculator,
  CheckCircle,
  Search,
  X,
  Layers
} from "lucide-react";
import Link from "next/link";

interface RecentActivity {
  id: string;
  content_type: string;
  content_id: string;
  content_title: string;
  content_url: string;
  viewed_at: string;
}

interface ResolvedBookmark {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
  resolvedDetails: {
    title?: string;
    drug_name?: string;
    name?: string;
    generic_name?: string;
    drug_class?: string;
    course?: string;
    semester?: number;
    subject?: string;
    city?: string;
    state?: string;
    slug?: string;
    department?: string;
    disease?: string;
    aim?: string;
    experiment_number?: string;
    definition?: string;
  } | null;
}

interface RecommendedNote {
  id: string;
  title: string;
  description: string;
  course: string;
  semester: number;
  subject: string;
  created_at: string;
}

interface UpdateItem {
  id: string;
  title: string;
  type: "note" | "drug" | "case" | "blog";
  url: string;
  date: string;
}

export default function StudentDashboard() {
  const { profile, setStudentProfile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [bookmarks, setBookmarks] = useState<ResolvedBookmark[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedNote[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<UpdateItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "notes" | "drugs" | "cases" | "colleges" | "viva" | "labs" | "quiz" | "question_bank" | "question_papers" | "flashcards">("all");

  // Learning Progress Stats
  const [quizStats, setQuizStats] = useState({
    attemptsCount: 0,
    correctCount: 0,
    accuracy: 0,
    streak: 0
  });
  const [learnedCount, setLearnedCount] = useState(0);

  // Loaders
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Profile Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editCustomCourse, setEditCustomCourse] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Sync edits state with profile when it opens
  const openEditModal = () => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditCourse(profile.course || "");
      setEditCustomCourse(profile.custom_course || "");
      setEditYear(profile.current_year || "");
      setEditCollege(profile.college_name || "");
      setEditMobile(profile.mobile_number || "");
      setUpdateError(null);
      setEditModalOpen(true);
    }
  };

  // Fetch Dashboard Stats & Content
  useEffect(() => {
    if (authLoading) return;
    if (!profile) {
      router.push("/login?redirectTo=/dashboard");
      return;
    }

    const studentId = profile.id;

    // 1. Fetch recent activity
    async function fetchActivity() {
      try {
        const res = await fetch(`/api/student/activity?studentId=${studentId}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activity || []);
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
      } finally {
        setLoadingActivity(false);
      }
    }

    // 2. Fetch bookmarks
    async function fetchBookmarks() {
      try {
        const res = await fetch(`/api/student/bookmarks?studentId=${studentId}`);
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data.bookmarks || []);
        }
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      } finally {
        setLoadingBookmarks(false);
      }
    }

    // 3. Fetch recommended notes
    async function fetchRecommendations() {
      try {
        const res = await fetch(`/api/student/recommendations?course=${encodeURIComponent(profile?.course || "")}&currentYear=${encodeURIComponent(profile?.current_year || "")}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoadingRecs(false);
      }
    }

    // 4. Fetch learning progress stats (Quiz and Flashcards)
    async function fetchLearningStats() {
      try {
        const [quizRes, fcRes] = await Promise.all([
          fetch(`/api/student/quiz?studentId=${studentId}`),
          fetch(`/api/student/flashcards?studentId=${studentId}`)
        ]);

        if (quizRes.ok) {
          const quizData = await quizRes.json();
          if (quizData.stats) {
            setQuizStats({
              attemptsCount: quizData.stats.attemptsCount || 0,
              correctCount: quizData.stats.correctCount || 0,
              accuracy: quizData.stats.accuracy || 0,
              streak: quizData.stats.streak || 0
            });
          }
        }

        if (fcRes.ok) {
          const fcData = await fcRes.json();
          if (fcData.learnedIds) {
            setLearnedCount(fcData.learnedIds.length);
          }
        }
      } catch (err) {
        console.error("Error loading learning stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    // 5. Fetch latest platform updates
    async function fetchLatestUpdates() {
      try {
        // Query recent content from DB in parallel
        // We will mock / retrieve latest content using supabase client locally (client side)
        const { supabase } = await import("@/lib/supabase");
        
        const [notesRes, drugsRes, casesRes, blogsRes] = await Promise.all([
          supabase.from("notes").select("id, title, created_at").order("created_at", { ascending: false }).limit(2),
          supabase.from("drug_of_the_day").select("id, drug_name, slug, created_at").eq("status", "published").order("created_at", { ascending: false }).limit(2),
          supabase.from("clinical_cases").select("id, title, slug, created_at").eq("status", "published").order("created_at", { ascending: false }).limit(2),
          supabase.from("blogs").select("id, title, slug, created_at").order("created_at", { ascending: false }).limit(2)
        ]);

        const items: UpdateItem[] = [];

        if (notesRes.data) {
          notesRes.data.forEach((n) => {
            items.push({
              id: n.id,
              title: n.title,
              type: "note",
              url: `/notes`, // We can redirect to the course folder
              date: n.created_at
            });
          });
        }

        if (drugsRes.data) {
          drugsRes.data.forEach((d) => {
            items.push({
              id: d.id,
              title: d.drug_name,
              type: "drug",
              url: `/drugs/${d.slug}`,
              date: d.created_at
            });
          });
        }

        if (casesRes.data) {
          casesRes.data.forEach((c) => {
            items.push({
              id: c.id,
              title: c.title,
              type: "case",
              url: `/cases/${c.slug}`,
              date: c.created_at
            });
          });
        }

        if (blogsRes.data) {
          blogsRes.data.forEach((b) => {
            items.push({
              id: b.id,
              title: b.title,
              type: "blog",
              url: `/blogs/${b.slug}`,
              date: b.created_at
            });
          });
        }

        // Sort items by date descending
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLatestUpdates(items.slice(0, 6));
      } catch (err) {
        console.error("Error fetching latest updates:", err);
      } finally {
        setLoadingUpdates(false);
      }
    }

    fetchActivity();
    fetchBookmarks();
    fetchRecommendations();
    fetchLearningStats();
    fetchLatestUpdates();
  }, [profile, authLoading, router]);

  // Handle profile update form submit
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUpdateError(null);
    setUpdatingProfile(true);

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = editMobile.trim().replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      setUpdateError("Please enter a valid 10-digit mobile number.");
      setUpdatingProfile(false);
      return;
    }

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          fullName: editName.trim(),
          course: editCourse,
          customCourse: editCourse === "Other" ? editCustomCourse.trim() : null,
          currentYear: editYear,
          collegeName: editCollege.trim(),
          mobileNumber: editMobile.trim()
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }

      setStudentProfile(result.profile);
      setEditModalOpen(false);
    } catch (err: unknown) {
      console.error(err);
      setUpdateError(err instanceof Error ? err.message : "Error saving profile. Please try again.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getYearOptions = (selectedCourse: string) => {
    switch (selectedCourse) {
      case "Pharm.D":
        return ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Internship / 6th Year"];
      case "B.Pharm":
        return ["1st Year", "2nd Year", "3rd Year", "4th Year"];
      case "D.Pharm":
      case "M.Pharm":
        return ["1st Year", "2nd Year"];
      default:
        return ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year", "Other"];
    }
  };

  // Resolve Bookmark Title display helpers
  const getBookmarkTitle = (b: ResolvedBookmark) => {
    if (!b.resolvedDetails) return "Unavailable Content";
    return b.resolvedDetails.title || b.resolvedDetails.drug_name || b.resolvedDetails.name || "Untitled";
  };

  const getBookmarkSubtitle = (b: ResolvedBookmark) => {
    if (!b.resolvedDetails) return "Item was removed";
    if (b.content_type === "notes") {
      return `Subject: ${b.resolvedDetails.subject} | Sem/Yr: ${b.resolvedDetails.semester}`;
    } else if (b.content_type === "drugs") {
      return `Generic: ${b.resolvedDetails.generic_name}`;
    } else if (b.content_type === "colleges") {
      return `${b.resolvedDetails.city}, ${b.resolvedDetails.state}`;
    } else if (b.content_type === "cases") {
      return `Dept: ${b.resolvedDetails.department} | Disease: ${b.resolvedDetails.disease}`;
    } else if (b.content_type === "viva") {
      return `Subject: ${b.resolvedDetails.subject} | Course: ${b.resolvedDetails.course}`;
    } else if (b.content_type === "labs") {
      return `Subject: ${b.resolvedDetails.subject} | Aim: ${b.resolvedDetails.aim}`;
    } else if (b.content_type === "quiz") {
      return "Daily Quiz Question";
    } else if (b.content_type === "question_bank") {
      return `Subject: ${b.resolvedDetails.subject} | Course: ${b.resolvedDetails.course}`;
    } else if (b.content_type === "question_papers") {
      return `Subject: ${b.resolvedDetails.subject} | Course: ${b.resolvedDetails.course}`;
    } else if (b.content_type === "flashcards") {
      return `Subject: ${b.resolvedDetails.subject} | Definition: ${b.resolvedDetails.definition ? b.resolvedDetails.definition.substring(0, 40) + '...' : ''}`;
    }
    return "";
  };

  const getBookmarkUrl = (b: ResolvedBookmark) => {
    if (!b.resolvedDetails) return "#";
    if (b.content_type === "notes") {
      return `/notes/${encodeURIComponent(b.resolvedDetails.course || "")}`;
    } else if (b.content_type === "drugs") {
      return `/drugs/${b.resolvedDetails.slug}`;
    } else if (b.content_type === "cases") {
      return `/cases/${b.resolvedDetails.slug}`;
    } else if (b.content_type === "blogs") {
      return `/blogs/${b.resolvedDetails.slug}`;
    } else if (b.content_type === "colleges") {
      return `/colleges/${b.resolvedDetails.slug}`;
    } else if (b.content_type === "viva") {
      return "/viva";
    } else if (b.content_type === "labs") {
      return `/labs/${b.content_id}`;
    } else if (b.content_type === "quiz") {
      return "/quiz";
    } else if (b.content_type === "question_bank") {
      return "/question-bank";
    } else if (b.content_type === "question_papers") {
      return "/question-papers";
    } else if (b.content_type === "flashcards") {
      return "/flashcards";
    }
    return "#";
  };

  // Filter Bookmarks by Tab Selection
  const filteredBookmarks = bookmarks.filter((b) => {
    if (activeTab === "all") return true;
    return b.content_type === activeTab;
  });

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-500 mt-2">Loading learning portal...</p>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50/70 pt-20 sm:pt-24 pb-16 relative">
      {/* Glow graphics background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">👋</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back, <span className="bg-gradient-to-r from-cyan-600 to-sky-500 bg-clip-text text-transparent">{profile.full_name}</span>
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
                {profile.course} {profile.current_year}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50">
                <School className="w-3.5 h-3.5 text-cyan-600" />
                {profile.college_name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openEditModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-all active:scale-98"
            >
              <Edit2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={signOut}
              className="px-4 py-2 border border-red-200 bg-red-50/50 text-xs font-bold text-red-650 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all active:scale-98"
            >
              Logout
            </button>
          </div>
        </section>

        {/* Universal Search Box Card */}
        <section 
          onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
          className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:border-cyan-300 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center transition-colors">
              <Search className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">Search RxFusion...</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Find lecture notes, drug classes, clinical cases, colleges, and news updates instantly.</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-200">
            Ctrl + K
          </span>
        </section>

        {/* Dashboard grid structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main learning content areas (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Continue Learning (Recently Viewed & Progress) */}
            <section className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-5 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span>Continue Learning</span>
              </h2>

              {loadingActivity ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                  <span>Loading learning activity...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="p-6 sm:p-8 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-4">
                  <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-slate-800 font-bold">You haven&apos;t completed any learning activities yet.</p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Start exploring pharmacy notes, taking daily quizzes, or studying flashcards to track your learning progress here.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <Link
                      href="/quiz"
                      className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Take Daily Quiz
                    </Link>
                    <Link
                      href="/flashcards"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      Explore Flashcards
                    </Link>
                    <Link
                      href="/cases"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      Browse Clinical Cases
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((act) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      notes: <FileText className="w-4 h-4 text-cyan-500" />,
                      drugs: <Pill className="w-4 h-4 text-emerald-500" />,
                      cases: <Activity className="w-4 h-4 text-violet-500" />,
                      quiz: <Sparkles className="w-4 h-4 text-amber-500" />,
                      flashcards: <Layers className="w-4 h-4 text-sky-500" />,
                      blogs: <BookOpen className="w-4 h-4 text-blue-500" />,
                      colleges: <School className="w-4 h-4 text-indigo-500" />
                    };
                    return (
                      <Link 
                        key={act.id}
                        href={act.content_url}
                        className="flex items-center justify-between p-3.5 hover:bg-slate-50 border border-slate-100/80 rounded-2xl group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                            {iconMap[act.content_type] || <FileText className="w-4 h-4 text-cyan-500" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-850 line-clamp-1 group-hover:text-cyan-600 transition-colors">
                              {act.content_title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              Activity recorded {new Date(act.viewed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 group-hover:text-cyan-500">
                          <span className="hidden sm:inline">Continue</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 2. Recommended Notes */}
            <section className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-5 shadow-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span>Recommended for Your Syllabus</span>
                </h2>
                <span className="text-[10px] font-extrabold text-cyan-650 bg-cyan-50 border border-cyan-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {profile.course} Notes
                </span>
              </div>

              {loadingRecs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-slate-50 animate-pulse border border-slate-100 rounded-2xl" />
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-150 rounded-2xl bg-slate-50/50">
                  <FileText className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-xs text-slate-800 font-bold">No recommendations available.</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">We couldn&apos;t find notes for your course and year in our database.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes/${encodeURIComponent(note.course)}`}
                      className="p-4 bg-white border border-slate-200/60 hover:border-cyan-300 rounded-2xl flex flex-col justify-between hover:shadow-3xs transition-all group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-extrabold uppercase bg-cyan-50 text-cyan-600 border border-cyan-100 px-2 py-0.5 rounded-md">
                            Sem {note.semester}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-cyan-650 transition-colors">
                          {note.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Subject: {note.subject}
                        </p>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-end text-[11px] font-bold text-cyan-600 group-hover:text-cyan-500 gap-1">
                        <span>Access Material</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* 3. My Saved Content (Bookmarks) */}
            <section className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-5 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-500" />
                <span>My Saved Content</span>
              </h2>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: "All" },
                  { id: "notes", label: "Notes" },
                  { id: "drugs", label: "Drugs" },
                  { id: "cases", label: "Cases" },
                  { id: "colleges", label: "Colleges" },
                  { id: "viva", label: "Viva" },
                  { id: "labs", label: "Labs" },
                  { id: "quiz", label: "Quiz" },
                  { id: "question_bank", label: "Q Bank" },
                  { id: "question_papers", label: "PYQs" },
                  { id: "flashcards", label: "Flashcards" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "all" | "notes" | "drugs" | "cases" | "colleges" | "viva" | "labs" | "quiz" | "question_bank" | "question_papers" | "flashcards")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                      activeTab === tab.id
                        ? "bg-cyan-500 border-cyan-500 text-white shadow-xs shadow-cyan-500/10"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loadingBookmarks ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading saved items...</span>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-150 rounded-2xl bg-slate-50/50">
                  <Bookmark className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-xs text-slate-800 font-bold">No saved content.</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Use the Bookmark icon on drug files or colleges to save them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.id}
                      href={getBookmarkUrl(bookmark)}
                      className="p-4 bg-white border border-slate-200/60 hover:border-cyan-300 rounded-2xl flex flex-col justify-between hover:shadow-3xs transition-all group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 border border-slate-200/40 px-2 py-0.5 rounded-md">
                            {bookmark.content_type}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-850 line-clamp-1 group-hover:text-cyan-650 transition-colors">
                          {getBookmarkTitle(bookmark)}
                        </h3>
                        {getBookmarkSubtitle(bookmark) && (
                          <p className="text-[10px] text-slate-500">
                            {getBookmarkSubtitle(bookmark)}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-end text-[11px] font-bold text-cyan-600 group-hover:text-cyan-500 gap-1">
                        <span>Open Item</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Quick Stats, Updates & Access Sidebar (Right 1 column) */}
          <div className="space-y-8">
            
            {/* Learning Progress Stats block */}
            <section className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4 shadow-xs">
              <h2 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                <span>Learning Progress</span>
              </h2>
              
              {loadingStats ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading progress...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quiz Attempts</p>
                    <p className="text-base font-black text-slate-800">{quizStats.attemptsCount}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quiz Accuracy</p>
                    <p className="text-base font-black text-cyan-600">{quizStats.accuracy}%</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quiz Streak</p>
                    <p className="text-base font-black text-amber-500">{quizStats.streak} Days</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cards Learned</p>
                    <p className="text-base font-black text-emerald-600">{learnedCount}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Quick Access Grid */}
            <section className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-5 shadow-xs">
              <h2 className="text-xs font-bold text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-2">Quick Access</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/notes"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <BookOpen className="w-5 h-5 text-cyan-550 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Lecture Notes</span>
                </Link>

                <Link
                  href="/drugs"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <Pill className="w-5 h-5 text-emerald-500 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Drug Database</span>
                </Link>

                <Link
                  href="/cases"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <Activity className="w-5 h-5 text-violet-500 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Clinical Cases</span>
                </Link>

                <Link
                  href="/clinical-tools"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <Calculator className="w-5 h-5 text-sky-500 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Clinical Tools</span>
                </Link>

                <Link
                  href="/viva"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <HelpCircle className="w-5 h-5 text-cyan-600 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Viva Hub</span>
                </Link>

                <Link
                  href="/quiz"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <Sparkles className="w-5 h-5 text-amber-500 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Daily Quiz</span>
                </Link>

                <Link
                  href="/question-bank"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <Layers className="w-5 h-5 text-indigo-500 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Q Bank</span>
                </Link>

                <Link
                  href="/question-papers"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <FileText className="w-5 h-5 text-pink-500 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">PYQs Papers</span>
                </Link>

                <Link
                  href="/flashcards"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <Bookmark className="w-5 h-5 text-rose-500 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Flashcards</span>
                </Link>

                <Link
                  href="/colleges"
                  className="p-3 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <GraduationCap className="w-5 h-5 text-cyan-600 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-600">Colleges</span>
                </Link>
              </div>
            </section>

            {/* Latest RxFusion Updates */}
            <section className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-5 shadow-xs">
              <h2 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Platform Updates</h2>

              {loadingUpdates ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking updates...</span>
                </div>
              ) : latestUpdates.length === 0 ? (
                <p className="text-[11px] text-slate-450">No updates recently.</p>
              ) : (
                <div className="space-y-4">
                  {latestUpdates.map((item) => {
                    const badgeColors = {
                      note: "bg-cyan-50 text-cyan-600 border-cyan-100",
                      drug: "bg-emerald-50 text-emerald-600 border-emerald-100",
                      case: "bg-violet-50 text-violet-600 border-violet-100",
                      blog: "bg-slate-100 text-slate-600 border-slate-200/65",
                    };
                    return (
                      <Link 
                        key={item.id} 
                        href={item.url} 
                        className="block space-y-1 group border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded-md ${badgeColors[item.type] || "bg-slate-100"}`}>
                            {item.type}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-1 leading-snug">
                          {item.title}
                        </h4>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

          </div>

        </div>

      </main>

      {/* Edit Profile Modal Dialog */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-xl">
            <button 
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Update Profile Details</h3>
              <p className="text-xs text-slate-500">Keep your academic course and year details current.</p>
            </div>

            {updateError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Course</label>
                  <select
                    required
                    value={editCourse}
                    onChange={(e) => {
                      setEditCourse(e.target.value);
                      const options = getYearOptions(e.target.value);
                      if (!options.includes(editYear)) setEditYear("");
                    }}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm font-semibold cursor-pointer"
                  >
                    <option value="Pharm.D">Pharm.D</option>
                    <option value="B.Pharm">B.Pharm</option>
                    <option value="D.Pharm">D.Pharm</option>
                    <option value="M.Pharm">M.Pharm</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Year</label>
                  <select
                    required
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm font-semibold cursor-pointer"
                  >
                    <option value="" disabled>Select Year</option>
                    {getYearOptions(editCourse).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editCourse === "Other" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Enter Custom Course</label>
                  <input
                    type="text"
                    required
                    value={editCustomCourse}
                    onChange={(e) => setEditCustomCourse(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm font-semibold"
                    placeholder="Enter custom course name"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">College Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <School className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/60 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
