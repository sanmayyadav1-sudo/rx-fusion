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

  const typeColorMap = {
    notes: "bg-cyan-500/10 text-cyan-400",
    blogs: "bg-violet-500/10 text-violet-400",
    resources: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Categories Panel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Classify and organize study materials, blogs, and downloadable resources.
          </p>
        </div>
      </div>

      {/* Error feedback */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-sm text-red-300 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Create Category Form — 2 cols */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-md font-bold text-white mb-5 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <span>{editingId ? "Edit Category" : "Create Category"}</span>
          </h2>

          <form onSubmit={handleCreateCategory} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                placeholder="e.g. Pharmacology II"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Slug (Auto-generated)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                placeholder="pharmacology-ii"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Module Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "notes" | "blogs" | "resources")}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/60 border border-slate-700/60 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 cursor-pointer"
              >
                <option value="notes" className="bg-slate-900">Notes</option>
                <option value="blogs" className="bg-slate-900">Blogs</option>
                <option value="resources" className="bg-slate-900">Resources</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Active Categories — 3 cols */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-md font-bold text-white mb-5 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-cyan-400" />
            <span>Active Categories</span>
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
                <FolderTree className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-400">No categories yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Categories you create will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all duration-150 group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{cat.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColorMap[cat.type]}`}>
                      {cat.type}
                    </span>
                    <button onClick={() => handleEditClick(cat)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
                      title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
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
