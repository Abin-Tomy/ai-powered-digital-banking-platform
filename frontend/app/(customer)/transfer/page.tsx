"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransferPage() {
  const router = useRouter();

  // 🔐 AUTH CHECK
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (isLoggedIn !== "true" || role !== "customer") {
      router.push("/login");
    }
  }, [router]);

  // 🧾 FORM STATE
  const [formData, setFormData] = useState({
    recipientName: "",
    accountNumber: "",
    amount: "",
    remarks: "",
  });

  const [success, setSuccess] = useState("");

  // ✍️ HANDLE CHANGE
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💸 HANDLE TRANSFER
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientName || !formData.accountNumber || !formData.amount) {
      alert("Fill all required fields ❌");
      return;
    }

    if (Number(formData.amount) <= 0) {
      alert("Enter a valid amount ❌");
      return;
    }

    // Fake success (no backend)
    setSuccess(
      `₹${formData.amount} transferred to ${formData.recipientName} ✅`
    );

    // Clear form
    setFormData({
      recipientName: "",
      accountNumber: "",
      amount: "",
      remarks: "",
    });

    // Redirect to statements
    setTimeout(() => {
      router.push("/customer/statements");
    }, 2000);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">SecureBank – Transfer</h1>
          <div className="space-x-2">
            <button
              onClick={() => router.push("/customer")}
              className="px-4 py-2 border rounded"
            >
              Back
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* FORM */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow border">

          <h2 className="text-2xl font-bold mb-4">Money Transfer 💸</h2>

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                className="w-full border p-3 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full border p-3 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full border p-3 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border p-3 rounded"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold"
            >
              Transfer
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
