"use client";

import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/AdminDashboardLayout";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CCApplication {
  id: string;
  application_number: string;
  user: string;
  user_name: string;
  user_email: string;
  card_type: string;
  card_type_name: string;
  requested_credit_limit: number;
  annual_income: number;
  employment_type: string;
  company_name: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  remarks: string | null;
  approved_credit_limit: number | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function AdminCreditCardsPage() {
  const [applications, setApplications] = useState<CCApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [approveTarget, setApproveTarget] = useState<CCApplication | null>(null);
  const [approvedLimit, setApprovedLimit] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<CCApplication | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/credit-cards/admin/applications/");
      const data = res.data;
      setApplications(Array.isArray(data) ? data : data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = applications.filter((app) => {
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      app.user_name.toLowerCase().includes(q) ||
      app.user_email.toLowerCase().includes(q) ||
      app.application_number.toLowerCase().includes(q) ||
      app.card_type_name.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    approved: applications.filter((a) => a.status === "APPROVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  const handleApprove = async () => {
    if (!approveTarget || !approvedLimit) return;
    setApproveLoading(true);
    try {
      await api.patch(`/credit-cards/applications/${approveTarget.id}/`, {
        status: "APPROVED",
        approved_credit_limit: parseFloat(approvedLimit),
      });
      setApproveTarget(null);
      setApprovedLimit("");
      await fetchApplications();
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      await api.patch(`/credit-cards/applications/${rejectTarget.id}/`, {
        status: "REJECTED",
        remarks: rejectRemarks || undefined,
      });
      setRejectTarget(null);
      setRejectRemarks("");
      await fetchApplications();
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Credit Card Applications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and process credit card applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-gray-700 dark:text-gray-300" },
            { label: "Pending", value: stats.pending, color: "text-yellow-600" },
            { label: "Approved", value: stats.approved, color: "text-green-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by name, email, card type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    {["Application #", "Applicant", "Card Type", "Requested Limit", "Annual Income", "Status", "Applied", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                        {app.application_number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {app.user_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {app.user_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {app.card_type_name}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {formatCurrency(app.requested_credit_limit)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {formatCurrency(app.annual_income)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {app.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setApproveTarget(app);
                                setApprovedLimit(String(app.requested_credit_limit));
                              }}
                              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectTarget(app);
                                setRejectRemarks("");
                              }}
                              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {app.approved_credit_limit
                              ? formatCurrency(app.approved_credit_limit)
                              : app.remarks ?? "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {approveTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Approve Application
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Applicant:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {approveTarget.user_name}
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Card Type:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {approveTarget.card_type_name}
              </span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Approved Credit Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={approvedLimit}
                onChange={(e) => setApprovedLimit(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 50000"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setApproveTarget(null);
                  setApprovedLimit("");
                }}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approveLoading || !approvedLimit}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {approveLoading ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reject Application
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Applicant:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {rejectTarget.user_name}
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Card Type:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {rejectTarget.card_type_name}
              </span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks (optional)
              </label>
              <textarea
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Reason for rejection..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectRemarks("");
                }}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectLoading}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {rejectLoading ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
