"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminDashboardLayout from "../components/AdminDashboardLayout";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
}

interface CreateAccountForm {
  owner_id: string;
  account_type: "SAVINGS" | "CURRENT" | "INVESTMENT";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [accountForm, setAccountForm] = useState<CreateAccountForm>({
    owner_id: "",
    account_type: "SAVINGS"
  });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await api.get("/admin/users/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedUser) return;

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access_token");
      await api.post("/accounts/create/", {
        owner_id: selectedUser.id,
        account_type: accountForm.account_type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`${accountForm.account_type} account created successfully for ${selectedUser.full_name}!`);
      setShowCreateAccount(false);
      setSelectedUser(null);
      setAccountForm({ owner_id: "", account_type: "SAVINGS" });
    } catch (err: unknown) {
      interface AxiosError {
        response?: { data?: { detail?: string } };
      }
      const axiosErr = err as AxiosError;
      setError(axiosErr.response?.data?.detail || "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
            <p className="text-purple-300">View all registered users and create accounts</p>
          </div>
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

        {/* Search */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-4 text-purple-300 font-semibold">Name</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Email</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Role</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Status</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-purple-300">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-white font-medium">{user.full_name}</td>
                      <td className="p-4 text-purple-300">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : user.role === "SUPPORT"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_verified
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}>
                          {user.is_verified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.role === "CUSTOMER" && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setAccountForm({ ...accountForm, owner_id: user.id });
                              setShowCreateAccount(true);
                            }}
                            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg border border-purple-500/30 text-sm font-medium transition-all"
                          >
                            Create Account
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Account Modal */}
        {showCreateAccount && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Create Account</h3>
              <p className="text-purple-300 mb-6">
                Creating account for: <span className="font-semibold text-white">{selectedUser.full_name}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-2">
                    Account Type
                  </label>
                  <select
                    value={accountForm.account_type}
                    onChange={(e) => setAccountForm({ ...accountForm, account_type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                    <option value="INVESTMENT">Investment Account</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateAccount}
                    disabled={creating}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create Account"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateAccount(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="text-blue-400 text-sm font-medium">Total Users</div>
            <div className="text-white text-2xl font-bold mt-1">{users.length}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-emerald-400 text-sm font-medium">Customers</div>
            <div className="text-white text-2xl font-bold mt-1">
              {users.filter(u => u.role === "CUSTOMER").length}
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-400 text-sm font-medium">Verified</div>
            <div className="text-white text-2xl font-bold mt-1">
              {users.filter(u => u.is_verified).length}
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}