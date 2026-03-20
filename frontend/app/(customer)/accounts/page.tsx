"use client";

import { useEffect, useState, useCallback } from "react";
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

interface AccountWithBalance extends Account {
  balance: number | null;
  balanceLoading: boolean;
}

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "Loading...";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all ${
      type === "success"
        ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-200"
        : "bg-red-900/90 border-red-500/30 text-red-200"
    }`}>
      {type === "success" ? (
        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [accountType, setAccountType] = useState<"SAVINGS" | "CURRENT">("SAVINGS");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchBalance = useCallback(async (accountId: string, index: number) => {
    try {
      const resp = await api.get(`/transactions/${accountId}/balance/`);
      setAccounts((prev) =>
        prev.map((a, i) =>
          i === index ? { ...a, balance: resp.data.balance, balanceLoading: false } : a
        )
      );
    } catch {
      setAccounts((prev) =>
        prev.map((a, i) =>
          i === index ? { ...a, balance: 0, balanceLoading: false } : a
        )
      );
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await api.get("/accounts/my/");
      const accs: Account[] = resp.data;
      const withBalance: AccountWithBalance[] = accs.map((a) => ({
        ...a,
        balance: null,
        balanceLoading: true,
      }));
      setAccounts(withBalance);
      // Fetch balances in parallel
      accs.forEach((a, i) => fetchBalance(a.id, i));
    } catch {
      setError("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchBalance]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    try {
      await api.post("/accounts/create/", { account_type: accountType });
      setShowModal(false);
      setToast({ message: "Account created successfully!", type: "success" });
      loadAccounts();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; non_field_errors?: string[] } } };
      const msg =
        e.response?.data?.non_field_errors?.[0] ||
        e.response?.data?.detail ||
        "Failed to create account.";
      if (msg.toLowerCase().includes("savings")) {
        setCreateError("You already have a savings account.");
      } else {
        setCreateError(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "ACTIVE") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (status === "FROZEN") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  return (
    <DashboardLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Accounts</h1>
            <p className="text-purple-300 text-sm mt-1">View and manage your bank accounts</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setCreateError(""); }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:scale-[1.02] transition-all shadow-lg text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Open New Account
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-300 text-sm">{error}</span>
            <button onClick={loadAccounts} className="text-red-400 hover:text-red-300 text-sm underline">Retry</button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-800/50 rounded-2xl h-52 border border-purple-500/10" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-16 border border-purple-500/20 text-center">
            <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">No accounts yet</h3>
            <p className="text-purple-300 text-sm mb-6">Open your first account to start banking with SecureBank</p>
            <button
              onClick={() => { setShowModal(true); setCreateError(""); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Open your first account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all overflow-hidden"
              >
                {/* Card gradient top */}
                <div className="h-2 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(account.status)}`}>
                      {account.status}
                    </span>
                    <span className="text-purple-400 text-sm font-semibold">{account.account_type}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-purple-300 text-xs mb-1">Account Number</p>
                    <p className="text-white font-mono text-sm tracking-widest">
                      {account.account_number.replace(/(.{4})/g, "$1 ").trim()}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-purple-300 text-xs mb-1">Available Balance</p>
                    {account.balanceLoading ? (
                      <div className="animate-pulse h-7 w-36 bg-slate-700/50 rounded" />
                    ) : (
                      <p className="text-2xl font-bold text-white">{formatCurrency(account.balance)}</p>
                    )}
                  </div>

                  <div className="mb-5">
                    <p className="text-purple-300 text-xs mb-1">Opened On</p>
                    <p className="text-white text-sm">{formatDate(account.created_at)}</p>
                  </div>

                  <Link
                    href={`/statements`}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-500/60 font-medium py-2.5 rounded-xl transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Transactions
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-900 rounded-2xl border border-purple-500/30 p-8 w-full max-w-md shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Open New Account</h2>
            </div>

            <div className="space-y-3 mb-6">
              {(["SAVINGS", "CURRENT"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    accountType === type
                      ? "bg-purple-600/20 border-purple-500 text-white"
                      : "bg-slate-800/50 border-slate-700/50 text-purple-300 hover:border-purple-500/50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    accountType === type ? "border-purple-400 bg-purple-400" : "border-slate-600"
                  }`}>
                    {accountType === type && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{type === "SAVINGS" ? "Savings Account" : "Current Account"}</p>
                    <p className="text-xs opacity-60 mt-0.5">{type === "SAVINGS" ? "Earn interest on your balance" : "For business or heavy transactions"}</p>
                  </div>
                </button>
              ))}
            </div>

            {createError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
                {createError}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                "Open Account"
              )}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
