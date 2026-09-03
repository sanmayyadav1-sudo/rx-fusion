import { NextRequest, NextResponse } from "next/server";
import { 
  getServiceSupabaseClient, 
  getAuthenticatedStudent, 
  createStudentSessionToken, 
  setStudentSessionCookie 
} from "@/lib/authHelpers";
import { normalizeCourseName } from "@/lib/courseHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedEmail = searchParams.get("email")?.trim().toLowerCase();

  try {
    // First, try resolving authenticated student from session cookie
    const studentFromSession = await getAuthenticatedStudent(request);
    
    if (studentFromSession) {
      // If an explicit email parameter was requested and doesn't match session, return forbidden
      if (requestedEmail && studentFromSession.email.toLowerCase() !== requestedEmail) {
        return NextResponse.json({ error: "Session email mismatch." }, { status: 403 });
      }

      // Update last_seen timestamp
      const supabase = getServiceSupabaseClient();
      await supabase
        .from("student_profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", studentFromSession.id);

      const response = NextResponse.json({ found: true, profile: studentFromSession });
      // Refresh session cookie
      const newToken = await createStudentSessionToken(studentFromSession.id, studentFromSession.email);
      setStudentSessionCookie(response, newToken);
      return response;
    }

    // Fallback if no active session cookie but email was provided
    if (!requestedEmail) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const supabase = getServiceSupabaseClient();
    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("email", requestedEmail)
      .maybeSingle();

    if (error) {
      console.error("Error retrieving student profile:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ found: false });
    }

    // Update last_seen timestamp
    await supabase
      .from("student_profiles")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", profile.id);

    const response = NextResponse.json({ found: true, profile });
    const sessionToken = await createStudentSessionToken(profile.id, profile.email);
    setStudentSessionCookie(response, sessionToken);
    return response;
  } catch (err: unknown) {
    console.error("Exception in GET student profile:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, course, customCourse, currentYear, collegeName, mobileNumber, action } = body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    if (action === "login") {
      const { data: profile, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error("Database login query failed:", error);
        return NextResponse.json({ error: "Database query failed." }, { status: 500 });
      }

      if (!profile) {
        return NextResponse.json({ error: "No student account found with this email. Please register." }, { status: 404 });
      }

      // Update last_seen timestamp
      await supabase
        .from("student_profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", profile.id);

      const response = NextResponse.json({ success: true, profile });
      const sessionToken = await createStudentSessionToken(profile.id, profile.email);
      setStudentSessionCookie(response, sessionToken);
      return response;
    } else {
      // Register (insert or update returning student)
      if (!fullName?.trim() || !course?.trim() || !currentYear?.trim() || !collegeName?.trim() || !mobileNumber?.trim()) {
        return NextResponse.json({ error: "All profile details are required for registration." }, { status: 400 });
      }

      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingProfile) {
        // Retrieve and log in returning student, update last seen
        await supabase
          .from("student_profiles")
          .update({ last_seen: new Date().toISOString() })
          .eq("id", existingProfile.id);
        
        const response = NextResponse.json({ success: true, profile: existingProfile });
        const sessionToken = await createStudentSessionToken(existingProfile.id, existingProfile.email);
        setStudentSessionCookie(response, sessionToken);
        return response;
      }

      const normalizedCourse = normalizeCourseName(course);

      // Create new profile
      const { data: profile, error } = await supabase
        .from("student_profiles")
        .insert({
          full_name: fullName.trim(),
          course: normalizedCourse,
          custom_course: course === "Other" ? customCourse?.trim() || null : null,
          current_year: currentYear.trim(),
          college_name: collegeName.trim(),
          mobile_number: mobileNumber.trim(),
          email: normalizedEmail,
        })
        .select()
        .single();

      if (error) {
        console.error("STUDENT PROFILE SAVE ERROR", {
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          error
        });
        return NextResponse.json({ 
          error: `Failed to save profile: [${error.code}] ${error.message}` 
        }, { status: 500 });
      }

      const response = NextResponse.json({ success: true, profile });
      const sessionToken = await createStudentSessionToken(profile.id, profile.email);
      setStudentSessionCookie(response, sessionToken);
      return response;
    }
  } catch (err: unknown) {
    console.error("Exception in POST student profile:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
