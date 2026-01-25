"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const handleReset = async () => {
    if (!password || !token) {
      alert("Invalid reset link");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/reset-password/", {
        token,
        password,
      });

      alert("Password reset successful ✅");
      router.push("/login");
    } catch {
      alert("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4"
      />

      <button
        onClick={handleReset}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}
