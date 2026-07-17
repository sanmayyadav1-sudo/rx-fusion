"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FolderTree, Trash2, Edit, Plus, Loader2, AlertCircle, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: "notes" | "blogs" | "resources";
  created_at: string;
}

export default function CategoriesCrud() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"notes" | "blogs" | "resources">("notes");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let updatedData = data || [];

      // Check if "Authorize" and "Non Authorize" categories of type "notes" exist
      const hasAuthorize = updatedData.some(c => c.name.toLowerCase() === "authorize" && c.type === "notes");
      const hasNonAuthorize = updatedData.some(c => (c.name.toLowerCase() === "non-authorize" || c.name.toLowerCase() === "non authorize") && c.type === "notes");

      if (!hasAuthorize || !hasNonAuthorize) {
        const toInsert = [];
        if (!hasAuthorize) {
          toInsert.push({ name: "Authorize", slug: "authorize", type: "notes" });
        }
        if (!hasNonAuthorize) {
          toInsert.push({ name: "Non Authorize", slug: "non-authorize", type: "notes" });
        }

        const { data: inserted, error: insertError } = await supabase
          .from("categories")
          .insert(toInsert)
          .select("*");

        if (!insertError && inserted) {
          updatedData = [...inserted, ...updatedData];
        } else if (insertError) {
          console.warn("Could not auto-seed default categories:", insertError.message);
        }
      }

      setCategories(updatedData as Category[]);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setEditingId(null);
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setType(cat.type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        // Update category
        const { error: updateError } = await supabase
          .from("categories")
          .update({ name, slug, type })
          .eq("id", editingId);

        if (updateError) {
          if (updateError.code === "23505") {
            setError(`A category with slug "${slug}" already exists. Use a different name.`);
          } else {
            setError("Failed to update category: " + updateError.message);
          }
          return;
        }
      } else {
        // Create category
        const { error: insertError } = await supabase
          .from("categories")
          .insert([{ name, slug, type }]);

        if (insertError) {
          if (insertError.code === "23505") {
            setError(`A category with slug "${slug}" already exists. Use a different name.`);
          } else {
            setError("Failed to create category: " + insertError.message);
          }
          return;
        }
      }

      resetForm();
      fetchCategories();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save category";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? It may unlink notes/blogs referencing it.")) return;

    try {
      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      setCategories(categories.filter((c) => c.id !== id));
    } catch {
      setError("Failed to delete category.");
    }
  };


  return (
    <div className="space-y-6 text-slate-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Categories Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Classify and organize study materials, blogs, and downloadable resources.</p>
        </div>
      </div>

      {/* Error feedback */}
      {error && (
        <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-355 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Create Category Form — 2 cols */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-slate-950/20 backdrop-blur-md">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>{editingId ? "Edit Category" : "Create Category"}</span>
          </h2>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                placeholder="e.g. Pharmacology II"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Slug (Auto-generated)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                placeholder="pharmacology-ii"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Module Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "notes" | "blogs" | "resources")}
                className="w-full px-4 py-2.5 rounded-xl text-xs text-white bg-slate-800/40 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
              >
                <option value="notes" className="bg-slate-900">Notes</option>
                <option value="blogs" className="bg-slate-900">Blogs</option>
                <option value="resources" className="bg-slate-900">Resources</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingId ? "Save Changes" : "Add Category"}</span>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all duration-200 active:scale-95"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Active Categories — 3 cols */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-slate-950/20 backdrop-blur-md">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <span>Active Categories</span>
          </h2>

          {loading ? (
            <div className="py-12 flex flex-col justify-center items-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              <span className="text-xs font-semibold">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-slate-550 bg-slate-900/10 border-dashed border border-slate-850/60 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-slate-800/40 flex items-center justify-center mb-3 mx-auto">
                <FolderTree className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-xs font-bold text-slate-400">No categories yet</p>
              <p className="text-[11px] text-slate-500 mt-1">Categories you create will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-850/30 border border-slate-800/60 hover:border-slate-700/60 transition-all duration-150 group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-50 transition-colors">{cat.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      cat.type === "notes" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                      cat.type === "blogs" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {cat.type}
                    </span>
                    <button onClick={() => handleEditClick(cat)}
                      className="p-1.5 rounded-lg bg-slate-800/40 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 border border-slate-800/60 hover:border-cyan-500/20 transition-all duration-150 opacity-0 group-hover:opacity-100"
                      title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-455 text-slate-400 border border-slate-800/60 hover:border-rose-500/20 transition-all duration-150 opacity-0 group-hover:opacity-100"
                      title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
