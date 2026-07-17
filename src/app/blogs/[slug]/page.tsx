"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";
import Link from "next/link";
import BookmarkButton from "../../../components/BookmarkButton";

interface Blog {
  id: string;
  title: string;
  slug: string;
  featured_image: string;
  content: string;
  author: string;
  published_date: string;
  categories?: {
    name: string;
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogDetail() {
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("*, categories(name)")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        if (data) setBlog(data as Blog);
      } catch (err) {
        console.error("Error fetching blog detail:", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchBlogDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-slate-500 mt-2">Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white">Article Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The requested pharmacy blog post does not exist or has been deleted.
        </p>
        <Link
          href="/blogs"
          className="px-4.5 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold"
        >
          Back to all blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/blogs"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Blogs</span>
        </Link>

        {/* Heading Metadata */}
        <header className="space-y-4 mb-8">
          {blog.categories && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary uppercase tracking-wider">
              {blog.categories.name}
            </span>
          )}
          
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {new Date(blog.published_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              Published by <strong className="text-slate-700 dark:text-slate-350">{blog.author}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <BookmarkButton 
              contentType="blogs"
              contentId={blog.id}
            />
          </div>
        </header>

        {/* Cover Image */}
        {blog.featured_image && (
          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 mb-10 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Text Content */}
        <div 
          className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-6"
          dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, "<br />") }}
        />
      </article>
    </div>
  );
}
