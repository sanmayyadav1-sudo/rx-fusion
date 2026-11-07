"use client";

import React, { useState } from "react";
import { FCS } from "@/lib/rxfusionData";

export default function Flashcards() {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlipped((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="g2">
      {FCS.map((f, i) => (
        <div
          key={i}
          className={`fc ${flipped[i] ? "fl" : ""}`}
          tabIndex={0}
          role="button"
          aria-label={`Flip card ${i + 1}: ${f.front}`}
          onClick={() => toggleFlip(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleFlip(i);
            }
          }}
        >
          <div>
            <span>{f.front}</span>
            <span>{f.back}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

