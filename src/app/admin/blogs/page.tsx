"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Plus, Trash2, Edit, Loader2, Upload, AlertCircle } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  featured_image: string;
  content: string;
  author: string;
  category_id: string;
  published_date: string;
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function BlogsCrud() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("RxFusion Editorial");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setBlogs(data as Blog[]);
    } catch (err) {
      console.error("Error loading blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("type", "blogs");

      if (data) {
        setCategories(data as Category[]);
        if (data.length > 0) setCategoryId(data[0].id);
      }
    } catch (err) {
      console.error("Error categories load:", err);
    }
  };

  const generateSlug = (val: string) =>
    val
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(generateSlug(val));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (blog: Blog) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setContent(blog.content);
    setAuthor(blog.author);
    setCategoryId(blog.category_id || "");
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim() || !slug.trim()) {
      setError("Please fill in the title, slug, and content fields.");
      return;
    }

    setSaving(true);
    let imageUrl = "";

    try {
      // 1. Upload Featured Image to Storage if exists
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const uniqueFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const storagePath = `featured/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(storagePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(storagePath);

        imageUrl = publicUrl;
      }

      // 2. Prepare payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        title,
        slug,
        content,
        author,
        category_id: categoryId || null
      };

      if (imageUrl) {
        payload.featured_image = imageUrl;
      }

      if (editingId) {
        // Update record
        const { error: dbError } = await supabase
          .from("blogs")
          .update(payload)
          .eq("id", editingId);

        if (dbError) throw dbError;
      } else {
        // Insert record
        payload.published_date = new Date().toISOString();
        const { error: dbError } = await supabase
          .from("blogs")
          .insert([payload]);

        if (dbError) throw dbError;
      }

      resetForm();
      fetchBlogs();

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save blog post";
      console.error(err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      // Attempt storage image cleanup first (non-blocking)
      if (imageUrl) {
        try {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/images\/(.+)$/);
          if (pathMatch?.[1]) {
            const { error: storageError } = await supabase.storage
              .from("images")
              .remove([decodeURIComponent(pathMatch[1])]);
            if (storageError) {
              console.warn("Image cleanup failed:", storageError.message);
            }
          }
        } catch (e) {
          console.warn("Could not parse image path from URL:", imageUrl, e);
        }
      }

      // Always delete the DB record regardless of storage result
      const { error: dbError } = await supabase
        .from("blogs")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setBlogs(blogs.filter((b) => b.id !== id));
    } catch {
      setError("Failed to delete blog.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-200">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Blogs Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compose scientific reviews, pharma research articles, and educational guides.
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
          <span>{showForm ? "Hide Editor" : "Write Article"}</span>
        </button>
      </div>

      {/* Error feedback */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-sm text-red-300 animate-fade-in max-w-4xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Form */}
      {showForm && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 mb-6 max-w-4xl shadow-xl shadow-slate-950/20 animate-fade-in">
          <h2 className="text-md font-bold text-white mb-6">
            {editingId ? "Edit Scientific Blog Post" : "Compose Scientific Blog Post"}
          </h2>

          <form onSubmit={handleSaveBlog} className="space-y-5">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  placeholder="e.g. Mechanism of Action of ACE Inhibitors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                  Slug (URL Parameter)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                  placeholder="mechanism-of-action-of-ace-inhibitors"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-800/60 my-5" />

            {/* Author & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                  Author
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-800/60 my-5" />

            {/* Featured Image Upload Zone */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Featured Image
              </label>
              <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-slate-700/60 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 group">
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors mb-2" />
                <span className="text-sm text-slate-555 group-hover:text-slate-300 font-medium">
                  {imageFile ? imageFile.name : "Click to select cover photo"}
                </span>
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-800/60 my-5" />

            {/* Content Body textarea with character count */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Content Body
              </label>
              <div className="relative">
                <textarea
                  rows={10}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white bg-slate-800/40 border border-slate-700/50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-200 resize-none"
                  placeholder="Write your scientific review here. Supports HTML or raw formatting..."
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
                  <span>{editingId ? "Save Changes" : "Publish Post"}</span>
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

      {/* Blogs list */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/10 border border-slate-800/60 border-dashed rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800/40 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">No blogs yet</p>
            <p className="text-xs text-slate-650 mt-1">
              Articles you compose will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950/40">
                  {["Title", "Author", "Category", "Publish Date", "Actions"].map(h => (
                    <th key={h} className="py-4 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="text-sm font-medium hover:bg-slate-800/20 transition-colors duration-150 group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-violet-400" />
                        </div>
                        <span className="text-sm font-semibold text-white group-hover:text-cyan-50 transition-colors line-clamp-1">
                          {blog.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-400">{blog.author}</td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-400">
                      {blog.categories?.name || "Uncategorized"}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {new Date(blog.published_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditClick(blog)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 border border-slate-800 hover:border-cyan-500/20 transition-all duration-150"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id, blog.featured_image)}
                          className="p-2 rounded-lg bg-slate-800/40 hover:bg-rose-500/10 hover:text-rose-450 text-slate-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-150"
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
