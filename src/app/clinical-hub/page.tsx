"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { SP, FEAT } from "@/lib/rxfusionData";

interface CaseSummary {
  id: string;
  slug: string;
  title: string;
  department: string;
  disease: string;
  age: number;
  gender: string;
}

export default function ClinicalHubPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState(0);
  const [selectedFeatureTab, setSelectedFeatureTab] = useState(0);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);

  const currentSpecialty = SP[selectedSpecialty];
  const currentFeature = FEAT[selectedFeatureTab];

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await fetch("/api/clinical-cases");
        const data = await res.json();
        if (data.success && data.cases) {
          setCases(data.cases);
        }
      } catch (err) {
        console.error("Failed to load specialty cases:", err);
      } finally {
        setLoadingCases(false);
      }
    }
    loadCases();
  }, []);

  const specialtyCases = cases.filter(
    (c) => c.department.toLowerCase().includes(currentSpecialty.name.toLowerCase()) ||
           currentSpecialty.name.toLowerCase().includes(c.department.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Clinical Hub"
        description="Ten clinical specialties organized around evidence-based pharmacotherapy, clinical rounds cases and guidelines."
      />
      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap adm">
          {/* Specialties Sidebar */}
          <aside id="sp">
            {SP.map((s, i) => (
              <button
                key={s.name}
                className={selectedSpecialty === i ? "on" : ""}
                onClick={() => {
                  setSelectedSpecialty(i);
                  setSelectedFeatureTab(0);
                }}
              >
                {s.name}
              </button>
            ))}
          </aside>

          {/* Specialty Detail View */}
          <div id="sd">
            <h2 style={{ maxWidth: "none" }}>{currentSpecialty.name}</h2>
            <p className="lead">{currentSpecialty.desc}</p>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "10px", margin: "14px 0", flexWrap: "wrap" }}>
              <Link href="/clinical-cases" className="btn" style={{ padding: "6px 14px", fontSize: "13px" }}>
                Browse All Clinical Cases
              </Link>
              <Link href="/drug-database" className="btn o" style={{ padding: "6px 14px", fontSize: "13px" }}>
                Search Drug Monograph
              </Link>
              <Link href="/learning-tools" className="btn o" style={{ padding: "6px 14px", fontSize: "13px" }}>
                Clinical Calculators
              </Link>
            </div>

            {/* Feature Tabs */}
            <div className="tabs" role="tablist">
              {FEAT.map((f, j) => (
                <button
                  key={f}
                  role="tab"
                  className={selectedFeatureTab === j ? "on" : ""}
                  onClick={() => setSelectedFeatureTab(j)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Feature Card */}
            <div className="tp">
              <div className="card">
                <h3>{currentFeature} · {currentSpecialty.name}</h3>
                
                {/* When Cases tab is active */}
                {currentFeature === "Cases" ? (
                  <div style={{ marginTop: "14px" }}>
                    {loadingCases ? (
                      <p style={{ color: "var(--tx2)" }}>Loading department cases...</p>
                    ) : specialtyCases.length > 0 ? (
                      specialtyCases.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: "12px 0",
                            borderBottom: "1px solid var(--ln)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <span className="pill">{c.department}</span>
                            <h4 style={{ marginTop: "6px", fontSize: "17px" }}>{c.title}</h4>
                            <p style={{ color: "var(--tx2)", fontSize: "13.5px" }}>
                              Diagnosis: {c.disease} · Patient: {c.gender}, {c.age}y
                            </p>
                          </div>
                          <Link href="/clinical-cases" className="btn o" style={{ padding: "4px 12px", fontSize: "13px" }}>
                            Open SOAP
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "var(--tx2)" }}>
                        Specialty case rounds recorded. Visit <Link href="/clinical-cases" style={{ color: "var(--blue)" }}>Clinical Cases</Link> to inspect all published ward cases.
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: "12px", lineHeight: "1.7", fontSize: "14.5px", color: "var(--tx1)" }}>
                    <p>
                      Curated guidelines and clinical pharmacotherapy review module for <b>{currentSpecialty.name}</b>.
                      Covers standard therapeutic regimens, primary indications, dosage adjustments for renal and hepatic impairment, drug-drug interaction warnings, and hospital ward monitoring protocols.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
