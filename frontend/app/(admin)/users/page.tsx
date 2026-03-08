"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminDashboardLayout from "../components/AdminDashboardLayout";
import { formatDate } from "@/lib/utils";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  totp_enabled: boolean;
  date_joined: string;
  last_login: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);

  const fetchUsers = async (url = "/admin/users/") => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(url);
      const data = response.data;
      setUsers(Array.isArray(data) ? data : data.results || []);
      setNextPage(data.next ?? null);
      setPrevPage(data.previous ?? null);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-purple-300">View and manage all registered users</p>
          </div>
          <button
            onClick={() => fetchUsers()}
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

        {/* Filters */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SUPPORT">Support</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, color: "blue" },
            { label: "Customers", value: users.filter((u) => u.role === "CUSTOMER").length, color: "emerald" },
            { label: "Verified", value: users.filter((u) => u.is_verified).length, color: "purple" },
            { label: "2FA Enabled", value: users.filter((u) => u.totp_enabled).length, color: "yellow" },
          ].map((s) => (
            <div key={s.label} className={`bg-${s.color}-500/10 border border-${s.color}-500/30 rounded-xl p-4`}>
              <div className={`text-${s.color}-400 text-xs font-medium`}>{s.label}</div>
              <div className="text-white text-2xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
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
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">User</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Role</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Verification</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">2FA</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Joined</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-purple-400">No users found</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials(user.full_name)}
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.full_name}</div>
                              <div className="text-purple-400 text-xs">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : user.role === "SUPPORT"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}>{user.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.is_verified
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}>
                            {user.is_verified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.totp_enabled
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                          }`}>
                            {user.totp_enabled ? "Enabled" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-purple-300 text-xs whitespace-nowrap">
                          {user.date_joined ? formatDate(user.date_joined) : "—"}
                        </td>
                        <td className="py-3 px-4 text-purple-300 text-xs whitespace-nowrap">
                          {user.last_login ? formatDate(user.last_login) : "Never"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {(nextPage || prevPage) && (
          <div className="flex justify-center gap-3">
            <button
              onClick={() => prevPage && fetchUsers(prevPage)}
              disabled={!prevPage}
              className="px-4 py-2 bg-slate-800/50 text-purple-300 rounded-xl border border-purple-500/30 disabled:opacity-40 hover:bg-slate-700/50 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => nextPage && fetchUsers(nextPage)}
              disabled={!nextPage}
              className="px-4 py-2 bg-slate-800/50 text-purple-300 rounded-xl border border-purple-500/30 disabled:opacity-40 hover:bg-slate-700/50 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}

