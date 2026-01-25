"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AdminDashboardLayout from "../components/AdminDashboardLayout";

interface Stats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  pendingFraudFlags: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    pendingFraudFlags: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setError("No access token found. Please login again.");
        return;
      }
      
      // Fetch all data to calculate stats
      const [usersRes, accountsRes, fraudRes] = await Promise.all([
        api.get("/admin/users/", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/accounts/admin/all/", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/fraud/flags/", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats({
        totalUsers: usersRes.data.length,
        totalAccounts: accountsRes.data.length,
        totalTransactions: 0, // Will be calculated from accounts if needed
        pendingFraudFlags: fraudRes.data.filter((f: { status: string }) => f.status === "PENDING").length
      });
    } catch (err: any) {
      console.error("Failed to fetch stats", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-300">{error}</span>
              <button 
                onClick={() => setError("")}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 ml-8">
              <button
                onClick={fetchStats}
                className="text-red-400 hover:text-red-300 text-sm underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-purple-300">Monitor and manage the entire banking system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-300 text-sm font-medium">Total Users</span>
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
            <button 
              onClick={() => router.push("/users")}
              className="text-blue-400 text-sm mt-2 hover:text-blue-300"
            >
              View all →
            </button>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-purple-300 text-sm font-medium">Total Accounts</span>
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalAccounts}</div>
            <button 
              onClick={() => router.push("/admin/accounts")}
              className="text-purple-400 text-sm mt-2 hover:text-purple-300"
            >
              Manage →
            </button>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-emerald-300 text-sm font-medium">Transactions</span>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">All</div>
            <button 
              onClick={() => router.push("/transactions")}
              className="text-emerald-400 text-sm mt-2 hover:text-emerald-300"
            >
              View all →
            </button>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-red-300 text-sm font-medium">Fraud Alerts</span>
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pendingFraudFlags}</div>
            <button 
              onClick={() => router.push("/admin/fraud")}
              className="text-red-400 text-sm mt-2 hover:text-red-300"
            >
              Review →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/users")}
              className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Create Account</div>
                <div className="text-xs text-purple-400">For existing user</div>
              </div>
            </button>

            <button
              onClick={() => router.push("/transactions")}
              className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Deposit Funds</div>
                <div className="text-xs text-purple-400">Add money to account</div>
              </div>
            </button>

            <button
              onClick={() => router.push("/admin/accounts")}
              className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Manage Accounts</div>
                <div className="text-xs text-purple-400">Update status</div>
              </div>
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-blue-300 font-semibold mb-1">Admin Panel Information</h4>
              <p className="text-blue-300/80 text-sm">
                You have full access to manage users, accounts, transactions, and fraud detection. All actions are logged and auditable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
