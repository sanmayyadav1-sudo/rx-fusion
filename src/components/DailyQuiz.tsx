"use client";

import React, { useState } from "react";
import { QZ } from "@/lib/rxfusionData";

export default function DailyQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const q = QZ[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === q.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QZ.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div id="qz">
        <h3 style={{ fontSize: "20px" }}>
          Score: {score} of {QZ.length}
        </h3>
        <button className="btn o" style={{ marginTop: "14px" }} onClick={handleRestart}>
          Restart
        </button>
      </div>
    );
  }

  return (
    <div id="qz">
      <p className="demo">
        Question {currentIdx + 1} of {QZ.length}
      </p>
      <h3 style={{ marginTop: "10px", fontSize: "20px" }}>{q.question}</h3>
      <div style={{ marginTop: "10px" }}>
        {q.options.map((opt, i) => {
          let extraClass = "";
          if (selectedOpt !== null) {
            if (i === q.correct) {
              extraClass = " ok";
            } else if (i === selectedOpt) {
              extraClass = " no";
            }
          }
          return (
            <button
              key={opt}
              className={`opt${extraClass}`}
              disabled={selectedOpt !== null}
              onClick={() => handleSelect(i)}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selectedOpt !== null && (
        <button className="btn" style={{ marginTop: "14px" }} onClick={handleNext}>
          {currentIdx + 1 < QZ.length ? "Next question" : "See score"}
        </button>
      )}
    </div>
  );
}

