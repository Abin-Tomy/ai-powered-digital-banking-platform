"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerPage() {
  const router = useRouter();
  const [section, setSection] = useState<"dashboard" | "statements" | "transfer">("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (isLoggedIn !== "true" || role !== "customer") {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) return null; // prevent rendering before auth check

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl shadow-2xl p-8 flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Customer Portal</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* NAV BUTTONS */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setSection("dashboard")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${section === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-blue-500 hover:text-white"}`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setSection("statements")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${section === "statements" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-green-500 hover:text-white"}`}
          >
            Statements
          </button>

          <button
            onClick={() => setSection("transfer")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${section === "transfer" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-purple-500 hover:text-white"}`}
          >
            Transfer
          </button>
        </div>

        {/* CONTENT */}
        <div className="w-full mx-auto">
          {section === "dashboard" && (
            <div className="w-full max-w-2xl mx-auto text-center bg-gray-700 p-6 rounded-2xl shadow-inner">
              <h2 className="text-2xl font-bold mb-3 text-white">Dashboard</h2>
              <p className="text-gray-300 text-lg">Welcome! Your account is active.</p>
            </div>
          )}

          {section === "statements" && (
            <div className="w-full max-w-3xl mx-auto bg-gray-700 p-6 rounded-2xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-center text-white">Statements</h2>

              {/* Table Headers */}
              <div className="grid grid-cols-4 gap-4 font-semibold text-gray-300 border-b border-gray-500 pb-2 mb-2 text-center">
                <span>Date</span>
                <span>Description</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              {/* Dummy Transactions */}
              <div className="space-y-2">
                {[
                  { date: "2026-01-15", desc: "Salary Credit", amount: "+ ₹50,000", status: "Completed", color: "text-green-400" },
                  { date: "2026-01-12", desc: "Electricity Bill", amount: "- ₹3,200", status: "Completed", color: "text-red-400" },
                  { date: "2026-01-10", desc: "Grocery Payment", amount: "- ₹1,500", status: "Completed", color: "text-red-400" },
                  { date: "2026-01-08", desc: "Transfer to Friend", amount: "- ₹2,000", status: "Pending", color: "text-yellow-400" },
                ].map((tx, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 text-center items-center text-gray-300">
                    <span>{tx.date}</span>
                    <span>{tx.desc}</span>
                    <span className={tx.color}>{tx.amount}</span>
                    <span className={tx.color}>{tx.status}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm text-gray-400 text-center">
                Showing last 4 transactions. All amounts in INR.
              </p>
            </div>
          )}

          {section === "transfer" && (
            <div className="w-full max-w-md mx-auto bg-gray-700 p-6 rounded-2xl shadow-md flex flex-col gap-4">
              <h2 className="text-2xl font-bold mb-2 text-center text-white">Transfer Money</h2>

              <input
                placeholder="Account Number"
                className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                placeholder="Amount"
                className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition">
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
