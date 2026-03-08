"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import DashboardLayout from "../components/DashboardLayout";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
  created_at: string;
}

interface Transaction {
  id: string;
  amount: string;
  type: "CREDIT" | "DEBIT";
  description: string;
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />;
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const [userResp, accountsResp] = await Promise.all([
        api.get("/auth/me/"),
        api.get("/accounts/my/"),
      ]);
      setUser(userResp.data);
      const accs: Account[] = accountsResp.data;
      setAccounts(accs);

      if (accs.length > 0) {
        const primaryId = accs[0].id;
        setBalanceLoading(true);
        setTxnLoading(true);
        const [balResp, txnResp] = await Promise.all([
          api.get(`/transactions/${primaryId}/balance/`),
          api.get(`/transactions/${primaryId}/`),
        ]);
        setBalance(balResp.data.balance);
        const txnData = txnResp.data;
        setTransactions(Array.isArray(txnData) ? txnData : txnData.results || []);
        setBalanceLoading(false);
        setTxnLoading(false);
      }
    } catch (err) {
      console.error("Dashboard load error", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setBalanceLoading(false);
      setTxnLoading(false);
    }
  };

  const primaryAccount = accounts[0] || null;
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const maskedNumber = primaryAccount
    ? "XXXX XXXX " + primaryAccount.account_number.slice(-4)
    : null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthDebits = transactions
    .filter((t) => t.type === "DEBIT" && new Date(t.created_at) >= startOfMonth)
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const thisMonthTxnCount = transactions.filter(
    (t) => new Date(t.created_at) >= startOfMonth
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Section A: Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            {loading ? (
              <>
                <SkeletonBlock className="h-8 w-64 mb-2" />
                <SkeletonBlock className="h-4 w-48" />
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {getGreeting()}, {firstName}! 👋
                </h1>
                <p className="text-purple-300 text-sm mt-1">{today}</p>
              </>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
              <span className="text-red-300 text-sm">{error}</span>
              <button onClick={loadDashboard} className="text-red-400 hover:text-red-300 text-xs underline">Retry</button>
            </div>
          )}
        </div>

        {/* Section B: Primary Account Card */}
        {loading ? (
          <SkeletonBlock className="h-48 w-full rounded-2xl" />
        ) : primaryAccount ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 p-6 shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                  <span className="text-white font-bold">SecureBank</span>
                </div>
                <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                  {primaryAccount.account_type}
                </span>
              </div>
              <div className="mb-6">
                <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Current Balance</p>
                {balanceLoading ? (
                  <SkeletonBlock className="h-10 w-48" />
                ) : (
                  <p className="text-4xl font-bold text-white">
                    {balance !== null ? formatCurrency(balance) : "—"}
                  </p>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">Account Number</p>
                  <p className="text-white font-mono tracking-widest">{maskedNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs mb-1">Account Holder</p>
                  <p className="text-white font-medium">{user?.full_name}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900/70 border border-purple-500/20 p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No account yet</h3>
            <p className="text-purple-300 text-sm mb-4">Open your first savings account to get started</p>
            <Link href="/accounts" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-all">
              Open Account
            </Link>
          </div>
        )}

        {/* Section C: Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-24 rounded-2xl" />
            ))
          ) : (
            <>
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
                <p className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-2">This Month Spent</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(thisMonthDebits)}</p>
              </div>
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
                <p className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-2">Transactions (Month)</p>
                <p className="text-2xl font-bold text-white">{thisMonthTxnCount}</p>
              </div>
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
                <p className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-2">Total Accounts</p>
                <p className="text-2xl font-bold text-white">{accounts.length}</p>
              </div>
            </>
          )}
        </div>

        {/* Section D: Quick Actions */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/transfer", label: "Transfer", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", colorClass: "from-blue-500/20 to-purple-600/20 border-blue-500/20 hover:border-blue-400/40", iconColor: "text-blue-400", bgColor: "bg-blue-500/20 group-hover:bg-blue-500/30" },
              { href: "/statements", label: "Statement", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", colorClass: "from-emerald-500/20 to-teal-600/20 border-emerald-500/20 hover:border-emerald-400/40", iconColor: "text-emerald-400", bgColor: "bg-emerald-500/20 group-hover:bg-emerald-500/30" },
              { href: "/loans", label: "Loans", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", colorClass: "from-amber-500/20 to-orange-600/20 border-amber-500/20 hover:border-amber-400/40", iconColor: "text-amber-400", bgColor: "bg-amber-500/20 group-hover:bg-amber-500/30" },
              { href: "/bill-payments", label: "Pay Bills", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", colorClass: "from-red-500/20 to-pink-600/20 border-red-500/20 hover:border-red-400/40", iconColor: "text-red-400", bgColor: "bg-red-500/20 group-hover:bg-red-500/30" },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="group">
                <div className={`bg-gradient-to-br ${action.colorClass} rounded-xl p-4 border transition-all duration-200 group-hover:scale-105`}>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center transition-colors`}>
                      <svg className={`w-6 h-6 ${action.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                      </svg>
                    </div>
                    <span className="text-white font-medium text-sm">{action.label}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section E: Recent Transactions */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
              <p className="text-purple-300 text-sm mt-0.5">Your latest account activity</p>
            </div>
            {transactions.length > 0 && (
              <Link href="/statements" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                View all →
              </Link>
            )}
          </div>

          {txnLoading ? (
            <div className="divide-y divide-purple-500/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <SkeletonBlock className="w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <SkeletonBlock className="h-4 w-40 mb-2" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                  <SkeletonBlock className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-purple-300 text-sm font-medium mb-1">No transactions yet</p>
              <p className="text-purple-400/60 text-xs mb-4">Make your first transfer to get started</p>
              <Link href="/transfer" className="inline-flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white font-medium px-4 py-2 rounded-xl border border-purple-500/30 transition-all text-sm">
                Make a Transfer
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-purple-500/10">
              {transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="p-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        txn.type === "CREDIT" ? "bg-emerald-500/20" : "bg-red-500/20"
                      }`}>
                        <svg className={`w-5 h-5 ${txn.type === "CREDIT" ? "text-emerald-400" : "text-red-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={txn.type === "CREDIT" ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M17 13l-5 5m0 0l-5-5m5 5V6"} />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{txn.description || "Transaction"}</p>
                        <p className="text-purple-400 text-xs">{formatDate(txn.created_at)}, {formatTime(txn.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`font-bold ${txn.type === "CREDIT" ? "text-emerald-400" : "text-red-400"}`}>
                        {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(txn.amount)}
                      </span>
                      <p className={`text-xs mt-0.5 ${txn.type === "CREDIT" ? "text-emerald-500/60" : "text-red-500/60"}`}>
                        {txn.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
