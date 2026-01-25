"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    if (!email) {
      alert("Enter your email");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/forgot-password/", { email });
      alert("Reset link sent to your email 📩");
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4"
      />

      <button
        onClick={handleForgot}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </div>
  );
}
