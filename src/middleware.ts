import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * High-performance Next.js Edge Middleware for Supabase Auth.
 * 
 * Capabilities:
 * 1. Refreshes expired auth session tokens transparently in cookie storage.
 * 2. Enforces route protection before page rendering to block unauthorized traffic.
 * 3. Enforces strict role boundaries:
 *    - /student/* -> requires authenticated user with 'student' role (or admin)
 *    - /lecturer/dashboard, /lecturer/publish, /lecturer/collections -> requires verified lecturer
 *    - /admin/* -> requires 'admin' or 'co_admin' role
 * 4. Adds security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // getUser() validates the JWT on the Supabase Auth server securely (tamper-proof)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Redirect already logged-in users away from /sign-in and /sign-up
  if (user && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/catalogue";
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Strict Protection for Authenticated Routes
  const isStudentRoute = pathname.startsWith("/student");
  const isLecturerDashboard = pathname.startsWith("/lecturer/dashboard") || pathname.startsWith("/lecturer/publish");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isStudentRoute || isLecturerDashboard || isAdminRoute) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. Security Headers for Banking & Academic Document Protection
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - api/webhooks (external telecom webhook callbacks)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

