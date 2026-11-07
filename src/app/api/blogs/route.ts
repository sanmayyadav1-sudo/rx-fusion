import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const search = searchParams.get("search")?.toLowerCase().trim();

    const supabase = getServiceSupabaseClient();

    const query = supabase
      .from("blogs")
      .select("id, title, slug, content, author, published_date, created_at, featured_image")
      .order("published_date", { ascending: false });

    if (slug) {
      const { data: blog, error } = await query.eq("slug", slug).maybeSingle();
      if (error) {
        return NextResponse.json({ error: "Failed to fetch blog article." }, { status: 500 });
      }
      return NextResponse.json({ success: true, blog });
    }

    const { data: blogs, error } = await query;

    if (error) {
      console.error("Blogs query error:", error);
      return NextResponse.json({ error: "Failed to fetch blogs." }, { status: 500 });
    }

    let results = blogs || [];
    if (search) {
      results = results.filter(
        (b) =>
          b.title?.toLowerCase().includes(search) ||
          b.content?.toLowerCase().includes(search) ||
          b.author?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      blogs: results,
    });
  } catch (err: unknown) {
    console.error("Blogs API error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
