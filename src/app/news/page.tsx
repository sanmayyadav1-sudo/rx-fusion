"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { NEWS } from "@/lib/rxfusionData";

interface NewsItem {
  id?: string;
  title: string;
  content?: string;
  source?: string;
  category?: string;
  published_date?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        if (data.success && data.news) {
          const fromDb: NewsItem[] = data.news.map((n: { id?: string; title: string; content?: string; source?: string; published_date?: string }) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            source: n.source || "Regulatory Advisory",
            category: "Clinical & Regulatory",
            published_date: n.published_date,
          }));

          const fallback: NewsItem[] = NEWS.map((n) => ({
            title: n.title,
            category: n.category,
            source: "RxFusion Editorial",
          }));

          const combined = [...fromDb];
          fallback.forEach((fb) => {
            if (!combined.some((c) => c.title.toLowerCase() === fb.title.toLowerCase())) {
              combined.push(fb);
            }
          });

          setNews(combined);
        }
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const categories = Array.from(new Set(news.map((n) => n.category || "General")));

  const filteredNews = news.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || n.title.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q));
    const matchesCategory = !selectedCategory || (n.category || "General") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <PageHeader
        title="Pharmacy & Healthcare News"
        description="Official CDSCO, FDA, hospital therapeutics, and clinical pharmacy regulatory updates."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap">
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              type="search"
              id="ns"
              placeholder="Search news by keyword..."
              aria-label="Search news"
              style={{ maxWidth: "320px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              id="nc"
              style={{ maxWidth: "260px" }}
              aria-label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div id="nl" style={{ marginTop: "20px" }}>
            {loading ? (
              <p style={{ color: "var(--tx2)", padding: "16px 0" }}>Loading news updates...</p>
            ) : filteredNews.length > 0 ? (
              filteredNews.map((n, idx) => (
                <div
                  key={n.id || idx}
                  style={{
                    padding: "20px 0",
                    borderBottom: "1px solid var(--ln)",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className="pill">{n.category || "General"}</span>
                    {n.source && (
                      <span style={{ fontSize: "12px", color: "var(--tx2)" }}>
                        Source: {n.source}
                      </span>
                    )}
                    {n.published_date && (
                      <span style={{ fontSize: "12px", color: "var(--tx2)" }}>
                        · {new Date(n.published_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 style={{ marginTop: "8px", fontSize: "20px", color: "var(--navy)" }}>{n.title}</h3>
                  {n.content && (
                    <p style={{ marginTop: "8px", color: "var(--tx2)", fontSize: "14.5px", lineHeight: "1.6" }}>
                      {n.content}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: "var(--tx2)", padding: "16px 0" }}>
                No news updates match your criteria.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
