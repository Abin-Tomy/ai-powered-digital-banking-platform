"use client";

import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SupportDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await api.post("/users/logout/");
    document.cookie = "role=; Max-Age=0; path=/";
    router.push("/login");
  };

  return (
    <div>
      <h1>Support Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
