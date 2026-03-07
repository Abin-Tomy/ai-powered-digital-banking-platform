"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import DashboardLayout from "../components/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MonthlySpending {
  month: string;
  total: number;
  count: number;
}

interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

interface Summary {
  total_spent_this_month: number;
  total_spent_last_month: number;
  change_percentage: number;
  highest_spending_category: string;
  average_transaction: number;
  total_transactions_this_month: number;
}

interface AnalyticsData {
  monthly_spending: MonthlySpending[];
  category_breakdown: CategoryBreakdown[];
  summary: Summary;
}

const CATEGORY_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#06b6d4",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await api.get("/transactions/analytics/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-800/60 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-72 bg-slate-800/60 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-72 bg-slate-800/60 rounded-2xl animate-pulse" />
            <div className="h-72 bg-slate-800/60 rounded-2xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data || (data.monthly_spending.length === 0 && data.category_breakdown.length === 0)) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">Spending Analytics</h1>
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/20 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Spending Data Yet</h3>
            <p className="text-purple-300">Make some transactions to see your analytics here.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, monthly_spending, category_breakdown } = data;
  const changeIsUp = summary.change_percentage > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white mb-2">Spending Analytics</h1>

        {/* SECTION A — Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <span className="text-purple-300 text-sm font-medium">Spent This Month</span>
            <div className="text-3xl font-bold text-white mt-2">{fmt(summary.total_spent_this_month)}</div>
            <div className={`flex items-center gap-1 mt-1 text-sm ${changeIsUp ? "text-red-400" : "text-emerald-400"}`}>
              {changeIsUp ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              )}
              {Math.abs(summary.change_percentage)}% vs last month
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/20">
            <span className="text-indigo-300 text-sm font-medium">Transactions</span>
            <div className="text-3xl font-bold text-white mt-2">{summary.total_transactions_this_month}</div>
            <div className="text-indigo-400 text-sm mt-1">This month</div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
            <span className="text-cyan-300 text-sm font-medium">Avg Transaction</span>
            <div className="text-3xl font-bold text-white mt-2">{fmt(summary.average_transaction)}</div>
            <div className="text-cyan-400 text-sm mt-1">{summary.highest_spending_category}</div>
          </div>
        </div>

        {/* SECTION B — Monthly Spending Bar Chart */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Monthly Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly_spending}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: "#a78bfa", fontSize: 12 }} />
              <YAxis tick={{ fill: "#a78bfa", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #6366f1", borderRadius: "12px" }}
                labelStyle={{ color: "#c4b5fd" }}
                itemStyle={{ color: "#e0e7ff" }}
                formatter={(value) => [fmt(Number(value)), "Spent"]}
              />
              <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SECTION C — Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={category_breakdown}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {category_breakdown.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #6366f1", borderRadius: "12px" }}
                  formatter={(value) => fmt(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
            <div className="space-y-4">
              {category_breakdown.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-purple-200 text-sm">{cat.category}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{fmt(cat.total)}</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-purple-400 text-xs">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
