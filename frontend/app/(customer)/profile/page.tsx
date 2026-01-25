"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import DashboardLayout from "../components/DashboardLayout";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: string;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      const [profileRes, accountsRes] = await Promise.all([
        api.get("/auth/me/", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/accounts/my/", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setProfile(profileRes.data);
      setAccounts(accountsRes.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-purple-300">View and manage your account information</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-3xl">
                    {profile.first_name?.[0] || profile.email[0].toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-purple-400 mb-4">{profile.email}</p>
                
                <div className="flex justify-center gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {profile.role}
                  </span>
                  {profile.is_verified ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="border-t border-purple-500/20 pt-4">
                  <p className="text-purple-400 text-sm">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                  <div className="text-purple-400 text-sm font-medium mb-2">Total Accounts</div>
                  <div className="text-3xl font-bold text-white">{accounts.length}</div>
                </div>
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
                  <div className="text-emerald-400 text-sm font-medium mb-2">Total Balance</div>
                  <div className="text-3xl font-bold text-emerald-400">
                    ${getTotalBalance().toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
                  <div className="text-blue-400 text-sm font-medium mb-2">Active Accounts</div>
                  <div className="text-3xl font-bold text-white">
                    {accounts.filter(a => a.status === "ACTIVE").length}
                  </div>
                </div>
              </div>

              {/* Accounts List */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-4">My Accounts</h3>
                <div className="space-y-3">
                  {accounts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-purple-400">No accounts found</p>
                    </div>
                  ) : (
                    accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-purple-500/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            account.account_type === "SAVINGS"
                              ? "bg-blue-500/20"
                              : "bg-purple-500/20"
                          }`}>
                            <svg className={`w-6 h-6 ${
                              account.account_type === "SAVINGS"
                                ? "text-blue-400"
                                : "text-purple-400"
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-mono font-medium">{account.account_number}</div>
                            <div className="text-purple-400 text-sm">{account.account_type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold text-lg">
                            ${parseFloat(account.balance).toLocaleString()}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            account.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : account.status === "FROZEN"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {account.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">Email Verification</div>
                        <div className="text-purple-400 text-sm">
                          {profile.is_verified ? "Your email is verified" : "Please verify your email"}
                        </div>
                      </div>
                    </div>
                    {profile.is_verified ? (
                      <span className="text-emerald-400 text-sm">✓ Verified</span>
                    ) : (
                      <button className="text-purple-400 hover:text-purple-300 text-sm">
                        Verify Now →
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">Password</div>
                        <div className="text-purple-400 text-sm">Manage your password</div>
                      </div>
                    </div>
                    <a href="/forget-password" className="text-purple-400 hover:text-purple-300 text-sm">
                      Change Password →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
