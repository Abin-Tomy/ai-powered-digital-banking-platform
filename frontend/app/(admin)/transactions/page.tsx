"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  // 🔐 Admin-only protection
  useEffect(() => {
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1];

    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  return (
    <div style={{ padding: "30px" }}>
      <h1>💸 Admin – Transactions</h1>

      <p>
        This page shows all customer transactions.
        Admin can monitor, verify, or audit transfers.
      </p>

      {/* later you can map transactions here */}
      <div style={{ marginTop: "20px" }}>
        <p>🧾 No transactions loaded yet.</p>
      </div>
    </div>
  );
}
