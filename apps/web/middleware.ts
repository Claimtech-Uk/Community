import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Routes that don't require authentication
const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/error"];

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/course", "/onboarding", "/admin"];

// Routes that require ADMIN role (checked server-side, middleware just ensures auth)
const adminRoutes = ["/admin"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Check if current path matches any protected route prefix
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path matches any admin route prefix
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is not logged in and trying to access protected route
  if (!isLoggedIn && isProtectedRoute) {
    const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (isLoggedIn && (pathname === "/auth/signin" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // For admin routes, middleware just ensures user is authenticated
  // Role check happens server-side in the admin layout/pages
  if (isAdminRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
});

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
