"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import SupportDashboardLayout from "../components/SupportDashboardLayout";

interface CustomerProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_locked: boolean;
  date_joined: string;
}

interface AccountData {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
  balance: number;
}

interface TransactionData {
  id: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

interface LoanAppData {
  id: string;
  loan_type: string;
  requested_amount: number;
  status: string;
  applied_at: string;
}

interface ActiveLoanData {
  id: string;
  principal_amount: number;
  outstanding_balance: number;
  monthly_emi: number;
  status: string;
}

interface FraudData {
  id: string;
  risk_score: number;
  status: string;
  reasons: string[];
  created_at: string;
}

interface CardData {
  id: string;
  last_four: string;
  credit_limit: number;
  available_credit: number;
  status: string;
}

interface NotifData {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Customer360Data {
  customer: CustomerProfile;
  accounts: AccountData[];
  recent_transactions: TransactionData[];
  loan_applications: LoanAppData[];
  active_loans: ActiveLoanData[];
  fraud_flags: FraudData[];
  credit_cards: CardData[];
  recent_notifications: NotifData[];
}

export default function Customer360Page() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState(searchParams.get("user_id") || "");
  const [searchInput, setSearchInput] = useState(userId);
  const [data, setData] = useState<Customer360Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomer = async (id: string) => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      const res = await api.get(`/support/customer360/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch {
      setError("Customer not found or access denied.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchCustomer(userId);
  }, [userId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUserId(searchInput.trim());
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "text-emerald-400 bg-emerald-500/20",
      FROZEN: "text-yellow-400 bg-yellow-500/20",
      CLOSED: "text-red-400 bg-red-500/20",
      APPROVED: "text-emerald-400 bg-emerald-500/20",
      REJECTED: "text-red-400 bg-red-500/20",
      PENDING: "text-yellow-400 bg-yellow-500/20",
      SUSPICIOUS: "text-orange-400 bg-orange-500/20",
      CONFIRMED_FRAUD: "text-red-400 bg-red-500/20",
      SUCCESS: "text-emerald-400 bg-emerald-500/20",
      FAILED: "text-red-400 bg-red-500/20",
      BLOCKED: "text-red-400 bg-red-500/20",
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${colors[s] || "text-purple-300 bg-purple-500/20"}`}>
        {s}
      </span>
    );
  };

  return (
    <SupportDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer 360</h1>
          <p className="text-purple-300">Comprehensive customer profile view</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter customer User ID..."
            className="flex-1 bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all">
            Search
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">{error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Customer Profile Card */}
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Customer Profile</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-purple-400 text-xs">Name</span>
                  <p className="text-white font-medium">{data.customer.full_name}</p>
                </div>
                <div>
                  <span className="text-purple-400 text-xs">Email</span>
                  <p className="text-white font-medium text-sm">{data.customer.email}</p>
                </div>
                <div>
                  <span className="text-purple-400 text-xs">Status</span>
                  <div className="flex gap-2 mt-1">
                    {data.customer.is_active ? statusBadge("ACTIVE") : statusBadge("INACTIVE")}
                    {data.customer.is_locked && <span className="px-2 py-1 rounded-lg text-xs font-medium text-red-400 bg-red-500/20">LOCKED</span>}
                    {data.customer.is_verified && <span className="px-2 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/20">VERIFIED</span>}
                  </div>
                </div>
                <div>
                  <span className="text-purple-400 text-xs">Joined</span>
                  <p className="text-white font-medium">{new Date(data.customer.date_joined).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Accounts */}
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Accounts ({data.accounts.length})</h3>
              {data.accounts.length === 0 ? (
                <p className="text-purple-400 text-sm">No accounts</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.accounts.map((acc) => (
                    <div key={acc.id} className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{acc.account_number}</p>
                          <p className="text-purple-400 text-xs">{acc.account_type}</p>
                        </div>
                        {statusBadge(acc.status)}
                      </div>
                      <p className="text-emerald-400 font-bold text-xl mt-2">₹{acc.balance.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Recent Transactions ({data.recent_transactions.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-purple-500/20">
                      <th className="py-2 px-3 text-purple-300 font-medium">Date</th>
                      <th className="py-2 px-3 text-purple-300 font-medium">Type</th>
                      <th className="py-2 px-3 text-purple-300 font-medium">Description</th>
                      <th className="py-2 px-3 text-purple-300 font-medium text-right">Amount</th>
                      <th className="py-2 px-3 text-purple-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_transactions.map((t) => (
                      <tr key={t.id} className="border-b border-purple-500/10">
                        <td className="py-2 px-3 text-purple-400 text-xs">{new Date(t.created_at).toLocaleString()}</td>
                        <td className="py-2 px-3"><span className={t.type === "CREDIT" ? "text-emerald-400" : "text-red-400"}>{t.type}</span></td>
                        <td className="py-2 px-3 text-white text-xs">{t.description}</td>
                        <td className={`py-2 px-3 text-right font-medium ${t.type === "CREDIT" ? "text-emerald-400" : "text-red-400"}`}>₹{t.amount.toLocaleString()}</td>
                        <td className="py-2 px-3">{statusBadge(t.status)}</td>
                      </tr>
                    ))}
                    {data.recent_transactions.length === 0 && (
                      <tr><td colSpan={5} className="py-4 text-center text-purple-400">No transactions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Loans + Credit Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Applications */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Loan Applications ({data.loan_applications.length})</h3>
                {data.loan_applications.map((la) => (
                  <div key={la.id} className="flex justify-between items-center py-2 border-b border-purple-500/10">
                    <div>
                      <p className="text-white text-sm">{la.loan_type}</p>
                      <p className="text-purple-400 text-xs">₹{la.requested_amount.toLocaleString()} · {new Date(la.applied_at).toLocaleDateString()}</p>
                    </div>
                    {statusBadge(la.status)}
                  </div>
                ))}
                {data.loan_applications.length === 0 && <p className="text-purple-400 text-sm">No loan applications</p>}

                {data.active_loans.length > 0 && (
                  <>
                    <h4 className="text-white font-semibold mt-4 mb-2">Active Loans</h4>
                    {data.active_loans.map((ln) => (
                      <div key={ln.id} className="bg-slate-800/50 rounded-lg p-3 mb-2 border border-purple-500/10">
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-xs">Principal: ₹{ln.principal_amount.toLocaleString()}</span>
                          <span className="text-purple-300 text-xs">EMI: ₹{ln.monthly_emi.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-yellow-400 text-xs">Outstanding: ₹{ln.outstanding_balance.toLocaleString()}</span>
                          {statusBadge(ln.status)}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Credit Cards */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Credit Cards ({data.credit_cards.length})</h3>
                {data.credit_cards.map((c) => (
                  <div key={c.id} className="bg-slate-800/50 rounded-lg p-4 mb-3 border border-purple-500/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">••••  ••••  ••••  {c.last_four}</p>
                        <p className="text-purple-400 text-xs mt-1">Limit: ₹{c.credit_limit.toLocaleString()}</p>
                      </div>
                      {statusBadge(c.status)}
                    </div>
                    <p className="text-emerald-400 text-sm mt-2">Available: ₹{c.available_credit.toLocaleString()}</p>
                  </div>
                ))}
                {data.credit_cards.length === 0 && <p className="text-purple-400 text-sm">No credit cards</p>}
              </div>
            </div>

            {/* Fraud Flags */}
            {data.fraud_flags.length > 0 && (
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Fraud Flags ({data.fraud_flags.length})</h3>
                {data.fraud_flags.map((f) => (
                  <div key={f.id} className="flex justify-between items-center py-2 border-b border-red-500/10">
                    <div>
                      <p className="text-white text-sm">Risk Score: <span className="text-red-400 font-bold">{f.risk_score}</span></p>
                      <p className="text-purple-400 text-xs">{f.reasons.join(", ")} · {new Date(f.created_at).toLocaleString()}</p>
                    </div>
                    {statusBadge(f.status)}
                  </div>
                ))}
              </div>
            )}

            {/* Recent Notifications */}
            {data.recent_notifications.length > 0 && (
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Recent Notifications</h3>
                <div className="space-y-2">
                  {data.recent_notifications.map((n) => (
                    <div key={n.id} className={`p-3 rounded-lg border border-purple-500/10 ${n.is_read ? "bg-slate-800/30" : "bg-purple-900/20"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-400">{n.type}</span>
                        <span className="text-white text-sm font-medium">{n.title}</span>
                      </div>
                      <p className="text-purple-300 text-xs mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SupportDashboardLayout>
  );
}
