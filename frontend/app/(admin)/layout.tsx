"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check both cookie and localStorage for role
    const cookieRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1];

    const hasToken = localStorage.getItem("access_token");

    // Allow if admin role in cookie AND has token
    if (cookieRole === "ADMIN" && hasToken) {
      setIsAuthorized(true);
    } else {
      // Clear any stale data and redirect
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      document.cookie = "access_token=; path=/; max-age=0";
      document.cookie = "role=; path=/; max-age=0";
      router.push("/login");
    }
  }, [router]);

  // Don't render until authorization check is complete
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return <>{children}</>;
}
