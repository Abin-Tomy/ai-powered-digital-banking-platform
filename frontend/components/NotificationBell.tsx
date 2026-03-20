"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";

interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const TYPE_META: Record<string, { icon: string; color: string }> = {
  TRANSACTION: { icon: "ðŸ’¸", color: "text-emerald-400" },
  LOAN:        { icon: "ðŸ¦", color: "text-blue-400" },
  FRAUD:       { icon: "âš ï¸", color: "text-red-400" },
  CREDIT_CARD: { icon: "ðŸ’³", color: "text-yellow-400" },
  SYSTEM:      { icon: "ðŸ””", color: "text-purple-400" },
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data.results);
      setUnreadCount(res.data.unread_count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time WebSocket for new notifications
    const token = localStorage.getItem("access_token");
    if (token) {
      const wsBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/^http/, "ws");
      const ws = new WebSocket(`${wsBase}/ws/notifications/?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data: Notification = JSON.parse(event.data);
          if (data.id) {
            setNotifications((prev) => [data, ...prev]);
            if (!data.is_read) setUnreadCount((c) => c + 1);
          }
        } catch { /* ignore */ }
      };

      return () => {
        ws.close();
        wsRef.current = null;
      };
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-purple-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-purple-500/30 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-purple-500/20">
            <span className="text-white font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-purple-400 hover:text-purple-200 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-purple-400 text-sm">No notifications</div>
          ) : (
            notifications.map((n) => {
              const meta = TYPE_META[n.notification_type] ?? { icon: "ðŸ””", color: "text-purple-400" };
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`p-3 border-b border-purple-500/10 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                    !n.is_read ? "bg-purple-900/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-semibold ${meta.color}`}>{n.notification_type}</span>
                        {!n.is_read && <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-white text-sm font-medium truncate">{n.title}</p>
                      <p className="text-purple-300 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-purple-500 text-xs mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
