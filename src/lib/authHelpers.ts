import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "./supabaseServer";

export const STUDENT_SESSION_COOKIE_NAME = "rxfusion_session";

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "rxfusion-fallback-secret-key-do-not-use-in-prod"
  );
}

export interface StudentSessionPayload {
  studentId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface StudentProfileRecord {
  id: string;
  email: string;
  full_name: string;
  course: string;
  custom_course?: string | null;
  current_year: string;
  college_name: string;
  mobile_number: string;
  free_downloads_used: number;
  download_limit: number;
  created_at: string;
  updated_at: string;
  last_seen: string | null;
}

/**
 * Base64URL string helpers compatible with Edge & Node runtimes.
 */
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return atob(base64);
}

/**
 * Computes HMAC-SHA256 signature using standard Web Crypto API.
 */
async function computeHmacSignature(payloadBase64: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payloadBase64));
  const bytes = new Uint8Array(signatureBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

/**
 * Creates a signed session token for a student user.
 */
export async function createStudentSessionToken(studentId: string, email: string, expiresInDays = 30): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInDays * 24 * 60 * 60;
  const payload: StudentSessionPayload = { studentId, email: email.toLowerCase().trim(), iat, exp };
  
  const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
  const signature = await computeHmacSignature(payloadBase64, getSessionSecret());

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes a student session token.
 */
export async function verifyStudentSessionToken(token: string): Promise<StudentSessionPayload | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  try {
    const expectedSignature = await computeHmacSignature(payloadBase64, getSessionSecret());

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadJson = base64UrlDecode(payloadBase64);
    const payload: StudentSessionPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired token
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Helper to get service role Supabase client for server-side trusted DB queries.
 */
export function getServiceSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey || supabaseServiceKey === "placeholder-service-role-key") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Resolves authenticated student profile from NextRequest.
 * Checks cookie `rxfusion_session` or `Authorization: Bearer <token>` header.
 */
export async function getAuthenticatedStudent(request: NextRequest): Promise<StudentProfileRecord | null> {
  let token = request.cookies.get(STUDENT_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;

  const payload = await verifyStudentSessionToken(token);
  if (!payload || !payload.studentId) return null;

  try {
    const supabase = getServiceSupabaseClient();
    const { data: student, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", payload.studentId)
      .maybeSingle();

    if (error || !student) return null;
    return student as StudentProfileRecord;
  } catch (err) {
    console.error("Error fetching authenticated student profile:", err);
    return null;
  }
}

/**
 * Requires student authentication for API route handlers.
 * Returns either `{ student }` or `{ errorResponse }` if unauthenticated.
 */
export async function requireStudent(request: NextRequest): Promise<
  | { student: StudentProfileRecord; errorResponse?: undefined }
  | { student?: undefined; errorResponse: NextResponse }
> {
  const student = await getAuthenticatedStudent(request);
  if (!student) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Valid student session required." },
        { status: 401 }
      ),
    };
  }
  return { student };
}

/**
 * Requires admin authentication for API route handlers.
 * Verifies Supabase Auth user session and admin role in `profiles` table.
 */
export async function requireAdmin(request?: NextRequest): Promise<
  | { adminUser: User; errorResponse?: undefined }
  | { adminUser?: undefined; errorResponse: NextResponse }
> {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    if (request) {
      console.warn(`Unauthorized admin access attempt from path: ${request.nextUrl?.pathname || "unknown"}`);
    }
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Admin authentication required." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  return { adminUser: user };
}

/**
 * Sets secure HttpOnly session cookie on NextResponse.
 */
export function setStudentSessionCookie(response: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: STUDENT_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Clears secure HttpOnly session cookie on NextResponse.
 */
export function clearStudentSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: STUDENT_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}
