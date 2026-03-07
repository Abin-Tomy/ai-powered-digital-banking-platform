"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";
import NotificationBell from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    document.cookie = "access_token=; Max-Age=0; path=/";
    document.cookie = "role=; Max-Age=0; path=/";
    router.push("/login");
  };

  const navItems = [
    { path: "/admin-dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { path: "/users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { path: "/admin/accounts", label: "Accounts", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { path: "/transactions", label: "Transactions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { path: "/admin/fraud", label: "Fraud Detection", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    { path: "/audit-log", label: "Audit Log", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white">SecureBank Admin</span>
                <div className="text-xs text-purple-400">Administrative Panel</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl transition-all border border-red-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400/50"
                    : "bg-slate-800/50 text-purple-300 hover:bg-slate-700/50 border border-purple-500/20 hover:border-purple-500/50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Page Content */}
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-6 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-purple-300 text-sm">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Admin Panel - Protected by 256-bit SSL Encryption | © 2026 SecureBank
          </div>
        </div>
      </footer>
    </div>
  );
}
