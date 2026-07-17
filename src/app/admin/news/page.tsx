"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Newspaper, Plus, Trash2, Edit, Loader2, Bell } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  is_important: boolean;
  published_date: string;
  created_at: string;
}

export default function NewsCrud() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setNews(data as NewsItem[]);
    } catch (err) {
      console.error("Error loading news bulletins:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSource("");
    setIsImportant(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (item: NewsItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setSource(item.source || "");
    setIsImportant(item.is_important || false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        title,
        content,
        source: source.trim() || null,
        is_important: isImportant,
      };

      if (editingId) {
        const { error } = await supabase
          .from("news")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        payload.published_date = new Date().toISOString();
        const { error } = await supabase.from("news").insert([payload]);

        if (error) throw error;
      }

      resetForm();
      fetchNews();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save notice.";
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news notice?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
      setNews(news.filter((item) => item.id !== id));
    } catch {
      alert("Failed to delete notice.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-200">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            News & Notices Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish PCI notices, exam notifications, and general announcements.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Hide Form" : "Create Notice"}</span>
        </button>
      </div>

      {/* Editor Form */}
      {showForm && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 mb-6 max-w-3xl shadow-xl shadow-slate-950/20 animate-fade-in">
          <h2 className="text-md font-bold text-white mb-6">
            {editingId ? "Edit Board Notice" : "Create General Board Notice"}
          </h2>

          {/* Priority Toggle */}
          <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex-1">Mark as important notice</span>
            <button
              type="button"
              onClick={() => setIsImportant(!isImportant)}
              className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${isImportant ? "bg-amber-500" : "bg-slate-700"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${isImportant ? "left-5" : "left-0.5"}`} />
            </button>
          </div>

          <form onSubmit={handleSaveNews} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Notice Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                placeholder="e.g. PCI Syllabus Updates for D Pharm Year 2"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Source Name (Optional)
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                placeholder="e.g. Pharmacy Council of India Portal"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Notice Content
              </label>
              <div className="relative">
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 resize-none"
                  placeholder="Include detailed exam dates, links, or notice explanations..."
                />
                <span className="absolute bottom-3 right-3 text-xs text-slate-500 font-semibold">
                  {content.length} chars
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingId ? "Save Changes" : "Publish Notice"}</span>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all duration-200 active:scale-95"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* News Table List */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/10 border border-slate-800/60 border-dashed rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800/40 flex items-center justify-center mb-3">
              <Newspaper className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">No notices yet</p>
            <p className="text-xs text-slate-650 mt-1">
              Notices you publish will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                  {["Title", "Source", "Publish Date", "Actions"].map(h => (
                    <th key={h} className="py-4 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {news.map((item) => (
                  <tr key={item.id} className="text-sm font-medium hover:bg-slate-800/20 transition-colors duration-150 group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Newspaper className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-semibold text-white group-hover:text-cyan-50 transition-colors line-clamp-1">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-400">
                      {item.source || "General Admin"}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {new Date(item.published_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditClick(item)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 border border-slate-800 hover:border-cyan-500/20 transition-all duration-150"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-455 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
