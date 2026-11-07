"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { YR, SL } from "@/lib/rxfusionData";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

interface YearPageViewProps {
  yearIndex: number;
}

interface NoteRecord {
  id: string;
  title: string;
  description?: string;
  subject: string;
  semester: number;
  course: string;
  file_url: string;
}

interface SubjectRecord {
  id: string;
  name: string;
  code?: string;
  year_number: number;
  total_credits?: number;
}

interface QuestionBankRecord {
  id: string;
  question: string;
  subject: string;
  year: number;
}

interface FlashcardRecord {
  id: string;
  term: string;
  definition: string;
  subject: string;
  year: number;
}

const TAB_NAMES = [
  "Subject notes",
  "Question banks",
  "Flashcards",
  "Curriculum subjects",
] as const;

export default function YearPageView({ yearIndex }: YearPageViewProps) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBankRecord[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardRecord[]>([]);
  const [previewNote, setPreviewNote] = useState<NoteRecord | null>(null);

  const y = YR[yearIndex];
  const yearNumber = yearIndex + 1;
  const isInternship = yearIndex === 5;

  useEffect(() => {
    let isMounted = true;
    async function loadYearData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/academic/notes?year=${yearNumber}`);
        const data = await res.json();
        if (isMounted && data.success) {
          setNotes(data.notes || []);
          setSubjects(data.subjects || []);
          setQuestionBanks(data.questionBanks || []);
          setFlashcards(data.flashcards || []);
        }
      } catch (err) {
        console.error("Failed to fetch year data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadYearData();
    return () => {
      isMounted = false;
    };
  }, [yearNumber]);

  const handleDownload = async (note: NoteRecord) => {
    if (!user) {
      showToast("Please log in with your student account to download notes.");
      return;
    }

    try {
      showToast("Generating secure download link...");
      const res = await fetch("/api/notes/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: note.id,
          noteTitle: note.title,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          showToast(`Download limit reached (${data.downloadLimit}/${data.downloadLimit} free downloads used).`);
        } else {
          showToast(data.error || "Failed to authorize download.");
        }
        return;
      }

      if (data.fileUrl) {
        showToast(`Download authorized! (${data.downloadLimit - data.freeDownloadsUsed} downloads remaining).`);
        const link = document.createElement("a");
        link.href = data.fileUrl;
        link.target = "_blank";
        link.download = `${note.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      showToast("Network error initiating download.");
    }
  };

  const handleBookmark = async (note: NoteRecord) => {
    if (!user) {
      showToast("Please log in to save bookmarks.");
      return;
    }
    try {
      const res = await fetch("/api/student/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "notes",
          contentId: note.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Note added to your bookmarks!");
      } else if (res.status === 409) {
        showToast("Already in your saved bookmarks.");
      } else {
        showToast(data.error || "Failed to bookmark note.");
      }
    } catch {
      showToast("Error saving bookmark.");
    }
  };

  // Filtered views
  const filteredNotes = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        (n.description && n.description.toLowerCase().includes(q))
    );
  }, [notes, searchFilter]);

  const filteredQBs = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return questionBanks;
    return questionBanks.filter(
      (qb) =>
        qb.question.toLowerCase().includes(q) ||
        qb.subject.toLowerCase().includes(q)
    );
  }, [questionBanks, searchFilter]);

  const filteredCards = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return flashcards;
    return flashcards.filter(
      (fc) =>
        fc.term.toLowerCase().includes(q) ||
        fc.definition.toLowerCase().includes(q) ||
        fc.subject.toLowerCase().includes(q)
    );
  }, [flashcards, searchFilter]);

  const filteredSubjects = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return subjects;
    return subjects.filter((s) => s.name.toLowerCase().includes(q));
  }, [subjects, searchFilter]);

  return (
    <>
      <PageHeader
        title={`Pharm.D ${y} year`}
        description={
          isInternship
            ? "Internship, clinical clerkship, rotation logbooks and case review materials."
            : `Official academic syllabus, curated subject notes and verified question banks.`
        }
        breadcrumb={
          <>
            <Link href="/">Home</Link> / <Link href="/academic-hub">Academic Hub</Link>
          </>
        }
      />

      <section className="s" style={{ paddingTop: "12px" }}>
        <div className="wrap">
          {/* Quick Metrics Bar */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span className="pill">
              {loading ? "Loading..." : `${notes.length} Verified Notes`}
            </span>
            <span className="pill">
              {subjects.length} Core Subjects
            </span>
            <span className="pill">
              Exclusive to Pharm.D
            </span>
          </div>

          {/* Tabs */}
          <div className="tabs" role="tablist">
            {TAB_NAMES.map((tName, idx) => (
              <button
                key={tName}
                role="tab"
                className={activeTab === idx ? "on" : ""}
                onClick={() => {
                  setActiveTab(idx);
                  setSearchFilter("");
                }}
              >
                {tName}
              </button>
            ))}
          </div>

          {/* Search / Filter */}
          <div className="tp">
            <input
              type="search"
              placeholder={`Filter ${TAB_NAMES[activeTab].toLowerCase()}...`}
              aria-label="Filter"
              style={{ maxWidth: "380px", marginBottom: "16px" }}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />

            {/* Tab 0: Notes */}
            {activeTab === 0 && (
              <div className="fl">
                {loading ? (
                  <p style={{ color: "var(--tx2)", padding: "20px 0" }}>Loading academic notes from Supabase...</p>
                ) : filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <details key={note.id}>
                      <summary>
                        <span style={{ fontWeight: 600 }}>{note.title}</span>
                        <span style={{ marginLeft: "10px", fontSize: "12px", color: "var(--teal)" }}>
                          [{note.subject}]
                        </span>
                      </summary>
                      <div style={{ padding: "10px 0 6px" }}>
                        <p style={{ color: "var(--tx2)", fontSize: "14px", lineHeight: "1.6" }}>
                          {note.description || `Comprehensive lecture notes and clinical review points for ${note.subject}.`}
                        </p>
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                          <button
                            className="btn"
                            style={{ padding: "6px 14px", fontSize: "13px" }}
                            onClick={() => handleDownload(note)}
                          >
                            Download PDF
                          </button>
                          <button
                            className="btn o"
                            style={{ padding: "6px 14px", fontSize: "13px" }}
                            onClick={() => setPreviewNote(note)}
                          >
                            Preview PDF
                          </button>
                          <button
                            className="btn o"
                            style={{ padding: "6px 14px", fontSize: "13px" }}
                            onClick={() => handleBookmark(note)}
                          >
                            Bookmark
                          </button>
                        </div>
                      </div>
                    </details>
                  ))
                ) : (
                  <p style={{ color: "var(--tx2)", padding: "12px 0" }}>
                    No notes found matching &quot;{searchFilter}&quot; for {y} year.
                  </p>
                )}
              </div>
            )}

            {/* Tab 1: Question Banks */}
            {activeTab === 1 && (
              <div className="fl">
                {loading ? (
                  <p style={{ color: "var(--tx2)", padding: "20px 0" }}>Loading question banks...</p>
                ) : filteredQBs.length > 0 ? (
                  filteredQBs.map((qb) => (
                    <details key={qb.id}>
                      <summary>
                        <span>{qb.question}</span>
                        <span style={{ marginLeft: "10px", fontSize: "12px", color: "var(--blue)" }}>
                          ({qb.subject})
                        </span>
                      </summary>
                      <p style={{ color: "var(--tx2)", fontSize: "14px", marginTop: "8px" }}>
                        Frequent university exam question for Pharm.D {y} year.
                      </p>
                    </details>
                  ))
                ) : (
                  <p style={{ color: "var(--tx2)", padding: "12px 0" }}>
                    {questionBanks.length === 0
                      ? `No question bank entries recorded yet for ${y} year.`
                      : `No question bank items match "${searchFilter}".`}
                  </p>
                )}
              </div>
            )}

            {/* Tab 2: Flashcards */}
            {activeTab === 2 && (
              <div className="g3" style={{ marginTop: "12px" }}>
                {loading ? (
                  <p style={{ color: "var(--tx2)" }}>Loading flashcards...</p>
                ) : filteredCards.length > 0 ? (
                  filteredCards.map((card) => (
                    <div key={card.id} className="card">
                      <span className="pill">{card.subject}</span>
                      <h4 style={{ marginTop: "10px", color: "var(--navy)", fontSize: "18px" }}>
                        {card.term}
                      </h4>
                      <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--tx2)", lineHeight: "1.6" }}>
                        {card.definition}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--tx2)" }}>
                    {flashcards.length === 0
                      ? `No flashcards recorded yet for ${y} year.`
                      : `No flashcards match "${searchFilter}".`}
                  </p>
                )}
              </div>
            )}

            {/* Tab 3: Curriculum Subjects */}
            {activeTab === 3 && (
              <div className="fl">
                {subjects.length > 0 ? (
                  filteredSubjects.map((sub) => (
                    <details key={sub.id}>
                      <summary>
                        <span style={{ fontWeight: 600 }}>{sub.name}</span>
                        {sub.code && (
                          <span style={{ marginLeft: "8px", color: "var(--tx2)", fontSize: "13px" }}>
                            ({sub.code})
                          </span>
                        )}
                      </summary>
                      <div style={{ padding: "8px 0" }}>
                        <p style={{ fontSize: "14px", color: "var(--tx2)" }}>
                          Pharm.D Core Curriculum · Year {sub.year_number}
                          {sub.total_credits ? ` · ${sub.total_credits} credits` : ""}
                        </p>
                      </div>
                    </details>
                  ))
                ) : (
                  <p style={{ color: "var(--tx2)", padding: "12px 0" }}>
                    Loading curriculum subjects...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Note PDF Preview Modal */}
          {previewNote && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(10, 18, 30, 0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
              }}
            >
              <div
                className="card"
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  maxHeight: "90vh",
                  display: "flex",
                  flexDirection: "column",
                  padding: "24px",
                  backgroundColor: "var(--bg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className="pill">{previewNote.subject}</span>
                    <h3 style={{ marginTop: "6px" }}>{previewNote.title}</h3>
                  </div>
                  <button
                    className="btn o"
                    style={{ padding: "4px 12px" }}
                    onClick={() => setPreviewNote(null)}
                  >
                    Close
                  </button>
                </div>

                <div style={{ flex: 1, minHeight: "420px", marginTop: "16px", borderRadius: "8px", overflow: "hidden" }}>
                  <iframe
                    src={`/api/student/notes/view?noteId=${previewNote.id}`}
                    title={previewNote.title}
                    style={{ width: "100%", height: "460px", border: "1px solid var(--ln)" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                  <button
                    className="btn"
                    onClick={() => handleDownload(previewNote)}
                  >
                    Download PDF
                  </button>
                  <button
                    className="btn o"
                    onClick={() => setPreviewNote(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick links to other years */}
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {YR.map((z, j) =>
              j === yearIndex ? null : (
                <Link
                  key={z}
                  className="btn o"
                  style={{ padding: "6px 12px" }}
                  href={`/academic-hub/${SL[j]}`}
                >
                  {z} year
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}
