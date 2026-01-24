"use client";

import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const router = useRouter();

  // 🔐 Protect admin route
  useEffect(() => {
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1];

    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  // 🚪 Logout
  const handleLogout = async () => {
    try {
      await api.post("/users/logout/");
    } catch (error) {
      console.error("Logout failed", error);
    }

    document.cookie = "role=; Max-Age=0; path=/";
    router.push("/login");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>👑 Admin Dashboard</h1>
      <p>Welcome Admin. Manage everything from here.</p>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => router.push("/users")}>
          👥 Manage Users
        </button>

        <br /><br />

        <button onClick={() => router.push("/transactions")}>
          💸 View Transactions
        </button>

        <br /><br />

        <button onClick={() => router.push("/support/support-dashboard")}>
          🛠 Support Chat
        </button>

        <br /><br />

        <button
          onClick={handleLogout}
          style={{ color: "red" }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
