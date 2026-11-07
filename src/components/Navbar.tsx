"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { YR, SL } from "@/lib/rxfusionData";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Home", href: "/" },
    {
      label: "Academic Hub",
      href: "/academic-hub",
      dropdown: [
        ...YR.map((y, i) => ({ label: `Pharm.D ${y} Year`, href: `/academic-hub/${SL[i]}` })),
        { label: "Pharm.D Interns", href: "/academic-hub/sixth-year" },
      ],
    },
    {
      label: "Clinical Hub",
      href: "/clinical-hub",
      dropdown: [
        { label: "Clinical Cases", href: "/clinical-cases" },
        { label: "Drug Database", href: "/drug-database" },
        { label: "Specialties", href: "/clinical-hub" },
      ],
    },
    { label: "Research Hub", href: "/research-hub" },
    { label: "Learning Tools", href: "/learning-tools" },
    { label: "Blogs", href: "/blogs" },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    if (pathname.startsWith(item.href)) {
      return true;
    }
    if (
      item.label === "Clinical Hub" &&
      (pathname.startsWith("/clinical-cases") || pathname.startsWith("/drug-database"))
    ) {
      return true;
    }
    return false;
  };

  return (
    <header className={`site-header ${scrolled ? "sc" : ""} ${isOpen ? "open" : ""}`} id="hd">
      <div className="wrap">
        <nav className="main-nav" aria-label="Main">
          <Link href="/" className="logo" aria-label="RxFusion home">
            <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
              <g transform="rotate(40 15 15)">
                <rect x="9" y="2" width="12" height="26" rx="6" fill="none" stroke="#102A43" strokeWidth="2" />
                <path d="M9 15h12v7a6 6 0 0 1-12 0z" fill="#1677B8" />
              </g>
            </svg>
            RxFusion
          </Link>

          <ul className="menu" id="menu">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <li key={item.label}>
                  <Link href={item.href} className={`t ${active ? "on" : ""}`}>
                    {item.label}
                  </Link>
                  {item.dropdown && (
                    <div className="dd">
                      {item.dropdown.map((sub) => (
                        <Link key={sub.label + sub.href} href={sub.href}>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="act">
            {user || profile ? (
              <>
                {isAdmin && (
                  <Link className="btn o" href="/admin" style={{ padding: "7px 13px", fontSize: "13px" }}>
                    Admin
                  </Link>
                )}
                <Link className="btn" href="/dashboard" style={{ padding: "7px 13px", fontSize: "13px" }}>
                  Dashboard
                </Link>
                <button
                  className="btn o"
                  onClick={() => signOut()}
                  style={{ padding: "7px 12px", fontSize: "13px", border: "1px solid var(--ln)" }}
                  title="Sign out"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn o" href="/login">
                  Login
                </Link>
                <Link className="btn" href="/register">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="burger"
            id="bg"
            aria-label="Open menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </nav>
      </div>
    </header>
  );
}
