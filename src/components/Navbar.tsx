"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, GraduationCap, Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SearchModal from "./SearchModal";

const primaryLinks = [
  { name: "Home", href: "/" },
  { name: "Notes", href: "/notes" },
  { name: "Explore", dropdown: true },
  { name: "Clinical Cases", href: "/cases" },
  { name: "Blogs", href: "/blogs" },
  { name: "News", href: "/news" },
  { name: "Resources", href: "/resources" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const exploreItems = [
  { name: "Drug Database", href: "/drugs" },
  { name: "Viva Questions", href: "/viva" },
  { name: "Daily Quiz", href: "/quiz" },
  { name: "Clinical Tools", href: "/clinical-tools" },
  { name: "Question Bank", href: "/question-bank" },
  { name: "Question Papers", href: "/question-papers" },
  { name: "Flashcards", href: "/flashcards" },
  { name: "Pharmacy Colleges", href: "/colleges" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileExploreOpen, setIsMobileExploreOpen] = useState(false);

  // Extract student first name
  const firstName = profile?.full_name ? profile.full_name.trim().split(" ")[0] : null;

  const links = user
    ? [{ name: "Dashboard", href: "/dashboard" }, ...primaryLinks]
    : primaryLinks;

  // Listen for Ctrl+K shortcut globally
  useEffect(() => {
    const handleGlobalSearchShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    const handleOpenSearchEvent = () => {
      setIsSearchOpen(true);
    };

    window.addEventListener("keydown", handleGlobalSearchShortcut);
    window.addEventListener("open-global-search", handleOpenSearchEvent);
    
    return () => {
      window.removeEventListener("keydown", handleGlobalSearchShortcut);
      window.removeEventListener("open-global-search", handleOpenSearchEvent);
    };
  }, []);

  // Handle transparent to glassmorphic header transit on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Check if current route matches navbar item
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  const isExploreActive = () =>
    exploreItems.some(item => pathname === item.href || pathname.startsWith(item.href + "/"));

  // Skip showing navbar on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-500 bg-clip-text text-transparent tracking-tight font-display">
              Rx<span className="text-slate-800 transition-colors">Fusion</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {links.map((link) => {
              if (link.dropdown) {
                return (
                  <div
                    key={link.name}
                    className="relative py-2"
                    onMouseEnter={() => setIsExploreOpen(true)}
                    onMouseLeave={() => setIsExploreOpen(false)}
                  >
                    <button
                      className={`text-sm font-medium transition-all duration-200 flex items-center gap-1.5 focus:outline-none ${
                        isExploreActive()
                          ? "text-cyan-500 font-semibold"
                          : "text-slate-650 hover:text-cyan-500"
                      }`}
                    >
                      <span>Explore</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${isExploreOpen ? "rotate-180 text-cyan-500" : "text-slate-450"}`} />
                    </button>

                    {isExploreOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200/60 rounded-2xl shadow-lg p-2 space-y-1 animate-fade-in">
                        {exploreItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              pathname === item.href || pathname.startsWith(item.href + "/")
                                ? "text-cyan-600 bg-cyan-50/50"
                                : "text-slate-650 hover:text-cyan-600 hover:bg-slate-50"
                            }`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href!}
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActive(link.href!)
                      ? "text-cyan-555 font-bold border-b-2 border-cyan-500 pb-0.5"
                      : "text-slate-650 hover:text-cyan-500 transition-colors"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center space-x-4 border-l border-slate-200 pl-4 ml-2">
                <span className="text-sm font-medium text-slate-600">
                  Hi, <span className="text-cyan-600 font-bold">{firstName || "Student"}</span>
                </span>
                <button
                  onClick={signOut}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-all duration-150"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center border-l border-slate-200 pl-4 ml-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-150 hover:-translate-y-0.5"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-all active:scale-95 ml-2"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          </nav>

          {/* Mobile search & menu buttons */}
          <div className="flex items-center space-x-1 md:hidden">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-all focus:outline-none"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-screen opacity-100 border-b border-slate-100"
            : "max-h-0 opacity-0 overflow-hidden"
        } bg-white`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-6 space-y-1 sm:px-6 overflow-y-auto max-h-[80vh]">
          {links.map((link) => {
            if (link.dropdown) {
              return (
                <div key={link.name} className="space-y-1">
                  <button
                    onClick={() => setIsMobileExploreOpen(!isMobileExploreOpen)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-base font-medium flex justify-between items-center ${
                      isExploreActive()
                        ? "text-cyan-600 bg-cyan-50/20"
                        : "text-slate-655 hover:bg-slate-50"
                    }`}
                  >
                    <span>Explore Platform</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileExploreOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isMobileExploreOpen && (
                    <div className="pl-4 border-l-2 border-slate-150 space-y-1 py-1 ml-2">
                      {exploreItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                            pathname === item.href || pathname.startsWith(item.href + "/")
                              ? "text-cyan-650 font-bold bg-cyan-50/40"
                              : "text-slate-500 hover:text-cyan-500 hover:bg-slate-50"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href!}
                className={`block px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive(link.href!)
                    ? "text-cyan-550 font-semibold bg-cyan-50/50"
                    : "text-slate-650 hover:text-cyan-500 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Mobile Auth actions */}
          <div className="border-t border-slate-100 mt-4 pt-4 space-y-3">
            {user ? (
              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-505 px-3">
                  Signed in as: <span className="text-cyan-600 font-bold">{firstName || "Student"}</span>
                </div>
                <button
                  onClick={signOut}
                  className="block w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-all duration-150"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all duration-150"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

