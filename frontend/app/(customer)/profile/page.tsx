"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  totp_enabled: boolean;
  date_joined: string;
  last_login: string | null;
}

interface Session {
  session_id: string;
  device_info: string;
  browser: string;
  ip_address: string;
  created_at: string;
  last_active: string;
}

type Tab = "personal" | "security" | "sessions" | "2fa";

const AVATAR_COLORS = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444",
  "#f59e0b", "#ec4899", "#6366f1", "#14b8a6",
];

function getAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (fullName.slice(0, 2) || "??").toUpperCase();
}

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  // Personal info
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Change password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokeMsg, setRevokeMsg] = useState("");

  // 2FA
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpStep, setTotpStep] = useState<"idle" | "setup" | "disable">("idle");
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpMsg, setTotpMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/auth/me/");
      setProfile(res.data);
      setEditName(res.data.full_name);
      setTotpEnabled(res.data.totp_enabled ?? false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get("/users/sessions/");
      setSessions(res.data);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (activeTab === "sessions") fetchSessions();
  }, [activeTab, fetchSessions]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await api.put("/users/profile/update/", { full_name: editName.trim() });
      setProfile(res.data);
      setSaveMsg({ text: "Profile updated successfully", ok: true });
    } catch {
      setSaveMsg({ text: "Failed to update profile", ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const passwordStrength = (pw: string): number => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (newPw.length < 8) {
      setPwMsg({ text: "New password must be at least 8 characters", ok: false });
      return;
    }
    if (newPw === currentPw) {
      setPwMsg({ text: "New password must differ from current password", ok: false });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ text: "Passwords do not match", ok: false });
      return;
    }
    setPwLoading(true);
    try {
      await api.post("/users/change-password/", { current_password: currentPw, new_password: newPw });
      setPwMsg({ text: "Password changed. Logging out in 2 seconds...", ok: true });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login";
      }, 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to change password";
      setPwMsg({ text: msg, ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/users/sessions/${sessionId}/`);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      setRevokeMsg("Session revoked");
      setTimeout(() => setRevokeMsg(""), 2000);
    } catch { /* ignore */ }
  };

  const revokeAllOther = async () => {
    const others = sessions.slice(1);
    await Promise.all(others.map(s => api.delete(`/users/sessions/${s.session_id}/`).catch(() => {})));
    await fetchSessions();
    setRevokeMsg(`${others.length} session${others.length !== 1 ? "s" : ""} revoked`);
    setTimeout(() => setRevokeMsg(""), 2000);
  };

  const handleSetup2FA = async () => {
    setTotpMsg(null);
    try {
      const res = await api.post("/auth/2fa/setup/");
      setQrCode(res.data.qr_code);
      setManualKey(res.data.manual_entry_key);
      setTotpStep("setup");
    } catch {
      setTotpMsg({ text: "Failed to set up 2FA. Try again.", ok: false });
    }
  };

  const handleVerify2FA = async () => {
    setTotpMsg(null);
    try {
      await api.post("/auth/2fa/verify/", { code: totpCode });
      setTotpEnabled(true);
      setTotpStep("idle");
      setTotpCode("");
      setTotpMsg({ text: "2FA enabled successfully!", ok: true });
    } catch {
      setTotpMsg({ text: "Invalid code. Try again.", ok: false });
    }
  };

  const handleDisable2FA = async () => {
    setTotpMsg(null);
    try {
      await api.post("/auth/2fa/disable/", { code: totpCode });
      setTotpEnabled(false);
      setTotpStep("idle");
      setTotpCode("");
      setTotpMsg({ text: "2FA has been disabled.", ok: true });
    } catch {
      setTotpMsg({ text: "Invalid code.", ok: false });
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(manualKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Active now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const pwStrength = passwordStrength(newPw);
  const pwStrengthColors = ["", "bg-red-500", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"];
  const pwStrengthLabels = ["", "Weak", "Weak", "Fair", "Strong", "Very Strong"];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  const avatarColor = getAvatarColor(profile.email);
  const initials = getInitials(profile.full_name);
  const roleBadgeClass =
    profile.role === "ADMIN"
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : profile.role === "SUPPORT"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-purple-500/20 text-purple-400 border-purple-500/30";

  const tabs: { id: Tab; label: string }[] = [
    { id: "personal", label: "Personal Info" },
    { id: "security", label: "Security" },
    { id: "sessions", label: "Sessions" },
    { id: "2fa", label: "2FA" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Profile</h1>
          <p className="text-purple-300">Manage your account information and security</p>
        </div>

        {/* Profile header */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white">{profile.full_name}</h2>
            <p className="text-purple-400">{profile.email}</p>
            <p className="text-purple-500 text-sm mt-0.5">Member since {formatDate(profile.date_joined)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${roleBadgeClass}`}>
            {profile.role}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-purple-500/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-purple-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">

          {/* TAB 1 â€” Personal Info */}
          {activeTab === "personal" && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-white">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-300 text-sm font-medium mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-purple-300 text-sm font-medium mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full bg-slate-800/20 border border-purple-500/10 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-purple-600 text-xs mt-1">Email cannot be changed</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || !editName.trim() || editName === profile.full_name}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  {saveMsg && (
                    <span className={`text-sm ${saveMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                      {saveMsg.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 â€” Security */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-300 text-sm font-medium mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPw}
                        onChange={e => setCurrentPw(e.target.value)}
                        className="w-full bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 pr-12"
                        placeholder="Current password"
                      />
                      <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white">
                        {showCurrentPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-purple-300 text-sm font-medium mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        className="w-full bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 pr-12"
                        placeholder="New password (min. 8 characters)"
                      />
                      <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white">
                        {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {newPw && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwStrengthColors[pwStrength] : "bg-slate-700"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-purple-400">{pwStrengthLabels[pwStrength]}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-purple-300 text-sm font-medium mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPw}
                        onChange={e => setConfirmPw(e.target.value)}
                        className="w-full bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 pr-12"
                        placeholder="Confirm new password"
                      />
                      <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white">
                        {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  {pwMsg && (
                    <div className={`p-3 rounded-xl text-sm ${pwMsg.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                      {pwMsg.text}
                    </div>
                  )}
                  <button
                    onClick={handleChangePassword}
                    disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {pwLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>

              <div className="border-t border-purple-500/20 pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Account Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div>
                      <div className="text-white font-medium">Email Verification</div>
                      <div className="text-purple-400 text-sm">{profile.email}</div>
                    </div>
                    {profile.is_verified ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Not Verified
                      </span>
                    )}
                  </div>
                  {profile.last_login && (
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div className="text-white font-medium">Last Login</div>
                      <div className="text-purple-400 text-sm">{formatDate(profile.last_login)}</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-white font-medium">Two-Factor Auth</div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${totpEnabled ? "text-emerald-400" : "text-purple-400"}`}>
                        {totpEnabled ? "â— Enabled" : "â—‹ Disabled"}
                      </span>
                      <button
                        onClick={() => setActiveTab("2fa")}
                        className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg hover:bg-purple-500/10 transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 â€” Sessions */}
          {activeTab === "sessions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Active Sessions</h3>
                {sessions.length > 1 && (
                  <button
                    onClick={revokeAllOther}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Revoke All Other Sessions
                  </button>
                )}
              </div>
              {revokeMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-sm">{revokeMsg}</div>
              )}
              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-purple-400 text-center py-8">No active sessions found</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s, idx) => {
                    const isCurrent = idx === 0;
                    return (
                      <div key={s.session_id} className={`flex items-center justify-between p-4 rounded-xl border ${isCurrent ? "bg-emerald-500/5 border-emerald-500/30" : "bg-slate-800/50 border-purple-500/10"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? "bg-emerald-500/20" : "bg-purple-500/20"}`}>
                            <svg className={`w-5 h-5 ${isCurrent ? "text-emerald-400" : "text-purple-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {s.device_info?.toLowerCase().includes("mobile") ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white text-sm font-medium">{s.browser || "Unknown Browser"}</span>
                              {isCurrent && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Current Session</span>}
                            </div>
                            <div className="text-purple-400 text-xs mt-0.5">{s.device_info || "Unknown Device"}</div>
                            <div className="text-purple-500 text-xs">{s.ip_address} Â· {timeAgo(s.last_active)}</div>
                          </div>
                        </div>
                        {!isCurrent && (
                          <button onClick={() => revokeSession(s.session_id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0" title="Revoke">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {sessions.length === 1 && <p className="text-purple-500 text-sm text-center">No other active sessions</p>}
            </div>
          )}

          {/* TAB 4 â€” 2FA */}
          {activeTab === "2fa" && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-white">Two-Factor Authentication</h3>
              {totpMsg && (
                <div className={`p-3 rounded-xl text-sm ${totpMsg.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                  {totpMsg.text}
                </div>
              )}

              {!totpEnabled && totpStep === "idle" && (
                <div className="flex flex-col items-center text-center p-8 bg-slate-800/30 rounded-2xl border border-purple-500/20 space-y-4">
                  <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Two-Factor Authentication is disabled</h4>
                    <p className="text-purple-400 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <ul className="text-sm space-y-2 text-left w-full max-w-xs">
                    {["Protect against password theft", "Required for large transfers", "Instant login alerts"].map(b => (
                      <li key={b} className="flex items-center gap-2 text-purple-300">
                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleSetup2FA} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                    Enable 2FA
                  </button>
                </div>
              )}

              {totpEnabled && totpStep === "idle" && (
                <div className="flex flex-col items-center text-center p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/30 space-y-4">
                  <svg className="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Two-Factor Authentication is enabled</h4>
                    <p className="text-emerald-400 text-sm">Your account is protected</p>
                  </div>
                  <button onClick={() => { setTotpStep("disable"); setTotpCode(""); setTotpMsg(null); }} className="px-6 py-2.5 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors font-medium">
                    Disable 2FA
                  </button>
                </div>
              )}

              {totpStep === "setup" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Step 1 â€” Scan QR Code</h4>
                    <p className="text-purple-300 text-sm mb-4">Open Google Authenticator or Authy and scan this code:</p>
                    {qrCode && <div className="flex justify-center mb-4"><img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-xl bg-white p-2" /></div>}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/20">
                      <div className="text-purple-400 text-xs mb-1">Or enter manually:</div>
                      <div className="flex items-center gap-3">
                        <code className="text-white font-mono text-sm tracking-wide flex-1 break-all">{manualKey}</code>
                        <button onClick={copySecret} className="text-xs text-purple-400 hover:text-white border border-purple-500/30 px-3 py-1 rounded-lg hover:bg-purple-500/10 transition-colors flex-shrink-0">
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-purple-500/20 pt-4">
                    <h4 className="text-white font-semibold mb-2">Step 2 â€” Verify Setup</h4>
                    <p className="text-purple-300 text-sm mb-3">Enter the 6-digit code from your app:</p>
                    <div className="flex gap-3 flex-wrap">
                      <input
                        type="text"
                        value={totpCode}
                        onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        autoFocus
                        className="px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white text-center font-mono tracking-widest w-40 focus:outline-none focus:border-purple-400"
                        maxLength={6}
                      />
                      <button onClick={handleVerify2FA} disabled={totpCode.length !== 6} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40">
                        Verify &amp; Enable
                      </button>
                    </div>
                    <button onClick={() => { setTotpStep("idle"); setTotpMsg(null); }} className="text-purple-400 text-sm hover:text-purple-300 mt-3 block">Cancel</button>
                  </div>
                </div>
              )}

              {totpStep === "disable" && (
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Disable 2FA</h4>
                  <p className="text-purple-300 text-sm">Enter the 6-digit code from your authenticator app to confirm:</p>
                  <div className="flex gap-3 flex-wrap">
                    <input
                      type="text"
                      value={totpCode}
                      onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      autoFocus
                      className="px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white text-center font-mono tracking-widest w-40 focus:outline-none focus:border-purple-400"
                      maxLength={6}
                    />
                    <button onClick={handleDisable2FA} disabled={totpCode.length !== 6} className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-medium hover:bg-red-500/30 transition-colors disabled:opacity-40">
                      Disable
                    </button>
                  </div>
                  <button onClick={() => { setTotpStep("idle"); setTotpMsg(null); }} className="text-purple-400 text-sm hover:text-purple-300">Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
