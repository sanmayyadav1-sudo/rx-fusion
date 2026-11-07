"use client";

import React, { useRef, useEffect } from "react";

// 16 particles with deterministic positions for hydration safety
const PARTICLES = [
  { left: 12, top: 18, size: 4, d: 5.2, x: 10, y: -15 },
  { left: 78, top: 22, size: 3, d: 4.8, x: -12, y: 14 },
  { left: 24, top: 76, size: 5, d: 6.1, x: 14, y: -8 },
  { left: 85, top: 68, size: 3, d: 7.0, x: -10, y: 18 },
  { left: 45, top: 12, size: 6, d: 5.5, x: 8, y: 12 },
  { left: 62, top: 82, size: 4, d: 6.4, x: -14, y: -10 },
  { left: 15, top: 48, size: 3, d: 8.2, x: 12, y: 15 },
  { left: 88, top: 40, size: 5, d: 4.5, x: -8, y: -16 },
  { left: 32, top: 34, size: 4, d: 5.9, x: 6, y: -12 },
  { left: 70, top: 54, size: 3, d: 6.8, x: -15, y: 10 },
  { left: 52, top: 64, size: 5, d: 7.4, x: 11, y: 14 },
  { left: 20, top: 88, size: 4, d: 5.1, x: -9, y: -14 },
  { left: 82, top: 15, size: 6, d: 6.6, x: 13, y: -7 },
  { left: 38, top: 92, size: 3, d: 8.0, x: -11, y: 12 },
  { left: 60, top: 28, size: 4, d: 4.9, x: 7, y: 16 },
  { left: 90, top: 85, size: 5, d: 7.2, x: -13, y: -11 },
];

export default function HeroCapsule() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const parent = scene.parentElement;
    if (!parent) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width - 0.5).toFixed(2);
      const my = ((e.clientY - rect.top) / rect.height - 0.5).toFixed(2);
      scene.style.setProperty("--mx", mx);
      scene.style.setProperty("--my", my);
    };

    parent.addEventListener("mousemove", handleMouseMove);
    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="scene" id="scene" ref={sceneRef} aria-hidden="true">
      <div className="glow" />

      {/* Molecular visual SVG with rotating ring */}
      <svg className="mol" viewBox="0 0 200 200" aria-hidden="true">
        <g className="r" stroke="#7FC4D0" strokeWidth="2.5" fill="none" opacity="0.9">
          <path d="M100 40 150 70 150 130 100 160 50 130 50 70Z" />
          <path d="M150 70 185 50M50 130 18 148M100 40 100 8" />
          <circle cx="100" cy="40" r="9" fill="#1677B8" />
          <circle cx="150" cy="70" r="9" fill="#247C83" />
          <circle cx="150" cy="130" r="9" fill="#1677B8" />
          <circle cx="100" cy="160" r="9" fill="#247C83" />
          <circle cx="50" cy="130" r="9" fill="#1677B8" />
          <circle cx="50" cy="70" r="9" fill="#247C83" />
          <circle cx="185" cy="50" r="7" fill="#9bd7e3" />
          <circle cx="18" cy="148" r="7" fill="#9bd7e3" />
          <circle cx="100" cy="8" r="7" fill="#9bd7e3" />
        </g>
      </svg>

      {/* 3D Floating Stage with multi-slice capsule */}
      <div className="stage">
        <div className="float">
          <div className="spin" id="cap">
            {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
              <div
                key={k}
                className={`sl ${k === 0 ? "f" : ""}`}
                style={{
                  transform: `translateZ(${k * 7}px)`,
                  opacity: k === 0 ? 1 : 0.55,
                }}
              />
            ))}
          </div>
          <div className="shadow" />
        </div>
      </div>

      {/* Ambient drifting particles */}
      {PARTICLES.map((p, idx) => (
        <i
          key={idx}
          className="pt"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              "--d": `${p.d}s`,
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

