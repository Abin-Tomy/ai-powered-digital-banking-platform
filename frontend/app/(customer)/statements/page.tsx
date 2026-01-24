"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StatementsPage() {
  const router = useRouter();

  // 🔐 AUTH CHECK
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (isLoggedIn !== "true" || role !== "customer") {
      router.push("/login");
    }
  }, [router]);

  // 🧾 ACCOUNT DETAILS
  const [account] = useState({
    accountNumber: "****1234",
    accountType: "Savings",
    balance: "25,450.00",
    status: "Active",
    customerName: "Abin Tomy",
  });

  // 💳 TRANSACTIONS
  const [transactions] = useState([
    {
      id: 1,
      type: "Credit",
      description: "Salary Deposit",
      amount: "15,000.00",
      date: "Jan 3, 2026",
      status: "Completed",
    },
    {
      id: 2,
      type: "Debit",
      description: "Amazon Purchase",
      amount: "1,249.00",
      date: "Jan 2, 2026",
      status: "Completed",
    },
    {
      id: 3,
      type: "Debit",
      description: "ATM Withdrawal",
      amount: "2,000.00",
      date: "Jan 1, 2026",
      status: "Completed",
    },
    {
      id: 4,
      type: "Credit",
      description: "Refund",
      amount: "899.00",
      date: "Dec 31, 2025",
      status: "Completed",
    },
  ]);

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Account Statements 📄</h1>
          <div className="space-x-3">
            <button
              onClick={() => router.push("/customer")}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ACCOUNT CARD */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <p className="text-sm text-gray-500 mb-1">Available Balance</p>
          <p className="text-3xl font-bold mb-4">₹{account.balance}</p>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Account: {account.accountNumber}</span>
            <span>{account.customerName}</span>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="p-3">{tx.date}</td>
                  <td className="p-3">{tx.description}</td>
                  <td className="p-3">{tx.type}</td>
                  <td
                    className={`p-3 text-right font-semibold ${
                      tx.type === "Credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {tx.type === "Credit" ? "+" : "-"}₹{tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
