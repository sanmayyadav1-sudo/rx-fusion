import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const department = searchParams.get("department");

    const supabase = getServiceSupabaseClient();

    let query = supabase
      .from("clinical_cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (slug) {
      const { data: caseItem, error } = await query.eq("slug", slug).maybeSingle();
      if (error) {
        return NextResponse.json({ error: "Failed to fetch clinical case." }, { status: 500 });
      }
      return NextResponse.json({ success: true, case: caseItem });
    }

    if (department && department !== "All") {
      query = query.eq("department", department);
    }

    const { data: cases, error } = await query;

    if (error) {
      console.error("Clinical cases fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch clinical cases." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cases: cases || [],
    });
  } catch (err: unknown) {
    console.error("Clinical cases route error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

