import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Initialize server client
  const supabase = createServerSupabaseClient();
  
  // 2. Fetch the requesting user's profile and check role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  // 3. Authenticated as Admin! We can fetch downloads using Service Role client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey || supabaseServiceKey === "placeholder-service-role-key") {
    console.error("Missing or placeholder SUPABASE_SERVICE_ROLE_KEY environment variable.");
    return NextResponse.json({ error: "Internal Server Error: Missing Service Key" }, { status: 500 });
  }

  const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

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
