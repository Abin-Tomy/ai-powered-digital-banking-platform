"use client";

import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded shadow max-w-xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Customer Portal 🏦</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push("/customer-dashboard/accounts")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Accounts
          </button>

          <button
            onClick={() => router.push("/customer-dashboard/statements")}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Statements
          </button>

          <button
            onClick={() => router.push("/customer-dashboard/transfer")}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Transfer
          </button>
        </div>

        <p className="mt-6 text-gray-600">
          Welcome! Your account is active.
        </p>
      </div>
    </div>
  );
}
