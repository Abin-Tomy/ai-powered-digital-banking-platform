"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface ChatMessage {
  id: string;
  sender: string;
  sender_role: "CUSTOMER" | "SUPPORT";
  message: string;
  timestamp: string;
}

export default function CustomerChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [userName, setUserName] = useState("Customer");
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current user info
    const userStr = localStorage.getItem("user");
    let userId = "anonymous";
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id || "anonymous";
        setUserName(user.full_name || "Customer");
      } catch {
        // use defaults
      }
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${userId}/`);

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
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

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support Chat</h1>
            <p className="text-purple-300">Chat with our support team in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}></div>
            <span className={`text-sm font-medium ${connected ? "text-emerald-400" : "text-gray-400"}`}>
              {connected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden flex flex-col h-[500px]">
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_role === "CUSTOMER" ? "justify-end" : "justify-start"} gap-3`}
              >
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
                  <p className={`text-xs mt-1 ${
                    msg.sender_role === "CUSTOMER" ? "text-purple-200" : "text-purple-400"
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.sender_role === "CUSTOMER" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{userName[0]}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={connected ? "Type your message..." : "Connecting to support..."}
                disabled={!connected}
                className="flex-1 bg-slate-800/70 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!message.trim() || !connected}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:scale-[1.02] transition-all disabled:opacity-50"
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
