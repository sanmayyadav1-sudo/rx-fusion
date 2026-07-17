"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  User, 
  School, 
  Phone, 
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const getYearOptions = (selectedCourse: string) => {
  switch (selectedCourse) {
    case "Pharm.D":
      return ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Internship / 6th Year"];
    case "B.Pharm":
      return ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    case "D.Pharm":
    case "M.Pharm":
      return ["1st Year", "2nd Year"];
    default:
      return ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year", "Other"];
  }
};

function validateRedirectTo(url: string | null): string {
  if (!url) return "/";
  const trimmed = url.trim();
  
  if (
    trimmed.startsWith("http://") || 
    trimmed.startsWith("https://") || 
    trimmed.startsWith("//") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:")
  ) {
    return "/";
  }
  
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("/login") ||
    lower.startsWith("/rx-admin-access") ||
    lower.startsWith("/admin")
  ) {
    return "/";
  }
  
  return trimmed;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setStudentProfile, profile: currentProfile } = useAuth();

  // Modes
  const [mode, setMode] = useState<"login" | "register" | "complete_profile">("login");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");

  // Student details registration fields
  const [fullName, setFullName] = useState("");
  const [course, setCourse] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const hasRedirectedRef = useRef(false);

  // Sync details if already logged in but details are missing (e.g. from context)
  useEffect(() => {
    if (currentProfile && !hasRedirectedRef.current) {
      if (currentProfile.role === "admin") {
        hasRedirectedRef.current = true;
        const rawRedirect = searchParams.get("redirectTo");
        const safeRedirect = validateRedirectTo(rawRedirect) === "/" ? "/admin/dashboard" : validateRedirectTo(rawRedirect);
        router.push(safeRedirect);
      } else if (currentProfile.role === "user") {
        if (!currentProfile.full_name) {
          setMode("complete_profile");
          setEmail(currentProfile.email);
        } else {
          hasRedirectedRef.current = true;
          const rawRedirect = searchParams.get("redirectTo");
          const safeRedirect = validateRedirectTo(rawRedirect) === "/" ? "/dashboard" : validateRedirectTo(rawRedirect);
          router.push(safeRedirect);
        }
      }
    }
  }, [currentProfile, searchParams, router]);

  // Adjust current year when course changes
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCourse(val);
    const options = getYearOptions(val);
    if (!options.includes(currentYear)) {
      setCurrentYear("");
    }
  };

  // Validate form details on client side
  const validateForm = () => {
    if (mode === "register" || mode === "complete_profile") {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return false;
      }
      if (!course) {
        setError("Please select your course.");
        return false;
      }
      if (course === "Other" && !customCourse.trim()) {
        setError("Please enter your course.");
        return false;
      }
      if (!currentYear) {
        setError("Please select your current year.");
        return false;
      }
      if (!collegeName.trim()) {
        setError("Please enter your college name.");
        return false;
      }
      
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = mobileNumber.trim().replace(/\D/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        setError("Please enter a valid 10-digit mobile number.");
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions
    setError(null);
    setMessage(null);


    // --- STUDENT PASSLESS DETAILS LOGIN ---
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fullName: fullName.trim(),
          course,
          customCourse: course === "Other" ? customCourse.trim() : null,
          currentYear,
          collegeName: collegeName.trim(),
          mobileNumber: mobileNumber.trim(),
          action: mode === "login" ? "login" : "register",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404 && mode === "login") {
          setError("No student account found with this email. Please register instead.");
          setMode("register");
        } else {
          setError(result.error || "Authentication failed. Please check details.");
        }
        setLoading(false);
        return;
      }

      
      setStudentProfile(result.profile);
      setMessage("Welcome to RxFusion!");
      
      setTimeout(() => {
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          const rawRedirect = searchParams.get("redirectTo");
          const safeRedirect = validateRedirectTo(rawRedirect) === "/" ? "/dashboard" : validateRedirectTo(rawRedirect);
          window.location.href = safeRedirect;
        }
      }, 300);

    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Dynamic Year selection mapping
  const yearOptions = getYearOptions(course);

  return (
    <div className="w-full max-w-md animate-fade-in relative z-10">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs relative overflow-hidden">
        {/* Glow visual accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand/Heading block */}
        <div className="text-center mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center space-x-2 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === "login" 
              ? "Welcome to RxFusion" 
              : mode === "complete_profile"
                ? "Complete Your Profile"
                : "Create Student Account"}
          </h1>
          <p className="text-xs text-slate-500 mt-2 px-2 leading-relaxed font-semibold">
            {mode === "login"
              ? "Join the RxFusion learning community and access pharmacy learning resources."
              : mode === "complete_profile"
                ? "Please fill in your details below to finish setting up your RxFusion portal access."
                : "Register as a student to access lecture notes, clinical cases, and study resources."}
          </p>
        </div>

        {/* Message notification banners */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-600 relative z-10" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-cyan-50 border border-cyan-200 flex items-start space-x-2.5 text-xs text-cyan-700 relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-cyan-500 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Form Entry */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 text-left">
          
          {/* 1. STUDENT REGISTRATION MODE FIELDS */}
          {(mode === "register" || mode === "complete_profile") && (
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* 2. EMAIL FIELD */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm ${
                  mode === "complete_profile"
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-slate-50 border-slate-200"
                }`}
                placeholder="Enter your email address"
                disabled={loading || (mode === "complete_profile")}
              />
            </div>
          </div>

          {/* 3. STUDENT EXTRA PROFILE DETAILS FIELDS */}
          {(mode === "register" || mode === "complete_profile") && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Course
                  </label>
                  <select
                    id="course"
                    required
                    value={course}
                    onChange={handleCourseChange}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm font-semibold cursor-pointer"
                    disabled={loading}
                  >
                    <option value="" disabled>Select your course</option>
                    <option value="Pharm.D">Pharm.D</option>
                    <option value="B.Pharm">B.Pharm</option>
                    <option value="D.Pharm">D.Pharm</option>
                    <option value="M.Pharm">M.Pharm</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="currentYear" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Current Year
                  </label>
                  <select
                    id="currentYear"
                    required
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm font-semibold cursor-pointer"
                    disabled={loading || !course}
                  >
                    <option value="" disabled>Select your year</option>
                    {yearOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {course === "Other" && (
                <div className="animate-fade-in">
                  <label htmlFor="customCourse" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Enter Your Course
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <input
                      id="customCourse"
                      type="text"
                      required
                      value={customCourse}
                      onChange={(e) => setCustomCourse(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm"
                      placeholder="Enter your course name"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="collegeName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  College Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <School className="w-4 h-4" />
                  </span>
                  <input
                    id="collegeName"
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm"
                    placeholder="Enter your college name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobileNumber" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="mobileNumber"
                    type="tel"
                    inputMode="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all text-sm"
                    placeholder="Enter your mobile number"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-cyan-500/10 active:translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <span>Continue to RxFusion</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* TOGGLE FOR STUDENT SIGN-IN/REGISTRATION MODES */}
          {mode !== "complete_profile" && (
            <div className="text-center pt-2">
              {mode === "login" ? (
                <p className="text-xs text-slate-500">
                  New to RxFusion?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("register"); setError(null); }}
                    className="text-cyan-650 font-bold hover:underline"
                  >
                    Create Student Account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(null); }}
                    className="text-cyan-650 font-bold hover:underline"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          )}
        </form>

        {/* Return to homepage */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4 relative z-10">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-cyan-600 transition-colors"
          >
            ← Return to RxFusion homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-55 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-xs text-slate-500 mt-2">Loading Authentication Portal...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
