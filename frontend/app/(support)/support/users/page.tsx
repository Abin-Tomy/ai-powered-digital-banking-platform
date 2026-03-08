"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import SupportDashboardLayout from "../../components/SupportDashboardLayout";
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

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SupportUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/?page=${page}&page_size=20`);
      const data = res.data;
      const all: User[] = Array.isArray(data) ? data : data.results ?? [];
      setUsers(all.filter((u: User) => u.role === "CUSTOMER"));
      setTotalCount(data.count ?? all.length);
      setNextUrl(data.next ?? null);
      setPrevUrl(data.previous ?? null);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      !searchTerm ||
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const verifiedCount = users.filter((u) => u.is_verified).length;

  return (
    <SupportDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Customer List</h1>
          <p className="text-purple-300 mt-1">{totalCount} total customers</p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/70 backdrop-blur-xl border border-purple-500/30 rounded-xl pl-12 pr-4 py-4 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-400 text-sm">Total Customers</div>
            <div className="text-white text-2xl font-bold">{totalCount}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-emerald-400 text-sm">Verified</div>
            <div className="text-white text-2xl font-bold">{verifiedCount}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-slate-800/50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left p-4 text-purple-300 font-medium text-sm">
                      Customer
                    </th>
                    <th className="text-left p-4 text-purple-300 font-medium text-sm">
                      Email
                    </th>
                    <th className="text-left p-4 text-purple-300 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left p-4 text-purple-300 font-medium text-sm">
                      Member Since
                    </th>
                    <th className="text-left p-4 text-purple-300 font-medium text-sm">
                      Last Login
                    </th>
                    <th className="text-left p-4 text-purple-300 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-purple-400">
                        {searchTerm
                          ? `No customers found for "${searchTerm}"`
                          : "No customers"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials(user.full_name)}
                            </div>
                            <span className="text-white font-medium">
                              {user.full_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-purple-300 text-sm">
                          {user.email}
                        </td>
                        <td className="p-4">
                          {user.is_verified ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-purple-400 text-sm">
                          {formatDate(user.date_joined)}
                        </td>
                        <td className="p-4 text-purple-400 text-sm">
                          {user.last_login ? formatDate(user.last_login) : "Never"}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                router.push(`/customer360?user_id=${user.id}`)
                              }
                              className="px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded border border-purple-500/30 transition-all"
                            >
                              View 360
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/chat?customer=${user.id}`)
                              }
                              className="px-2 py-1 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded border border-indigo-500/30 transition-all"
                            >
                              Chat
                            </button>
                          </div>
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
        {(prevUrl || nextUrl) && (
          <div className="flex justify-center gap-3">
            <button
              disabled={!prevUrl}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-5 py-2 rounded-xl bg-slate-800/50 text-purple-300 border border-purple-500/20 disabled:opacity-40 hover:bg-slate-700/50 transition-all"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-purple-400">Page {page}</span>
            <button
              disabled={!nextUrl}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2 rounded-xl bg-slate-800/50 text-purple-300 border border-purple-500/20 disabled:opacity-40 hover:bg-slate-700/50 transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </SupportDashboardLayout>
  );
}