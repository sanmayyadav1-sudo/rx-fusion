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
    <div className="dark min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Open Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
          RxFusion Admin
        </span>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar - fixed width */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Administrative content wrapper - offsets for sidebar width */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen pt-16 md:pt-0">
        <main className="flex-grow p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
