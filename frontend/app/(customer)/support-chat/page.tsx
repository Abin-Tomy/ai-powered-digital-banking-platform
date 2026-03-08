"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";

const MAX_CHARS = 500;
const RECONNECT_LIMIT = 3;
const RECONNECT_DELAY_MS = 3000;

interface ChatMessage {
  id: string;
  sender: string;
  sender_role: "CUSTOMER" | "SUPPORT" | "SYSTEM";
  message: string;
  timestamp: string;
}

function sysMsg(text: string): ChatMessage {
  return {
    id: `sys-${Date.now()}-${Math.random()}`,
    sender: "System",
    sender_role: "SYSTEM",
    message: text,
    timestamp: new Date().toISOString(),
  };
}

export default function CustomerChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [userName, setUserName] = useState("Customer");
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectAttemptsRef = useRef(0);
  const userIdRef = useRef<string>("anonymous");
  const wsBaseRef = useRef<string>("");

  const connect = useCallback((userId: string, name: string, wsBase: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${wsBase}/ws/chat/${userId}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setConnectionFailed(false);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "connection_established") {
        setMessages((prev) => [...prev, sysMsg(data.message || "Connected to support")]);
      } else if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-${Math.random()}`,
            sender: data.sender,
            sender_role: data.sender_role,
            message: data.message,
            timestamp: data.timestamp,
          },
        ]);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (reconnectAttemptsRef.current < RECONNECT_LIMIT) {
        reconnectAttemptsRef.current += 1;
        setMessages((prev) => [
          ...prev,
          sysMsg(`Connection lost. Reconnecting (${reconnectAttemptsRef.current}/${RECONNECT_LIMIT})...`),
        ]);
        setTimeout(() => connect(userId, name, wsBase), RECONNECT_DELAY_MS);
      } else {
        setConnectionFailed(true);
        setMessages((prev) => [...prev, sysMsg("Unable to connect to support. Please try again later.")]);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const wsBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/^http/, "ws");
    wsBaseRef.current = wsBase;

    const tryConnect = async () => {
      let userId = "anonymous";
      let name = "Customer";

      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.id) userId = String(user.id);
          if (user.full_name) name = user.full_name;
        } catch { /* ignore */ }
      }

      if (userId === "anonymous") {
        try {
          const res = await api.get("/auth/me/");
          userId = String(res.data.id);
          name = res.data.full_name || "Customer";
        } catch { /* ignore */ }
      }

      userIdRef.current = userId;
      setUserName(name);
      connect(userId, name, wsBase);
    };

    tryConnect();

    return () => {
      reconnectAttemptsRef.current = RECONNECT_LIMIT; // prevent reconnects on unmount
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        message: message.trim(),
        sender: userName,
        sender_role: "CUSTOMER",
      })
    );
    setMessage("");
  };

  const handleReconnect = () => {
    reconnectAttemptsRef.current = 0;
    setConnectionFailed(false);
    connect(userIdRef.current, userName, wsBaseRef.current);
  };

  const statusText = connectionFailed ? "Disconnected" : connected ? "Connected" : "Connecting...";
  const statusColor = connectionFailed ? "text-red-400" : connected ? "text-emerald-400" : "text-yellow-400";
  const dotColor = connectionFailed ? "bg-red-400" : connected ? "bg-emerald-400 animate-pulse" : "bg-yellow-400 animate-pulse";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support Chat</h1>
            <p className="text-purple-300">Chat with our support team in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${dotColor}`} />
            <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
            {connectionFailed && (
              <button onClick={handleReconnect} className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg hover:bg-purple-500/10 transition-colors">
                Reconnect
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden flex flex-col h-[560px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-medium">Support Team</div>
              <div className="text-emerald-400 text-sm">Available 24/7</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-purple-400 py-10">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Send a message to start chatting with support.</p>
              </div>
            )}
            {messages.map((msg) => {
              if (msg.sender_role === "SYSTEM") {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <span className="text-xs text-purple-500 bg-slate-800/60 px-3 py-1 rounded-full border border-purple-500/20">
                      {msg.message}
                    </span>
                  </div>
                );
              }
              return (
                <div key={msg.id} className={`flex ${msg.sender_role === "CUSTOMER" ? "justify-end" : "justify-start"} gap-3`}>
                  {msg.sender_role === "SUPPORT" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">S</span>
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.sender_role === "CUSTOMER"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-slate-800 text-white border border-purple-500/20"
                  }`}>
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.sender_role === "CUSTOMER" ? "text-purple-200" : "text-purple-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.sender_role === "CUSTOMER" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">{userName[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/20">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                  placeholder={connected ? "Type your message..." : "Waiting for connection..."}
                  disabled={!connected}
                  className="w-full bg-slate-800/70 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                {message.length > 400 && (
                  <span className={`absolute right-3 bottom-3 text-xs ${message.length >= MAX_CHARS ? "text-red-400" : "text-yellow-400"}`}>
                    {MAX_CHARS - message.length}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!message.trim() || !connected}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:scale-[1.02] transition-all disabled:opacity-50 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
