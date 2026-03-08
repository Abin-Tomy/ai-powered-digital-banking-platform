"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import DashboardLayout from "../components/DashboardLayout";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
}

interface TransferReceipt {
  reference: string;
  amount: string;
  toAccountNumber: string;
  timestamp: string;
}

function genIdempotencyKey() {
  return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getErrorMessage(err: unknown): string {
  const e = err as { response?: { status?: number; data?: { detail?: string } } };
  const detail = e.response?.data?.detail ?? "";
  const httpStatus = e.response?.status;
  if (httpStatus === 409) return "This transfer was already processed. Please refresh and check your balance.";
  if (detail.toLowerCase().includes("insufficient")) return "You don't have enough balance for this transfer.";
  if (detail.toLowerCase().includes("destination account not found")) return "Recipient account not found. Check the account number and try again.";
  if (detail.toLowerCase().includes("same account") || detail.toLowerCase().includes("cannot transfer to the same")) return "You cannot transfer to your own account.";
  if (detail.toLowerCase().includes("source account is not active")) return "Your selected account is not active and cannot make transfers.";
  if (detail.toLowerCase().includes("destination account is not active")) return "The recipient account is not active.";
  if (detail) return detail;
  return "Transfer failed. Please try again. Your account has not been debited.";
}

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(genIdempotencyKey);

  const fetchBalance = useCallback(async (accountId: string) => {
    if (!accountId) return;
    setBalanceLoading(true);
    setBalance(null);
    try {
      const res = await api.get(`/transactions/${accountId}/balance/`);
      setBalance(res.data.balance);
    } catch {
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/accounts/my/");
        const active = (res.data as Account[]).filter((a) => a.status === "ACTIVE");
        setAccounts(active);
        if (active.length > 0) {
          setFromAccountId(active[0].id);
        }
      } catch {
        setError("Failed to load accounts.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (fromAccountId) fetchBalance(fromAccountId);
  }, [fromAccountId, fetchBalance]);

  const parsedAmount = parseFloat(amount) || 0;
  const isInsufficient = balance !== null && parsedAmount > 0 && parsedAmount > balance;
  const canSubmit =
    fromAccountId &&
    toAccountNumber.trim().length > 0 &&
    parsedAmount > 0 &&
    !isInsufficient &&
    !balanceLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    setTransferring(true);
    setError("");
    try {
      const res = await api.post(
        "/transactions/transfer/",
        {
          from_account: fromAccountId,
          to_account_number: toAccountNumber.trim(),
          amount: parsedAmount.toFixed(2),
        },
        { headers: { "Idempotency-Key": idempotencyKey } }
      );
      setReceipt({
        reference: res.data.reference,
        amount: parsedAmount.toFixed(2),
        toAccountNumber: toAccountNumber.trim(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTransferring(false);
    }
  };

  const handleMakeAnother = () => {
    setReceipt(null);
    setToAccountNumber("");
    setAmount("");
    setDescription("");
    setError("");
    setIdempotencyKey(genIdempotencyKey());
    fetchBalance(fromAccountId);
  };

  // ─── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="animate-pulse h-10 w-56 bg-slate-800/50 rounded-xl" />
          <div className="animate-pulse h-96 bg-slate-800/50 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  // ─── Success Receipt ─────────────────────────────────────────────
  if (receipt) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-10 border border-emerald-500/30 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/30">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Transfer Successful!</h2>
            <p className="text-emerald-400 text-sm mb-8">Your money is on its way</p>

            <div className="bg-slate-800/50 rounded-xl p-5 text-left space-y-3 mb-6 border border-purple-500/20">
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">Amount Sent</span>
                <span className="text-white font-bold">{formatCurrency(parseFloat(receipt.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">To Account</span>
                <span className="text-white font-mono text-sm">{receipt.toAccountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">Date & Time</span>
                <span className="text-white text-sm">{formatDateTime(receipt.timestamp)}</span>
              </div>
              <div className="pt-2 border-t border-purple-500/20">
                <div className="flex justify-between">
                  <span className="text-purple-300 text-xs">Transaction Reference</span>
                  <span className="text-purple-200 font-mono text-xs break-all max-w-[180px] text-right">{receipt.reference}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMakeAnother}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:scale-[1.02] transition-all"
              >
                Make Another Transfer
              </button>
              <Link
                href="/statements"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white font-semibold py-3 rounded-xl transition-all text-center border border-purple-500/30"
              >
                View Statement
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedAccount = accounts.find((a) => a.id === fromAccountId);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Transfer Money</h1>
          <p className="text-purple-300 text-sm">Send money to any account instantly</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-300 text-sm flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 flex-shrink-0">✕</button>
          </div>
        )}

        {/* No active accounts */}
        {accounts.length === 0 && !error && (
          <div className="bg-slate-900/70 rounded-2xl p-10 border border-purple-500/20 text-center">
            <p className="text-purple-300 mb-4">You have no active accounts to transfer from.</p>
            <Link href="/accounts" className="text-purple-400 underline hover:text-purple-300">Open an account</Link>
          </div>
        )}

        {accounts.length > 0 && (
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Step 1: From Account */}
              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-2">
                  <span className="bg-purple-600/30 text-purple-300 rounded-full px-2 py-0.5 text-xs mr-2">1</span>
                  From Account
                </label>
                <select
                  value={fromAccountId}
                  onChange={(e) => { setFromAccountId(e.target.value); setError(""); }}
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-all"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type} — ••••{acc.account_number.slice(-4)}
                    </option>
                  ))}
                </select>
                <div className="mt-2 h-5">
                  {balanceLoading ? (
                    <div className="animate-pulse h-4 w-40 bg-slate-700/50 rounded" />
                  ) : balance !== null ? (
                    <p className="text-sm text-purple-300">
                      Available balance:{" "}
                      <span className="text-white font-semibold">{formatCurrency(balance)}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Step 2: To Account */}
              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-2">
                  <span className="bg-purple-600/30 text-purple-300 rounded-full px-2 py-0.5 text-xs mr-2">2</span>
                  Recipient Account Number
                </label>
                <input
                  type="text"
                  value={toAccountNumber}
                  onChange={(e) => { setToAccountNumber(e.target.value); setError(""); }}
                  placeholder="Enter account number"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all font-mono"
                />
                <p className="text-purple-400/60 text-xs mt-1.5">Enter the recipient&#39;s bank account number</p>
              </div>

              {/* Step 3: Amount */}
              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-2">
                  <span className="bg-purple-600/30 text-purple-300 rounded-full px-2 py-0.5 text-xs mr-2">3</span>
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-lg">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(""); }}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full pl-9 pr-4 py-3.5 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all text-xl font-semibold"
                  />
                </div>
                <div className="mt-2 h-5">
                  {isInsufficient ? (
                    <p className="text-red-400 text-sm font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                      Insufficient balance
                    </p>
                  ) : parsedAmount > 0 ? (
                    <p className="text-purple-300 text-sm">
                      You are sending <span className="text-white font-semibold">{formatCurrency(parsedAmount)}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Step 4: Description */}
              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-2">
                  <span className="bg-purple-600/30 text-purple-300 rounded-full px-2 py-0.5 text-xs mr-2">4</span>
                  What&#39;s this for? <span className="text-purple-400/60 font-normal text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Rent, Groceries, etc."
                  maxLength={100}
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit || transferring}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                {transferring ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Transfer {parsedAmount > 0 ? formatCurrency(parsedAmount) : ""}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-blue-300/80 text-sm">
            Transfers are processed immediately and secured with 256-bit encryption. Verify recipient details before confirming.
          </p>
        </div>
      </div>

      {/* ─── Confirmation Modal ─── */}
      {showModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-900 rounded-2xl border border-purple-500/30 p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Confirm Transfer</h2>
            <div className="space-y-3 mb-6 bg-slate-800/50 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">From</span>
                <span className="text-white text-sm font-medium">
                  {selectedAccount.account_type} ••••{selectedAccount.account_number.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">To</span>
                <span className="text-white font-mono text-sm">{toAccountNumber}</span>
              </div>
              <div className="flex justify-between border-t border-purple-500/20 pt-3 mt-1">
                <span className="text-purple-300 text-sm font-semibold">Amount</span>
                <span className="text-white font-bold text-lg">{formatCurrency(parsedAmount)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold py-3 rounded-xl border border-purple-500/30 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
