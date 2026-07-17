"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Blog {
  id: string;
  title: string;
  slug: string;
  featured_image: string;
  content: string;
  author: string;
  published_date: string;
  category_id: string;
  categories?: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogsAndCategories() {
      try {
        // Fetch categories for blogs
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("type", "blogs");

        if (catData) setCategories(catData as Category[]);

        // Fetch blogs with category join
        const { data: blogData, error } = await supabase
          .from("blogs")
          .select("*, categories(name, slug)")
          .order("published_date", { ascending: false });

        if (error) throw error;
        if (blogData) setBlogs(blogData as Blog[]);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogsAndCategories();
  }, []);

  // Filter blogs by query and category
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || blog.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 bg-slate-50 min-h-screen">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-15%] w-[40%] aspect-square rounded-full bg-cyan-55/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-500" />
            <span>Pharmacy & Science Insights</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Read reviewed articles covering pharmacology breakthroughs, medicinal chemistry research, and pharmacy guidelines.
          </p>
        </div>

        {/* Search & Category filter */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto items-stretch md:items-center px-2">
          {/* Search bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search blogs by title, content, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all duration-150 text-sm shadow-xs"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none flex-shrink-0">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === null
                  ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Blogs grid list */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-video bg-slate-100 rounded-2xl" />
                <div className="h-6 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl max-w-xl mx-auto shadow-3xs">
            <p className="text-sm text-slate-500">No blog posts found matching this criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Featured Image placeholder/url */}
                  <div className="aspect-video bg-slate-50 relative overflow-hidden">
                    {blog.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen className="w-10 h-10 text-cyan-500/20" />
                      </div>
                    )}

                    {blog.categories && (
                      <span className="absolute top-4 left-4 bg-white/95 text-cyan-600 text-3xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs border border-slate-100">
                        {blog.categories.name}
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center text-3xs text-slate-450 gap-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(blog.published_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {blog.author}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-cyan-600 transition-colors">
                      {blog.title}
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {blog.content.replace(/<[^>]*>/g, "")} {/* Strips markdown/html tags */}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-end">
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="flex items-center space-x-1 text-xs font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
