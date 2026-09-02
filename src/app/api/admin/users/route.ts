import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Initialize server client with requesting user's cookies to authenticate them
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

  // 3. Authenticated as Admin! We can fetch users using Service Role client
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
  
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all"; // all, free_available, limit_reached, recently_joined
  const sort = searchParams.get("sort") || "recently_active"; // newest, oldest, recently_active, most_downloads
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 25;
  const offset = (page - 1) * limit;

  try {
    // Build query on the `student_profiles` table
    let query = serviceSupabase
      .from("student_profiles")
      .select("*", { count: "exact" });

    // Apply search filter (name, email, college, mobile, course)
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,mobile_number.ilike.%${search}%,college_name.ilike.%${search}%,course.ilike.%${search}%`);
    }

    const now = new Date();
    const activeThresholdTime = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    // Apply filters
    if (filter === "free_available") {
      query = query.lt("free_downloads_used", 2);
    } else if (filter === "limit_reached") {
      query = query.gte("free_downloads_used", 2);
    } else if (filter === "recently_joined") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(); // ~7 days
      query = query.gte("created_at", sevenDaysAgo);
    }

    // Apply sorting
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sort === "recently_active") {
      query = query.order("last_seen", { ascending: false, nullsFirst: false });
    } else if (sort === "most_downloads") {
      query = query.order("free_downloads_used", { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, count, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching users from database:", fetchError);
      return NextResponse.json({ error: "Failed to load users from database" }, { status: 500 });
    }

    // Fetch summary statistics
    // 1. Total registered users
    const { count: totalUsersCount } = await serviceSupabase
      .from("student_profiles")
      .select("id", { count: "exact", head: true });

    // 2. Active Now count (last_seen within 5 minutes)
    const { count: activeNowCount } = await serviceSupabase
      .from("student_profiles")
      .select("id", { count: "exact", head: true })
      .gte("last_seen", activeThresholdTime);

    // 3. Limit Reached count
    const { count: limitReachedCount } = await serviceSupabase
      .from("student_profiles")
      .select("id", { count: "exact", head: true })
      .gte("free_downloads_used", 2);

    // 4. New Users (joined in the last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsersCount } = await serviceSupabase
      .from("student_profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      limit,
      summary: {
        totalUsers: totalUsersCount || 0,
        activeNow: activeNowCount || 0,
        limitReached: limitReachedCount || 0,
        newUsers: newUsersCount || 0,
      }
    });

  } catch (err) {
    console.error("Internal error in admin users API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // 1. Initialize server client with requesting user's cookies to authenticate them
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

  // 3. Authenticated as Admin! We can delete using Service Role client
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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const { error: deleteError } = await serviceSupabase
      .from("student_profiles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting student profile:", deleteError);
      return NextResponse.json({ error: "Failed to delete student from database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error("Internal error in admin users DELETE API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
