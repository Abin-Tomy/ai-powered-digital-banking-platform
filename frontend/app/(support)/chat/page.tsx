"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import SupportDashboardLayout from "../components/SupportDashboardLayout";
import UserAvatar from "@/components/UserAvatar";

interface ChatMessage {
  id: string;
  sender: "customer" | "support";
  message: string;
  timestamp: Date;
  customer_id?: string;
}

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "active" | "waiting" | "closed";
  lastMessage: string;
  unread: number;
  customer_id: string;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  date_joined: string;
}

export default function SupportChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      // Fetch all users to create potential chat sessions
      const usersRes = await api.get("/admin/users/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const customerUsers = usersRes.data.filter((user: any) => user.role === "CUSTOMER");
      setCustomers(customerUsers);
      
      // Create chat sessions from customers
      const sessions: ChatSession[] = customerUsers.map((customer: Customer, index: number) => ({
        id: customer.id,
        customerName: customer.full_name,
        customerEmail: customer.email,
        status: index === 0 ? "active" : index === 1 ? "waiting" : "closed",
        lastMessage: index === 0 ? "Hello, I need help with a transfer" : 
                     index === 1 ? "My account is locked" : 
                     "Thank you for your help!",
        unread: index < 2 ? 1 : 0,
        customer_id: customer.id
      }));
      
      setChatSessions(sessions);
      
      // Initialize some sample messages for demo
      const initialMessages: Record<string, ChatMessage[]> = {};
      sessions.forEach((session, index) => {
        if (index < 2) { // Only add messages for first 2 customers
          initialMessages[session.id] = [
            {
              id: `m${session.id}_1`,
              sender: "customer",
              message: session.lastMessage,
              timestamp: new Date(Date.now() - (index + 1) * 3600000),
              customer_id: session.customer_id
            }
          ];
        }
      });
      
      setMessages(initialMessages);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    
    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      sender: "support",
      message: message.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }));
    
    // Update session's last message
    setChatSessions(prev => 
      prev.map(session => 
        session.id === selectedChat 
          ? { ...session, lastMessage: message.trim(), status: "active" }
          : session
      )
    );
    
    setMessage("");
  };

  const selectedSession = chatSessions.find(s => s.id === selectedChat);
  const chatMessages = selectedChat ? messages[selectedChat] || [] : [];

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
          <h1 className="text-3xl font-bold text-white mb-2">Support Chat</h1>
          <p className="text-purple-300">Assist customers in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-purple-500/20">
              <h2 className="text-lg font-bold text-white">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedChat(session.id)}
                  className={`w-full p-4 text-left transition-all border-b border-purple-500/10 ${
                    selectedChat === session.id 
                      ? "bg-purple-500/20" 
                      : "hover:bg-purple-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <UserAvatar 
                        name={session.customerName} 
                        email={session.customerEmail} 
                        size="md" 
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        session.status === "active" ? "bg-emerald-400" :
                        session.status === "waiting" ? "bg-yellow-400" : "bg-gray-400"
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium truncate">{session.customerName}</span>
                        {session.unread > 0 && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {session.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-purple-400 text-sm truncate">{session.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden flex flex-col">
            {selectedSession ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {selectedSession.customerName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{selectedSession.customerName}</div>
                      <div className="text-purple-400 text-sm">{selectedSession.customerEmail}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedSession.status === "active" 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : selectedSession.status === "waiting"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}>
                    {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "support" ? "justify-end" : "justify-start"} gap-3`}
                    >
                      {msg.sender === "customer" && (
                        <UserAvatar 
                          name={selectedSession?.customerName || "Customer"} 
                          email={selectedSession?.customerEmail}
                          size="sm" 
                        />
                      )}
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender === "support"
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                          : "bg-slate-800 text-white border border-purple-500/20"
                      }`}>
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === "support" ? "text-purple-200" : "text-purple-400"
                        }`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.sender === "support" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">S</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/20">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-slate-800/70 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
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
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Conversation</h3>
                  <p className="text-purple-400">Choose a chat from the list to start helping</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Chat Info */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-emerald-300 font-semibold mb-1">Live Support System</h4>
              <p className="text-emerald-300/80 text-sm">
                Chat with real customers pulled from the user database. Messages are stored in memory for this session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SupportDashboardLayout>
  );
}