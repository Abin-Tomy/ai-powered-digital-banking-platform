"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminDashboardLayout from "../components/AdminDashboardLayout";

interface Transaction {
  id: string;
  account_number: string;
  transaction_type: string;
  amount: string;
  status: string;
  created_at: string;
}

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: string;
  user_email: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      // Fetch all accounts which will have transaction data
      const accountsRes = await api.get("/accounts/admin/all/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(accountsRes.data);

      // Note: There's no /transactions/all/ endpoint, so we'll show accounts
      // In a real scenario, you'd fetch from a transactions endpoint
      setTransactions([]);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedAccount || !depositAmount) {
      setError("Please select an account and enter an amount");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access_token");
      await api.post("/transactions/deposit/", {
        account_id: selectedAccount,
        amount: parseFloat(depositAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Successfully deposited $${depositAmount} to account ${accounts.find(a => a.id === selectedAccount)?.account_number}`);
      setShowDepositModal(false);
      setSelectedAccount("");
      setDepositAmount("");
      fetchData(); // Refresh accounts
    } catch (err: unknown) {
      interface AxiosError {
        response?: { data?: { detail?: string; amount?: string[] } };
      }
      const axiosErr = err as AxiosError;
      setError(axiosErr.response?.data?.detail || axiosErr.response?.data?.amount?.[0] || "Failed to deposit funds");
    } finally {
      setProcessing(false);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Transaction Management</h1>
            <p className="text-purple-300">View accounts and manage deposits</p>
          </div>
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Deposit Funds
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-300">{error}</span>
              <button onClick={() => setError("")} className="ml-auto text-red-400">✕</button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-300">{success}</span>
              <button onClick={() => setSuccess("")} className="ml-auto text-emerald-400">✕</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by account number, email, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/70 backdrop-blur-xl border border-purple-500/30 rounded-xl pl-12 pr-4 py-4 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-full bg-slate-900/70 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/20 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Accounts Found</h3>
              <p className="text-purple-300">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-purple-400 text-sm mb-1">Account Number</div>
                    <div className="text-white font-mono font-bold text-lg">{account.account_number}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    account.account_type === "SAVINGS"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  }`}>
                    {account.account_type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-purple-400 text-sm mb-1">Balance</div>
                    <div className="text-emerald-400 font-bold text-2xl">
                      ${parseFloat(account.balance).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-purple-400 text-sm mb-1">Account Holder</div>
                    <div className="text-white text-sm">{account.user_email}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-6">Deposit Funds</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-purple-300 mb-2">Select Account</label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full bg-slate-800/70 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose an account...</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_number} - {account.user_email} (${parseFloat(account.balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 mb-2">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800/70 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeposit}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Deposit"}
                </button>
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setSelectedAccount("");
                    setDepositAmount("");
                    setError("");
                  }}
                  className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-400 text-sm font-medium">Total Accounts</div>
            <div className="text-white text-2xl font-bold mt-1">{accounts.length}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-emerald-400 text-sm font-medium">Total Balance</div>
            <div className="text-white text-2xl font-bold mt-1">
              ${accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="text-blue-400 text-sm font-medium">Average Balance</div>
            <div className="text-white text-2xl font-bold mt-1">
              ${accounts.length > 0 ? (accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0) / accounts.length).toLocaleString() : "0"}
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
