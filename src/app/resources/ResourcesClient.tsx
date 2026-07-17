"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BookMarked, Download, Search, FileText, HelpCircle } from "lucide-react";

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

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchResources() {
      try {
        const { data, error } = await supabase
          .from("resources")
          .select("*, categories(name)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setResources(data as Resource[]);
      } catch (err) {
        console.error("Error fetching academic resources:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const filteredResources = resources.filter((res) =>
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 bg-slate-50 min-h-screen">
      {/* Background circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[35%] aspect-square rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
            <BookMarked className="w-8 h-8 text-cyan-500" />
            <span>Syllabus & Course Resources</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Download standard Pharmacy Council of India (PCI) syllabus blueprints, guidelines, reference books, and lab templates.
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
              placeholder="Search resource files or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all duration-150 text-sm shadow-xs"
            />
          </div>
        </div>

        {/* Resources list */}
        {loading ? (
          <div className="space-y-4 animate-pulse px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 border border-slate-150 rounded-xl" />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-3 shadow-3xs max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-md font-bold text-slate-900">No Resources Uploaded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no generic curriculum PDFs or reference templates listed here yet. Reach out if you have documents to contribute!
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-2">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="p-5.5 bg-white border border-slate-200/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-cyan-300 transition-colors shadow-3xs"
              >
                <div className="min-w-0 flex items-start space-x-3.5 text-left">
                  <div className="w-11 h-11 bg-cyan-50 border border-cyan-100/30 rounded-xl flex items-center justify-center text-cyan-600 flex-shrink-0 mt-0.5">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      {res.categories && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">
                          {res.categories.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Added: {new Date(res.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      {res.title}
                    </h3>
                    {res.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {res.description}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={res.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4.5 py-2.5 bg-slate-50 hover:bg-cyan-500 hover:text-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all hover:border-cyan-500 shadow-3xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resource</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
