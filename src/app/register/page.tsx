"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { YR } from "@/lib/rxfusionData";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setStudentProfile } = useAuth();
  const [formData, setFormData] = useState({
    nm: "",
    em: "",
    mo: "",
    yr: "",
    co: "",
    pw: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.nm.trim()) newErrors.nm = "Full name is required.";

    if (!formData.em.trim()) {
      newErrors.em = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.em.trim())) {
      newErrors.em = "Enter a valid email address.";
    }

    if (!formData.mo.trim()) {
      newErrors.mo = "Mobile number is required.";
    } else if (!/^\+?\d{10,13}$/.test(formData.mo.replace(/[\s-]/g, ""))) {
      newErrors.mo = "Enter a valid 10-digit mobile number.";
    }

    if (!formData.yr) newErrors.yr = "Please select your Pharm.D academic year.";

    if (!formData.co.trim()) newErrors.co = "College name is required.";

    if (!formData.pw) {
      newErrors.pw = "Password is required.";
    } else if (formData.pw.length < 8) {
      newErrors.pw = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.nm.trim(),
          email: formData.em.trim().toLowerCase(),
          mobileNumber: formData.mo.trim(),
          currentYear: formData.yr,
          collegeName: formData.co.trim(),
          password: formData.pw,
          action: "register",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || "Registration failed. Please check your details.");
        setIsSubmitting(false);
        return;
      }

      showToast("Account created successfully! Welcome to RxFusion.");
      if (data.profile) {
        setStudentProfile(data.profile);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      showToast("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create your account"
        description="Exclusive to Pharm.D students, interns and pharmacy educators."
      />

      <section className="s" style={{ paddingTop: "20px" }}>
        <div className="wrap" style={{ maxWidth: "480px" }}>
          <form className="card" id="af" noValidate onSubmit={handleSubmit}>
            <label htmlFor="nm">Full name</label>
            <input
              id="nm"
              type="text"
              autoComplete="name"
              placeholder="e.g. Dr. Jane Doe"
              value={formData.nm}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <div className="err" id="e-nm">
              {errors.nm}
            </div>

            <label htmlFor="em">Email</label>
            <input
              id="em"
              type="email"
              autoComplete="email"
              placeholder="e.g. student@college.edu"
              value={formData.em}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <div className="err" id="e-em">
              {errors.em}
            </div>

            <label htmlFor="mo">Mobile number</label>
            <input
              id="mo"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. 9876543210"
              value={formData.mo}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <div className="err" id="e-mo">
              {errors.mo}
            </div>

            <label htmlFor="yr">Pharm.D academic year</label>
            <select 
              id="yr" 
              value={formData.yr} 
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Select Pharm.D year</option>
              {YR.map((y) => (
                <option key={y} value={`${y} year`}>
                  Pharm.D {y} year
                </option>
              ))}
              <option value="Internship">Pharm.D Internship (6th Year)</option>
            </select>
            <div className="err" id="e-yr">
              {errors.yr}
            </div>

            <label htmlFor="co">College / University name</label>
            <input
              id="co"
              type="text"
              autoComplete="organization"
              placeholder="e.g. Government College of Pharmacy"
              value={formData.co}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <div className="err" id="e-co">
              {errors.co}
            </div>

            <label htmlFor="pw">Password (8+ characters)</label>
            <input
              id="pw"
              type="password"
              autoComplete="new-password"
              placeholder="Create a secure password"
              value={formData.pw}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <div className="err" id="e-pw">
              {errors.pw}
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ marginTop: "16px", width: "100%", opacity: isSubmitting ? 0.7 : 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </button>

            <p style={{ marginTop: "14px", fontSize: "14px" }}>
              Already registered?{" "}
              <Link href="/login" style={{ color: "var(--blue)" }}>
                Log in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
