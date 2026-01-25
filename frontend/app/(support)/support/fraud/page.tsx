"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SupportDashboardLayout from "../../components/SupportDashboardLayout";

interface FraudFlag {
  id: string;
  transaction_id: string;
  status: "PENDING" | "CONFIRMED_FRAUD" | "FALSE_POSITIVE";
  risk_score: number;
  flagged_reason: string;
  created_at: string;
  reviewed_at: string | null;
}

export default function SupportFraudPage() {
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    fetchFraudFlags();
  }, []);

  const fetchFraudFlags = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await api.get("/fraud/flags/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFraudFlags(response.data);
    } catch (err) {
      console.error("Failed to fetch fraud flags", err);
      setError("Failed to load fraud flags");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decision: "CONFIRMED_FRAUD" | "FALSE_POSITIVE") => {
    if (!selectedFlag) return;

    setReviewing(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access_token");
      await api.post(`/fraud/review/${selectedFlag.id}/`, {
        status: decision
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Transaction marked as ${decision === "CONFIRMED_FRAUD" ? "Confirmed Fraud" : "False Positive"}`);
      setSelectedFlag(null);
      fetchFraudFlags(); // Refresh list
    } catch (err: unknown) {
      interface AxiosError {
        response?: { data?: { detail?: string } };
      }
      const axiosErr = err as AxiosError;
      setError(axiosErr.response?.data?.detail || "Failed to review fraud flag");
    } finally {
      setReviewing(false);
    }
  };

  const filteredFlags = fraudFlags.filter(flag => 
    filterStatus === "ALL" || flag.status === filterStatus
  );

  if (loading) {
    return (
      <SupportDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </SupportDashboardLayout>
    );
  }

  return (
    <SupportDashboardLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Fraud Detection</h1>
          <p className="text-purple-300">Review and manage suspicious transactions</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-300">{error}</span>
              <button onClick={() => setError("")} className="ml-auto text-red-400">✕</button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-300">{success}</span>
              <button onClick={() => setSuccess("")} className="ml-auto text-emerald-400">✕</button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["ALL", "PENDING", "CONFIRMED_FRAUD", "FALSE_POSITIVE"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                filterStatus === status
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                  : "bg-slate-800/50 text-purple-300 hover:bg-slate-700/50 border border-purple-500/20"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Fraud Flags List */}
        <div className="space-y-4">
          {filteredFlags.length === 0 ? (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/20 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Fraud Flags</h3>
              <p className="text-purple-300">
                {filterStatus === "ALL" ? "All transactions are clean!" : `No ${filterStatus.replace("_", " ").toLowerCase()} flags found`}
              </p>
            </div>
          ) : (
            filteredFlags.map((flag) => (
              <div
                key={flag.id}
                className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        flag.status === "PENDING"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : flag.status === "CONFIRMED_FRAUD"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {flag.status.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-400 font-medium">Risk Score: {(flag.risk_score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-white font-mono text-sm mb-2">
                      Transaction ID: {flag.transaction_id}
                    </div>
                    <div className="text-purple-300 text-sm mb-2">
                      <span className="font-semibold">Reason:</span> {flag.flagged_reason}
                    </div>
                    <div className="text-purple-400 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Flagged {new Date(flag.created_at).toLocaleString()}
                    </div>
                    {flag.reviewed_at && (
                      <div className="text-purple-400 text-sm flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Reviewed {new Date(flag.reviewed_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  {flag.status === "PENDING" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedFlag(flag)}
                        className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg border border-yellow-500/30 font-medium transition-all"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {selectedFlag && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-yellow-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Review Fraud Flag</h3>
              <div className="mb-6">
                <div className="text-purple-300 mb-2">
                  Transaction ID: <span className="font-mono text-white text-sm">{selectedFlag.transaction_id}</span>
                </div>
                <div className="text-purple-300 mb-2">
                  Risk Score: <span className="text-red-400 font-bold">{(selectedFlag.risk_score * 100).toFixed(1)}%</span>
                </div>
                <div className="text-purple-300">
                  Reason: <span className="text-white">{selectedFlag.flagged_reason}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleReview("CONFIRMED_FRAUD")}
                  disabled={reviewing}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {reviewing ? "Processing..." : "Confirm as Fraud"}
                </button>
                <button
                  onClick={() => handleReview("FALSE_POSITIVE")}
                  disabled={reviewing}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-400 text-sm font-medium">Total Flags</div>
            <div className="text-white text-2xl font-bold mt-1">{fraudFlags.length}</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="text-yellow-400 text-sm font-medium">Pending Review</div>
            <div className="text-white text-2xl font-bold mt-1">
              {fraudFlags.filter(f => f.status === "PENDING").length}
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="text-red-400 text-sm font-medium">Confirmed Fraud</div>
            <div className="text-white text-2xl font-bold mt-1">
              {fraudFlags.filter(f => f.status === "CONFIRMED_FRAUD").length}
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-emerald-400 text-sm font-medium">False Positives</div>
            <div className="text-white text-2xl font-bold mt-1">
              {fraudFlags.filter(f => f.status === "FALSE_POSITIVE").length}
            </div>
          </div>
        </div>
      </div>
    </SupportDashboardLayout>
  );
}
