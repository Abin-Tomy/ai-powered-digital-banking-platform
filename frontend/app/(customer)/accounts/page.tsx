"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AccountsPage() {
  const router = useRouter();

  // 🔐 Route protection: only logged-in customer can see this page
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (isLoggedIn !== "true" || role !== "customer") {
      router.push("/login");
    }
  }, [router]);

  const [accounts, setAccounts] = useState([
    {
      id: 1,
      accountNumber: "****1234",
      accountType: "Savings",
      balance: "25,450.00",
      status: "Active",
      customerName: "Abin Tomy",
      lastLogin: "Jan 4, 2026 at 10:30 AM"
    },
    {
      id: 2,
      accountNumber: "****5678",
      accountType: "Current",
      balance: "75,200.00",
      status: "Active",
      customerName: "Abin Tomy",
      lastLogin: "Jan 2, 2026 at 09:15 AM"
    }
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, type: "Credit", description: "Salary Deposit", amount: "+15,000.00", date: "Jan 3, 2026", status: "Completed" },
    { id: 2, type: "Debit", description: "Online Purchase - Amazon", amount: "-1,249.00", date: "Jan 2, 2026", status: "Completed" },
    { id: 3, type: "Debit", description: "ATM Withdrawal", amount: "-2,000.00", date: "Jan 1, 2026", status: "Completed" },
    { id: 4, type: "Credit", description: "Refund - Flipkart", amount: "+899.00", date: "Dec 31, 2025", status: "Completed" }
  ]);

  // Logout function
  const handleLogout = async () => {
    await api.post("/users/logout/"); // optional: your backend logout
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    router.push("/login");
  };

  // View transactions per account
  const handleViewTransactions = (accountNumber: string) => {
    router.push(`/statements?account=${accountNumber}`); // optional: send account number via query
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SecureBank</h1>
                <p className="text-xs text-slate-500">Accounts Overview</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200 border border-slate-300"
              >
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Accounts</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{acc.accountType} Account</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  acc.status === "Active" 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  ● {acc.status}
                </span>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 mb-4 text-white">
                <p className="text-sm text-blue-100 mb-2">Available Balance</p>
                <p className="text-3xl font-bold mb-4">₹{acc.balance}</p>
                <div className="flex items-center justify-between pt-4 border-t border-blue-500">
                  <div>
                    <p className="text-xs text-blue-100">Account Number</p>
                    <p className="text-sm font-mono font-semibold">{acc.accountNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-100">Customer Name</p>
                    <p className="text-sm font-semibold">{acc.customerName}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleViewTransactions(acc.accountNumber)}
                className="w-full flex items-center justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200 border border-slate-200 font-medium"
              >
                View Transactions
              </button>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Description</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">{tx.description}</td>
                    <td className="py-4 px-4">{tx.date}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">{tx.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
