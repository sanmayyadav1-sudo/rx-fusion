"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer in admin panel and admin access pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/rx-admin-access")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-sky-500 bg-clip-text text-transparent tracking-tight font-display">
                Rx<span className="text-slate-800">Fusion</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              RxFusion is a comprehensive pharmacy education platform providing premium notes, course resources, syllabus materials, and scientific blogs to pharmacy pupils.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="flex flex-col gap-y-2 text-sm">
              <li>
                <Link href="/notes" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  Pharmacy Notes
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  Scientific Blogs
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  Pharmacy News
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  Syllabus Library
                </Link>
              </li>
              <li>
                <Link href="/colleges" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  Colleges Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Pharmacy Streams
            </h3>
            <ul className="flex flex-col gap-y-2 text-sm">
              <li>
                <Link href="/notes/Pharm%20D" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  Pharm D (Doctor of Pharmacy)
                </Link>
              </li>
              <li>
                <Link href="/notes/B%20Pharm" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  B Pharm (Bachelor of Pharmacy)
                </Link>
              </li>
              <li>
                <Link href="/notes/D%20Pharm" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  D Pharm (Diploma in Pharmacy)
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed">
                  About the Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Contact RxFusion
            </h3>
            <ul className="flex flex-col gap-y-2.5 text-sm text-slate-500">
              <li className="flex items-start space-x-2.5">
                <svg
                  className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.63 1.977 14.154.952 11.53.951c-5.444 0-9.87 4.372-9.874 9.802-.001 1.73.463 3.42 1.343 4.927l-.958 3.5 3.6-.94c1.514.826 3.1 1.258 4.675 1.258h.023zm10.963-7.477c-.3-.15-1.77-.875-2.046-.975-.276-.1-.477-.15-.677.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-3.04-1.52-4.004-2.61-4.74-3.885-.196-.34-.02-.52.15-.69.15-.15.3-.35.45-.53.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.677-1.625-.926-2.225-.244-.589-.493-.51-.677-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.025 2.9 1.175 3.1c.15.2 2.021 3.085 4.897 4.33.685.297 1.22.474 1.637.607.69.219 1.317.188 1.812.114.55-.082 1.77-.725 2.02-1.425.25-.7.25-1.3 1.75-1.4.075-.1.225-.25.075-.4z" />
                </svg>
                <a
                  href={`https://wa.me/917350410894?text=${encodeURIComponent("Hello RxFusion 👋\n\nI am visiting the RxFusion website and I have a query. Please help me.\n\nThank you.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed"
                >
                  WhatsApp: +917350410894
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:rxfusion.support@gmail.com?subject=${encodeURIComponent("RxFusion Website Query")}&body=${encodeURIComponent("Hello RxFusion Team,\n\nI am contacting you regarding a query about RxFusion.\n\nMy Query:\n\nThank you.")}`}
                  className="break-all text-slate-500 hover:text-cyan-600 transition-colors duration-150 text-sm leading-relaxed"
                >
                  Email: rxfusion.support@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright segment */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} RxFusion Pharmacy Education. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Designed for excellence. Built with ❤️ for Future Pharmacists.
          </p>
        </div>
      </div>
    </footer>
  );
}
