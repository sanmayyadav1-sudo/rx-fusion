"use client";

import React, { useState } from "react";
import { IXD, IX } from "@/lib/rxfusionData";

export default function InteractionChecker() {
  const [drugA, setDrugA] = useState<string>(IXD[0]);
  const [drugB, setDrugB] = useState<string>(IXD[9]); // 'warfarin'
  const [result, setResult] = useState<{ severity: string; text: string } | string | null>(null);
  const [error, setError] = useState<string>("");

  const handleCheck = () => {
    if (drugA === drugB) {
      setError("Choose two different drugs.");
      setResult(null);
      return;
    }

    setError("");
    const key = [drugA, drugB].sort().join("|");
    const found = IX[key];

    if (found) {
      setResult({
        severity: found[0],
        text: found[1],
      });
    } else {
      setResult("No entry in the demonstration dataset.");
    }
  };

  return (
    <div className="card" style={{ maxWidth: "520px" }}>
      <label htmlFor="a">Drug A</label>
      <select id="a" value={drugA} onChange={(e) => setDrugA(e.target.value)}>
        {IXD.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <label htmlFor="b">Drug B</label>
      <select id="b" value={drugB} onChange={(e) => setDrugB(e.target.value)}>
        {IXD.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <button className="btn" style={{ marginTop: "14px" }} onClick={handleCheck}>
        Check
      </button>

      {error && <div className="err">{error}</div>}

      {result && (
        <div style={{ marginTop: "14px" }}>
          {typeof result === "string" ? (
            <p>{result}</p>
          ) : (
            <p>
              <b>{result.severity}</b>: {result.text}
            </p>
          )}
        </div>
      )}

      <p className="demo" style={{ marginTop: "12px" }}>
        Small demonstration dataset. A missing entry does not mean a combination is safe.
      </p>
    </div>
  );
}

