"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Activity, 
  Clock, 
  UserPlus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  Calendar,
  BookOpen,
  FileText,
  Phone,
  School,
  Loader2,
  Trash2
} from "lucide-react";
import Link from "next/link";

interface StudentProfile {
  id: string;
  email: string;
  full_name: string;
  course: string;
  custom_course?: string | null;
  current_year: string;
  college_name: string;
  mobile_number: string;
  free_downloads_used: number;
  download_limit: number;
  created_at: string;
  updated_at: string;
  last_seen: string | null;
}

interface NoteDownloadRecord {
  id: string;
  note_identifier: string;
  note_title: string;
  downloaded_at: string;
  student_profiles: {
    full_name: string;
    email: string;
    course: string;
    current_year: string;
  };
}

interface SummaryStats {
  totalUsers: number;
  activeNow: number;
  activeToday: number; // Used for "Limit Reached" to preserve structure
  newUsers: number;
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"students" | "downloads">("students");

  // Query state
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [sort, setSort] = useState("recently_active"); 
  const [page, setPage] = useState(1);
  
  // Data state (Students)
  const [users, setUsers] = useState<StudentProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<SummaryStats>({
    totalUsers: 0,
    activeNow: 0,
    activeToday: 0,
    newUsers: 0,
  });
  
  // Data state (Downloads)
  const [downloads, setDownloads] = useState<NoteDownloadRecord[]>([]);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [downloadsPage, setDownloadsPage] = useState(1);
  const [downloadsLoading, setDownloadsLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // UI states
  const [selectedUser, setSelectedUser] = useState<StudentProfile | null>(null);
  const [deleteStudentConfirm, setDeleteStudentConfirm] = useState<StudentProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const limit = 25;

  // Active status config (5 minutes)
  const ACTIVE_USER_THRESHOLD_MINUTES = 5;

  const fetchUsersData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        search: search.trim(),
        filter,
        sort,
        page: page.toString(),
      });

      const response = await fetch(`/api/admin/users?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error("Unable to load users. Please try again.");
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setUsers(result.users || []);
      setTotal(result.total || 0);
      setSummary(result.summary || {
        totalUsers: 0,
        activeNow: 0,
        activeToday: 0,
        newUsers: 0,
      });
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [search, filter, sort, page]);

  const fetchDownloadsData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setDownloadsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/downloads?page=${downloadsPage}`);
      if (response.ok) {
        const result = await response.json();
        setDownloads(result.downloads || []);
        setTotalDownloads(result.total || 0);
      }
    } catch (err) {
      console.error("Error fetching note downloads:", err);
    } finally {
      setDownloadsLoading(false);
    }
  }, [downloadsPage]);

  // Load active tab data
  useEffect(() => {
    if (activeTab === "students") {
      fetchUsersData();
    } else {
      fetchDownloadsData();
    }
  }, [activeTab, fetchUsersData, fetchDownloadsData]);

  const handleDeleteStudent = async (studentId: string) => {
    setDeletingId(studentId);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/users?id=${studentId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Unable to delete student. Please try again.");
      }
      setSuccess("Student deleted successfully.");
      setDeleteStudentConfirm(null);
      // Remove student from state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== studentId));
      setTotal(prevTotal => Math.max(prevTotal - 1, 0));
      // Refresh summary stats silently
      fetchUsersData(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to delete student. Please try again.");
      setDeleteStudentConfirm(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearchChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsersData(true);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const isCurrentlyActive = (lastSeenStr: string | null) => {
    if (!lastSeenStr) return false;
    const lastSeen = new Date(lastSeenStr);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = diffMs / (1000 * 60);
    return diffMins <= ACTIVE_USER_THRESHOLD_MINUTES;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatLastActive = (lastSeenStr: string | null) => {
    if (!lastSeenStr) return "Never";
    const lastSeen = new Date(lastSeenStr);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    
    // Convert to readable relative units
    const secs = Math.floor(diffMs / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return formatDate(lastSeenStr);
  };

  const totalPages = Math.ceil(total / limit);
  const totalDownloadsPages = Math.ceil(totalDownloads / limit);

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Background visual accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[45%] aspect-square rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[35%] aspect-square rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link href="/admin/dashboard" className="hover:text-cyan-400 transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-slate-350">Student Users</span>
        </div>

        {/* Headline */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            <span>Student Management</span>
          </h1>
          <p className="text-sm text-slate-450 mt-1">
            Track student registrations, courses, and notes download usage metrics.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800/80 mb-8">
          <button
            onClick={() => setActiveTab("students")}
            className={`py-3.5 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "students"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Students ({total})</span>
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={`py-3.5 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "downloads"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Downloads History ({totalDownloads})</span>
          </button>
        </div>

        {activeTab === "students" ? (
          <>
            {/* Stats summaries */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Students", value: summary.totalUsers, icon: <Users className="w-5 h-5" />, color: "cyan" },
                { label: "Active Now", value: summary.activeNow, icon: <Activity className="w-5 h-5" />, color: "emerald" },
                { label: "Limit Reached", value: summary.activeToday, icon: <Clock className="w-5 h-5" />, color: "rose" },
                { label: "Recently Joined", value: summary.newUsers, icon: <UserPlus className="w-5 h-5" />, color: "blue" },
              ].map((stat) => {
                const colorMap: Record<string, string> = {
                  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
                  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                };
                return (
                  <div key={stat.label} className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="space-y-1">
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                      <div className="text-3xs sm:text-2xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[stat.color]}`}>
                      {stat.icon}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toolbar Filters / Search */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <form onSubmit={handleSearchChange} className="relative w-full lg:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by Name, Email, Mobile, College, Course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-3xs sm:text-2xs font-semibold rounded-lg shadow-md transition-all duration-200 active:scale-95"
                >
                  Search
                </button>
              </form>

              {/* Filters dropdown and Sort */}
              <div className="flex items-center gap-3 self-end lg:self-auto flex-wrap">
                <select
                  value={filter}
                  onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Students</option>
                  <option value="free_available" className="bg-slate-900">Free Downloads Available</option>
                  <option value="limit_reached" className="bg-slate-900">Free Limit Reached</option>
                  <option value="recently_joined" className="bg-slate-900">Recently Joined</option>
                </select>

                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                >
                  <option value="recently_active" className="bg-slate-900">Recently Active</option>
                  <option value="newest" className="bg-slate-900">Recently Joined</option>
                  <option value="oldest" className="bg-slate-900">Oldest Accounts</option>
                  <option value="most_downloads" className="bg-slate-900">Most Downloads</option>
                </select>
              </div>
            </div>

            {/* Error state banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/30 flex items-start space-x-2.5 text-xs text-red-400 mb-8" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success state banner */}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-start space-x-2.5 text-xs text-emerald-450 mb-8" role="alert">
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-500 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Users grid table */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 relative min-h-[30vh]">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-2xs z-10 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              )}

              {!loading && !error && users.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No students found</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {search ? "No students match your search query." : "No registered students found."}
                  </p>
                </div>
              )}

              {!loading && !error && users.length > 0 && (
                <div>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                          <th className="py-4 px-4">Student</th>
                          <th className="py-4 px-4">Email</th>
                          <th className="py-4 px-4">Course & Year</th>
                          <th className="py-4 px-4">College</th>
                          <th className="py-4 px-4 text-center">Downloads</th>
                          <th className="py-4 px-4">Last Seen</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {users.map((item) => {
                          const active = isCurrentlyActive(item.last_seen);
                          const limitReached = item.free_downloads_used >= item.download_limit;
                          return (
                            <tr 
                              key={item.id}
                              onClick={() => setSelectedUser(item)}
                              className="hover:bg-slate-800/20 transition-colors duration-150 cursor-pointer text-sm font-medium"
                            >
                              <td className="py-4 px-4 text-white">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-emerald-400" : "bg-slate-500"}`} />
                                  <span>{item.full_name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-400">{item.email}</td>
                              <td className="py-4 px-4 text-slate-350">
                                {item.course} — {item.current_year}
                              </td>
                              <td className="py-4 px-4 text-slate-400 max-w-[150px] truncate">{item.college_name}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  limitReached
                                    ? "bg-slate-800/60 text-slate-400 border-slate-700/30"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                }`}>
                                  {item.free_downloads_used} / {item.download_limit}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-slate-500">{formatLastActive(item.last_seen)}</td>
                              <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setDeleteStudentConfirm(item)}
                                  className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-450 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile responsive cards */}
                  <div className="md:hidden space-y-4">
                    {users.map((item) => {
                      const active = isCurrentlyActive(item.last_seen);
                      const limitReached = item.free_downloads_used >= item.download_limit;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedUser(item)}
                          className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-3 active:bg-slate-800/20 transition-all duration-150 shadow-sm shadow-slate-950/20"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white truncate max-w-[150px] flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-emerald-400" : "bg-slate-500"}`} />
                              <span>{item.full_name}</span>
                            </span>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                limitReached
                                  ? "bg-slate-800/60 text-slate-400 border-slate-700/30"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {item.free_downloads_used} / {item.download_limit}
                              </span>
                              <button
                                onClick={() => setDeleteStudentConfirm(item)}
                                className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-450 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-slate-400 break-all">{item.email}</div>
                          <div className="text-xs text-slate-350">{item.course} — {item.current_year}</div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                            <div>
                              <span className="block text-[8px] text-slate-600 mb-0.5">Joined</span>
                              {formatDate(item.created_at)}
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-600 mb-0.5">Last Seen</span>
                              {formatLastActive(item.last_seen)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination footer */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-6 mt-4">
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Page {page} of {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(Math.max(page - 1, 1))}
                          disabled={page === 1}
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white disabled:opacity-40 transition-all duration-200 active:scale-95"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPage(Math.min(page + 1, totalPages))}
                          disabled={page === totalPages}
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white disabled:opacity-40 transition-all duration-200 active:scale-95"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Tab 2: Download History */
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 relative min-h-[30vh]">
            {downloadsLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 z-10 rounded-2xl">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            )}

            {!downloadsLoading && downloads.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No download logs found</p>
                <p className="text-xs text-slate-600 mt-0.5">Notes downloaded by students will be recorded here.</p>
              </div>
            )}

            {!downloadsLoading && downloads.length > 0 && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                        <th className="py-4 px-4">Student</th>
                        <th className="py-4 px-4">Student Email</th>
                        <th className="py-4 px-4">Note Title</th>
                        <th className="py-4 px-4">Note Identifier</th>
                        <th className="py-4 px-4">Download Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {downloads.map((item) => (
                        <tr key={item.id} className="text-sm font-medium hover:bg-slate-800/20 transition-colors duration-150">
                          <td className="py-4 px-4 text-white">{item.student_profiles?.full_name || "Unknown Student"}</td>
                          <td className="py-4 px-4 text-slate-400">{item.student_profiles?.email || "N/A"}</td>
                          <td className="py-4 px-4 text-cyan-400">{item.note_title}</td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-500">{item.note_identifier}</td>
                          <td className="py-4 px-4 text-slate-400">{new Date(item.downloaded_at).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Downloads Pagination */}
                {totalDownloadsPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-6 mt-4">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      Page {downloadsPage} of {totalDownloadsPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDownloadsPage(Math.max(downloadsPage - 1, 1))}
                        disabled={downloadsPage === 1}
                        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white disabled:opacity-40 transition-all duration-200 active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDownloadsPage(Math.min(downloadsPage + 1, totalDownloadsPages))}
                        disabled={downloadsPage === totalDownloadsPages}
                        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white disabled:opacity-40 transition-all duration-200 active:scale-95"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Details Dialog Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Student Details Portal</span>
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white transition-all duration-200 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedUser.full_name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedUser.email}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isCurrentlyActive(selectedUser.last_seen)
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450" 
                    : "bg-slate-800/60 border-slate-700/30 text-slate-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlyActive(selectedUser.last_seen) ? "bg-emerald-400" : "bg-slate-400"}`} />
                  {isCurrentlyActive(selectedUser.last_seen) ? "Active Now" : "Offline"}
                </span>
              </div>

              {/* Course details */}
              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Course Stream</span>
                  <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-cyan-500" />
                    {selectedUser.course === "Other" ? selectedUser.custom_course || "Other" : selectedUser.course}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Academic Year</span>
                  <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    {selectedUser.current_year}
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">College Institution</span>
                  <div className="text-slate-200 font-medium flex items-center gap-2">
                    <School className="w-4 h-4 text-slate-500" />
                    {selectedUser.college_name}
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Mobile Contact Number</span>
                  <div className="text-slate-200 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    {selectedUser.mobile_number}
                  </div>
                </div>
              </div>

              {/* Downloads status */}
              <div className="border-t border-slate-800/60 pt-4 mt-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Downloads Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Downloads Used</span>
                    <span className="text-white font-extrabold text-lg">{selectedUser.free_downloads_used}</span>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Downloads Remaining</span>
                    <span className="text-cyan-400 font-extrabold text-lg">
                      {Math.max(selectedUser.download_limit - selectedUser.free_downloads_used, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta logs */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-800/60">
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Registered Date</span>
                  <span className="text-slate-400">{new Date(selectedUser.created_at).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Last Online</span>
                  <span className="text-slate-400">{selectedUser.last_seen ? new Date(selectedUser.last_seen).toLocaleString("en-IN") : "Never"}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex justify-between items-center gap-2 flex-wrap">
              <button
                onClick={() => handleCopyId(selectedUser.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 mr-auto"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? "Copied!" : "Copy Student ID"}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setDeleteStudentConfirm(selectedUser);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Student</span>
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all duration-200 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {deleteStudentConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span>DELETE STUDENT?</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are about to permanently delete this student profile.
            </p>
            <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-1">
              <p className="text-xs font-bold text-white">Student: <span className="font-semibold text-slate-300">{deleteStudentConfirm.full_name}</span></p>
              <p className="text-xs font-bold text-white">Email: <span className="font-semibold text-slate-400">{deleteStudentConfirm.email}</span></p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              This action may remove the student&apos;s RxFusion profile and related student-owned data.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteStudentConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all duration-200 active:scale-95"
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(deleteStudentConfirm.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                disabled={deletingId !== null}
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Student</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
