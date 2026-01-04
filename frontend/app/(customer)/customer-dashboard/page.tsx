"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();
  
  const [accountData, setAccountData] = useState({
    accountNumber: "****1234",
    accountType: "Savings",
    balance: "25,450.00",
    status: "Active",
    customerName: "Abin Tomy",
    lastLogin: "Jan 4, 2026 at 10:30 AM"
  });

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, type: "Credit", description: "Salary Deposit", amount: "+15,000.00", date: "Jan 3, 2026", status: "Completed" },
    { id: 2, type: "Debit", description: "Online Purchase - Amazon", amount: "-1,249.00", date: "Jan 2, 2026", status: "Completed" },
    { id: 3, type: "Debit", description: "ATM Withdrawal", amount: "-2,000.00", date: "Jan 1, 2026", status: "Completed" },
    { id: 4, type: "Credit", description: "Refund - Flipkart", amount: "+899.00", date: "Dec 31, 2025", status: "Completed" }
  ]);

  const handleLogout = async () => {
    await api.post("/users/logout/");
    document.cookie = "role=; Max-Age=0; path=/";
    router.push("/login");
  };

  const handleViewTransactions = () => {
    alert("Navigate to full transactions page");
  };

  const handleTransferFunds = () => {
    alert("Navigate to transfer funds page");
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
                <p className="text-xs text-slate-500">Personal Banking</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-slate-900">{accountData.customerName}</p>
                <p className="text-xs text-slate-500">Last login: {accountData.lastLogin}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200 border border-slate-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h2>
          <p className="text-slate-600">Welcome back, {accountData.customerName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Account Summary Card */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Account Overview</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                accountData.status === "Active" 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                ● {accountData.status}
              </span>
            </div>

            {/* Balance Display */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 mb-6 text-white">
              <p className="text-sm text-blue-100 mb-2">Available Balance</p>
              <p className="text-4xl font-bold mb-4">₹{accountData.balance}</p>
              <div className="flex items-center justify-between pt-4 border-t border-blue-500">
                <div>
                  <p className="text-xs text-blue-100">Account Number</p>
                  <p className="text-sm font-mono font-semibold">{accountData.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-100">Account Type</p>
                  <p className="text-sm font-semibold">{accountData.accountType} Account</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleTransferFunds}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-200"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900">Transfer Funds</span>
                <span className="text-xs text-slate-600 mt-1">Send money instantly</span>
              </button>

              <button
                onClick={handleViewTransactions}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200 border border-slate-200"
              >
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900">View Transactions</span>
                <span className="text-xs text-slate-600 mt-1">Check your history</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Monthly Summary</h3>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">Money In</span>
                    <span className="text-xs font-medium text-green-600">+18.5%</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">₹18,450</p>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">Money Out</span>
                    <span className="text-xs font-medium text-red-600">+12.3%</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">₹12,840</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors duration-200">
                  Statement Download
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors duration-200">
                  Update Profile
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors duration-200">
                  Change Password
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors duration-200">
                  Help & Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
            <button 
              onClick={handleViewTransactions}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
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
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "Credit" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {transaction.type === "Credit" ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{transaction.description}</p>
                          <p className="text-xs text-slate-500">{transaction.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-600">{transaction.date}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`text-sm font-semibold ${
                        transaction.type === "Credit" ? "text-green-600" : "text-red-600"
                      }`}>
                        ₹{transaction.amount}
                      </span>
                    </td>
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