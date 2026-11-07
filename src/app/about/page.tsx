"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function AboutPage() {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please write your message first.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || profile?.full_name || "Pharm.D Colleague",
          email: email.trim() || profile?.email || "anonymous@pharmd.edu",
          message: trimmed,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Thank you! Your message has been sent to RxFusion Support.");
        setMessage("");
      } else {
        showToast(data.error || "Failed to deliver message.");
      }
    } catch {
      showToast("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="About RxFusion"
        description="The premier academic and clinical companion built exclusively for Doctor of Pharmacy (Pharm.D) students and hospital clinicians."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap g2">
          <div>
            <h3>Our Mission</h3>
            <p className="lead">
              To empower every Pharm.D student with verified academic lecture notes, realistic ward clinical cases, pharmacotherapy review guidelines and biostatistics research guidance in a unified, modern workspace.
            </p>

            <h3 style={{ marginTop: "24px" }}>Our Vision</h3>
            <p className="lead">
              To advance clinical pharmacy practice in India and worldwide by providing hospital-ready learning from 1st Year foundational sciences to 6th Year clinical internships.
            </p>

            <h3 style={{ marginTop: "24px" }}>Pharm.D Exclusivity</h3>
            <p className="lead">
              RxFusion was created specifically for the six-year Doctor of Pharmacy curriculum. We deliberately exclude unrelated programs to ensure every resource meets the standards expected of clinical pharmacists in patient-care wards.
            </p>
          </div>

          <div className="card">
            <h3>Contact RxFusion Clinical Support</h3>
            <p style={{ color: "var(--tx2)", marginBottom: "14px", fontSize: "14px" }}>
              Official inquiries: <b>support@rxfusion.org</b>
            </p>

            <form id="cf" noValidate onSubmit={handleSubmit}>
              <label htmlFor="cn">Your Name</label>
              <input
                id="cn"
                type="text"
                placeholder="Dr. Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />

              <label htmlFor="ce">Email Address</label>
              <input
                id="ce"
                type="email"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />

              <label htmlFor="cm">Message or Resource Request</label>
              <textarea
                id="cm"
                rows={4}
                placeholder="How can our clinical team help you?"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (error) setError("");
                }}
                disabled={submitting}
              />
              <div className="err">{error}</div>

              <button type="submit" className="btn" style={{ marginTop: "12px", width: "100%" }} disabled={submitting}>
                {submitting ? "Sending message..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
