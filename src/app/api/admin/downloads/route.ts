import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Enforce strict server-side admin authentication and authorization
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  const serviceSupabase = getServiceSupabaseClient();

  // Parse pagination params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 25;
  const offset = (page - 1) * limit;

  try {
    const { data: downloads, count, error: fetchError } = await serviceSupabase
      .from("note_downloads")
      .select(`
        id,
        note_identifier,
        note_title,
        downloaded_at,
        student_profiles (
          full_name,
          email,
          course,
          current_year
        )
      `, { count: "exact" })
      .order("downloaded_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error("Error fetching note downloads:", fetchError);
      return NextResponse.json({ error: "Failed to load downloads history" }, { status: 500 });
    }

    return NextResponse.json({
      downloads: downloads || [],
      total: count || 0,
      page,
      limit
    });

  } catch (err) {
    console.error("Internal error in admin downloads API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
