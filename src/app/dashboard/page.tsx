"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { YR, SL } from "@/lib/rxfusionData";

interface BookmarkItem {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
  resolvedDetails?: {
    title?: string;
    subject?: string;
    drug_name?: string;
    generic_name?: string;
    slug?: string;
    name?: string;
    department?: string;
    disease?: string;
  } | null;
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading, setStudentProfile, signOut } = useAuth();
  const { showToast } = useToast();

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    currentYear: "",
    collegeName: "",
    mobileNumber: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        fullName: profile.full_name || "",
        currentYear: profile.current_year || "1st Year",
        collegeName: profile.college_name || "",
        mobileNumber: profile.mobile_number || "",
      });
      loadBookmarks();
    }
  }, [profile]);

  async function loadBookmarks() {
    setLoadingBookmarks(true);
    try {
      const res = await fetch("/api/student/bookmarks");
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    } finally {
      setLoadingBookmarks(false);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName.trim() || !editForm.collegeName.trim() || !editForm.mobileNumber.trim()) {
      showToast("Please fill in all required profile fields.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editForm.fullName.trim(),
          course: "Pharm D",
          currentYear: editForm.currentYear.trim(),
          collegeName: editForm.collegeName.trim(),
          mobileNumber: editForm.mobileNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to update profile.");
        setSavingProfile(false);
        return;
      }

      showToast("Profile details updated successfully!");
      if (data.profile) {
        setStudentProfile(data.profile);
      }
      setIsEditing(false);
    } catch {
      showToast("Network error updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const removeBookmark = async (b: BookmarkItem) => {
    try {
      const res = await fetch(`/api/student/bookmarks?contentType=${b.content_type}&contentId=${b.content_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Bookmark removed.");
        setBookmarks((prev) => prev.filter((item) => item.id !== b.id));
      } else {
        showToast("Failed to remove bookmark.");
      }
    } catch {
      showToast("Network error.");
    }
  };

  if (authLoading) {
    return (
      <>
        <PageHeader title="Student Dashboard" description="Loading profile..." />
        <section className="s" style={{ paddingTop: "20px" }}>
          <div className="wrap">
            <p style={{ color: "var(--tx2)" }}>Loading your Pharm.D workspace...</p>
          </div>
        </section>
      </>
    );
  }

  if (!user || !profile) {
    return (
      <>
        <PageHeader
          title="Student Dashboard"
          description="Log in to access your saved notes, clinical cases, and download quota."
        />
        <section className="s" style={{ paddingTop: "20px" }}>
          <div className="wrap" style={{ maxWidth: "540px" }}>
            <div className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
              <div className="serif" style={{ fontSize: "36px", color: "var(--navy)", marginBottom: "8px" }}>
                RxFusion Workspace
              </div>
              <p style={{ color: "var(--tx2)", fontSize: "15px", lineHeight: "1.6", marginBottom: "20px" }}>
                Please sign in with your registered Pharm.D student account or register to access personalized notes, track download limits and manage clinical bookmarks.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Link href="/login" className="btn">
                  Log in
                </Link>
                <Link href="/register" className="btn o">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const freeUsed = profile.free_downloads_used || 0;
  const limit = profile.download_limit || 10;
  const remaining = Math.max(0, limit - freeUsed);
  const percentUsed = Math.min(100, Math.round((freeUsed / limit) * 100));

  // Determine year route index
  const curYearLower = (profile.current_year || "").toLowerCase();
  let matchedYearSlug = "third-year";
  if (curYearLower.includes("1") || curYearLower.includes("first")) matchedYearSlug = "first-year";
  else if (curYearLower.includes("2") || curYearLower.includes("second")) matchedYearSlug = "second-year";
  else if (curYearLower.includes("3") || curYearLower.includes("third")) matchedYearSlug = "third-year";
  else if (curYearLower.includes("4") || curYearLower.includes("fourth")) matchedYearSlug = "fourth-year";
  else if (curYearLower.includes("5") || curYearLower.includes("fifth")) matchedYearSlug = "fifth-year";
  else if (curYearLower.includes("6") || curYearLower.includes("sixth") || curYearLower.includes("intern")) matchedYearSlug = "sixth-year";

  return (
    <>
      <PageHeader
        title={`Welcome, ${profile.full_name || "Doctor"}`}
        description={`Pharm.D Student Workspace · ${profile.college_name || "Pharmacy Institute"}`}
        breadcrumb={<Link href="/">Home</Link>}
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap">
          {/* Top Metric Cards */}
          <div className="g3">
            <div className="card">
              <span className="pill">Academic Year</span>
              <h3 style={{ marginTop: "10px", color: "var(--navy)" }}>
                {profile.current_year || "Pharm.D"}
              </h3>
              <p style={{ color: "var(--teal)", fontSize: "13px", marginTop: "4px" }}>
                Curriculum: Pharm.D Exclusive
              </p>
            </div>

            <div className="card">
              <span className="pill">Download Quota</span>
              <h3 style={{ marginTop: "10px", color: remaining > 0 ? "var(--navy)" : "#d9534f" }}>
                {remaining} Remaining
              </h3>
              <div className="bar" style={{ marginTop: "8px" }}>
                <i style={{ width: `${percentUsed}%` }} />
              </div>
              <p style={{ color: "var(--tx2)", fontSize: "13px", marginTop: "4px" }}>
                {freeUsed} of {limit} free PDF downloads used
              </p>
            </div>

            <div className="card">
              <span className="pill">Bookmarks</span>
              <h3 style={{ marginTop: "10px", color: "var(--navy)" }}>
                {bookmarks.length} Saved
              </h3>
              <p style={{ color: "var(--tx2)", fontSize: "13px", marginTop: "4px" }}>
                Notes, cases & monographs
              </p>
            </div>
          </div>

          {/* Quick Year Link & Action Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 14px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link href={`/academic-hub/${matchedYearSlug}`} className="btn" style={{ padding: "8px 16px" }}>
                Open My Year Notes ({profile.current_year})
              </Link>
              <Link href="/clinical-cases" className="btn o" style={{ padding: "8px 16px" }}>
                Clinical Ward Cases
              </Link>
              <Link href="/drug-database" className="btn o" style={{ padding: "8px 16px" }}>
                Drug Monographs
              </Link>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn o"
                style={{ padding: "8px 16px" }}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
              <button
                className="btn o"
                style={{ padding: "8px 16px", color: "#d9534f", borderColor: "rgba(217, 83, 79, 0.3)" }}
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Profile Edit Form */}
          {isEditing && (
            <div className="card" style={{ marginBottom: "24px", padding: "20px" }}>
              <h3 style={{ marginBottom: "14px", color: "var(--navy)" }}>Edit Student Profile</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="g2">
                  <div>
                    <label htmlFor="edit-name">Full Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      disabled={savingProfile}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-year">Pharm.D Academic Year</label>
                    <select
                      id="edit-year"
                      value={editForm.currentYear}
                      onChange={(e) => setEditForm({ ...editForm, currentYear: e.target.value })}
                      disabled={savingProfile}
                    >
                      {YR.map((y) => (
                        <option key={y} value={`${y} year`}>
                          Pharm.D {y} year
                        </option>
                      ))}
                      <option value="Internship">Pharm.D Internship (6th Year)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-college">College / University</label>
                    <input
                      id="edit-college"
                      type="text"
                      value={editForm.collegeName}
                      onChange={(e) => setEditForm({ ...editForm, collegeName: e.target.value })}
                      disabled={savingProfile}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-mobile">Mobile Number</label>
                    <input
                      id="edit-mobile"
                      type="tel"
                      value={editForm.mobileNumber}
                      onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                      disabled={savingProfile}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn" disabled={savingProfile}>
                    {savingProfile ? "Saving changes..." : "Save Profile"}
                  </button>
                  <button type="button" className="btn o" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Saved Bookmarks & Workspace Columns */}
          <div className="g2" style={{ marginTop: "16px" }}>
            {/* Bookmarks Column */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3>Saved Bookmarks</h3>
                <span className="pill">{bookmarks.length} Total</span>
              </div>

              {loadingBookmarks ? (
                <p style={{ color: "var(--tx2)", padding: "12px 0" }}>Loading your bookmarks...</p>
              ) : bookmarks.length > 0 ? (
                <div className="fl">
                  {bookmarks.map((b) => {
                    const title =
                      b.resolvedDetails?.title ||
                      b.resolvedDetails?.drug_name ||
                      b.resolvedDetails?.name ||
                      `${b.content_type.toUpperCase()} Item`;

                    const sub =
                      b.resolvedDetails?.subject ||
                      b.resolvedDetails?.department ||
                      b.content_type;

                    let linkHref = "/academic-hub";
                    if (b.content_type === "cases") linkHref = "/clinical-cases";
                    else if (b.content_type === "drugs") linkHref = "/drug-database";
                    else if (b.content_type === "blogs") linkHref = "/blogs";

                    return (
                      <div
                        key={b.id}
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid var(--ln)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <span className="pill" style={{ fontSize: "11px" }}>{sub}</span>
                          <h4 style={{ marginTop: "4px", fontSize: "15px" }}>
                            <Link href={linkHref} style={{ color: "var(--navy)" }}>
                              {title}
                            </Link>
                          </h4>
                          <span style={{ fontSize: "11px", color: "var(--tx2)" }}>
                            Saved {new Date(b.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          className="btn o"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          onClick={() => removeBookmark(b)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "var(--tx2)", padding: "16px 0", lineHeight: "1.6" }}>
                  No saved bookmarks yet. Browse <Link href="/academic-hub" style={{ color: "var(--blue)" }}>Academic Notes</Link> or <Link href="/clinical-cases" style={{ color: "var(--blue)" }}>Clinical Cases</Link> and click &quot;Bookmark&quot; to keep them here for quick study.
                </p>
              )}
            </div>

            {/* Quick Subjects Navigation */}
            <div className="card">
              <h3 style={{ marginBottom: "12px" }}>Browse Academic Years</h3>
              <p style={{ color: "var(--tx2)", fontSize: "14px", marginBottom: "14px" }}>
                Select any Pharm.D year to access lecture notes, syllabus, question banks and exam papers.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {YR.map((y, idx) => (
                  <Link
                    key={y}
                    href={`/academic-hub/${SL[idx]}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg)",
                      border: "1px solid var(--ln)",
                      color: "var(--tx1)",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>Pharm.D {y} Year</span>
                    <span style={{ color: "var(--blue)", fontSize: "13px" }}>Open Hub →</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
