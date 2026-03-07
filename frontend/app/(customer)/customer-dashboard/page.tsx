"use client";

import { useEffect, useState } from "react";
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
  account: string;
  amount: string;
  type: "CREDIT" | "DEBIT";
  reference: string;
  description: string;
  status: string;
  created_at: string;
}

export default function CustomerDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount.id);
      fetchBalance(selectedAccount.id);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await api.get("/accounts/my/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data);
      if (response.data.length > 0) {
        setSelectedAccount(response.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get(`/transactions/${accountId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  const fetchBalance = async (accountId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get(`/transactions/${accountId}/balance/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(response.data.balance);
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const totalCredits = transactions
    .filter(t => t.type === "CREDIT")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalDebits = transactions
    .filter(t => t.type === "DEBIT")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-purple-300 text-sm font-medium">Total Balance</span>
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{formatCurrency(balance)}</div>
            <div className="text-purple-400 text-sm mt-1">
              {selectedAccount?.account_type} Account
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-emerald-300 text-sm font-medium">Total Income</span>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalCredits)}</div>
            <div className="text-emerald-400 text-sm mt-1">Credits received</div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-red-300 text-sm font-medium">Total Expenses</span>
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalDebits)}</div>
            <div className="text-red-400 text-sm mt-1">Debits made</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            <p className="text-purple-300 text-sm mt-1">Access banking services quickly</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/transfer" className="group">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-200 group-hover:scale-105">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-sm">Transfer</span>
                </div>
              </div>
            </a>
            
            <a href="/loans" className="group">
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-xl p-4 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-200 group-hover:scale-105">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-sm">Loans</span>
                </div>
              </div>
            </a>

            <a href="/credit-cards" className="group">
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-xl p-4 border border-amber-500/20 hover:border-amber-400/40 transition-all duration-200 group-hover:scale-105">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-sm">Credit Cards</span>
                </div>
              </div>
            </a>

            <a href="/bill-payments" className="group">
              <div className="bg-gradient-to-br from-red-500/20 to-pink-600/20 rounded-xl p-4 border border-red-500/20 hover:border-red-400/40 transition-all duration-200 group-hover:scale-105">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-sm">Bill Payments</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
            <p className="text-purple-300 text-sm mt-1">Your latest account activity</p>
          </div>
          <div className="divide-y divide-purple-500/10">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-purple-300">
                No transactions yet
              </div>
            ) : (
              transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        txn.type === "CREDIT" ? "bg-emerald-500/20" : "bg-red-500/20"
                      }`}>
                        <svg className={`w-5 h-5 ${txn.type === "CREDIT" ? "text-emerald-400" : "text-red-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={txn.type === "CREDIT" ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M17 13l-5 5m0 0l-5-5m5 5V6"} />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">{txn.description}</div>
                        <div className="text-purple-400 text-sm">{formatDate(txn.created_at)}</div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${txn.type === "CREDIT" ? "text-emerald-400" : "text-red-400"}`}>
                      {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(txn.amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
