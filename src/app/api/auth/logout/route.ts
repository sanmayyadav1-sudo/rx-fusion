import { NextResponse } from "next/server";
import { clearStudentSessionCookie } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  clearStudentSessionCookie(response);
  return response;
}
