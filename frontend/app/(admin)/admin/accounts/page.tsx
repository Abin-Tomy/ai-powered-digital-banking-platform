"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminDashboardLayout from "../../components/AdminDashboardLayout";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
  created_at: string;
}

export default function AccountsManagementPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "FROZEN" | "CLOSED">("ACTIVE");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await api.get("/accounts/admin/all/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAccount) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access_token");
      await api.post(`/accounts/admin/${selectedAccount.id}/status/`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Account ${selectedAccount.account_number} status updated to ${newStatus}`);
      setSelectedAccount(null);
      fetchAccounts(); // Refresh list
    } catch (err: unknown) {
      interface AxiosError {
        response?: { data?: { detail?: string } };
      }
      const axiosErr = err as AxiosError;
      setError(axiosErr.response?.data?.detail || "Failed to update account status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.status.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Accounts Management</h1>
          <p className="text-purple-300">View all accounts and manage their status</p>
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
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <input
            type="text"
            placeholder="Search by account number, type, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-full bg-slate-900/70 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/20 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Accounts Found</h3>
              <p className="text-purple-300">No accounts match your search criteria</p>
            </div>
          ) : (
            filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all"
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
                <div className="text-purple-300 text-sm flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Created {new Date(account.created_at).toLocaleDateString()}
                </div>
                <button
                  onClick={() => {
                    setSelectedAccount(account);
                    setNewStatus(account.status as any);
                  }}
                  className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg border border-purple-500/30 text-sm font-medium transition-all"
                >
                  Update Status
                </button>
              </div>
            ))
          )}
        </div>

        {/* Update Status Modal */}
        {selectedAccount && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Update Account Status</h3>
              <p className="text-purple-300 mb-2">
                Account: <span className="font-mono text-white">{selectedAccount.account_number}</span>
              </p>
              <p className="text-purple-300 mb-6">
                Current Status: <span className="font-semibold text-white">{selectedAccount.status}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="FROZEN">Frozen</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating || newStatus === selectedAccount.status}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                  <button
                    onClick={() => setSelectedAccount(null)}
                    className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-400 text-sm font-medium">Total Accounts</div>
            <div className="text-white text-2xl font-bold mt-1">{accounts.length}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-emerald-400 text-sm font-medium">Active</div>
            <div className="text-white text-2xl font-bold mt-1">
              {accounts.filter(a => a.status === "ACTIVE").length}
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="text-blue-400 text-sm font-medium">Frozen</div>
            <div className="text-white text-2xl font-bold mt-1">
              {accounts.filter(a => a.status === "FROZEN").length}
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="text-red-400 text-sm font-medium">Closed</div>
            <div className="text-white text-2xl font-bold mt-1">
              {accounts.filter(a => a.status === "CLOSED").length}
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
