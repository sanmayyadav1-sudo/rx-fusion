"use client";

import React, { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 text-white flex items-center justify-between px-4 z-30 shadow-lg">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all active:scale-95"
          aria-label="Open Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
            Rx<span className="text-white">Fusion</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            Admin
          </span>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-30 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar - fixed width */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Administrative content wrapper - offsets for sidebar width */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen pt-16 md:pt-0">
        <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
