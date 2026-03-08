"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SupportDashboardLayout from "../../components/SupportDashboardLayout";
import { formatDateTime } from "@/lib/utils";

interface FraudFlag {
  id: string;
  transaction: string;
  status: "CLEAR" | "SUSPICIOUS" | "CONFIRMED_FRAUD" | "FALSE_POSITIVE";
  risk_score: number;
  reasons: string[];
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export default function SupportFraudPage() {
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("SUSPICIOUS");

  useEffect(() => {
    fetchFraudFlags();
  }, []);

  const fetchFraudFlags = async () => {
    setLoading(true);
    try {
      const res = await api.get("/fraud/flags/?page_size=100");
      const data = res.data;
      setFraudFlags(Array.isArray(data) ? data : data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decision: "CONFIRMED_FRAUD" | "FALSE_POSITIVE") => {
    if (!selectedFlag) return;

    setReviewing(true);
    try {
      await api.post(`/fraud/review/${selectedFlag.id}/`, { status: decision });
      setSelectedFlag(null);
      await fetchFraudFlags();
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

        {/* Error / Success Messages removed — silent fail */}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["ALL", "SUSPICIOUS", "CONFIRMED_FRAUD", "FALSE_POSITIVE", "CLEAR"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                filterStatus === status
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                  : "bg-slate-800/50 text-purple-300 hover:bg-slate-700/50 border border-purple-500/20"
              }`}
            >
              {status.replace(/_/g, " ")}
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
                        flag.status === "SUSPICIOUS"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : flag.status === "CONFIRMED_FRAUD"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : flag.status === "FALSE_POSITIVE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}>
                        {flag.status.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-400 font-medium">Risk Score: {flag.risk_score}%</span>
                      </div>
                    </div>
                    <div className="text-white font-mono text-sm mb-2">
                      Transaction: {flag.transaction}
                    </div>
                    <div className="text-purple-300 text-sm mb-2">
                      <span className="font-semibold">Reasons:</span>{" "}
                      {Array.isArray(flag.reasons) ? flag.reasons.join(", ") : flag.reasons}
                    </div>
                    <div className="text-purple-400 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Flagged {formatDateTime(flag.created_at)}
                    </div>
                    {flag.reviewed_at && (
                      <div className="text-purple-400 text-sm flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Reviewed {formatDateTime(flag.reviewed_at)}
                      </div>
                    )}
                  </div>
                  {flag.status === "SUSPICIOUS" && (
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
                  Transaction: <span className="font-mono text-white text-sm">{selectedFlag.transaction}</span>
                </div>
                <div className="text-purple-300 mb-2">
                  Risk Score: <span className="text-red-400 font-bold">{selectedFlag.risk_score}%</span>
                </div>
                <div className="text-purple-300">
                  Reasons: <span className="text-white">{Array.isArray(selectedFlag.reasons) ? selectedFlag.reasons.join(", ") : selectedFlag.reasons}</span>
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
            <div className="text-yellow-400 text-sm font-medium">Suspicious</div>
            <div className="text-white text-2xl font-bold mt-1">
              {fraudFlags.filter(f => f.status === "SUSPICIOUS").length}
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
