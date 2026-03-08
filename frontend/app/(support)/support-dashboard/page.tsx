"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupportDashboardLayout from "../components/SupportDashboardLayout";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

interface FraudFlag {
  id: string;
  transaction: string;
  status: string;
  risk_score: number;
  reasons: string[];
  created_at: string;
}

export default function SupportDashboardPage() {
  const router = useRouter();
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [agentName, setAgentName] = useState("Support Agent");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.full_name) setAgentName(user.full_name);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fraudRes, usersRes] = await Promise.all([
        api.get("/fraud/flags/?page_size=100"),
        api.get("/admin/users/?page_size=1"),
      ]);
      const rawFraud = fraudRes.data;
      setFraudFlags(Array.isArray(rawFraud) ? rawFraud : rawFraud.results ?? []);
      setTotalUsers(usersRes.data.count ?? 0);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const suspicious = fraudFlags.filter((f) => f.status === "SUSPICIOUS");
  const confirmed = fraudFlags.filter((f) => f.status === "CONFIRMED_FRAUD");
  const cleared = fraudFlags.filter((f) => f.status === "FALSE_POSITIVE");
  const recentSuspicious = suspicious.slice(0, 5);

  const riskColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    return "text-emerald-400";
  };

  return (
    <SupportDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Support Dashboard</h1>
            <p className="text-purple-300 mt-1">{getGreeting()}, {agentName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-white">
              {currentTime.toLocaleTimeString("en-IN", { hour12: false })}
            </div>
            <div className="text-purple-400 text-sm">
              {currentTime.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-800/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => router.push("/support/fraud")} className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-yellow-500/30 text-left hover:border-yellow-400/60 transition-all">
              <div className="text-yellow-400 text-sm font-medium mb-1">Open Fraud Cases</div>
              <div className={`text-3xl font-bold ${suspicious.length > 0 ? "text-red-400" : "text-white"}`}>{suspicious.length}</div>
              <div className="text-yellow-400 text-xs mt-2">Review →</div>
            </button>
            <button onClick={() => router.push("/chat")} className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-indigo-500/30 text-left hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 text-sm font-medium mb-1">Live Chat</div>
              <div className="text-3xl font-bold text-white">Open</div>
              <div className="text-indigo-400 text-xs mt-2">Start chat →</div>
            </button>
            <button onClick={() => router.push("/support/fraud")} className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-red-500/20 text-left hover:border-red-400/60 transition-all">
              <div className="text-red-400 text-sm font-medium mb-1">Confirmed Fraud</div>
              <div className="text-3xl font-bold text-white">{confirmed.length}</div>
              <div className="text-gray-400 text-xs mt-2">{cleared.length} cleared</div>
            </button>
            <button onClick={() => router.push("/support/users")} className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/30 text-left hover:border-purple-400/60 transition-all">
              <div className="text-purple-400 text-sm font-medium mb-1">Total Users</div>
              <div className="text-3xl font-bold text-white">{totalUsers}</div>
              <div className="text-purple-400 text-xs mt-2">View all →</div>
            </button>
          </div>
        )}

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-purple-500/20">
            <h2 className="text-xl font-bold text-white">Recent Fraud Cases</h2>
            <button onClick={() => router.push("/support/fraud")} className="text-purple-400 hover:text-purple-300 text-sm">View all →</button>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />)}</div>
          ) : recentSuspicious.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-emerald-400 font-medium">No open fraud cases</p>
            </div>
          ) : (
            <div className="divide-y divide-purple-500/10">
              {recentSuspicious.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-4 hover:bg-purple-500/5 transition-all">
                  <div>
                    <div className="text-white text-sm font-mono truncate max-w-xs">{flag.transaction}</div>
                    <div className="text-purple-400 text-xs mt-0.5">{formatDateTime(flag.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className={`font-bold ${riskColor(flag.risk_score)}`}>{flag.risk_score}%</div>
                      <div className="text-purple-400 text-xs">risk</div>
                    </div>
                    <button onClick={() => router.push("/support/fraud")} className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-xs font-medium border border-yellow-500/30 transition-all">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "🔍 Customer Lookup", path: "/customer360" },
              { label: "💬 Open Chat", path: "/chat" },
              { label: "⚠️ Fraud Queue", path: "/support/fraud" },
              { label: "👥 User List", path: "/support/users" },
            ].map(({ label, path }) => (
              <button key={path} onClick={() => router.push(path)} className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-xl text-white font-medium transition-all text-center">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SupportDashboardLayout>
  );
}