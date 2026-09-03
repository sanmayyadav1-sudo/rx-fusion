import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

// GET: Retrieve the authenticated student's recently viewed items
export async function GET(request: NextRequest) {
  const auth = await requireStudent(request);
  if (auth.errorResponse) return auth.errorResponse;
  const student = auth.student;

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const supabase = getServiceSupabaseClient();
    const { data: activity, error } = await supabase
      .from("student_recent_activity")
      .select("*")
      .eq("student_id", student.id)
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

// POST: Add or update the authenticated student's recent activity item
export async function POST(request: NextRequest) {
  try {
    const auth = await requireStudent(request);
    if (auth.errorResponse) return auth.errorResponse;
    const student = auth.student;

    const body = await request.json();
    const { contentType, contentId, contentTitle, contentUrl } = body;

    if (!contentType || !contentId || !contentTitle || !contentUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    // Upsert recent activity for the authenticated student
    const { data, error } = await supabase
      .from("student_recent_activity")
      .upsert({
        student_id: student.id,
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
      return NextResponse.json({ error: "Failed to log activity." }, { status: 500 });
    }

    return NextResponse.json({ success: true, activity: data });
  } catch (err: unknown) {
    console.error("Exception in POST student activity:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
