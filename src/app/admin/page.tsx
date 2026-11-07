"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { YR } from "@/lib/rxfusionData";

const ADMIN_TABS = [
  "Overview",
  "Students",
  "Notes",
  "Clinical cases",
  "Blogs & News",
  "Drug information",
] as const;

type AdminTab = typeof ADMIN_TABS[number];

interface AdminCounts {
  students: number;
  notes: number;
  cases: number;
  blogs: number;
  drugs: number;
  downloads: number;
}

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  current_year: string;
  college_name: string;
  mobile_number: string;
  free_downloads_used: number;
  download_limit: number;
}

interface NoteRow {
  id: string;
  title: string;
  subject: string;
  semester: number;
  file_url: string;
  created_at: string;
}

interface CaseRow {
  id: string;
  title: string;
  department: string;
  disease: string;
  status: string;
}

interface BlogRow {
  id: string;
  title: string;
  author: string;
  published_date: string;
}

interface DrugRow {
  id: string;
  drug_name: string;
  generic_name: string;
  drug_class: string;
}

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("Overview");

  const [counts, setCounts] = useState<AdminCounts>({
    students: 0,
    notes: 0,
    cases: 0,
    blogs: 0,
    drugs: 0,
    downloads: 0,
  });

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [drugs, setDrugs] = useState<DrugRow[]>([]);

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  // New Note Modal
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    subject: "",
    semester: "1",
    description: "",
    fileUrl: "",
  });
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    async function loadAdminOverview() {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCounts(data.counts);
            setStudents(data.students || []);
            setNotes(data.notes || []);
            setCases(data.cases || []);
            setBlogs(data.blogs || []);
            setDrugs(data.drugs || []);
          }
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
    }

    if (isAdmin) {
      loadAdminOverview();
    }
  }, [isAdmin]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.subject.trim() || !newNote.fileUrl.trim()) {
      showToast("Please enter title, subject and file URL.");
      return;
    }

    setSubmittingNote(true);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to create note.");
        setSubmittingNote(false);
        return;
      }

      showToast("Note published successfully to Pharm.D Hub!");
      setNotes([data.note, ...notes]);
      setCounts((prev) => ({ ...prev, notes: prev.notes + 1 }));
      setShowAddNote(false);
      setNewNote({ title: "", subject: "", semester: "1", description: "", fileUrl: "" });
    } catch {
      showToast("Network error creating note.");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/admin/notes?id=${noteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Note deleted successfully.");
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setCounts((prev) => ({ ...prev, notes: Math.max(0, prev.notes - 1) }));
      } else {
        showToast("Failed to delete note.");
      }
    } catch {
      showToast("Network error.");
    }
  };

  if (authLoading) {
    return (
      <>
        <PageHeader title="Admin Dashboard" description="Verifying credentials..." />
        <section className="s" style={{ paddingTop: "20px" }}>
          <div className="wrap">
            <p style={{ color: "var(--tx2)" }}>Loading...</p>
          </div>
        </section>
      </>
    );
  }

  // Access Control Guard
  if (!isAdmin) {
    return (
      <>
        <PageHeader
          title="Administrative Portal"
          description="Privileged area. Valid RxFusion Administrator credentials required."
        />
        <section className="s" style={{ paddingTop: "20px" }}>
          <div className="wrap" style={{ maxWidth: "520px" }}>
            <div className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
              <div style={{ color: "#d9534f", fontSize: "40px", marginBottom: "12px" }}>🔒</div>
              <h3 style={{ color: "var(--navy)", marginBottom: "8px" }}>Access Restricted</h3>
              <p style={{ color: "var(--tx2)", fontSize: "14.5px", lineHeight: "1.6", marginBottom: "20px" }}>
                You do not currently have Administrator privileges. If you are a faculty member or system administrator, please sign in with your administrative account.
              </p>
              <Link href="/login" className="btn">
                Sign in as Administrator
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.college_name?.toLowerCase().includes(q) ||
      s.current_year?.toLowerCase().includes(q)
    );
  });

  const filteredNotes = notes.filter((n) => {
    const q = noteSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      n.title?.toLowerCase().includes(q) ||
      n.subject?.toLowerCase().includes(q) ||
      n.semester?.toString().includes(q)
    );
  });

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="RxFusion Central Administration · Database Management, Student Access & Content Control"
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap adm">
          {/* Sidebar */}
          <aside id="am">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "on" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </aside>

          {/* Panel */}
          <div className="card" id="ap">
            {/* 1. OVERVIEW */}
            {activeTab === "Overview" && (
              <div>
                <h3 style={{ color: "var(--navy)" }}>Live Platform Overview</h3>
                <p style={{ color: "var(--tx2)", fontSize: "14px", marginTop: "4px" }}>
                  Real-time database statistics connected to Supabase backend.
                </p>

                <div className="g3" style={{ marginTop: "20px" }}>
                  <div className="card" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="serif" style={{ fontSize: "36px", color: "var(--navy)" }}>
                      {counts.students}
                    </div>
                    <div style={{ color: "var(--tx2)", fontSize: "14px" }}>Registered Students</div>
                  </div>
                  <div className="card" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="serif" style={{ fontSize: "36px", color: "var(--navy)" }}>
                      {counts.notes}
                    </div>
                    <div style={{ color: "var(--tx2)", fontSize: "14px" }}>Pharm.D Notes</div>
                  </div>
                  <div className="card" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="serif" style={{ fontSize: "36px", color: "var(--navy)" }}>
                      {counts.cases}
                    </div>
                    <div style={{ color: "var(--tx2)", fontSize: "14px" }}>Clinical Cases</div>
                  </div>
                  <div className="card" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="serif" style={{ fontSize: "36px", color: "var(--navy)" }}>
                      {counts.drugs}
                    </div>
                    <div style={{ color: "var(--tx2)", fontSize: "14px" }}>Drug Monographs</div>
                  </div>
                  <div className="card" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="serif" style={{ fontSize: "36px", color: "var(--navy)" }}>
                      {counts.blogs}
                    </div>
                    <div style={{ color: "var(--tx2)", fontSize: "14px" }}>Articles & News</div>
                  </div>
                  <div className="card" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="serif" style={{ fontSize: "36px", color: "var(--navy)" }}>
                      {counts.downloads}
                    </div>
                    <div style={{ color: "var(--tx2)", fontSize: "14px" }}>Total Downloads</div>
                  </div>
                </div>

                <div style={{ marginTop: "28px" }}>
                  <h4>Quick Content Actions</h4>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                    <button className="btn" onClick={() => { setActiveTab("Notes"); setShowAddNote(true); }}>
                      Upload New Note
                    </button>
                    <button className="btn o" onClick={() => setActiveTab("Students")}>
                      View Registered Students
                    </button>
                    <button className="btn o" onClick={() => setActiveTab("Clinical cases")}>
                      Manage Clinical Cases
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. STUDENTS */}
            {activeTab === "Students" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ color: "var(--navy)" }}>Registered Pharm.D Students ({students.length})</h3>
                    <p style={{ color: "var(--tx2)", fontSize: "13.5px" }}>
                      Strictly Pharm.D students and interns from accredited colleges.
                    </p>
                  </div>
                  <input
                    type="search"
                    placeholder="Search name, email, college..."
                    style={{ maxWidth: "260px" }}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <table style={{ marginTop: "16px" }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Pharm.D Year</th>
                      <th>College</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Downloads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <tr key={s.id}>
                          <td><b>{s.full_name}</b></td>
                          <td><span className="pill">{s.current_year}</span></td>
                          <td>{s.college_name}</td>
                          <td>{s.email}</td>
                          <td>{s.mobile_number}</td>
                          <td>{s.free_downloads_used} / {s.download_limit}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "var(--tx2)" }}>
                          No students match search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. NOTES */}
            {activeTab === "Notes" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ color: "var(--navy)" }}>Pharm.D Academic Notes ({notes.length})</h3>
                    <p style={{ color: "var(--tx2)", fontSize: "13.5px" }}>
                      Manage curriculum lecture notes, syllabus materials and question banks.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="search"
                      placeholder="Search title or subject..."
                      style={{ maxWidth: "220px" }}
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                    />
                    <button className="btn" onClick={() => setShowAddNote(!showAddNote)}>
                      {showAddNote ? "Cancel" : "+ Add Note"}
                    </button>
                  </div>
                </div>

                {/* Add Note Form */}
                {showAddNote && (
                  <form onSubmit={handleCreateNote} style={{ marginTop: "16px", padding: "16px", backgroundColor: "var(--bg)", borderRadius: "8px", border: "1px solid var(--ln)" }}>
                    <h4 style={{ marginBottom: "12px", color: "var(--navy)" }}>Publish New Note to Supabase</h4>
                    <div className="g2">
                      <div>
                        <label>Note Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Clinical Pharmacokinetics of Digoxin"
                          value={newNote.title}
                          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BIOPHARMACEUTICS & PHARMACOKINETICS"
                          value={newNote.subject}
                          onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Pharm.D Year / Semester</label>
                        <select
                          value={newNote.semester}
                          onChange={(e) => setNewNote({ ...newNote, semester: e.target.value })}
                        >
                          {YR.map((y, idx) => (
                            <option key={y} value={idx + 1}>
                              Year {idx + 1} ({y} Year)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>File URL (Storage or External PDF)</label>
                        <input
                          type="url"
                          required
                          placeholder="https://...supabase.co/storage/v1/object/public/notes/..."
                          value={newNote.fileUrl}
                          onChange={(e) => setNewNote({ ...newNote, fileUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label>Brief Description</label>
                      <input
                        type="text"
                        placeholder="Key syllabus topics covered in this lecture note"
                        value={newNote.description}
                        onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn" style={{ marginTop: "14px" }} disabled={submittingNote}>
                      {submittingNote ? "Uploading..." : "Save and Publish"}
                    </button>
                  </form>
                )}

                <table style={{ marginTop: "16px" }}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Year</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.length > 0 ? (
                      filteredNotes.map((n) => (
                        <tr key={n.id}>
                          <td><b>{n.title}</b></td>
                          <td>{n.subject}</td>
                          <td>Year {n.semester}</td>
                          <td>{new Date(n.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <a href={n.file_url} target="_blank" rel="noopener noreferrer" className="btn o" style={{ padding: "3px 8px", fontSize: "12px" }}>
                                View
                              </a>
                              <button
                                className="btn o"
                                style={{ padding: "3px 8px", fontSize: "12px", color: "#d9534f" }}
                                onClick={() => handleDeleteNote(n.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "var(--tx2)" }}>
                          No notes match your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. CLINICAL CASES */}
            {activeTab === "Clinical cases" && (
              <div>
                <h3 style={{ color: "var(--navy)" }}>Published Clinical Rounds Cases ({cases.length})</h3>
                <p style={{ color: "var(--tx2)", fontSize: "13.5px", marginTop: "4px" }}>
                  Real SOAP rounds cases mapped to hospital specialties.
                </p>

                <table style={{ marginTop: "16px" }}>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Case Title</th>
                      <th>Diagnosis</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr key={c.id}>
                        <td><span className="pill">{c.department}</span></td>
                        <td><b>{c.title}</b></td>
                        <td>{c.disease}</td>
                        <td><span style={{ color: "var(--teal)", fontWeight: 600 }}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. BLOGS & NEWS */}
            {activeTab === "Blogs & News" && (
              <div>
                <h3 style={{ color: "var(--navy)" }}>Published Blog Articles & Regulatory News</h3>
                <p style={{ color: "var(--tx2)", fontSize: "13.5px", marginTop: "4px" }}>
                  Articles, CDSCO announcements and educational news.
                </p>

                <table style={{ marginTop: "16px" }}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Published</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => (
                      <tr key={b.id}>
                        <td><b>{b.title}</b></td>
                        <td>{b.author}</td>
                        <td>{new Date(b.published_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. DRUG INFORMATION */}
            {activeTab === "Drug information" && (
              <div>
                <h3 style={{ color: "var(--navy)" }}>Clinical Drug Monographs ({drugs.length})</h3>
                <p style={{ color: "var(--tx2)", fontSize: "13.5px", marginTop: "4px" }}>
                  Pharmacology monographs stored in database.
                </p>

                <table style={{ marginTop: "16px" }}>
                  <thead>
                    <tr>
                      <th>Drug Name</th>
                      <th>Generic Name</th>
                      <th>Drug Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drugs.map((d) => (
                      <tr key={d.id}>
                        <td><b>{d.drug_name}</b></td>
                        <td>{d.generic_name}</td>
                        <td><span className="pill">{d.drug_class}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
