"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

interface ClinicalCase {
  id: string;
  slug: string;
  title: string;
  department: string;
  disease: string;
  age: number;
  gender: string;
  chief_complaint?: string;
  history?: string;
  medication_history?: string;
  findings?: string;
  diagnosis?: string;
  treatment?: string;
  monitoring?: string;
  outcome?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  discussion?: string;
  learning_points?: string;
}

const CASE_TABS = ["Subjective", "Objective", "Assessment", "Plan", "Discussion & Pearls"] as const;

export default function ClinicalCasesPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseSlug, setSelectedCaseSlug] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  useEffect(() => {
    async function loadCases() {
      setLoading(true);
      try {
        const res = await fetch("/api/clinical-cases");
        const data = await res.json();
        if (data.success && data.cases?.length > 0) {
          setCases(data.cases);
          setSelectedCaseSlug(data.cases[0].slug);
        }
      } catch (err) {
        console.error("Failed to load clinical cases:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  const departments = useMemo(() => {
    const list = Array.from(new Set(cases.map((c) => c.department)));
    return ["All", ...list];
  }, [cases]);

  const filteredCases = useMemo(() => {
    if (selectedDepartment === "All") return cases;
    return cases.filter((c) => c.department === selectedDepartment);
  }, [cases, selectedDepartment]);

  const activeCase = useMemo(() => {
    return (
      cases.find((c) => c.slug === selectedCaseSlug) ||
      filteredCases[0] ||
      cases[0]
    );
  }, [cases, selectedCaseSlug, filteredCases]);

  const handleBookmarkCase = async () => {
    if (!user) {
      showToast("Please log in to save clinical case bookmarks.");
      return;
    }
    if (!activeCase) return;

    try {
      const res = await fetch("/api/student/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "cases",
          contentId: activeCase.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Case saved to your student bookmarks!");
      } else if (res.status === 409) {
        showToast("This case is already bookmarked.");
      } else {
        showToast(data.error || "Failed to bookmark case.");
      }
    } catch {
      showToast("Network error saving bookmark.");
    }
  };

  return (
    <>
      <PageHeader
        title="Clinical Cases"
        description="Comprehensive SOAP-format clinical rounds cases, laboratory data, pharmacotherapy workups and clinical pearls."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap">
          {/* Department Filter Bar */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {departments.map((dept) => (
              <button
                key={dept}
                className={selectedDepartment === dept ? "btn" : "btn o"}
                style={{ padding: "6px 14px", fontSize: "13.5px" }}
                onClick={() => {
                  setSelectedDepartment(dept);
                  const firstMatch = cases.find((c) => dept === "All" || c.department === dept);
                  if (firstMatch) setSelectedCaseSlug(firstMatch.slug);
                }}
              >
                {dept}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="card">
              <p style={{ color: "var(--tx2)" }}>Loading clinical cases from database...</p>
            </div>
          ) : !activeCase ? (
            <div className="card">
              <p style={{ color: "var(--tx2)" }}>No clinical cases available in this department.</p>
            </div>
          ) : (
            <div className="adm">
              {/* Left Column: Case Selector */}
              <aside id="dl" style={{ maxWidth: "340px" }}>
                <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--tx2)", marginBottom: "8px" }}>
                  Select Case ({filteredCases.length})
                </p>
                {filteredCases.map((c) => (
                  <button
                    key={c.id}
                    className={activeCase.id === c.id ? "on" : ""}
                    onClick={() => {
                      setSelectedCaseSlug(c.slug);
                      setActiveTab(0);
                    }}
                    style={{ textAlign: "left", padding: "10px 12px", lineHeight: "1.4" }}
                  >
                    <div style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 600 }}>
                      {c.department} · {c.gender}, {c.age}y
                    </div>
                    <div style={{ fontSize: "13.5px", marginTop: "2px" }}>{c.title}</div>
                  </button>
                ))}
              </aside>

              {/* Right Column: Case SOAP View */}
              <div className="card" id="dm">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      <span className="pill">{activeCase.department}</span>
                      <span className="pill">
                        Patient: {activeCase.gender}, {activeCase.age} Years Old
                      </span>
                      <span className="pill" style={{ color: "var(--teal)" }}>
                        SOAP Standard
                      </span>
                    </div>

                    <h3 style={{ marginTop: "12px", fontSize: "22px", color: "var(--navy)" }}>
                      {activeCase.title}
                    </h3>
                    <p style={{ color: "var(--tx2)", fontSize: "14px", marginTop: "4px" }}>
                      Primary Diagnosis: <b>{activeCase.disease}</b>
                    </p>
                  </div>

                  <button
                    className="btn o"
                    style={{ padding: "6px 14px", fontSize: "13px" }}
                    onClick={handleBookmarkCase}
                  >
                    Bookmark Case
                  </button>
                </div>

                {/* SOAP Tabs */}
                <div className="tabs" role="tablist" style={{ marginTop: "18px" }}>
                  {CASE_TABS.map((tab, idx) => (
                    <button
                      key={tab}
                      role="tab"
                      className={activeTab === idx ? "on" : ""}
                      onClick={() => setActiveTab(idx)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Panels */}
                <div className="tp" style={{ minHeight: "220px", marginTop: "16px" }}>
                  {/* Tab 0: Subjective */}
                  {activeTab === 0 && (
                    <div style={{ lineHeight: "1.7", fontSize: "14.5px" }}>
                      {activeCase.chief_complaint && (
                        <div style={{ marginBottom: "14px" }}>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Chief Complaint:</h4>
                          <p style={{ color: "var(--tx1)" }}>{activeCase.chief_complaint}</p>
                        </div>
                      )}
                      {activeCase.history && (
                        <div style={{ marginBottom: "14px" }}>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>History of Present Illness:</h4>
                          <p style={{ color: "var(--tx1)" }}>{activeCase.history}</p>
                        </div>
                      )}
                      {activeCase.medication_history && (
                        <div style={{ marginBottom: "14px" }}>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Medication & Allergy History:</h4>
                          <p style={{ color: "var(--tx1)" }}>{activeCase.medication_history}</p>
                        </div>
                      )}
                      {activeCase.subjective && (
                        <div>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Clinical Presentation:</h4>
                          <p style={{ color: "var(--tx1)" }}>{activeCase.subjective}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 1: Objective */}
                  {activeTab === 1 && (
                    <div style={{ lineHeight: "1.7", fontSize: "14.5px" }}>
                      {activeCase.findings && (
                        <div style={{ marginBottom: "14px" }}>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Clinical Examination Findings:</h4>
                          <p style={{ color: "var(--tx1)" }}>{activeCase.findings}</p>
                        </div>
                      )}
                      {activeCase.objective && (
                        <div>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Laboratory & Diagnostic Parameters:</h4>
                          <p style={{ color: "var(--tx1)", whiteSpace: "pre-line" }}>{activeCase.objective}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Assessment */}
                  {activeTab === 2 && (
                    <div style={{ lineHeight: "1.7", fontSize: "14.5px" }}>
                      <h4 style={{ color: "var(--navy)", marginBottom: "6px" }}>Clinical Pharmacist Assessment:</h4>
                      <p style={{ color: "var(--tx1)", whiteSpace: "pre-line" }}>
                        {activeCase.assessment || "Drug therapy problem assessment in progress."}
                      </p>
                      {activeCase.diagnosis && (
                        <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "var(--bg)", borderLeft: "3px solid var(--teal)" }}>
                          <b>Confirmed Etiology:</b> {activeCase.diagnosis}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Plan */}
                  {activeTab === 3 && (
                    <div style={{ lineHeight: "1.7", fontSize: "14.5px" }}>
                      {activeCase.plan && (
                        <div style={{ marginBottom: "14px" }}>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Pharmaceutical Care Plan:</h4>
                          <p style={{ color: "var(--tx1)", whiteSpace: "pre-line" }}>{activeCase.plan}</p>
                        </div>
                      )}
                      {activeCase.treatment && (
                        <div style={{ marginBottom: "14px" }}>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Therapeutic Regimen:</h4>
                          <p style={{ color: "var(--tx1)" }}>{activeCase.treatment}</p>
                        </div>
                      )}
                      {activeCase.monitoring && (
                        <div>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Monitoring & Safety Parameters:</h4>
                          <p style={{ color: "var(--tx1)" }}>{activeCase.monitoring}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 4: Discussion & Pearls */}
                  {activeTab === 4 && (
                    <div style={{ lineHeight: "1.7", fontSize: "14.5px" }}>
                      {activeCase.discussion && (
                        <div style={{ marginBottom: "14px" }}>
                          <h4 style={{ color: "var(--navy)", marginBottom: "4px" }}>Clinical Discussion:</h4>
                          <p style={{ color: "var(--tx1)", whiteSpace: "pre-line" }}>{activeCase.discussion}</p>
                        </div>
                      )}
                      {activeCase.learning_points && (
                        <div style={{ padding: "12px 14px", backgroundColor: "var(--bg)", border: "1px solid var(--ln)", borderRadius: "6px" }}>
                          <h4 style={{ color: "var(--blue)", marginBottom: "6px" }}>High-Yield Learning Pearls:</h4>
                          <p style={{ color: "var(--tx1)", whiteSpace: "pre-line" }}>{activeCase.learning_points}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
