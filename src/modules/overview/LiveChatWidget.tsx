"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { useChat } from "@/modules/chat/chatContext";
import { useAuth } from "@/modules/auth/authContext";
import { Send, MessageSquare, Trash2, Crown, Lock, Unlock, KeyRound, Sparkles, AlertTriangle } from "lucide-react";

export function LiveChatWidget() {
  const { messages, sendMessage, clearChat, decryptMessage } = useChat();
  const { user, isAdmin } = useAuth();
  const [inputText, setInputText] = useState("");

  // Encryption mode state
  const [isEncryptMode, setIsEncryptMode] = useState(false);
  const [encryptPassword, setEncryptPassword] = useState("080497");

  // Decryption popup/state map: { [msgId]: { guessKey: string, decryptedText?: string, isError?: boolean } }
  const [activeDecryptMsgId, setActiveDecryptMsgId] = useState<string | null>(null);
  const [decryptGuess, setDecryptGuess] = useState("");
  const [decryptedCache, setDecryptedCache] = useState<Record<string, { text: string; success: boolean }>>({});

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isEncryptMode) {
      if (!encryptPassword.trim()) {
        alert("Vui lòng đặt mật khẩu mã hóa tin nhắn!");
        return;
      }
      sendMessage(inputText, "public", true, encryptPassword.trim());
    } else {
      sendMessage(inputText, "public", false);
    }
    setInputText("");
  };

  const handleTriggerDecrypt = (msgId: string, cipherText?: string, keyHash?: string) => {
    if (!cipherText || !keyHash || !decryptGuess.trim()) return;
    const res = decryptMessage(cipherText, keyHash, decryptGuess.trim());
    setDecryptedCache((prev) => ({
      ...prev,
      [msgId]: res,
    }));
    setActiveDecryptMsgId(null);
    setDecryptGuess("");
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
              Kênh Chat & Mã Hóa Mật
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-muted-foreground">Mã hóa đầu cuối bằng mật khẩu bí mật</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Encrypted Chat Mode */}
          <button
            onClick={() => setIsEncryptMode(!isEncryptMode)}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
              isEncryptMode
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
            title="Bật/Tắt chế độ chat mật mã"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>{isEncryptMode ? "Mã hóa BẬT" : "Mã hóa TẮT"}</span>
          </button>

          {isAdmin && messages.length > 0 && (
            <button
              onClick={() => clearChat()}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1"
              title="Admin dọn sạch tin nhắn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {messages.map((msg) => {
          const isMe = msg.sender === user?.username;
          const cached = decryptedCache[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[88%] ${
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
                  <img src={msg.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  msg.avatar
                )}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl p-2.5 text-xs shadow-sm space-y-1.5 ${
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
                  {msg.isEncrypted && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                      MÃ HÓA
                    </span>
                  )}
                </div>

                {/* Plain or Encrypted Display */}
                {!msg.isEncrypted ? (
                  <p className="leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="space-y-1.5">
                    {/* If Decrypted */}
                    {cached ? (
                      <div
                        className={`p-2 rounded-xl border text-[11px] leading-relaxed ${
                          cached.success
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                            : "bg-rose-500/20 border-rose-500/40 text-rose-200 font-mono"
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold text-[10px] mb-0.5">
                          {cached.success ? (
                            <>
                              <Unlock className="w-3 h-3 text-emerald-400" />
                              <span>Đã giải mã thành công:</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>Giải mã thất bại:</span>
                            </>
                          )}
                        </div>
                        <p>{cached.text}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-mono text-[11px] text-amber-200 bg-black/20 p-1.5 rounded-lg border border-amber-500/20">
                          {msg.text}
                        </p>
                        <button
                          onClick={() => setActiveDecryptMsgId(activeDecryptMsgId === msg.id ? null : msg.id)}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Giải mã tin nhắn</span>
                        </button>
                      </div>
                    )}

                    {/* Decrypt Input Popup */}
                    {activeDecryptMsgId === msg.id && (
                      <div className="p-2 rounded-xl bg-slate-950/90 border border-white/20 space-y-1.5 animate-in fade-in">
                        <input
                          type="password"
                          value={decryptGuess}
                          onChange={(e) => setDecryptGuess(e.target.value)}
                          placeholder="Nhập mật khẩu người gửi đặt..."
                          className="w-full px-2 py-1 rounded-lg bg-white/10 text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveDecryptMsgId(null)}
                            className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-white"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleTriggerDecrypt(msg.id, msg.cipherText, msg.keyHash)}
                            className="px-2.5 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold"
                          >
                            Mở khóa
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Encrypt Bar if enabled */}
      {isEncryptMode && (
        <div className="pb-1.5 flex items-center gap-2 text-[11px] text-amber-300">
          <KeyRound className="w-3.5 h-3.5 shrink-0" />
          <span>Mật mã tin nhắn:</span>
          <input
            type="text"
            value={encryptPassword}
            onChange={(e) => setEncryptPassword(e.target.value)}
            placeholder="Mật mã bí mật (VD: 080497)..."
            className="flex-1 px-2 py-0.5 rounded-lg bg-black/40 border border-amber-500/30 text-[11px] text-amber-200 font-mono"
          />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="pt-2 border-t border-white/10 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isEncryptMode ? "Nhập nội dung cần mã hóa bí mật..." : "Nhập tin nhắn..."}
          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2 rounded-xl disabled:opacity-40 text-white transition-all shadow ${
            isEncryptMode ? "bg-amber-600 hover:bg-amber-500" : "bg-blue-600 hover:bg-blue-500"
          }`}
          title={isEncryptMode ? "Gửi tin nhắn mã hóa" : "Gửi tin nhắn"}
        >
          {isEncryptMode ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
