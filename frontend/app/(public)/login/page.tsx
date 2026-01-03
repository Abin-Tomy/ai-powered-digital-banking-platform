"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await api.post("/users/login/", {
        username,
        password,
      });

      // Admin can read users list
      const res = await api.get("/users/");
      const user = res.data[0];

      if (user.role === "ADMIN") {
        router.push("/admin-dashboard");
      } else if (user.role === "SUPPORT") {
        router.push("/support-dashboard");
      } else {
        router.push("/customer-dashboard");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}