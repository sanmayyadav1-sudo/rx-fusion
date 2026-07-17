import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing. Bypassing middleware auth.");
    return NextResponse.next();
  }

  // Instantiate server client in middleware
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Helper to construct a redirect response and copy updated cookies
  const redirect = (toPath: string, searchParams?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = toPath;
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // 1. Validate server-side session via Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if authenticated user has an admin role profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      // Admins can browse the entire website including /admin dashboard
      if (
        pathname === "/login" ||
        pathname === "/rx-admin-access" ||
        pathname === "/admin" ||
        pathname === "/admin/"
      ) {
        return redirect("/admin/dashboard");
      }
      return supabaseResponse;
    }

    // Authenticated non-admin user (student/user). Block access to /admin routes
    if (pathname.startsWith("/admin")) {
      return redirect("/rx-admin-access");
    }
  }

  // 2. Check for student identity (either via Supabase Auth user email or student cookie)
  const rawEmail = user?.email?.trim().toLowerCase() || request.cookies.get("rxfusion_student_email")?.value;

  if (rawEmail) {
    const decodedEmail = decodeURIComponent(rawEmail).trim().toLowerCase();
    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("full_name")
      .eq("email", decodedEmail)
      .maybeSingle();

    const hasProfile = !!(studentProfile && studentProfile.full_name && studentProfile.full_name.trim());

    if (!hasProfile) {
      // Incomplete profile: force redirect to /login to complete details
      if (pathname !== "/login") {
        return redirect("/login", { redirectTo: pathname });
      }
    } else {
      // Complete profile: prevent accessing login page
      if (pathname === "/login") {
        return redirect("/dashboard");
      }
    }

    if (pathname.startsWith("/admin")) {
      return redirect("/rx-admin-access");
    }

    return supabaseResponse;
  }

  // 3. No active session or cookie (user is null / unauthenticated).
  if (pathname === "/dashboard") {
    return redirect("/login", { redirectTo: "/dashboard" });
  }

  if (pathname.startsWith("/admin")) {
    return redirect("/rx-admin-access", { redirectTo: pathname });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
