import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Read JWT cookie
  const token = request.cookies.get("access_token");

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route checks (based on path)
  if (pathname.startsWith("/admin-dashboard")) {
    const role = request.cookies.get("role")?.value;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/support-dashboard")) {
    const role = request.cookies.get("role")?.value;
    if (role !== "SUPPORT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/customer-dashboard")) {
    const role = request.cookies.get("role")?.value;
    if (role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware only to app routes
export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/support-dashboard/:path*",
    "/customer-dashboard/:path*",
  ],
};
