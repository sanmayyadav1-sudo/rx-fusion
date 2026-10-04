"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  GraduationCap, 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Newspaper, 
  BookMarked, 
  FolderTree, 
  Settings, 
  LogOut,
  UserCheck,
  X,
  Pill,
  Stethoscope,
  Megaphone,
  Users,
  HelpCircle,
  Calendar,
  BarChart2,
  ClipboardList
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "Notes", href: "/admin/notes", icon: <FileText className="w-5 h-5" /> },
    { name: "Manage Subjects", href: "/admin/subjects", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Colleges", href: "/admin/colleges", icon: <GraduationCap className="w-5 h-5" /> },
    { name: "Drug of the Day", href: "/admin/drugs", icon: <Pill className="w-5 h-5" /> },
    { name: "Clinical Cases", href: "/admin/cases", icon: <Stethoscope className="w-5 h-5" /> },
    { name: "Announcements", href: "/admin/announcements", icon: <Megaphone className="w-5 h-5" /> },
    { name: "Blogs", href: "/admin/blogs", icon: <BookOpen className="w-5 h-5" /> },
    { name: "News", href: "/admin/news", icon: <Newspaper className="w-5 h-5" /> },
    { name: "Viva Questions", href: "/admin/viva", icon: <HelpCircle className="w-5 h-5" /> },
    { name: "Quiz Management", href: "/admin/quiz", icon: <HelpCircle className="w-5 h-5" /> },
    { name: "Daily Quiz", href: "/admin/daily-quiz", icon: <Calendar className="w-5 h-5" /> },
    { name: "Quiz Analytics", href: "/admin/quiz-analytics", icon: <BarChart2 className="w-5 h-5" /> },
    { name: "Article Orders", href: "/admin/article-orders", icon: <ClipboardList className="w-5 h-5" /> },
    { name: "Question Bank", href: "/admin/question-bank", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Question Papers", href: "/admin/question-papers", icon: <FileText className="w-5 h-5" /> },
    { name: "Flashcards", href: "/admin/flashcards", icon: <BookMarked className="w-5 h-5" /> },
    { name: "Lab Manuals", href: "/admin/labs", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Resources", href: "/admin/resources", icon: <BookMarked className="w-5 h-5" /> },
    { name: "Categories", href: "/admin/categories", icon: <FolderTree className="w-5 h-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className={`w-64 bg-slate-900/40 border-r border-slate-800/60 text-white flex flex-col justify-between h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 backdrop-blur-md shadow-xl shadow-slate-950/20 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Upper Brand / Logo block */}
      <div className="flex flex-col flex-grow overflow-y-auto scrollbar-none">
        <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-slate-800/60 flex-shrink-0">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent tracking-tight font-display">
                Rx<span className="text-white">Fusion</span>
              </span>
            </Link>
            <span className="ml-2.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shadow-xs">
              Admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  active
                    ? "bg-gradient-to-r from-cyan-500/15 to-blue-600/5 text-cyan-400 border border-cyan-500/25 shadow-md shadow-cyan-500/5"
                    : "text-slate-400 hover:text-slate-150 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <span className={active ? "text-cyan-400" : "text-slate-400"}>{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Session actions */}
      <div className="p-4 border-t border-slate-800/60 space-y-3 flex-shrink-0 bg-slate-900/20">
        {profile && (
          <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-800/50">
            <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-grow">
              <h4 className="text-xs font-bold text-slate-200 truncate">{profile.email.split("@")[0]}</h4>
              <p className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider">
                {profile.role}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={async () => {
            await signOut();
            window.location.href = "/rx-admin-access";
          }}
          className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-400 hover:text-white hover:bg-rose-500/15 transition-all duration-200 border border-transparent hover:border-rose-500/20 active:scale-95"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
