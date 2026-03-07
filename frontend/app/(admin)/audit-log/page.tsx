"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminDashboardLayout from "../components/AdminDashboardLayout";

interface AuditEntry {
  id: number;
  user: number | null;
  user_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  detail: string;
  ip_address: string | null;
  created_at: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState("/admin/audit-log/");

  const fetchLogs = async (url: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
      // Handle paginated or non-paginated response
      if (res.data.results) {
        setLogs(res.data.results);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
      } else {
        setLogs(Array.isArray(res.data) ? res.data : []);
        setNextPage(null);
        setPrevPage(null);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = actionFilter ? `?action=${actionFilter}` : "";
    const url = `/admin/audit-log/${params}`;
    setCurrentUrl(url);
    fetchLogs(url);
  }, [actionFilter]);

  const actionColors: Record<string, string> = {
    LOGIN_SUCCESS: "text-emerald-400 bg-emerald-500/20",
    LOGIN_FAILED: "text-red-400 bg-red-500/20",
    LOGOUT: "text-blue-400 bg-blue-500/20",
    PASSWORD_RESET: "text-yellow-400 bg-yellow-500/20",
    TRANSFER: "text-cyan-400 bg-cyan-500/20",
    LOAN_APPROVED: "text-emerald-400 bg-emerald-500/20",
    LOAN_REJECTED: "text-red-400 bg-red-500/20",
    FRAUD_REVIEW: "text-orange-400 bg-orange-500/20",
    CREDIT_CARD_APPROVED: "text-emerald-400 bg-emerald-500/20",
    CREDIT_CARD_REJECTED: "text-red-400 bg-red-500/20",
  };

  const uniqueActions = [
    "LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT", "PASSWORD_RESET",
    "TRANSFER", "LOAN_APPROVED", "LOAN_REJECTED", "FRAUD_REVIEW",
    "CREDIT_CARD_APPROVED", "CREDIT_CARD_REJECTED",
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Audit Log</h1>
            <p className="text-purple-300">Track all system activity</p>
          </div>
          <button
            onClick={() => fetchLogs(currentUrl)}
            className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2 rounded-xl border border-purple-500/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActionFilter("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!actionFilter ? "bg-purple-600 text-white" : "bg-slate-800/50 text-purple-300 hover:bg-slate-700/50"}`}
            >
              All
            </button>
            {uniqueActions.map((a) => (
              <button
                key={a}
                onClick={() => setActionFilter(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${actionFilter === a ? "bg-purple-600 text-white" : "bg-slate-800/50 text-purple-300 hover:bg-slate-700/50"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-purple-500/20 bg-slate-800/30">
                    <th className="py-3 px-4 text-purple-300 font-medium">Timestamp</th>
                    <th className="py-3 px-4 text-purple-300 font-medium">Action</th>
                    <th className="py-3 px-4 text-purple-300 font-medium">User</th>
                    <th className="py-3 px-4 text-purple-300 font-medium">Resource</th>
                    <th className="py-3 px-4 text-purple-300 font-medium">Detail</th>
                    <th className="py-3 px-4 text-purple-300 font-medium">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-purple-500/10 hover:bg-slate-800/50">
                      <td className="py-3 px-4 text-purple-400 text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${actionColors[log.action] || "text-purple-300 bg-purple-500/20"}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white text-xs">{log.user_email || "—"}</td>
                      <td className="py-3 px-4 text-purple-300 text-xs">{log.resource_type} {log.resource_id && `#${log.resource_id}`}</td>
                      <td className="py-3 px-4 text-purple-400 text-xs max-w-xs truncate">{log.detail || "—"}</td>
                      <td className="py-3 px-4 text-purple-500 text-xs">{log.ip_address || "—"}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-purple-400">No audit logs found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {(prevPage || nextPage) && (
            <div className="flex justify-between items-center p-4 border-t border-purple-500/20">
              <button
                onClick={() => prevPage && fetchLogs(prevPage.replace(/^https?:\/\/[^/]+/, ""))}
                disabled={!prevPage}
                className="px-4 py-2 rounded-lg bg-slate-800/50 text-purple-300 disabled:opacity-30 hover:bg-slate-700/50 transition-all text-sm"
              >
                ← Previous
              </button>
              <button
                onClick={() => nextPage && fetchLogs(nextPage.replace(/^https?:\/\/[^/]+/, ""))}
                disabled={!nextPage}
                className="px-4 py-2 rounded-lg bg-slate-800/50 text-purple-300 disabled:opacity-30 hover:bg-slate-700/50 transition-all text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
