"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminDashboardLayout from "../../components/AdminDashboardLayout";
import { formatDate } from "@/lib/utils";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
  created_at: string;
}

type ModalMode = "status" | "deposit" | null;

export default function AccountsManagementPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "FROZEN" | "CLOSED">("ACTIVE");
  const [depositAmount, setDepositAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/accounts/admin/all/");
      setAccounts(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleUpdateStatus = async () => {
    if (!selectedAccount) return;
    setProcessing(true);
    setError("");
    try {
      await api.post(`/accounts/admin/${selectedAccount.id}/status/`, { status: newStatus });
      setSuccess(`Account ${selectedAccount.account_number} updated to ${newStatus}`);
      setModalMode(null);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Failed to update account status");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedAccount || !depositAmount) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) { setError("Enter a valid amount"); return; }
    setProcessing(true);
    setError("");
    try {
      await api.post("/transactions/deposit/", { account_id: selectedAccount.id, amount });
      setSuccess(`Deposited ₹${amount.toLocaleString()} to ${selectedAccount.account_number}`);
      setModalMode(null);
      setSelectedAccount(null);
      setDepositAmount("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Deposit failed");
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (account: Account, mode: ModalMode) => {
    setSelectedAccount(account);
    setNewStatus(account.status as "ACTIVE" | "FROZEN" | "CLOSED");
    setDepositAmount("");
    setError("");
    setModalMode(mode);
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchSearch =
      a.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.account_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (s: string) =>
    s === "ACTIVE"
      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
      : s === "FROZEN"
      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      : "bg-red-500/20 text-red-400 border border-red-500/30";

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Accounts Management</h1>
            <p className="text-purple-300">View all accounts and manage their status</p>
          </div>
          <button
            onClick={fetchAccounts}
            className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2 rounded-xl border border-purple-500/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-red-300">{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400">✕</button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-emerald-300">{success}</span>
            <button onClick={() => setSuccess("")} className="ml-auto text-emerald-400">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: accounts.length, color: "purple" },
            { label: "Active", value: accounts.filter((a) => a.status === "ACTIVE").length, color: "emerald" },
            { label: "Frozen", value: accounts.filter((a) => a.status === "FROZEN").length, color: "blue" },
          ].map((s) => (
            <div key={s.label} className={`bg-${s.color}-500/10 border border-${s.color}-500/30 rounded-xl p-4`}>
              <div className={`text-${s.color}-400 text-xs font-medium`}>{s.label} Accounts</div>
              <div className="text-white text-2xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by account number or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="FROZEN">Frozen</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20 bg-slate-800/30">
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Account Number</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Type</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Status</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Created</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-purple-400">No accounts found</td>
                    </tr>
                  ) : filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-white font-mono">{account.account_number}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {account.account_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(account.status)}`}>
                          {account.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-purple-300 text-xs">{formatDate(account.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(account, "deposit")}
                            disabled={account.status !== "ACTIVE"}
                            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg border border-emerald-500/30 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Deposit
                          </button>
                          <button
                            onClick={() => openModal(account, "status")}
                            className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg border border-purple-500/30 text-xs font-medium transition-all"
                          >
                            Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status Modal */}
        {modalMode === "status" && selectedAccount && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-1">Update Account Status</h3>
              <p className="text-purple-300 text-sm mb-6">
                Account: <span className="font-mono text-white">{selectedAccount.account_number}</span>
              </p>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as "ACTIVE" | "FROZEN" | "CLOSED")}
                className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white mb-6 focus:outline-none focus:border-purple-400"
              >
                <option value="ACTIVE">Active</option>
                <option value="FROZEN">Frozen</option>
                <option value="CLOSED">Closed</option>
              </select>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateStatus}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                  {processing ? "Updating..." : "Update"}
                </button>
                <button
                  onClick={() => { setModalMode(null); setSelectedAccount(null); }}
                  className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {modalMode === "deposit" && selectedAccount && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-emerald-500/30">
              <h3 className="text-xl font-bold text-white mb-1">Admin Deposit</h3>
              <p className="text-purple-300 text-sm mb-6">
                Account: <span className="font-mono text-white">{selectedAccount.account_number}</span>
              </p>
              <input
                type="number"
                placeholder="Amount (₹)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-xl text-white mb-6 focus:outline-none focus:border-emerald-400 placeholder-purple-400"
                min="1"
                step="0.01"
              />
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleDeposit}
                  disabled={processing || !depositAmount}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Deposit Funds"}
                </button>
                <button
                  onClick={() => { setModalMode(null); setSelectedAccount(null); }}
                  className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}

