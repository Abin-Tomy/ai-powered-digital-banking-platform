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

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        setFromAccountId(response.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fromAccountId || !toAccountNumber || !amount) {
      setError("Please fill all fields");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setTransferring(true);

    try {
      const token = localStorage.getItem("access_token");
      const idempotencyKey = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await api.post("/transactions/transfer/", {
        from_account: fromAccountId,
        to_account_number: toAccountNumber,
        amount: amount
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey
        }
      });

      setSuccess("Transfer completed successfully!");
      setToAccountNumber("");
      setAmount("");
    } catch (err: unknown) {
      interface AxiosError {
        response?: { data?: { detail?: string; message?: string } };
      }
      const axiosErr = err as AxiosError;
      setError(axiosErr.response?.data?.detail || axiosErr.response?.data?.message || "Transfer failed");
    } finally {
      setTransferring(false);
    }
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Transfer Money</h1>
          <p className="text-purple-300">Send money securely to another account</p>
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

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-300">{success}</span>
              <button onClick={() => setSuccess("")} className="ml-auto text-emerald-400 hover:text-emerald-300">✕</button>
            </div>
          </div>
        )}

        {/* Transfer Form */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
          <form onSubmit={handleTransfer} className="space-y-6">
            {/* From Account */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-3">
                From Account
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_number} - {acc.account_type} ({acc.status})
                  </option>
                ))}
              </select>
            </div>

            {/* To Account Number */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-3">
                To Account Number
              </label>
              <input
                type="text"
                value={toAccountNumber}
                onChange={(e) => setToAccountNumber(e.target.value)}
                placeholder="Enter recipient account number"
                className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                required
              />
              <p className="text-purple-400 text-xs mt-2">Enter the full account number of the recipient</p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-3">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to transfer"
                min="1"
                step="0.01"
                className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                required
              />
              <p className="text-purple-400 text-xs mt-2">Minimum transfer amount: ₹1.00</p>
            </div>

            {/* Transfer Button */}
            <button
              type="submit"
              disabled={transferring || !fromAccountId || !toAccountNumber || !amount}
              className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {transferring ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Transfer Now</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-blue-300 font-semibold mb-1">Security Information</h4>
              <p className="text-blue-300/80 text-sm">
                All transfers are secured with 256-bit encryption. Verify recipient details before confirming. Transactions are processed immediately and cannot be reversed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
