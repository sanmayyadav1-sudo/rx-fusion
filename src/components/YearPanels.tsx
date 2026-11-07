"use client";

import React, { useState } from "react";
import Link from "next/link";
import { YR, SL, SUB } from "@/lib/rxfusionData";

export default function YearPanels() {
  const [activeYearIndex, setActiveYearIndex] = useState(0);

  return (
    <div className="yrs" id="yrs">
      {YR.map((y, i) => {
        const isActive = activeYearIndex === i;
        return (
          <button
            key={y}
            className={`yp ${isActive ? "on" : ""}`}
            aria-expanded={isActive}
            onClick={() => setActiveYearIndex(i)}
          >
            <span className="n">{i + 1}</span>
            <h3>{y} year</h3>
            <div className="in">
              <ul>
                {SUB[i].map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <Link href={`/academic-hub/${SL[i]}`} onClick={(e) => e.stopPropagation()}>
                Open {y.toLowerCase()} year
              </Link>
            </div>
          </button>
        );
      })}
    </div>
  );
}

