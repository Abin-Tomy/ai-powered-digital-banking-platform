"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AdminDashboardLayout from "../components/AdminDashboardLayout";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AnalyticsData {
  kpis: {
    total_users: number;
    total_accounts: number;
    total_transactions: number;
    total_fraud_alerts: number;
    pending_loans: number;
    active_accounts: number;
    total_deposits: number;
  };
  daily_transactions: { date: string; count: number; volume: number }[];
  daily_registrations: { date: string; count: number }[];
  loan_status_breakdown: { status: string; count: number }[];
  fraud_trend: { date: string; count: number }[];
  top_accounts: { account_number: string; owner: string; balance: number; type: string }[];
}

const PIE_COLORS = ["#a78bfa", "#34d399", "#f87171", "#facc15", "#60a5fa", "#f472b6"];

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      if (!token) { setError("No access token found."); return; }
      const res = await api.get("/admin/analytics/", { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 401) setError("Authentication failed.");
      else setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </AdminDashboardLayout>
    );
  }

  const kpis = data?.kpis;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-red-300">{error}</span>
            <button onClick={fetchAnalytics} className="ml-auto text-red-400 hover:text-red-300 text-sm underline">Retry</button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-purple-300">Real-time banking analytics</p>
          </div>
          <button onClick={fetchAnalytics} className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2 rounded-xl border border-purple-500/30 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Users", value: kpis?.total_users, color: "blue", onClick: () => router.push("/users") },
            { label: "Accounts", value: kpis?.total_accounts, color: "purple", onClick: () => router.push("/admin/accounts") },
            { label: "Active Accts", value: kpis?.active_accounts, color: "emerald" },
            { label: "Transactions", value: kpis?.total_transactions, color: "cyan", onClick: () => router.push("/transactions") },
            { label: "Fraud Alerts", value: kpis?.total_fraud_alerts, color: "red", onClick: () => router.push("/admin/fraud") },
            { label: "Pending Loans", value: kpis?.pending_loans, color: "yellow" },
          ].map((card) => (
            <div key={card.label} onClick={card.onClick} className={`bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-${card.color}-500/20 ${card.onClick ? "cursor-pointer hover:border-" + card.color + "-500/50" : ""}`}>
              <span className={`text-${card.color}-300 text-xs font-medium`}>{card.label}</span>
              <div className="text-2xl font-bold text-white mt-1">{card.value ?? 0}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1: Transactions + Registrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Transaction Volume */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Daily Transaction Volume (30d)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data?.daily_transactions || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#a78bfa", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#a78bfa", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #7c3aed", borderRadius: 8, color: "#fff" }} />
                <Area type="monotone" dataKey="count" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} name="Txn Count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Registrations */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">User Registrations (30d)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.daily_registrations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#a78bfa", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#a78bfa", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #7c3aed", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2: Loan Breakdown + Fraud Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Status Pie */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Loan Application Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data?.loan_status_breakdown || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}>
                  {(data?.loan_status_breakdown || []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #7c3aed", borderRadius: 8, color: "#fff" }} />
                <Legend wrapperStyle={{ color: "#a78bfa", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Fraud Trend Line */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Fraud Alerts Trend (30d)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data?.fraud_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#a78bfa", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#a78bfa", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #7c3aed", borderRadius: 8, color: "#fff" }} />
                <Line type="monotone" dataKey="count" stroke="#f87171" strokeWidth={2} dot={{ fill: "#f87171" }} name="Fraud Alerts" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Accounts Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-bold text-white mb-4">Top Accounts by Balance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="py-3 px-4 text-purple-300 font-medium">#</th>
                  <th className="py-3 px-4 text-purple-300 font-medium">Owner</th>
                  <th className="py-3 px-4 text-purple-300 font-medium">Account (last 4)</th>
                  <th className="py-3 px-4 text-purple-300 font-medium">Type</th>
                  <th className="py-3 px-4 text-purple-300 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(data?.top_accounts || []).map((acc, i) => (
                  <tr key={i} className="border-b border-purple-500/10 hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-purple-400">{i + 1}</td>
                    <td className="py-3 px-4 text-white">{acc.owner}</td>
                    <td className="py-3 px-4 text-purple-300">••••{acc.account_number}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300">{acc.type}</span></td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold text-right">₹{acc.balance.toLocaleString()}</td>
                  </tr>
                ))}
                {(!data?.top_accounts || data.top_accounts.length === 0) && (
                  <tr><td colSpan={5} className="py-6 text-center text-purple-400">No accounts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Manage Users", sub: "View & manage", path: "/users", color: "blue" },
              { label: "Audit Log", sub: "View activity", path: "/audit-log", color: "yellow" },
              { label: "Fraud Review", sub: "Review alerts", path: "/admin/fraud", color: "red" },
              { label: "Manage Accounts", sub: "Update status", path: "/admin/accounts", color: "purple" },
            ].map((a) => (
              <button key={a.label} onClick={() => router.push(a.path)} className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all text-left">
                <div>
                  <div className="font-semibold text-white">{a.label}</div>
                  <div className="text-xs text-purple-400">{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
