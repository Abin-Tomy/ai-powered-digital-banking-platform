import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (no auth required)
  const publicRoutes = ["/login", "/register", "/forget-password", "/reset-password"];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Read JWT cookie
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("role")?.value?.toUpperCase();

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Root path - redirect based on role
  if (pathname === "/") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    } else if (role === "SUPPORT") {
      return NextResponse.redirect(new URL("/support-dashboard", request.url));
    } else if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/customer-dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Role-based route protection
  // Admin routes
  if (pathname.startsWith("/admin-dashboard") || pathname.startsWith("/admin/") || pathname.startsWith("/users") || pathname.startsWith("/transactions") || pathname.startsWith("/customer360")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Support routes
  if (pathname.startsWith("/support-dashboard") || pathname.startsWith("/support/") || pathname.startsWith("/chat")) {
    if (role !== "SUPPORT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Customer routes
  if (pathname.startsWith("/customer-dashboard") || pathname.startsWith("/accounts") || pathname.startsWith("/statements") || pathname.startsWith("/transfer") || pathname.startsWith("/loans") || pathname.startsWith("/credit-cards") || pathname.startsWith("/bill-payments") || pathname.startsWith("/credit-score") || pathname.startsWith("/profile") || pathname.startsWith("/support-chat") || pathname.startsWith("/audit-log")) {
    if (role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware to protected routes
export const config = {
  matcher: [
    "/",
    "/admin-dashboard/:path*",
    "/admin/:path*",
    "/support-dashboard/:path*",
    "/support/:path*",
    "/customer-dashboard/:path*",
    "/accounts/:path*",
    "/statements/:path*",
    "/transfer/:path*",
    "/users/:path*",
    "/transactions/:path*",
    "/chat/:path*",
    "/loans/:path*",
    "/credit-cards/:path*",
    "/bill-payments/:path*",
    "/credit-score/:path*",
    "/profile/:path*",
    "/support-chat/:path*",
    "/audit-log/:path*",
    "/customer360/:path*",
  ],
};