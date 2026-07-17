import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey || supabaseServiceKey === "placeholder-service-role-key") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

// GET: Retrieve a student's recently viewed items
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId parameter." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    const { data: activity, error } = await supabase
      .from("student_recent_activity")
      .select("*")
      .eq("student_id", studentId)
      .order("viewed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching student activity:", error);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    return NextResponse.json({ activity });
  } catch (err: unknown) {
    console.error("Exception in GET student activity:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Add or update a student's recent activity item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, contentType, contentId, contentTitle, contentUrl } = body;

    if (!studentId || !contentType || !contentId || !contentTitle || !contentUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Upsert recent activity for the student
    const { data, error } = await supabase
      .from("student_recent_activity")
      .upsert({
        student_id: studentId,
        content_type: contentType,
        content_id: contentId,
        content_title: contentTitle,
        content_url: contentUrl,
        viewed_at: new Date().toISOString()
      }, {
        onConflict: "student_id,content_type,content_id"
      })
      .select()
      .single();

    if (error) {
      console.error("Error logging student activity:", error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, activity: data });
  } catch (err: unknown) {
    console.error("Exception in POST student activity:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
