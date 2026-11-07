"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import HeroCapsule from "@/components/HeroCapsule";
import YearPanels from "@/components/YearPanels";
import DailyQuiz from "@/components/DailyQuiz";
import { SP, RH, BLOGS } from "@/lib/rxfusionData";

export default function HomeClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reveal-on-scroll intersection observer matching the reference implementation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll("section.s .wrap > *");
    elements.forEach((el) => el.classList.add("rv"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((el) => el.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <section className="hero">
        <div className="wrap">
          <div>
            <div className="tag">Pharmacy Knowledge. Clinical Excellence.</div>
            <h1>Where Pharmacy Knowledge Meets Clinical Excellence.</h1>
            <p>
              An advanced learning ecosystem designed exclusively for Doctor of Pharmacy students,
              combining academic resources, clinical education and scientific research.
            </p>
            <div className="cta">
              <Link className="btn" href="/academic-hub">
                Explore Academic Hub
              </Link>
              <Link className="btn w" href="/clinical-hub">
                Discover Clinical Learning
              </Link>
            </div>
          </div>

          <HeroCapsule />
        </div>
      </section>

      {/* Year Selector / Academic Hub Preview */}
      <section className="s">
        <div className="wrap">
          <h2>Six years and an internship, in one place.</h2>
          <p className="lead">
            Select your academic year to access lecture notes, syllabus, university question banks and exam resources.
          </p>
          <YearPanels />
        </div>
      </section>

      {/* Clinical Specialties Grid */}
      <section className="s band">
        <div className="wrap">
          <h2>Clinical learning by specialty.</h2>
          <p className="lead">
            Disease information, cases, therapy and counselling organised around the wards you will work in.
          </p>
          <div className="spec">
            {SP.map((s) => (
              <Link key={s.name} href="/clinical-hub">
                <b>{s.name}</b>
                <small>{s.desc}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Learning: Drug of the day, Case of the day, Daily quiz */}
      <section className="s">
        <div className="wrap">
          <h2>Today’s learning.</h2>
          <p className="lead">
            A drug monograph, a ward case and a clinical challenge, refreshed daily for hospital rounds.
          </p>
          <div className="g3" style={{ marginTop: "36px" }}>
            <div className="card">
              <span className="pill">Drug of the day</span>
              <h3 style={{ marginTop: "12px" }}>Pantoprazole</h3>
              <p>
                Proton Pump Inhibitor (PPI). Irreversibly inhibits the H+/K+ ATPase pump in gastric parietal cells.
              </p>
              <Link className="btn o" style={{ marginTop: "16px" }} href="/drug-database">
                Open monograph
              </Link>
            </div>

            <div className="card">
              <span className="pill">Case of the day</span>
              <h3 style={{ marginTop: "12px" }}>Uncontrolled Essential Hypertension</h3>
              <p>Cardiology inpatient workup with dual pharmacotherapy evaluation and SOAP documentation.</p>
              <Link className="btn o" style={{ marginTop: "16px" }} href="/clinical-cases">
                Start the case
              </Link>
            </div>

            <div className="card">
              <span className="pill">Daily quiz</span>
              <div style={{ marginTop: "10px" }}>
                <DailyQuiz />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Hub Section (Dark Navy) */}
      <section className="s dark">
        <div className="wrap g2" style={{ alignItems: "center" }}>
          <div>
            <h2>Research Hub</h2>
            <p className="lead" style={{ color: "#B9CCDD" }}>
              From your first literature search to a submitted review article.
            </p>
            <Link className="btn w" style={{ marginTop: "22px" }} href="/research-hub">
              Enter Research Hub
            </Link>
          </div>
          <div>
            {RH.slice(0, 5).map((r) => (
              <details key={r.title} style={{ borderColor: "rgba(255,255,255,.15)" }}>
                <summary style={{ color: "#fff" }}>{r.title}</summary>
                <p style={{ color: "#B9CCDD" }}>{r.desc}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Resources & Blogs */}
      <section className="s">
        <div className="wrap">
          <h2>Learning resources and blogs.</h2>
          <div className="g3" style={{ marginTop: "36px" }}>
            {BLOGS.slice(0, 3).map((b) => (
              <Link key={b.title} className="card" href="/blogs">
                <span className="pill">{b.category}</span>
                <h3 style={{ marginTop: "12px" }}>{b.title}</h3>
                <p style={{ color: "var(--tx2)", fontSize: "14px" }}>
                  {b.author}, {b.readTime} read
                </p>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: "22px" }}>
            <Link className="btn o" href="/resources">
              Browse resources
            </Link>
          </p>
        </div>
      </section>

      {/* Why RxFusion */}
      <section className="s band">
        <div className="wrap">
          <h2>Why RxFusion.</h2>
          <div className="g3" style={{ marginTop: "36px" }}>
            <div>
              <h3>Made only for Pharm.D</h3>
              <p className="lead" style={{ marginTop: "8px" }}>
                Every note, case and tool follows the Pharm.D curriculum and clinical clerkship.
              </p>
            </div>
            <div>
              <h3>Clinical before theoretical</h3>
              <p className="lead" style={{ marginTop: "8px" }}>
                Cases, SOAP notes and drug monographs sit beside your year-wise notes.
              </p>
            </div>
            <div>
              <h3>Research-ready</h3>
              <p className="lead" style={{ marginTop: "8px" }}>
                Methods, referencing and publication guidance for review articles and posters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="s">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2 style={{ margin: "auto", maxWidth: "22ch" }}>Start with the year you are in.</h2>
          <p className="lead" style={{ margin: "14px auto 26px" }}>
            Create a student account to track progress and save resources.
          </p>
          <Link className="btn" href="/register">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
