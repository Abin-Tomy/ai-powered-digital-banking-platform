"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SupportDashboardLayout from "../../components/SupportDashboardLayout";
import UserAvatar from "@/components/UserAvatar";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  is_locked: boolean;
  created_at: string;
}

export default function SupportUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users/");
      const data = response.data;
      const allUsers = Array.isArray(data) ? data : data.results || [];
      // Filter to show only customers for support staff
      setUsers(allUsers.filter((u: User) => u.role === "CUSTOMER"));
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Unable to load user list. You may not have permission to view users.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white mb-2">Customer Directory</h1>
          <p className="text-purple-300">View customer information</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-300">{error}</span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/70 backdrop-blur-xl border border-purple-500/30 rounded-xl pl-12 pr-4 py-4 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-4 text-purple-300 font-medium">Customer</th>
                  <th className="text-left p-4 text-purple-300 font-medium">Email</th>
                  <th className="text-left p-4 text-purple-300 font-medium">Status</th>
                  <th className="text-left p-4 text-purple-300 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-purple-400">
                      {searchTerm ? "No customers found matching your search" : "No customers available"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            name={`${user.first_name} ${user.last_name}`} 
                            email={user.email} 
                            size="sm" 
                          />
                          <div>
                            <div className="text-white font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-purple-300">{user.email}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {user.is_verified ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              Unverified
                            </span>
                          )}
                          {user.is_locked && (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                              Locked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-purple-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-400 text-sm font-medium">Total Customers</div>
            <div className="text-white text-2xl font-bold mt-1">{users.length}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-emerald-400 text-sm font-medium">Verified</div>
            <div className="text-white text-2xl font-bold mt-1">
              {users.filter(u => u.is_verified).length}
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="text-red-400 text-sm font-medium">Locked Accounts</div>
            <div className="text-white text-2xl font-bold mt-1">
              {users.filter(u => u.is_locked).length}
            </div>
          </div>
        </div>
      </div>
    </SupportDashboardLayout>
  );
}
