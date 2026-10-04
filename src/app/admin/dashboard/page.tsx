"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  BookOpen, 
  Newspaper, 
  Download, 
  Mail, 
  Trash2, 
  Calendar, 
  Loader2, 
  Inbox, 
  HelpCircle, 
  BookMarked,
  ClipboardList,
  Users,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

interface Stats {
  notesCount: number;
  blogsCount: number;
  newsCount: number;
  downloadsCount: number;
  quizCount: number;
  qbCount: number;
  qpCount: number;
  fcCount: number;
  todaysQuizzesCount: number;
  quizAttemptsCount: number;
  activeStudentsCount: number;
  newArticleOrdersCount: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface RecentDownload {
  id: string;
  downloaded_at: string;
  notes: {
    title: string;
    course: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    notesCount: 0,
    blogsCount: 0,
    newsCount: 0,
    downloadsCount: 0,
    quizCount: 0,
    qbCount: 0,
    qpCount: 0,
    fcCount: 0,
    todaysQuizzesCount: 0,
    quizAttemptsCount: 0,
    activeStudentsCount: 0,
    newArticleOrdersCount: 0,
  });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<RecentDownload[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch stats count in parallel
      const [
        { count: notesCount },
        { count: blogsCount },
        { count: newsCount },
        { count: downloadsCount },
        { count: quizCount },
        { count: qbCount },
        { count: qpCount },
        { count: fcCount }
      ] = await Promise.all([
        supabase.from("notes").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("news").select("*", { count: "exact", head: true }),
        supabase.from("downloads").select("id, notes!inner(id)", { count: "exact", head: true }),
        supabase.from("quiz_questions").select("*", { count: "exact", head: true }),
        supabase.from("question_bank").select("*", { count: "exact", head: true }),
        supabase.from("question_papers").select("*", { count: "exact", head: true }),
        supabase.from("flashcards").select("*", { count: "exact", head: true }),
      ]);

      // Fetch dynamic analytics from new API routes
      let todaysQuizzesCount = 0;
      let quizAttemptsCount = 0;
      let activeStudentsCount = 0;
      let newArticleOrdersCount = 0;

      try {
        const [dailyRes, analyticsRes, ordersRes, usersRes] = await Promise.all([
          fetch("/api/admin/daily-quiz"),
          fetch("/api/admin/quiz-analytics"),
          fetch("/api/admin/article-orders"),
          supabase.from("student_profiles").select("id", { count: "exact", head: true })
        ]);

        if (dailyRes.ok) {
          const dData = await dailyRes.json();
          const todayStr = new Date().toISOString().split("T")[0];
          todaysQuizzesCount = (dData.dailyQuizzes || []).filter((q: { quiz_date: string }) => q.quiz_date === todayStr).length;
        }

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          quizAttemptsCount = aData.summary?.totalAttempts || 0;
        }

        if (ordersRes.ok) {
          const oData = await ordersRes.json();
          newArticleOrdersCount = oData.summary?.newOrders || 0;
        }

        activeStudentsCount = usersRes.count || 0;
      } catch (err) {
        console.warn("Secondary metric fetch issue:", err);
      }

      setStats({
        notesCount: notesCount || 0,
        blogsCount: blogsCount || 0,
        newsCount: newsCount || 0,
        downloadsCount: downloadsCount || 0,
        quizCount: quizCount || 0,
        qbCount: qbCount || 0,
        qpCount: qpCount || 0,
        fcCount: fcCount || 0,
        todaysQuizzesCount,
        quizAttemptsCount,
        activeStudentsCount,
        newArticleOrdersCount,
      });

      // Fetch contact messages
      const { data: msgData } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (msgData) setMessages(msgData as ContactMessage[]);

      // Fetch recent downloads
      const { data: dlData } = await supabase
        .from("downloads")
        .select("id, downloaded_at, notes(title, course)")
        .order("downloaded_at", { ascending: false })
        .limit(5);

      if (dlData) setRecentDownloads(dlData as unknown as RecentDownload[]);

    } catch (err) {
      console.error("Dashboard metric load fail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return;
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setMessages(messages.filter((m) => m.id !== id));
    } catch {
      alert("Failed to delete message");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-500 mt-2">Aggregating dashboard stats...</p>
      </div>
    );
  }

  // Highlight Cards specified in Requirement 11
  const highlightCards = [
    { label: "Today's Quizzes", value: stats.todaysQuizzesCount, icon: <Calendar className="w-5 h-5" />, href: "/admin/daily-quiz", color: "cyan" as const, desc: "Active daily tests today" },
    { label: "Quiz Attempts", value: stats.quizAttemptsCount, icon: <CheckCircle className="w-5 h-5" />, href: "/admin/quiz-analytics", color: "violet" as const, desc: "Total student submissions" },
    { label: "Active Students", value: stats.activeStudentsCount, icon: <Users className="w-5 h-5" />, href: "/admin/users", color: "emerald" as const, desc: "Registered pharmacy students" },
    { label: "New Article Orders", value: stats.newArticleOrdersCount, icon: <ClipboardList className="w-5 h-5" />, href: "/admin/article-orders", color: "amber" as const, desc: "Review & research requests" },
  ];

  const contentCards = [
    { label: "Total Notes", value: stats.notesCount, icon: <FileText className="w-5 h-5" />, color: "cyan" as const },
    { label: "Total Blogs", value: stats.blogsCount, icon: <BookOpen className="w-5 h-5" />, color: "violet" as const },
    { label: "Total News", value: stats.newsCount, icon: <Newspaper className="w-5 h-5" />, color: "emerald" as const },
    { label: "Downloads", value: stats.downloadsCount, icon: <Download className="w-5 h-5" />, color: "amber" as const },
    { label: "Quiz Questions", value: stats.quizCount, icon: <HelpCircle className="w-5 h-5" />, color: "cyan" as const },
    { label: "Question Bank", value: stats.qbCount, icon: <BookOpen className="w-5 h-5" />, color: "violet" as const },
    { label: "Question Papers", value: stats.qpCount, icon: <FileText className="w-5 h-5" />, color: "emerald" as const },
    { label: "Flashcards", value: stats.fcCount, icon: <BookMarked className="w-5 h-5" />, color: "amber" as const },
  ];

  const colorMap = {
    cyan: {
      border: "hover:border-cyan-500/30",
      bg: "bg-cyan-500/5",
      iconBg: "bg-cyan-500/10",
      iconBorder: "border-cyan-500/20",
      iconText: "text-cyan-400",
      valueText: "text-cyan-400",
    },
    violet: {
      border: "hover:border-violet-500/30",
      bg: "bg-violet-500/5",
      iconBg: "bg-violet-500/10",
      iconBorder: "border-violet-500/20",
      iconText: "text-violet-400",
      valueText: "text-violet-400",
    },
    emerald: {
      border: "hover:border-emerald-500/30",
      bg: "bg-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconBorder: "border-emerald-500/20",
      iconText: "text-emerald-400",
      valueText: "text-emerald-400",
    },
    amber: {
      border: "hover:border-amber-500/30",
      bg: "bg-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconBorder: "border-amber-500/20",
      iconText: "text-amber-400",
      valueText: "text-amber-400",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor your platform&apos;s files, posts, and student downloads.
          </p>
        </div>
      </div>

      {/* Requirement 11 Primary Highlights */}
      <div>
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span>Live Operations & Engagement</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlightCards.map((stat) => {
            const colors = colorMap[stat.color];
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className={`relative overflow-hidden rounded-2xl p-5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-slate-950/20 ${colors.border} hover:-translate-y-0.5 transition-all duration-200 group block`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center ${colors.iconText}`}>
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                    Manage &rarr;
                  </span>
                </div>
                <div className={`text-3xl font-black ${colors.valueText} mb-1 tracking-tight`}>
                  {stat.value ?? 0}
                </div>
                <div className="text-xs font-bold text-white mb-0.5">
                  {stat.label}
                </div>
                <div className="text-[10px] text-slate-400">
                  {stat.desc}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Library & Repositories */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          <span>Academic Repositories</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contentCards.map((stat) => {
            const colors = colorMap[stat.color];
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl p-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-xl shadow-slate-950/20 ${colors.border} transition-all duration-200`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 ${colors.bg} rounded-full blur-2xl pointer-events-none`} />
                <div className={`w-9 h-9 rounded-xl ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center mb-3 ${colors.iconText}`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl font-extrabold ${colors.valueText} mb-1`}>
                  {stat.value ?? 0}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Columns for Messages & Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Contact Messages */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/60">
            <Mail className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Recent Messages</h2>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
                <Inbox className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-400">No messages yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Contact form submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 bg-slate-800/30 border border-slate-800/50 rounded-xl space-y-2 relative group hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-150"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{msg.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{msg.email}</p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pr-6">
                    {msg.message}
                  </p>
                  <div className="text-[9px] text-slate-500 text-right">
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Downloads */}
        <div id="downloads" className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/60">
            <Download className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Live Download Activity</h2>
          </div>

          {recentDownloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
                <Download className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-400">No downloads yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Notes you upload will track downloads here.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentDownloads.map((dl) => (
                <div
                  key={dl.id}
                  className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-800/20 transition-colors duration-150 group"
                >
                  <div className="min-w-0 pr-4">
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-50 transition-colors truncate">
                      {dl.notes?.title || "Unknown File"}
                    </h4>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                      {dl.notes?.course || "Global"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(dl.downloaded_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
