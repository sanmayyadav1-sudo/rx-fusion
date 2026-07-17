"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BookMarked, Plus, Trash2, Loader2, Upload, Download, AlertCircle } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
  category_id: string;
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function ResourcesCrud() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "url">("file");

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setResources(data as Resource[]);
    } catch (err) {
      console.error("Error loading resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("type", "resources");

      if (data) {
        setCategories(data as Category[]);
        if (data.length > 0) setCategoryId(data[0].id);
      }
    } catch (err) {
      console.error("Error categories load:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a resource title.");
      return;
    }

    const hasFile = !!file;
    const hasUrl = fileUrl.trim().length > 0;

    if (inputMode === "file" && !hasFile) {
      setError("Please upload a file.");
      return;
    }
    if (inputMode === "url" && !hasUrl) {
      setError("Please paste a direct URL.");
      return;
    }

    if (hasUrl && inputMode === "url") {
      try { new URL(fileUrl.trim()); }
      catch { setError("Please enter a valid URL (must start with https://)."); return; }
    }

    setSaving(true);
    let finalUrl = inputMode === "url" ? fileUrl.trim() : "";

    try {
      // 1. If file uploaded, route it to resources bucket
      if (file && inputMode === "file") {
        const fileExt = file.name.split(".").pop();
        const uniqueFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const storagePath = `general/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("resources")
          .getPublicUrl(storagePath);

        finalUrl = publicUrl;
      }

      if (!finalUrl) {
        setError("File upload failed — no URL was generated.");
        setSaving(false);
        return;
      }

      // 2. Insert record
      const { error: dbError } = await supabase.from("resources").insert([
        {
          title,
          description: description.trim() || null,
          file_url: finalUrl,
          category_id: categoryId || null,
        },
      ]);

      if (dbError) throw dbError;

      setTitle("");
      setDescription("");
      setFileUrl("");
      setFile(null);
      setShowForm(false);
      fetchResources();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save curriculum resource.";
      console.error(err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async (id: string, resourceFileUrl: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const { error: dbError } = await supabase.from("resources").delete().eq("id", id);
      if (dbError) throw dbError;

      // Delete storage file if inside our bucket
      if (resourceFileUrl && resourceFileUrl.includes("/storage/v1/object/public/resources/")) {
        try {
          const urlObj = new URL(resourceFileUrl);
          const pathSegments = urlObj.pathname.split("/storage/v1/object/public/resources/");
          if (pathSegments.length > 1) {
            const filePath = decodeURIComponent(pathSegments[1]);
            await supabase.storage.from("resources").remove([filePath]);
          }
        } catch (imgErr) {
          console.error("Storage resource removal fail:", imgErr);
        }
      }

      setResources(resources.filter((res) => res.id !== id));
    } catch {
      setError("Failed to delete resource.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Curriculum Resources
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish PCI blueprints, reference syllabuses, and ebook references.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Hide Form" : "Add Resource"}</span>
        </button>
      </div>

      {/* Error feedback */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-sm text-red-300 animate-fade-in max-w-3xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Form */}
      {showForm && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 max-w-3xl animate-fade-in">
          <h2 className="text-md font-bold text-white mb-6">
            Upload Generic Curriculum Resource
          </h2>

          <form onSubmit={handleSaveResource} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                  placeholder="e.g. PCI B Pharm Syllabus 2026 Guidelines"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File/URL Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Resource Source
              </label>
              <div className="flex gap-1 p-1 bg-slate-800 rounded-xl w-fit mb-4">
                <button type="button" onClick={() => { setInputMode("file"); setFileUrl(""); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${inputMode === "file" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                  Upload File
                </button>
                <button type="button" onClick={() => { setInputMode("url"); setFile(null); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${inputMode === "url" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                  Paste URL
                </button>
              </div>

              {/* Conditional input */}
              {inputMode === "file" ? (
                <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-slate-700 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 group">
                  <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors mb-2" />
                  <span className="text-sm text-slate-500 group-hover:text-slate-300">
                    {file ? file.name : "Click to select file"}
                  </span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </label>
              ) : (
                <input
                  type="url"
                  placeholder="https://example.com/syllabus.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Resource Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 resize-none"
                placeholder="Include brief outlines, regulatory boards, or document notes..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing resource...</span>
                </>
              ) : (
                <span>Publish Resource</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Resources Table List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
              <BookMarked className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">No resources yet</p>
            <p className="text-xs text-slate-600 mt-1">
              Resources you upload will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Title", "Category", "Publish Date", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-4 first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((res) => (
                  <tr key={res.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors duration-150 group">
                    <td className="py-3.5 px-4 first:pl-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <BookMarked className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-sm font-semibold text-white group-hover:text-cyan-50 transition-colors line-clamp-1">
                          {res.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-500">
                      {res.categories?.name || "General Resource"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {new Date(res.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <a href={res.file_url} target="_blank" rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 transition-all duration-150"
                          title="Download">
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteResource(res.id, res.file_url)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all duration-150"
                          title="Delete">
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
