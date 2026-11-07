"use client";

import React, { useState } from "react";

export default function DoseCalculator() {
  const [weight, setWeight] = useState<string>("20");
  const [dosePerKg, setDosePerKg] = useState<string>("30");
  const [dosesPerDay, setDosesPerDay] = useState<string>("3");
  const [maxCap, setMaxCap] = useState<string>("");
  const [result, setResult] = useState<{
    dailyDose: string;
    perDose: string;
    doses: number;
    capped: boolean;
  } | null>(null);
  const [error, setError] = useState<string>("");

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const d = parseFloat(dosePerKg);
    const n = parseFloat(dosesPerDay);
    const m = maxCap ? parseFloat(maxCap) : 0;

    if (!(w > 0 && d > 0 && n >= 1)) {
      setError("Enter positive values for weight, dose and doses per day.");
      setResult(null);
      return;
    }

    setError("");
    let day = w * d;
    let capped = false;
    if (m > 0 && day > m) {
      day = m;
      capped = true;
    }

    setResult({
      dailyDose: day.toFixed(0),
      perDose: (day / n).toFixed(1),
      doses: n,
      capped,
    });
  };

  return (
    <div className="card" style={{ maxWidth: "520px" }}>
      <form onSubmit={handleCalculate}>
        <label htmlFor="w">Weight (kg)</label>
        <input
          id="w"
          type="number"
          min="0"
          step="any"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <label htmlFor="dk">Dose (mg/kg/day)</label>
        <input
          id="dk"
          type="number"
          min="0"
          step="any"
          value={dosePerKg}
          onChange={(e) => setDosePerKg(e.target.value)}
        />

        <label htmlFor="n">Doses per day</label>
        <input
          id="n"
          type="number"
          min="1"
          value={dosesPerDay}
          onChange={(e) => setDosesPerDay(e.target.value)}
        />

        <label htmlFor="mx">Maximum dose cap (mg/day, optional)</label>
        <input
          id="mx"
          type="number"
          min="0"
          step="any"
          value={maxCap}
          placeholder="e.g. 2000"
          onChange={(e) => setMaxCap(e.target.value)}
        />

        <button type="submit" className="btn" style={{ marginTop: "14px" }}>
          Calculate
        </button>

        {error && <div className="err">{error}</div>}

        {result && (
          <div style={{ marginTop: "14px", lineHeight: "1.5" }}>
            <b>
              {result.dailyDose} mg/day
              {result.capped && " (capped at your maximum)"}
            </b>
            <br />
            {result.perDose} mg per dose, {result.doses} doses per day
          </div>
        )}
      </form>

      <p className="demo" style={{ marginTop: "12px" }}>
        Educational practice only. Assumes a simple weight-based regimen with normal organ function.
        Not clinical advice; check the label and a validated reference.
      </p>
    </div>
  );
}

