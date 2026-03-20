"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
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

interface TopTransaction {
  id: string;
  amount: string;
  description: string;
  reference: string;
  created_at: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#f97316",
  Shopping: "#8b5cf6",
  Utilities: "#06b6d4",
  Travel: "#2563eb",
  "Large Transfers": "#dc2626",
};
const FALLBACK_COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f97316", "#ef4444", "#06b6d4"];

function getCategoryColor(category: string, index: number): string {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [topTransactions, setTopTransactions] = useState<TopTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, accountsRes] = await Promise.all([
          api.get("/transactions/analytics/"),
          api.get("/accounts/my/"),
        ]);
        setData(analyticsRes.data);

        // Fetch top transactions from the first account this month
        const accounts: { id: string }[] = accountsRes.data;
        if (accounts.length > 0) {
          const now = new Date();
          const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
          const today = now.toISOString().slice(0, 10);
          try {
            const txnRes = await api.get(
              `/transactions/${accounts[0].id}/?type=DEBIT&ordering=-amount&page_size=5&date_from=${firstOfMonth}&date_to=${today}`
            );
            setTopTransactions(txnRes.data.results ?? []);
          } catch {
            // optional section — silently ignore
          }
        }
      } catch {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse h-8 w-72 bg-slate-800/50 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-800/60 rounded-2xl animate-pulse" />)}
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

  // ─── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">Spending Analytics</h1>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-red-600/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-600/30 transition-all text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────
  const isEmpty =
    !data ||
    (data.monthly_spending.every((m) => m.total === 0) &&
      data.category_breakdown.length === 0 &&
      data.summary.total_spent_this_month === 0);

  if (isEmpty) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">Spending Analytics</h1>
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-16 border border-purple-500/20 text-center">
            <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Spending Data Yet</h3>
            <p className="text-purple-300 text-sm mb-6">Start making transactions to see your spending analytics here</p>
            <Link
              href="/transfer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Make a Transfer
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, monthly_spending, category_breakdown } = data!;
  const changeIsUp = summary.change_percentage > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Spending Analytics</h1>
          <p className="text-purple-300 text-sm">Last 6 months</p>
        </div>

        {/* SECTION A — Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <p className="text-purple-300 text-sm font-medium mb-2">Spent This Month</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(summary.total_spent_this_month)}</p>
            <div className={`flex items-center gap-1 mt-2 text-sm ${changeIsUp ? "text-red-400" : "text-emerald-400"}`}>
              {changeIsUp ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              )}
              {Math.abs(summary.change_percentage)}% vs last month
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/20">
            <p className="text-indigo-300 text-sm font-medium mb-2">Transactions</p>
            <p className="text-3xl font-bold text-white">{summary.total_transactions_this_month}</p>
            <p className="text-indigo-400 text-sm mt-2">
              Avg {formatCurrency(summary.average_transaction)}
            </p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
            <p className="text-cyan-300 text-sm font-medium mb-2">Top Category</p>
            <p className="text-xl font-bold text-white truncate">{summary.highest_spending_category}</p>
            <p className="text-cyan-400 text-sm mt-2">Highest spending area</p>
          </div>
        </div>

        {/* SECTION B — Monthly Spending Bar Chart */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-5">Monthly Spending</h2>
          {monthly_spending.every((m) => m.total === 0) ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-purple-400 text-sm">No spending data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly_spending} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#a78bfa", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#a78bfa", fontSize: 11 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #6366f1", borderRadius: "12px" }}
                  labelStyle={{ color: "#c4b5fd" }}
                  formatter={(value, _name, props) => [
                    `${formatCurrency(Number(value))} across ${props.payload?.count ?? 0} transactions`,
                    "Spent",
                  ]}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* SECTION C — Category Breakdown */}
        {category_breakdown.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut chart */}
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-5">Category Breakdown</h2>
              <div className="relative">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={category_breakdown}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={3}
                    >
                      {category_breakdown.map((entry, i) => (
                        <Cell key={entry.category} fill={getCategoryColor(entry.category, i)} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #6366f1", borderRadius: "12px" }}
                      labelStyle={{ color: "#c4b5fd" }}
                      formatter={(value, name, props) => [
                        `${formatCurrency(Number(value))} (${props.payload?.percentage ?? 0}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-purple-400 text-xs">Total</p>
                    <p className="text-white font-bold text-sm">
                      {formatCurrency(category_breakdown.reduce((s, c) => s + c.total, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category list */}
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-5">Categories</h2>
              <div className="space-y-4">
                {category_breakdown.map((cat, i) => {
                  const color = getCategoryColor(cat.category, i);
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-purple-200 text-sm">{cat.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold text-sm">{formatCurrency(cat.total)}</span>
                          <span className="text-purple-400 text-xs ml-2">{cat.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${cat.percentage}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION D — Top Transactions This Month */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-6 border-b border-purple-500/10">
            <h2 className="text-xl font-bold text-white">Highest Transactions This Month</h2>
          </div>
          {topTransactions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-purple-300 text-sm">No transactions this month</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-800/50 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                <div className="col-span-3">Date</div>
                <div className="col-span-5">Reference</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              <div className="divide-y divide-purple-500/10">
                {topTransactions.map((txn, i) => (
                  <div key={txn.id} className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors items-center">
                    <div className="col-span-3 text-white text-sm">{formatDateShort(txn.created_at)}</div>
                    <div className="col-span-5 text-purple-200 text-sm truncate">{txn.description || txn.reference}</div>
                    <div className="col-span-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block mr-1"
                        style={{ backgroundColor: FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
                      />
                      <span className="text-purple-300 text-xs">Debit</span>
                    </div>
                    <div className="col-span-2 text-right text-red-400 font-bold text-sm">
                      -{formatCurrency(parseFloat(txn.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
