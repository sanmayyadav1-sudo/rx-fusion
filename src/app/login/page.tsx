"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setStudentProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Enter your password (at least 6 characters).";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          action: "login",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || "Login failed. Please check your credentials.");
        setIsSubmitting(false);
        return;
      }

      showToast("Signed in successfully!");
      if (data.profile) {
        setStudentProfile(data.profile);
      }

      if (data.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      showToast("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Student & Faculty Login"
        description="Access your Pharm.D notes, clinical cases, drug database and study dashboard."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap" style={{ maxWidth: "480px" }}>
          <form className="card" id="af" noValidate onSubmit={handleSubmit}>
            <label htmlFor="em">Email address</label>
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
              {errors.email}
            </div>

            <label htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="err" id="e-pw">
              {errors.password}
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ marginTop: "16px", width: "100%", opacity: isSubmitting ? 0.7 : 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Log in"}
            </button>

            <p style={{ marginTop: "14px", fontSize: "14px" }}>
              New here?{" "}
              <Link href="/register" style={{ color: "var(--blue)" }}>
                Create an account
              </Link>{" "}
              ·{" "}
              <Link href="/forgot-password" style={{ color: "var(--blue)" }}>
                Forgot password
              </Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
