"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import DashboardLayout from "../components/DashboardLayout";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
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

interface StatementData {
  opening_balance: number;
  closing_balance: number;
  transactions: Transaction[];
}

export default function StatementsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statementData, setStatementData] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await api.get("/accounts/my/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data);
      if (response.data.length > 0) {
        setSelectedAccountId(response.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStatement = async () => {
    if (!selectedAccountId || !fromDate || !toDate) {
      setError("Please select account and date range");
      return;
    }

    setError("");
    setGenerating(true);
    setStatementData(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get(
        `/transactions/${selectedAccountId}/statement/?from=${fromDate}&to=${toDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatementData(response.data);
    } catch (err: unknown) {
      interface AxiosError {
        response?: { data?: { detail?: string } };
      }
      const axiosErr = err as AxiosError;
      setError(axiosErr.response?.data?.detail || "Failed to generate statement");
    } finally {
      setGenerating(false);
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
          <h1 className="text-3xl font-bold text-white mb-2">Account Statements</h1>
          <p className="text-purple-300">Generate and view your account statements</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-300">{error}</span>
              <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>
        )}

        {/* Statement Generator Form */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Generate Statement</h3>
            <p className="text-purple-300">Select account and date range to view transactions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-3">Account</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border-b-2 border-purple-500/50 text-white focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_number} - {acc.account_type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-3">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border-b-2 border-purple-500/50 text-white focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
              />
            </div>
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-3">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border-b-2 border-purple-500/50 text-white focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateStatement}
                disabled={generating || !fromDate || !toDate}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statement Results */}
        {statementData && (
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
            <div className="p-6 border-b border-purple-500/20">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h4 className="text-xl font-bold text-white">Statement Results</h4>
                  <p className="text-purple-300 text-sm">{fromDate} to {toDate}</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center md:text-right">
                    <div className="text-purple-300 text-sm">Opening Balance</div>
                    <div className="text-white font-bold text-lg">{formatCurrency(statementData.opening_balance)}</div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-purple-300 text-sm">Closing Balance</div>
                    <div className="text-white font-bold text-lg">{formatCurrency(statementData.closing_balance)}</div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-purple-300 text-sm">Net Change</div>
                    <div className={`font-bold text-lg ${
                      statementData.closing_balance - statementData.opening_balance >= 0 
                        ? "text-emerald-400" 
                        : "text-red-400"
                    }`}>
                      {formatCurrency(statementData.closing_balance - statementData.opening_balance)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-purple-500/10">
              {statementData.transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Transactions</h3>
                  <p className="text-purple-300">No transactions found for this period</p>
                </div>
              ) : (
                statementData.transactions.map((txn) => (
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
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
