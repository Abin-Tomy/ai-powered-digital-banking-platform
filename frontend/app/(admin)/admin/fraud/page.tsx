"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import AdminDashboardLayout from "../../components/AdminDashboardLayout";
import { formatDateTime } from "@/lib/utils";

interface FraudFlag {
  id: string;
  transaction: string;
  status: "PENDING" | "CONFIRMED_FRAUD" | "FALSE_POSITIVE" | "CLEAR" | "SUSPICIOUS";
  risk_score: number;
  reasons: string[];
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
}

interface LiveAlert {
  id: string;
  transaction_id: string;
  risk_score: number;
  amount: string;
  user_email: string;
  timestamp: string;
}

export default function FraudDetectionPage() {
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchFraudFlags = async () => {
    try {
      setLoading(true);
      const response = await api.get("/fraud/flags/");
      const data = response.data;
      setFraudFlags(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to load fraud flags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudFlags();

    const wsBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/^http/, "ws");
    const token = localStorage.getItem("access_token");
    const ws = new WebSocket(`${wsBase}/ws/fraud-alerts/?token=${token}`);

    ws.onopen = () => setWsConnected(true);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "fraud_alert") {
          const alert: LiveAlert = {
            id: `alert-${Date.now()}`,
            transaction_id: data.transaction_id,
            risk_score: data.risk_score,
            amount: data.amount,
            user_email: data.user_email,
            timestamp: data.timestamp,
          };
          setLiveAlerts((prev) => [alert, ...prev].slice(0, 20));
          fetchFraudFlags();
        }
      } catch { /* ignore parse errors */ }
    };
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    wsRef.current = ws;

    return () => { ws.close(); };
  }, []);

  const handleReview = async (decision: "CONFIRMED_FRAUD" | "FALSE_POSITIVE") => {
    if (!selectedFlag) return;
    setReviewing(true);
    setError("");
    try {
      await api.post(`/fraud/review/${selectedFlag.id}/`, { status: decision });
      setSuccess(`Marked as ${decision === "CONFIRMED_FRAUD" ? "Confirmed Fraud" : "False Positive"}`);
      setSelectedFlag(null);
      fetchFraudFlags();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Failed to review fraud flag");
    } finally {
      setReviewing(false);
    }
  };

  const filteredFlags = fraudFlags.filter((f) => filterStatus === "ALL" || f.status === filterStatus);

  const statusBadge = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "CONFIRMED_FRAUD": return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "FALSE_POSITIVE": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "SUSPICIOUS": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const riskColor = (score: number) =>
    score >= 75 ? "text-red-400" : score >= 50 ? "text-orange-400" : "text-yellow-400";

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Fraud Detection</h1>
            <p className="text-purple-300">Review and manage suspicious transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${wsConnected ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${wsConnected ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
              {wsConnected ? "Live" : "Disconnected"}
            </div>
            <button
              onClick={fetchFraudFlags}
              className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2 rounded-xl border border-purple-500/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Live Alerts */}
        {liveAlerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-red-400 font-bold text-sm">LIVE FRAUD ALERT</div>
                  <div className="text-white text-sm">txn: ...{alert.transaction_id.slice(-8)} | ₹{alert.amount} | Risk: {alert.risk_score}%</div>
                  <div className="text-red-300/70 text-xs">{alert.user_email}</div>
                </div>
              </div>
              <button onClick={() => setLiveAlerts((p) => p.filter((a) => a.id !== alert.id))} className="text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-red-300">{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400">✕</button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-emerald-300">{success}</span>
            <button onClick={() => setSuccess("")} className="ml-auto text-emerald-400">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Flags", value: fraudFlags.length, color: "purple" },
            { label: "Pending", value: fraudFlags.filter((f) => f.status === "PENDING" || f.status === "SUSPICIOUS").length, color: "yellow" },
            { label: "Confirmed Fraud", value: fraudFlags.filter((f) => f.status === "CONFIRMED_FRAUD").length, color: "red" },
            { label: "False Positives", value: fraudFlags.filter((f) => f.status === "FALSE_POSITIVE").length, color: "emerald" },
          ].map((s) => (
            <div key={s.label} className={`bg-${s.color}-500/10 border border-${s.color}-500/30 rounded-xl p-4`}>
              <div className={`text-${s.color}-400 text-xs font-medium`}>{s.label}</div>
              <div className="text-white text-2xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["ALL", "PENDING", "SUSPICIOUS", "CONFIRMED_FRAUD", "FALSE_POSITIVE"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === s
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                  : "bg-slate-800/50 text-purple-300 hover:bg-slate-700/50 border border-purple-500/20"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Fraud Flags Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : filteredFlags.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white font-semibold">No fraud flags found</p>
              <p className="text-purple-400 text-sm mt-1">All transactions are clean</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20 bg-slate-800/30">
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Transaction</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Status</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Risk Score</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Reasons</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Flagged</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {filteredFlags.map((flag) => (
                    <tr key={flag.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-white font-mono text-xs">...{flag.transaction.slice(-12)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(flag.status)}`}>
                          {flag.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${riskColor(flag.risk_score)}`}>{flag.risk_score}%</span>
                      </td>
                      <td className="py-3 px-4 text-purple-300 text-xs max-w-xs">
                        {Array.isArray(flag.reasons) ? flag.reasons.join(", ") : flag.reasons || "—"}
                      </td>
                      <td className="py-3 px-4 text-purple-400 text-xs whitespace-nowrap">
                        {formatDateTime(flag.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        {(flag.status === "PENDING" || flag.status === "SUSPICIOUS") && (
                          <button
                            onClick={() => { setSelectedFlag(flag); setError(""); }}
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 text-xs font-medium transition-all"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedFlag && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Review Fraud Flag</h3>
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 text-sm">Transaction</span>
                  <span className="text-white font-mono text-xs">...{selectedFlag.transaction.slice(-16)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 text-sm">Risk Score</span>
                  <span className={`font-bold ${riskColor(selectedFlag.risk_score)}`}>{selectedFlag.risk_score}%</span>
                </div>
                <div>
                  <span className="text-purple-300 text-sm block mb-1">Reasons</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(selectedFlag.reasons) ? selectedFlag.reasons : [selectedFlag.reasons]).map((r, i) => (
                      <span key={i} className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs">{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <div className="space-y-3">
                <button
                  onClick={() => handleReview("CONFIRMED_FRAUD")}
                  disabled={reviewing}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                  {reviewing ? "Processing..." : "Confirm as Fraud"}
                </button>
                <button
                  onClick={() => handleReview("FALSE_POSITIVE")}
                  disabled={reviewing}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                  {reviewing ? "Processing..." : "Mark as False Positive"}
                </button>
                <button
                  onClick={() => setSelectedFlag(null)}
                  className="w-full bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}

