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
  HelpCircle
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
    { name: "Quiz Questions", href: "/admin/quiz", icon: <HelpCircle className="w-5 h-5" /> },
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
    <aside className={`w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Upper Brand / Logo block */}
      <div className="flex flex-col flex-grow overflow-y-auto scrollbar-none">
        <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight font-display">
                Rx<span className="text-white">Fusion</span>
              </span>
            </Link>
            <span className="ml-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
              Admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive(item.href)
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Profile / Session actions */}
      <div className="p-4 border-t border-slate-800 space-y-4 flex-shrink-0 bg-slate-900">
        {profile && (
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-primary">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-grow">
              <h4 className="text-xs font-bold text-white truncate">{profile.email.split("@")[0]}</h4>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
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
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-red-400 hover:text-white hover:bg-red-950/20 transition-all border border-transparent hover:border-red-900/35"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
