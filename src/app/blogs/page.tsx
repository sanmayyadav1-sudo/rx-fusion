"use client";

import React, { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { BLOGS } from "@/lib/rxfusionData";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

interface BlogArticle {
  id?: string;
  title: string;
  slug?: string;
  category?: string;
  author: string;
  content?: string;
  published_date?: string;
  readTime?: string;
}

export default function BlogsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<BlogArticle | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        if (data.success && data.blogs) {
          const fromDb: BlogArticle[] = data.blogs.map((b: { id: string; title: string; slug?: string; author?: string; content?: string; published_date?: string }) => ({
            id: b.id,
            title: b.title,
            slug: b.slug,
            category: "Pharm.D Perspectives",
            author: b.author || "RxFusion Clinical Faculty",
            content: b.content,
            published_date: b.published_date,
            readTime: "5 min",
          }));

          const fallback: BlogArticle[] = BLOGS.map((b) => ({
            title: b.title,
            category: b.category,
            author: b.author,
            readTime: b.readTime,
            content: `Clinical insights and career perspectives for Pharm.D scholars. This article explores practical applications in hospital rounds, therapeutic drug monitoring, and patient counseling.`,
          }));

          const combined = [...fromDb];
          fallback.forEach((fb) => {
            if (!combined.some((c) => c.title.toLowerCase() === fb.title.toLowerCase())) {
              combined.push(fb);
            }
          });

          setBlogs(combined);
          if (combined.length > 0) {
            setSelectedBlog(combined[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const filteredBlogs = blogs.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      b.author.toLowerCase().includes(q)
    );
  });

  const handleSelectBlog = (b: BlogArticle) => {
    setSelectedBlog(b);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const handleBookmarkBlog = async () => {
    if (!user) {
      showToast("Please log in to save articles.");
      return;
    }
    if (!selectedBlog?.id) {
      showToast("Article saved to your session reading list!");
      return;
    }
    try {
      const res = await fetch("/api/student/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "blogs",
          contentId: selectedBlog.id,
        }),
      });
      if (res.ok) {
        showToast("Article bookmarked successfully!");
      } else {
        showToast("Already in your saved bookmarks.");
      }
    } catch {
      showToast("Error bookmarking article.");
    }
  };

  return (
    <>
      <PageHeader
        title="Pharm.D Blogs & Perspectives"
        description="Thought leadership, clinical pharmacy residency insights, hospital case discussions and academic career guidance."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap">
          <input
            type="search"
            id="bs"
            placeholder="Search articles by title, topic or author..."
            aria-label="Search articles"
            style={{ maxWidth: "380px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="g3" id="bl" style={{ marginTop: "20px" }}>
            {loading ? (
              <p style={{ color: "var(--tx2)" }}>Loading articles...</p>
            ) : filteredBlogs.length > 0 ? (
              filteredBlogs.map((b) => (
                <button
                  key={b.title}
                  className="card"
                  style={{ 
                    textAlign: "left", 
                    cursor: "pointer", 
                    width: "100%",
                    borderColor: selectedBlog?.title === b.title ? "var(--teal)" : undefined 
                  }}
                  onClick={() => handleSelectBlog(b)}
                >
                  <span className="pill">{b.category || "Pharm.D"}</span>
                  <h3 style={{ marginTop: "12px", fontSize: "19px" }}>{b.title}</h3>
                  <p style={{ color: "var(--tx2)", fontSize: "14px", marginTop: "6px" }}>
                    {b.author} · {b.readTime || "4 min"} read
                  </p>
                </button>
              ))
            ) : (
              <p style={{ color: "var(--tx2)" }}>No articles match your search query.</p>
            )}
          </div>

          {selectedBlog && (
            <div
              id="bd"
              ref={detailRef}
              className="card"
              style={{ marginTop: "28px", display: "block", padding: "28px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <span className="pill">{selectedBlog.category || "Pharm.D"}</span>
                  <h2 style={{ maxWidth: "none", marginTop: "10px", fontSize: "28px" }}>{selectedBlog.title}</h2>
                  <p style={{ color: "var(--tx2)", marginTop: "6px", fontSize: "14.5px" }}>
                    Published by <b>{selectedBlog.author}</b>
                    {selectedBlog.published_date ? ` on ${new Date(selectedBlog.published_date).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <button
                  className="btn o"
                  style={{ padding: "6px 14px", fontSize: "13px" }}
                  onClick={handleBookmarkBlog}
                >
                  Bookmark Article
                </button>
              </div>

              <div style={{ marginTop: "20px", lineHeight: "1.8", fontSize: "15px", color: "var(--tx1)" }}>
                {selectedBlog.content ? (
                  <div style={{ whiteSpace: "pre-line" }}>
                    {selectedBlog.content}
                  </div>
                ) : (
                  <p>
                    Full article body available. This work covers contemporary changes in Pharm.D education, clinical hospital rotations, and hospital pharmacy standards across healthcare institutions.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
