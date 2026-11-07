"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (resetErr) {
        showToast(resetErr.message);
        setIsSubmitting(false);
        return;
      }

      setSent(true);
      showToast("Password reset instructions sent to your email.");
    } catch {
      showToast("Unable to send reset email at this moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Reset password"
        description="Enter your registered Pharm.D account email to receive a password reset link."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap" style={{ maxWidth: "480px" }}>
          <form className="card" id="af" noValidate onSubmit={handleSubmit}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <h3 style={{ color: "var(--navy)", marginBottom: "8px" }}>Check your inbox</h3>
                <p style={{ color: "var(--tx2)", fontSize: "14.5px", lineHeight: "1.6" }}>
                  We have sent password reset instructions to <b>{email}</b>. Follow the link in the email to set a new password.
                </p>
                <Link href="/login" className="btn" style={{ marginTop: "18px", display: "inline-block" }}>
                  Return to login
                </Link>
              </div>
            ) : (
              <>
                <label htmlFor="em">Registered email address</label>
                <input
                  id="em"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="err" id="e-em">
                  {error}
                </div>

                <button 
                  type="submit" 
                  className="btn" 
                  style={{ marginTop: "16px", width: "100%", opacity: isSubmitting ? 0.7 : 1 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending reset link..." : "Send reset link"}
                </button>

                <p style={{ marginTop: "14px", fontSize: "14px" }}>
                  <Link href="/login" style={{ color: "var(--blue)" }}>
                    Back to login
                  </Link>
                </p>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
