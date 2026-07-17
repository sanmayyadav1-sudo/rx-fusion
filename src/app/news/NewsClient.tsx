"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Newspaper, Calendar, Globe, Search } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  published_date: string;
  created_at: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("published_date", { ascending: false });

        if (error) throw error;
        if (data) setNews(data as NewsItem[]);
      } catch (err) {
        console.error("Error fetching news bulletins:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.source && item.source.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 bg-slate-50 min-h-screen">
      {/* Background decoration radial overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[35%] aspect-square rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
            <Newspaper className="w-8 h-8 text-cyan-500" />
            <span>Pharmacy News Board</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Stay updated with curriculum announcements, university exam schedules, PCI notices, and industrial updates.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto px-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search announcements & news boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all duration-150 text-sm shadow-xs"
            />
          </div>
        </div>

        {/* Bulletins list */}
        {loading ? (
          <div className="space-y-6 animate-pulse px-2">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 bg-slate-100 rounded-2xl h-36 border border-slate-150" />
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl shadow-3xs max-w-xl mx-auto">
            <p className="text-sm text-slate-500">No announcements posted on the news board yet.</p>
          </div>
        ) : (
          <div className="space-y-6 px-2">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-3xs hover:shadow-xs hover:border-cyan-300 transition-colors space-y-4"
              >
                <div className="flex flex-wrap items-center gap-3.5 text-3xs text-slate-500 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.published_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {item.source && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-cyan-500" />
                        Source: {item.source}
                      </span>
                    </>
                  )}
                </div>

                <div className="space-y-2 text-left">
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h2>
                  <p 
                    className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, "<br />") }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
