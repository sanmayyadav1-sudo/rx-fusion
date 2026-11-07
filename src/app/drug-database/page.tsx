"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { DRUGS } from "@/lib/rxfusionData";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface UnifiedDrug {
  id?: string;
  generic: string;
  brands: string;
  drugClass: string;
  moa: string;
  uses: string;
  sideEffects: string;
  contraindications: string;
  interactions: string;
  pearl?: string;
  viva?: string;
}

export default function DrugDatabasePage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [dbDrugs, setDbDrugs] = useState<UnifiedDrug[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [selectedDrugName, setSelectedDrugName] = useState<string>("");

  useEffect(() => {
    async function loadDbDrugs() {
      try {
        const res = await fetch("/api/drugs");
        const data = await res.json();
        if (data.success && data.drugs) {
          const mapped: UnifiedDrug[] = data.drugs.map((d: {
            id?: string;
            drug_name?: string;
            generic_name?: string;
            drug_class?: string;
            moa?: string;
            uses?: string;
            side_effects?: string;
            contraindications?: string;
            interactions?: string;
            clinical_pearl?: string;
            viva_questions?: string;
          }) => ({
            id: d.id,
            generic: d.drug_name || d.generic_name,
            brands: d.generic_name !== d.drug_name ? d.generic_name : "Common Clinical Brands",
            drugClass: d.drug_class || "Pharmacotherapeutic Agent",
            moa: d.moa || "Selective receptor / enzymatic pathway modulation.",
            uses: d.uses || "Evidence-based clinical indications.",
            sideEffects: d.side_effects || "Monitor for adverse clinical effects.",
            contraindications: d.contraindications || "Hypersensitivity to active compound.",
            interactions: d.interactions || "Check cytochrome P450 and renal excretion interactions.",
            pearl: d.clinical_pearl,
            viva: d.viva_questions,
          }));

          // Merge with static reference list for complete alphabet coverage
          const fallbackMapped: UnifiedDrug[] = DRUGS.map((d) => ({
            generic: d.g,
            brands: d.b,
            drugClass: d.c,
            moa: d.m,
            uses: d.i,
            sideEffects: d.ae,
            contraindications: d.ci,
            interactions: d.x,
          }));

          const combined = [...mapped];
          fallbackMapped.forEach((fb) => {
            if (!combined.some((c) => c.generic.toLowerCase() === fb.generic.toLowerCase())) {
              combined.push(fb);
            }
          });

          // Sort alphabetically
          combined.sort((a, b) => a.generic.localeCompare(b.generic));
          setDbDrugs(combined);
          if (combined.length > 0) {
            setSelectedDrugName(combined[0].generic);
          }
        }
      } catch (err) {
        console.error("Failed to load drugs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDbDrugs();
  }, []);

  const filteredDrugs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return dbDrugs.filter((d) => {
      const matchesQuery = !q || (d.generic + " " + d.brands + " " + d.drugClass).toLowerCase().includes(q);
      const matchesLetter = !selectedLetter || d.generic.toUpperCase().startsWith(selectedLetter);
      return matchesQuery && matchesLetter;
    });
  }, [dbDrugs, searchQuery, selectedLetter]);

  const selectedDrug: UnifiedDrug | undefined = useMemo(() => {
    return (
      filteredDrugs.find((d) => d.generic === selectedDrugName) ||
      filteredDrugs[0] ||
      undefined
    );
  }, [filteredDrugs, selectedDrugName]);

  const handleLetterClick = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter("");
    } else {
      setSelectedLetter(letter);
    }
  };

  const handleBookmarkDrug = async () => {
    if (!user) {
      showToast("Please log in to save drug monographs.");
      return;
    }
    if (!selectedDrug) return;

    try {
      const res = await fetch("/api/student/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "drugs",
          contentId: selectedDrug.id || selectedDrug.generic,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Saved ${selectedDrug.generic} to your bookmarks!`);
      } else if (res.status === 409) {
        showToast("Drug is already bookmarked.");
      } else {
        showToast(data.error || "Failed to bookmark drug.");
      }
    } catch {
      showToast("Network error saving bookmark.");
    }
  };

  return (
    <>
      <PageHeader
        title="Drug Database"
        description="Comprehensive clinical pharmacology monographs, mechanism of action, dosages, adverse effects, contraindications and clinical pearls."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap">
          {/* Search Bar */}
          <input
            type="search"
            id="ds"
            placeholder="Search generic, brand name or drug class..."
            aria-label="Search drugs"
            style={{ maxWidth: "420px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* A-Z Filter */}
          <div className="az" id="az" style={{ marginTop: "12px" }}>
            {ALPHABET.map((char) => (
              <button
                key={char}
                className={selectedLetter === char ? "on" : ""}
                onClick={() => handleLetterClick(char)}
              >
                {char}
              </button>
            ))}
          </div>

          {/* Master-Detail Layout */}
          <div className="adm" style={{ marginTop: "16px" }}>
            <aside id="dl" style={{ maxWidth: "300px" }}>
              <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--tx2)", marginBottom: "8px" }}>
                Matching Monographs ({filteredDrugs.length})
              </p>
              {loading ? (
                <p style={{ color: "var(--tx2)", padding: "10px 0" }}>Loading monographs...</p>
              ) : filteredDrugs.length > 0 ? (
                filteredDrugs.map((d) => (
                  <button
                    key={d.generic}
                    className={selectedDrug?.generic === d.generic ? "on" : ""}
                    onClick={() => setSelectedDrugName(d.generic)}
                  >
                    {d.generic}
                  </button>
                ))
              ) : (
                <p style={{ color: "var(--tx2)", padding: "10px 0" }}>
                  No match found. Try a different name or letter.
                </p>
              )}
            </aside>

            <div id="dm">
              {selectedDrug ? (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                    <div>
                      <span className="pill">{selectedDrug.drugClass}</span>
                      <h3 style={{ marginTop: "8px", fontSize: "24px" }}>{selectedDrug.generic}</h3>
                      <p style={{ color: "var(--tx2)", marginTop: "4px" }}>
                        Brands & Formulations: {selectedDrug.brands}
                      </p>
                    </div>
                    <button
                      className="btn o"
                      style={{ padding: "6px 14px", fontSize: "13px" }}
                      onClick={handleBookmarkDrug}
                    >
                      Bookmark Monograph
                    </button>
                  </div>

                  <table style={{ marginTop: "18px" }}>
                    <tbody>
                      <tr>
                        <th style={{ width: "32%" }}>Mechanism of Action</th>
                        <td>{selectedDrug.moa}</td>
                      </tr>
                      <tr>
                        <th>Clinical Indications</th>
                        <td>{selectedDrug.uses}</td>
                      </tr>
                      <tr>
                        <th>Adverse Drug Reactions</th>
                        <td>{selectedDrug.sideEffects}</td>
                      </tr>
                      <tr>
                        <th>Contraindications</th>
                        <td>{selectedDrug.contraindications}</td>
                      </tr>
                      <tr>
                        <th>Drug Interactions</th>
                        <td>{selectedDrug.interactions}</td>
                      </tr>
                      {selectedDrug.pearl && (
                        <tr>
                          <th>Clinical Pearl</th>
                          <td style={{ color: "var(--teal)", fontWeight: 500 }}>{selectedDrug.pearl}</td>
                        </tr>
                      )}
                      {selectedDrug.viva && (
                        <tr>
                          <th>Viva / Exam Focus</th>
                          <td>{selectedDrug.viva}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>

          <p style={{ marginTop: "20px", fontSize: "13.5px", color: "var(--tx2)" }}>
            Clinical reference for Pharm.D students, interns and hospital pharmacists. Verified against national formularies and clinical practice guidelines.
          </p>
        </div>
      </section>
    </>
  );
}
