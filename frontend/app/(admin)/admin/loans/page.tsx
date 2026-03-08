"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminDashboardLayout from "../../components/AdminDashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LoanApplication {
  id: string;
  applicant: number;
  applicant_name: string;
  loan_type: number;
  loan_type_name: string;
  requested_amount: number;
  tenure_months: number;
  purpose: string;
  annual_income: number;
  employment_type: string;
  status: string;
  applied_at: string;
  reviewed_at: string | null;
  approved_amount: number | null;
  approved_rate: number | null;
  rejection_reason: string | null;
}

export default function LoanApplicationsPage() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approvedRate, setApprovedRate] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/loans/admin/applications/");
      const data = res.data;
      setApplications(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to load loan applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const openReview = (app: LoanApplication, actionType: "approve" | "reject") => {
    setSelectedApp(app);
    setAction(actionType);
    setApprovedAmount(app.requested_amount.toString());
    setApprovedRate("");
    setNotes("");
    setError("");
  };

  const handleReview = async () => {
    if (!selectedApp || !action) return;
    setProcessing(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { action };
      if (action === "approve") {
        if (approvedAmount) payload.approved_amount = parseFloat(approvedAmount);
        if (approvedRate) payload.approved_rate = parseFloat(approvedRate);
      }
      if (notes) payload.notes = notes;

      await api.post(`/loans/admin/applications/${selectedApp.id}/approve/`, payload);
      setSuccess(`Loan application ${action === "approve" ? "approved" : "rejected"} successfully`);
      setSelectedApp(null);
      setAction(null);
      fetchApplications();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || `Failed to ${action} application`);
    } finally {
      setProcessing(false);
    }
  };

  const filtered = applications.filter((a) => {
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    const matchSearch =
      a.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.loan_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusBadge = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "APPROVED": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "REJECTED": return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "DISBURSED": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    approved: applications.filter((a) => a.status === "APPROVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Loan Applications</h1>
            <p className="text-purple-300">Review and approve loan requests</p>
          </div>
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2 rounded-xl border border-purple-500/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

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
            { label: "Total", value: counts.total, color: "purple" },
            { label: "Pending Review", value: counts.pending, color: "yellow" },
            { label: "Approved", value: counts.approved, color: "emerald" },
            { label: "Rejected", value: counts.rejected, color: "red" },
          ].map((s) => (
            <div key={s.label} className={`bg-${s.color}-500/10 border border-${s.color}-500/30 rounded-xl p-4`}>
              <div className={`text-${s.color}-400 text-xs font-medium`}>{s.label}</div>
              <div className="text-white text-2xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by applicant, loan type, or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DISBURSED">Disbursed</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20 bg-slate-800/30">
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Applicant</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Loan Type</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Amount</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Tenure</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Status</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Applied</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-purple-400">No applications found</td>
                    </tr>
                  ) : filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{app.applicant_name}</div>
                        <div className="text-purple-400 text-xs">{app.employment_type}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {app.loan_type_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{formatCurrency(app.requested_amount)}</td>
                      <td className="py-3 px-4 text-purple-300">{app.tenure_months}m</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-purple-300 text-xs">{formatDate(app.applied_at)}</td>
                      <td className="py-3 px-4">
                        {app.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openReview(app, "approve")}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg border border-emerald-500/30 text-xs font-medium transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openReview(app, "reject")}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 text-xs font-medium transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {app.status !== "PENDING" && (
                          <span className="text-purple-400 text-xs">
                            {app.reviewed_at ? formatDate(app.reviewed_at) : "—"}
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

        {/* Review Modal */}
        {selectedApp && action && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-slate-900 rounded-2xl p-8 max-w-lg w-full border ${action === "approve" ? "border-emerald-500/30" : "border-red-500/30"}`}>
              <h3 className="text-xl font-bold text-white mb-1">
                {action === "approve" ? "Approve Loan Application" : "Reject Loan Application"}
              </h3>
              <p className="text-purple-300 text-sm mb-6">
                Applicant: <span className="text-white font-medium">{selectedApp.applicant_name}</span>
              </p>

              {/* Application summary */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-purple-400">Loan Type</span>
                  <div className="text-white font-medium">{selectedApp.loan_type_name}</div>
                </div>
                <div>
                  <span className="text-purple-400">Requested</span>
                  <div className="text-white font-medium">{formatCurrency(selectedApp.requested_amount)}</div>
                </div>
                <div>
                  <span className="text-purple-400">Tenure</span>
                  <div className="text-white font-medium">{selectedApp.tenure_months} months</div>
                </div>
                <div>
                  <span className="text-purple-400">Annual Income</span>
                  <div className="text-white font-medium">{formatCurrency(selectedApp.annual_income)}</div>
                </div>
              </div>

              {action === "approve" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-purple-300 text-sm mb-2">Approved Amount (₹)</label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-xl text-white focus:outline-none focus:border-emerald-400"
                      placeholder="Leave blank to use requested amount"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-300 text-sm mb-2">Interest Rate (%) <span className="text-purple-500">(optional)</span></label>
                    <input
                      type="number"
                      value={approvedRate}
                      onChange={(e) => setApprovedRate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-xl text-white focus:outline-none focus:border-emerald-400"
                      placeholder="Leave blank to use default rate"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-purple-300 text-sm mb-2">
                  {action === "approve" ? "Notes (optional)" : "Rejection Reason"}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white focus:outline-none resize-none ${action === "approve" ? "border-purple-500/30 focus:border-purple-400" : "border-red-500/30 focus:border-red-400"} placeholder-purple-500`}
                  placeholder={action === "approve" ? "Optional admin notes..." : "Provide a reason for rejection..."}
                />
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={handleReview}
                  disabled={processing}
                  className={`flex-1 text-white font-bold py-3 rounded-xl disabled:opacity-50 ${action === "approve" ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-red-600 to-orange-600"}`}
                >
                  {processing ? "Processing..." : action === "approve" ? "Approve Loan" : "Reject Application"}
                </button>
                <button
                  onClick={() => { setSelectedApp(null); setAction(null); }}
                  className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all"
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
