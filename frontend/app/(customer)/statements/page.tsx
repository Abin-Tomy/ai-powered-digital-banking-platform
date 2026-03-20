"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
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

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

export default function StatementsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // PDF modal
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfFrom, setPdfFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [pdfTo, setPdfTo] = useState(() => new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

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

  const fetchTransactions = useCallback(async () => {
    if (!selectedAccountId) return;
    setSearching(true);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("page_size", pageSize.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (minAmount) params.set("min_amount", minAmount);
      if (maxAmount) params.set("max_amount", maxAmount);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      const res = await api.get<PaginatedResponse>(
        `/transactions/${selectedAccountId}/?${params.toString()}`
      );
      setTransactions(res.data.results);
      setTotalCount(res.data.count);
    } catch {
      setError("Failed to fetch transactions");
    } finally {
      setSearching(false);
    }
  }, [selectedAccountId, currentPage, pageSize, debouncedSearch, typeFilter, minAmount, maxAmount, dateFrom, dateTo]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/accounts/my/");
        setAccounts(res.data);
        if (res.data.length > 0) setSelectedAccountId(res.data[0].id);
      } catch {
        setError("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchBalance(selectedAccountId);
      fetchTransactions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  useEffect(() => {
    if (selectedAccountId) fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, typeFilter, minAmount, maxAmount, dateFrom, dateTo, currentPage, pageSize]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setTypeFilter("ALL");
    setMinAmount("");
    setMaxAmount("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(searchTerm || typeFilter !== "ALL" || minAmount || maxAmount || dateFrom || dateTo);
  const totalPages = Math.ceil(totalCount / pageSize);
  const fromItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(currentPage * pageSize, totalCount);

  // Summary from current page
  const thisMonthCredits = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const thisMonthDebits = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const netFlow = thisMonthCredits - thisMonthDebits;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse h-10 w-72 bg-slate-800/50 rounded-xl" />
          <div className="animate-pulse h-28 w-full bg-slate-800/50 rounded-2xl" />
          <div className="animate-pulse h-48 w-full bg-slate-800/50 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1">Account Statements</h1>
            <p className="text-purple-300 text-sm">View and filter your transaction history</p>
          </div>
          <button
            onClick={() => setShowPdfModal(true)}
            disabled={!selectedAccountId}
            className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-4 py-2.5 rounded-xl transition-all font-medium text-sm disabled:opacity-40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-300 text-sm flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        {/* Account Selector + Balance */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="block text-purple-200 text-sm font-semibold mb-2">Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => { setSelectedAccountId(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-80 px-4 py-3 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-all"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} — ••••{acc.account_number.slice(-4)}
                </option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <p className="text-purple-300 text-xs mb-1">Current Balance</p>
            {balanceLoading ? (
              <div className="animate-pulse h-7 w-32 bg-slate-700/50 rounded" />
            ) : balance !== null ? (
              <p className="text-2xl font-bold text-white">{formatCurrency(balance)}</p>
            ) : null}
          </div>
        </div>

        {/* Summary Row */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/70 rounded-2xl p-5 border border-emerald-500/20">
              <p className="text-emerald-300 text-xs font-medium mb-1">Credits (this view)</p>
              <p className="text-xl font-bold text-white">{formatCurrency(thisMonthCredits)}</p>
            </div>
            <div className="bg-slate-900/70 rounded-2xl p-5 border border-red-500/20">
              <p className="text-red-300 text-xs font-medium mb-1">Debits (this view)</p>
              <p className="text-xl font-bold text-white">{formatCurrency(thisMonthDebits)}</p>
            </div>
            <div className={`bg-slate-900/70 rounded-2xl p-5 ${netFlow >= 0 ? "border-emerald-500/20" : "border-red-500/20"} border`}>
              <p className="text-purple-300 text-xs font-medium mb-1">Net Flow</p>
              <p className={`text-xl font-bold ${netFlow >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {netFlow >= 0 ? "+" : ""}{formatCurrency(netFlow)}
              </p>
            </div>
          </div>
        )}

        {/* Filter Panel */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by description or reference..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type */}
            <div>
              <label className="block text-purple-200 text-xs font-semibold mb-2">Type</label>
              <div className="flex rounded-xl overflow-hidden border border-purple-500/30">
                {["ALL", "DEBIT", "CREDIT"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                    className={`flex-1 py-2.5 text-xs font-medium transition-all ${
                      typeFilter === t
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800/50 text-purple-300 hover:bg-slate-700/50"
                    }`}
                  >
                    {t === "ALL" ? "All" : t === "DEBIT" ? "Debit" : "Credit"}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-purple-200 text-xs font-semibold mb-2">Amount Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minAmount}
                  onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
                  className="w-1/2 px-3 py-2.5 bg-slate-800/60 border border-purple-500/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 text-xs"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxAmount}
                  onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                  className="w-1/2 px-3 py-2.5 bg-slate-800/60 border border-purple-500/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 text-xs"
                />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-purple-200 text-xs font-semibold mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-800/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 text-xs [color-scheme:dark]"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-purple-200 text-xs font-semibold mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-800/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 text-xs [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-purple-300 text-sm">
            {searching
              ? "Loading..."
              : totalCount === 0
              ? "No transactions found"
              : `Showing ${fromItem}–${toItem} of ${totalCount} transactions`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xs">Per page:</span>
            {[10, 20, 50].map((n) => (
              <button
                key={n}
                onClick={() => { setPageSize(n); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  pageSize === n
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800/50 text-purple-300 hover:bg-slate-700/50 border border-purple-500/20"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {searching ? (
            <div className="p-12 text-center">
              <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-purple-300 text-sm">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {hasActiveFilters ? "No transactions match your filters" : "No transactions yet"}
              </h3>
              <p className="text-purple-300 text-sm mb-4">
                {hasActiveFilters
                  ? "Try adjusting or clearing your filters"
                  : "Make your first transfer to see transactions here!"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-600/30 transition-all text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-800/50 border-b border-purple-500/10 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                <div className="col-span-3">Date</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1 text-right">Status</div>
              </div>
              <div className="divide-y divide-purple-500/10">
                {transactions.map((txn) => (
                  <div key={txn.id}>
                    <button
                      className="w-full grid grid-cols-12 gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors text-left items-center"
                      onClick={() => setExpandedRow(expandedRow === txn.id ? null : txn.id)}
                    >
                      <div className="col-span-3 text-white text-sm">{formatDateTime(txn.created_at)}</div>
                      <div className="col-span-4 text-purple-200 text-sm truncate">{txn.description || txn.reference}</div>
                      <div className="col-span-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          txn.type === "CREDIT"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {txn.type}
                        </span>
                      </div>
                      <div className={`col-span-2 text-right font-bold text-sm ${
                        txn.type === "CREDIT" ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(parseFloat(txn.amount))}
                      </div>
                      <div className="col-span-1 text-right">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          txn.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : txn.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                    </button>
                    {expandedRow === txn.id && (
                      <div className="px-5 py-4 bg-slate-800/30 border-t border-purple-500/10 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-purple-400 text-xs mb-0.5">Transaction ID</p>
                          <p className="text-white font-mono text-xs break-all">{txn.id}</p>
                        </div>
                        <div>
                          <p className="text-purple-400 text-xs mb-0.5">Reference</p>
                          <p className="text-white font-mono text-xs break-all">{txn.reference}</p>
                        </div>
                        <div>
                          <p className="text-purple-400 text-xs mb-0.5">Description</p>
                          <p className="text-white text-xs">{txn.description}</p>
                        </div>
                        <div>
                          <p className="text-purple-400 text-xs mb-0.5">Full Date & Time</p>
                          <p className="text-white text-xs">{formatDateTime(txn.created_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-purple-300 border border-purple-500/20 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) page = i + 1;
              else if (currentPage <= 4) page = i + 1;
              else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
              else page = currentPage - 3 + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800/50 text-purple-300 border border-purple-500/20 hover:bg-slate-700/50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-purple-300 border border-purple-500/20 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* PDF Download Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPdfModal(false)} />
          <div className="relative bg-slate-900 rounded-2xl border border-purple-500/30 p-8 w-full max-w-md shadow-2xl">
            <button onClick={() => setShowPdfModal(false)} className="absolute top-4 right-4 text-purple-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Download Statement</h2>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-2">Date From</label>
                <input
                  type="date"
                  value={pdfFrom}
                  onChange={(e) => setPdfFrom(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-2">Date To</label>
                <input
                  type="date"
                  value={pdfTo}
                  onChange={(e) => setPdfTo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400 [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPdfModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold py-3 rounded-xl border border-purple-500/30 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.open(
                    `http://localhost:8000/api/transactions/${selectedAccountId}/statement/pdf/?date_from=${pdfFrom}&date_to=${pdfTo}`,
                    "_blank"
                  );
                  setShowPdfModal(false);
                }}
                disabled={!pdfFrom || !pdfTo}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
