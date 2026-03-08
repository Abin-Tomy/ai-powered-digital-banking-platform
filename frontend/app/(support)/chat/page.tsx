"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import SupportDashboardLayout from "../components/SupportDashboardLayout";
import UserAvatar from "@/components/UserAvatar";

interface ChatMessage {
  id: string;
  sender: string;
  sender_role: "CUSTOMER" | "SUPPORT";
  message: string;
  timestamp: string;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
}

export default function SupportChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect/disconnect WebSocket when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    setMessages([]);
    setConnected(false);

    const wsBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/^http/, "ws");
    const ws = new WebSocket(`${wsBase}/ws/chat/${selectedChat}/`);

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
  }, [selectedChat]);

  const fetchCustomers = async () => {
    try {
      const usersRes = await api.get("/admin/users/");
      const allUsers = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.results || [];
      const customerUsers = allUsers.filter(
        (user: any) => user.role === "CUSTOMER"
      );
      setCustomers(customerUsers);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        message: message.trim(),
        sender: "Support Agent",
        sender_role: "SUPPORT",
      })
    );
    setMessage("");
  };

  const selectedCustomer = customers.find((c) => c.id === selectedChat);

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support Chat</h1>
            <p className="text-purple-300">Assist customers in real-time via WebSocket</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}></div>
            <span className={`text-sm font-medium ${connected ? "text-emerald-400" : "text-gray-400"}`}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Customer List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-purple-500/20">
              <h2 className="text-lg font-bold text-white">Customers</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedChat(customer.id)}
                  className={`w-full p-4 text-left transition-all border-b border-purple-500/10 ${
                    selectedChat === customer.id
                      ? "bg-purple-500/20"
                      : "hover:bg-purple-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={customer.full_name} email={customer.email} size="md" />
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-medium truncate block">{customer.full_name}</span>
                      <p className="text-purple-400 text-sm truncate">{customer.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden flex flex-col">
            {selectedCustomer ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {selectedCustomer.full_name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{selectedCustomer.full_name}</div>
                      <div className="text-purple-400 text-sm">{selectedCustomer.email}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    connected
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}>
                    {connected ? "Live" : "Connecting..."}
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-purple-400 py-10">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_role === "SUPPORT" ? "justify-end" : "justify-start"} gap-3`}
                    >
                      {msg.sender_role === "CUSTOMER" && (
                        <UserAvatar name={selectedCustomer.full_name} email={selectedCustomer.email} size="sm" />
                      )}
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender_role === "SUPPORT"
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                          : "bg-slate-800 text-white border border-purple-500/20"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            msg.sender_role === "SUPPORT"
                              ? "bg-emerald-500/30 text-emerald-300"
                              : "bg-blue-500/30 text-blue-300"
                          }`}>
                            {msg.sender_role}
                          </span>
                          <span className="text-xs opacity-60">{msg.sender}</span>
                        </div>
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_role === "SUPPORT" ? "text-purple-200" : "text-purple-400"
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.sender_role === "SUPPORT" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">S</span>
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
                      placeholder={connected ? "Type your message..." : "Connecting..."}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Customer</h3>
                  <p className="text-purple-400">Choose a customer from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SupportDashboardLayout>
  );
}