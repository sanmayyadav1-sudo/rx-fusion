import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();

    const supabase = getServiceSupabaseClient();

    const { data: news, error } = await supabase
      .from("news")
      .select("id, title, content, source, published_date, created_at")
      .order("published_date", { ascending: false });

    if (error) {
      console.error("News query error:", error);
      return NextResponse.json({ error: "Failed to fetch news." }, { status: 500 });
    }

    let results = news || [];
    if (search) {
      results = results.filter(
        (n) =>
          n.title?.toLowerCase().includes(search) ||
          n.content?.toLowerCase().includes(search) ||
          n.source?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      news: results,
    });
  } catch (err: unknown) {
    console.error("News API error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

