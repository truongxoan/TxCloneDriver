"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { useChat } from "@/modules/chat/chatContext";
import { useAuth } from "@/modules/auth/authContext";
import { Send, MessageSquare, Trash2, Crown } from "lucide-react";

export function LiveChatWidget() {
  const { messages, sendMessage, clearChat } = useChat();
  const { user, isAdmin } = useAuth();
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Kênh Chat Trực Tiếp
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-muted-foreground">Trao đổi nội bộ toàn hệ thống</p>
          </div>
        </div>

        {isAdmin && messages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1"
            title="Admin dọn sạch tin nhắn"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {messages.map((msg) => {
          const isMe = msg.sender === user?.username;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isMe ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.role === "admin"
                    ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black shadow-sm"
                    : "bg-slate-700 text-slate-200 border border-slate-600"
                }`}
              >
                {msg.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={msg.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  msg.avatar
                )}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl p-2.5 text-xs shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-800/90 text-slate-100 border border-white/5 rounded-tl-none"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-[11px] text-sky-200 flex items-center gap-1">
                    {msg.name}
                    {msg.role === "admin" && <Crown className="w-2.5 h-2.5 text-amber-300" />}
                  </span>
                  <span className="text-[9px] text-white/50">{msg.time}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="pt-2 border-t border-white/10 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
