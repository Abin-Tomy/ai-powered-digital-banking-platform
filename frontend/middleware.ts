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
  if (pathname.startsWith("/admin-dashboard") || pathname.startsWith("/users") || pathname.startsWith("/transactions")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/support-dashboard") || pathname.startsWith("/chat")) {
    if (role !== "SUPPORT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/customer-dashboard") || pathname.startsWith("/accounts") || pathname.startsWith("/statements") || pathname.startsWith("/transfer")) {
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
    "/support-dashboard/:path*",
    "/customer-dashboard/:path*",
    "/accounts/:path*",
    "/statements/:path*",
    "/transfer/:path*",
    "/users/:path*",
    "/transactions/:path*",
    "/chat/:path*",
  ],
};