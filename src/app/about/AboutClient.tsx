"use client";

import React from "react";
import { GraduationCap, Users, BookMarked, Shield, Sparkles, BookOpen, Download, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const values = [
    {
      icon: <Users className="w-5 h-5 text-cyan-600" />,
      title: "Student-Centric",
      description: "Everything we curate is focused on helping pharmacy pupils master complicated chemistry and drug pathways."
    },
    {
      icon: <BookMarked className="w-5 h-5 text-cyan-600" />,
      title: "Syllabus Aligned",
      description: "All uploaded syllabus details strictly trace modern regulatory curriculums (PCI guidelines) for Pharm D, B Pharm, and D Pharm."
    },
    {
      icon: <Shield className="w-5 h-5 text-cyan-600" />,
      title: "Scientific Integrity",
      description: "Blogs and news bulletins are verified for scientific accuracy, drawing directly from established pharmacopoeia and clinical journals."
    }
  ];

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 bg-slate-50 min-h-screen">
      {/* Background circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-0 left-[-5%] w-[35%] aspect-square rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-150 text-xs font-semibold text-cyan-600 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            About RxFusion
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Building the premier repository of pharmacy reference sheets, lecture notes, and curriculum study material.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="space-y-12">
          {/* Section 1 */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-xs space-y-6 text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-cyan-500" />
              <span>Who We Are</span>
            </h2>
            <p className="text-slate-650 leading-relaxed text-sm sm:text-base">
              RxFusion was created by a group of pharmacy educators and senior academic students who realized how fragmented study materials were. Syllabus topics like medicinal chemistry, pharmacokinetics, and clinical toxicology are notoriously challenging, requiring clear diagrams and synthesized notes.
            </p>
            <p className="text-slate-650 leading-relaxed text-sm sm:text-base">
              Our platform serves as a unified vault where students across D Pharm, B Pharm, and Pharm D streams can access high-quality reference notes completely free of charge. No signup traps, no premium paywalls—just raw, high-yield academic material.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-10">
            {[
              { value: "3", label: "Pharmacy Streams", icon: <BookOpen className="w-5 h-5" /> },
              { value: "100%", label: "Free to Access", icon: <Download className="w-5 h-5" /> },
              { value: "PCI", label: "Syllabus Aligned", icon: <CheckCircle className="w-5 h-5" /> },
              { value: "24/7", label: "Always Available", icon: <Clock className="w-5 h-5" /> },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-3xs">
                <div className="flex justify-center mb-2 text-cyan-500">{stat.icon}</div>
                <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Section 2 - Values */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-8">
              Our Core Principles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((v) => (
                <div 
                  key={v.title}
                  className="bg-white border border-slate-200/50 rounded-xl p-6.5 text-center space-y-4 hover:shadow-xs shadow-3xs transition-shadow"
                >
                  <div className="w-12 h-12 bg-cyan-50 border border-cyan-100/30 rounded-xl flex items-center justify-center mx-auto shadow-3xs">
                    {v.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{v.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 - Syllabus Alignments */}
          <div className="bg-cyan-50/50 border border-cyan-150 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Ready to study?</h3>
              <p className="text-sm text-slate-600 max-w-md">
                Browse our note database organized by semester, stream, and subject.
              </p>
            </div>
            <Link
              href="/notes"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-cyan-500/10 flex-shrink-0"
            >
              Access Study Material
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
