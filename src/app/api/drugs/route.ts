import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/authHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const letter = searchParams.get("letter")?.toUpperCase().trim();
    const slug = searchParams.get("slug");

    const supabase = getServiceSupabaseClient();

    const query = supabase
      .from("drug_of_the_day")
      .select("*")
      .order("drug_name", { ascending: true });

    if (slug) {
      const { data: drug, error } = await query.eq("slug", slug).maybeSingle();
      if (error) {
        return NextResponse.json({ error: "Failed to fetch drug monograph." }, { status: 500 });
      }
      return NextResponse.json({ success: true, drug });
    }

    const { data: drugs, error } = await query;

    if (error) {
      console.error("Drugs query error:", error);
      return NextResponse.json({ error: "Failed to fetch drugs." }, { status: 500 });
    }

    let filtered = drugs || [];

    if (letter) {
      filtered = filtered.filter((d) => d.drug_name?.toUpperCase().startsWith(letter) || d.generic_name?.toUpperCase().startsWith(letter));
    }

    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.drug_name?.toLowerCase().includes(search) ||
          d.generic_name?.toLowerCase().includes(search) ||
          d.drug_class?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      drugs: filtered,
    });
  } catch (err: unknown) {
    console.error("Drugs API error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
