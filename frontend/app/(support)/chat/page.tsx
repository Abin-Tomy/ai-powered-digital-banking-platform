"use client";

import { useState } from "react";
import SupportDashboardLayout from "../components/SupportDashboardLayout";

interface ChatMessage {
  id: string;
  sender: "customer" | "support";
  message: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "active" | "waiting" | "closed";
  lastMessage: string;
  unread: number;
}

export default function SupportChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  
  // Mock data - In a real app, this would come from a WebSocket/API
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      status: "active",
      lastMessage: "I need help with my transfer",
      unread: 2
    },
    {
      id: "2",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      status: "waiting",
      lastMessage: "My account is locked",
      unread: 1
    },
    {
      id: "3",
      customerName: "Bob Wilson",
      customerEmail: "bob@example.com",
      status: "closed",
      lastMessage: "Thank you for your help!",
      unread: 0
    }
  ]);

  const [messages] = useState<Record<string, ChatMessage[]>>({
    "1": [
      { id: "m1", sender: "customer", message: "Hello, I need help with a transfer", timestamp: new Date(Date.now() - 3600000) },
      { id: "m2", sender: "support", message: "Hi! I'd be happy to help. What seems to be the issue?", timestamp: new Date(Date.now() - 3500000) },
      { id: "m3", sender: "customer", message: "I tried to transfer money but it says insufficient balance", timestamp: new Date(Date.now() - 3400000) },
      { id: "m4", sender: "customer", message: "I need help with my transfer", timestamp: new Date(Date.now() - 60000) },
    ],
    "2": [
      { id: "m5", sender: "customer", message: "My account seems to be locked", timestamp: new Date(Date.now() - 1800000) },
    ],
    "3": [
      { id: "m6", sender: "customer", message: "Thank you for your help!", timestamp: new Date(Date.now() - 86400000) },
      { id: "m7", sender: "support", message: "You're welcome! Have a great day!", timestamp: new Date(Date.now() - 86300000) },
    ]
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    
    // In a real app, this would send via WebSocket/API
    console.log("Sending message:", message, "to chat:", selectedChat);
    setMessage("");
  };

  const selectedSession = chatSessions.find(s => s.id === selectedChat);
  const chatMessages = selectedChat ? messages[selectedChat] || [] : [];

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
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {session.customerName[0]}
                        </span>
                      </div>
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
                      className={`flex ${msg.sender === "support" ? "justify-end" : "justify-start"}`}
                    >
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

        {/* Note */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-blue-300 font-semibold mb-1">Demo Mode</h4>
              <p className="text-blue-300/80 text-sm">
                This is a demonstration of the chat interface. In production, this would be connected to a real-time messaging service (WebSocket).
              </p>
            </div>
          </div>
        </div>
      </div>
    </SupportDashboardLayout>
  );
}