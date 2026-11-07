"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RH } from "@/lib/rxfusionData";

export default function ResearchHubPage() {
  const [filterQuery, setFilterQuery] = useState("");

  const filteredTopics = RH.filter(
    (r) =>
      r.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.desc.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <>
      {/* Research Hero */}
      <section className="hero" style={{ minHeight: 0 }}>
        <div className="wrap" style={{ minHeight: 0, padding: "64px 24px" }}>
          <div>
            <div className="crumb">
              <Link href="/" style={{ color: "#7FC4D0" }}>
                Home
              </Link>
            </div>
            <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)" }}>Research Hub</h1>
            <p>Methods, writing and publication guidance for Pharm.D students.</p>
          </div>

          {/* DNA Double Helix Visual SVG */}
          <svg
            viewBox="0 0 300 200"
            aria-hidden="true"
            style={{ maxWidth: "340px", margin: "auto" }}
          >
            <g fill="none" stroke="#7FC4D0" strokeWidth="2">
              <path id="h1" d="M20 40C90 40 90 160 160 160S230 40 290 40" />
              <path
                d="M20 160C90 160 90 40 160 40S230 160 290 160"
                stroke="#1677B8"
              />
            </g>
            <g stroke="#4aa3c7">
              {[40, 70, 100, 130, 160, 190, 220, 250].map((x, i) => (
                <line
                  key={x}
                  x1={x}
                  x2={x}
                  y1={60 + (i % 3) * 8}
                  y2={140 - (i % 3) * 8}
                />
              ))}
            </g>
          </svg>
        </div>
      </section>

      {/* Topics & Competitions Section */}
      <section className="s">
        <div className="wrap">
          <input
            type="search"
            id="rs"
            placeholder="Filter topics"
            aria-label="Filter topics"
            style={{ maxWidth: "340px" }}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />

          <div id="rl" style={{ marginTop: "12px" }}>
            {filteredTopics.length > 0 ? (
              filteredTopics.map((r) => (
                <details key={r.title}>
                  <summary>{r.title}</summary>
                  <p style={{ color: "var(--tx1)", lineHeight: "1.6", marginTop: "8px" }}>
                    {r.desc} Core methodology documentation, institutional ethical clearance templates, and protocol review resources for Pharm.D projects and dissertations.
                  </p>
                </details>
              ))
            ) : (
              <p style={{ color: "var(--tx2)", padding: "12px 0" }}>
                No topics match &quot;{filterQuery}&quot;.
              </p>
            )}
          </div>

          <div className="card" style={{ marginTop: "32px" }}>
            <h3>Research Competitions & Journal Submissions</h3>
            <p style={{ color: "var(--tx2)", marginTop: "6px", lineHeight: "1.6" }}>
              National and international clinical pharmacy research symposiums, case report poster competitions, and peer-reviewed PubMed/Scopus indexed journal submission directories.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

