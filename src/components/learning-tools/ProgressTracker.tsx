"use client";

import React, { useState } from "react";
import { SUB } from "@/lib/rxfusionData";

export default function ProgressTracker() {
  // Use 3rd Year subjects as standard sample like HTML reference
  const subjects = SUB[2];
  const [progress, setProgress] = useState<number[]>([72, 48, 61, 85, 40]);

  const handleSliderChange = (idx: number, val: number) => {
    setProgress((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  return (
    <div className="card" style={{ maxWidth: "520px" }}>
      <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>Pharm.D Subject Mastery</h3>
      {subjects.map((sub, i) => (
        <div key={sub} style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <label style={{ margin: 0, fontWeight: 500 }}>{sub}</label>
            <span style={{ fontSize: "14px", color: "var(--tx2)" }}>{progress[i]}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress[i]}
            aria-label={`${sub} progress`}
            onChange={(e) => handleSliderChange(i, parseInt(e.target.value, 10))}
            style={{ width: "100%", padding: 0 }}
          />
        </div>
      ))}
    </div>
  );
}

