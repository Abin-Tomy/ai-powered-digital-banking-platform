"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SupportDashboardLayout from "../components/SupportDashboardLayout";

interface Stats {
  totalUsers: number;
  pendingFraudFlags: number;
  confirmedFraud: number;
  falsePositives: number;
}

interface FraudFlag {
  id: string;
  status: string;
  risk_score: number;
  created_at: string;
}

export default function SupportDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingFraudFlags: 0,
    confirmedFraud: 0,
    falsePositives: 0
  });
  const [recentFlags, setRecentFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // Fetch fraud flags (support can view these)
      const fraudRes = await api.get("/fraud/flags/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const flags = fraudRes.data;
      setRecentFlags(flags.slice(0, 5));

      setStats({
        totalUsers: 0, // Support doesn't have access to user list
        pendingFraudFlags: flags.filter((f: FraudFlag) => f.status === "PENDING").length,
        confirmedFraud: flags.filter((f: FraudFlag) => f.status === "CONFIRMED_FRAUD").length,
        falsePositives: flags.filter((f: FraudFlag) => f.status === "FALSE_POSITIVE").length
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SupportDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </SupportDashboardLayout>
    );
  }

  return (
    <SupportDashboardLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Support Dashboard</h1>
          <p className="text-purple-300">Monitor fraud alerts and assist customers</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-yellow-400 text-sm font-medium">Pending Alerts</div>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pendingFraudFlags}</div>
            <a href="/support/fraud" className="text-yellow-400 text-sm hover:underline mt-2 inline-block">Review now →</a>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-red-400 text-sm font-medium">Confirmed Fraud</div>
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.confirmedFraud}</div>
            <div className="text-red-400 text-sm mt-2">Cases confirmed</div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-emerald-400 text-sm font-medium">False Positives</div>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.falsePositives}</div>
            <div className="text-emerald-400 text-sm mt-2">Cleared cases</div>
          </div>
        </div>

        {/* Recent Fraud Alerts */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Fraud Alerts</h2>
            <a href="/support/fraud" className="text-purple-400 hover:text-purple-300 text-sm">View all →</a>
          </div>

          {recentFlags.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">All Clear!</h3>
              <p className="text-purple-300">No fraud alerts to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFlags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-purple-500/10">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      flag.status === "PENDING" 
                        ? "bg-yellow-500/20" 
                        : flag.status === "CONFIRMED_FRAUD" 
                        ? "bg-red-500/20" 
                        : "bg-emerald-500/20"
                    }`}>
                      <svg className={`w-5 h-5 ${
                        flag.status === "PENDING" 
                          ? "text-yellow-400" 
                          : flag.status === "CONFIRMED_FRAUD" 
                          ? "text-red-400" 
                          : "text-emerald-400"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium">Risk Score: {(flag.risk_score * 100).toFixed(1)}%</div>
                      <div className="text-purple-400 text-sm">{new Date(flag.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    flag.status === "PENDING"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : flag.status === "CONFIRMED_FRAUD"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {flag.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/support/fraud"
              className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold">Review Fraud Alerts</div>
                <div className="text-purple-400 text-sm">Check suspicious transactions</div>
              </div>
            </a>

            <a
              href="/chat"
              className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold">Support Chat</div>
                <div className="text-purple-400 text-sm">Assist customers</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </SupportDashboardLayout>
  );
}