import { NextRequest, NextResponse } from "next/server";
import { 
  getServiceSupabaseClient, 
  getAuthenticatedStudent, 
  createStudentSessionToken, 
  setStudentSessionCookie 
} from "@/lib/authHelpers";
import { normalizeCourseName } from "@/lib/courseHelpers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const VALID_PHARMD_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "6th Year",
  "Internship",
  "Pharm.D 1st Year",
  "Pharm.D 2nd Year",
  "Pharm.D 3rd Year",
  "Pharm.D 4th Year",
  "Pharm.D 5th Year",
  "Pharm.D 6th Year",
  "Pharm.D Intern"
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedEmail = searchParams.get("email")?.trim().toLowerCase();

  try {
    // First, try resolving authenticated student from session cookie
    const studentFromSession = await getAuthenticatedStudent(request);
    
    if (studentFromSession) {
      if (requestedEmail && studentFromSession.email.toLowerCase() !== requestedEmail) {
        return NextResponse.json({ error: "Session email mismatch." }, { status: 403 });
      }

      const supabase = getServiceSupabaseClient();
      await supabase
        .from("student_profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", studentFromSession.id);

      const response = NextResponse.json({ found: true, profile: studentFromSession });
      const newToken = await createStudentSessionToken(studentFromSession.id, studentFromSession.email);
      setStudentSessionCookie(response, newToken);
      return response;
    }

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
    const { email, password, fullName, currentYear, collegeName, mobileNumber, action } = body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (action === "login") {
      // 1. Check if user is an admin in profiles table
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      const isAdmin = adminProfile?.role === "admin";

      // 2. If password provided, attempt Supabase Auth validation
      if (password && password.length >= 6) {
        try {
          const anonClient = createClient(supabaseUrl, supabaseAnonKey);
          const { error: signInError } = await anonClient.auth.signInWithPassword({
            email: normalizedEmail,
            password: password,
          });

          // If signIn failed and user is not an existing student profile, return error
          if (signInError) {
            // Check if student profile exists without auth credentials
            const { data: existingStudent } = await supabase
              .from("student_profiles")
              .select("*")
              .eq("email", normalizedEmail)
              .maybeSingle();

            if (!existingStudent && !adminProfile) {
              return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
            }
          }
        } catch {
          // Fall through to profile check
        }
      }

      // 3. Retrieve student profile
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
        if (isAdmin) {
          return NextResponse.json({
            success: true,
            isAdmin: true,
            profile: {
              id: adminProfile.id,
              email: adminProfile.email,
              role: "admin",
              full_name: "RxFusion Administrator",
              course: "Pharm D",
              current_year: "Faculty / Admin",
              college_name: "RxFusion HQ",
              free_downloads_used: 0,
              download_limit: 9999,
            }
          });
        }
        return NextResponse.json({ error: "No student account found with this email. Please register." }, { status: 404 });
      }

      await supabase
        .from("student_profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", profile.id);

      const response = NextResponse.json({ success: true, profile, isAdmin });
      const sessionToken = await createStudentSessionToken(profile.id, profile.email);
      setStudentSessionCookie(response, sessionToken);
      return response;
    } else {
      // REGISTRATION FLOW
      if (!fullName?.trim()) {
        return NextResponse.json({ error: "Full name is required." }, { status: 400 });
      }
      if (!currentYear?.trim()) {
        return NextResponse.json({ error: "Pharm.D academic year is required." }, { status: 400 });
      }
      if (!collegeName?.trim()) {
        return NextResponse.json({ error: "College name is required." }, { status: 400 });
      }
      if (!mobileNumber?.trim() || !/^\+?\d{10,13}$/.test(mobileNumber.replace(/[\s-]/g, ""))) {
        return NextResponse.json({ error: "A valid 10-digit mobile number is required." }, { status: 400 });
      }
      if (password && password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }

      // Validate Pharm.D year exclusivity
      const isValidYear = VALID_PHARMD_YEARS.some(
        (y) => y.toLowerCase() === currentYear.trim().toLowerCase()
      );
      if (!isValidYear) {
        return NextResponse.json({ 
          error: "RxFusion is exclusively for Pharm.D students (1st to 6th Year / Internship)." 
        }, { status: 400 });
      }

      // Create Supabase Auth user if password provided
      if (password) {
        try {
          const { error: authCreateErr } = await supabase.auth.admin.createUser({
            email: normalizedEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName.trim(),
              current_year: currentYear.trim(),
              college_name: collegeName.trim(),
              role: "student",
            },
          });
          if (authCreateErr && authCreateErr.message.toLowerCase().includes("already registered")) {
            // If already registered in auth, update password
            const { data: usersData } = await supabase.auth.admin.listUsers();
            const existingAuth = usersData?.users.find((u) => u.email === normalizedEmail);
            if (existingAuth) {
              await supabase.auth.admin.updateUserById(existingAuth.id, { password });
            }
          }
        } catch (authErr) {
          console.warn("Supabase auth user creation non-fatal error:", authErr);
        }
      }

      // Check if student profile exists
      const { data: existingProfile } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingProfile) {
        // Update returning student's info
        const { data: updated, error: updateErr } = await supabase
          .from("student_profiles")
          .update({
            full_name: fullName.trim(),
            current_year: currentYear.trim(),
            college_name: collegeName.trim(),
            mobile_number: mobileNumber.trim(),
            course: "Pharm D",
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id)
          .select()
          .single();

        if (updateErr) {
          console.error("Error updating returning student profile:", updateErr);
          return NextResponse.json({ error: "Failed to update existing student profile." }, { status: 500 });
        }

        const response = NextResponse.json({ success: true, profile: updated });
        const sessionToken = await createStudentSessionToken(updated.id, updated.email);
        setStudentSessionCookie(response, sessionToken);
        return response;
      }

      // Create brand new student profile
      const normalizedCourse = normalizeCourseName("Pharm D");

      const { data: newProfile, error: insertError } = await supabase
        .from("student_profiles")
        .insert({
          full_name: fullName.trim(),
          course: normalizedCourse,
          current_year: currentYear.trim(),
          college_name: collegeName.trim(),
          mobile_number: mobileNumber.trim(),
          email: normalizedEmail,
          free_downloads_used: 0,
          download_limit: 10,
        })
        .select()
        .single();

      if (insertError) {
        console.error("STUDENT PROFILE SAVE ERROR", insertError);
        return NextResponse.json({ 
          error: `Failed to create profile: ${insertError.message}` 
        }, { status: 500 });
      }

      const response = NextResponse.json({ success: true, profile: newProfile });
      const sessionToken = await createStudentSessionToken(newProfile.id, newProfile.email);
      setStudentSessionCookie(response, sessionToken);
      return response;
    }
  } catch (err: unknown) {
    console.error("Exception in POST student profile:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
