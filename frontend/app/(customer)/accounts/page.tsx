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

export default function AccountsPage() {
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Accounts</h1>
          <p className="text-purple-300">View and manage your bank accounts</p>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={`bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border cursor-pointer transition-all hover:scale-[1.02] ${
                selectedAccount?.id === account.id
                  ? "border-purple-500 shadow-lg shadow-purple-500/20"
                  : "border-purple-500/20 hover:border-purple-500/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  account.status === "ACTIVE" 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : account.status === "FROZEN"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}>
                  {account.status}
                </span>
                <span className="text-purple-400 text-sm font-medium">{account.account_type}</span>
              </div>
              <div className="text-white font-mono text-lg mb-2 tracking-wide">
                {account.account_number}
              </div>
              <div className="text-purple-300 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Created {new Date(account.created_at).toLocaleDateString()}
              </div>
              {selectedAccount?.id === account.id && (
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 text-sm">Balance</span>
                    <span className="text-white font-bold text-lg">{formatCurrency(balance)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/20 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Accounts Yet</h3>
            <p className="text-purple-300">Contact support to create your first account.</p>
          </div>
        )}

        {/* Account Transactions (if account selected) */}
        {selectedAccount && transactions.length > 0 && (
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
            <div className="p-6 border-b border-purple-500/20">
              <h3 className="text-xl font-bold text-white">Transactions - {selectedAccount.account_number}</h3>
              <p className="text-purple-300 text-sm mt-1">All transactions for this account</p>
            </div>
            <div className="divide-y divide-purple-500/10">
              {transactions.map((txn) => (
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
                        <div className="text-purple-400 text-sm flex items-center gap-2">
                          <span>{formatDate(txn.created_at)}</span>
                          <span>•</span>
                          <span className="text-purple-500">Ref: {txn.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${txn.type === "CREDIT" ? "text-emerald-400" : "text-red-400"}`}>
                        {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(txn.amount)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        txn.status === "COMPLETED" 
                          ? "bg-emerald-500/10 text-emerald-400"
                          : txn.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {txn.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
