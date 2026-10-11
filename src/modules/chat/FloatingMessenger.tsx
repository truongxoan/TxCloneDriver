"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  User,
  Users,
  KeyRound,
  Trash2,
  AlertTriangle,
  Sparkles,
  Minimize2,
  Maximize2,
  Clock,
  Radio,
} from "lucide-react";
import { useChat } from "./chatContext";
import { useAuth } from "@/modules/auth/authContext";
import { cn } from "@/lib/utils";

const MASTER_PIN = "080497";
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const BLUR_TIMEOUT_MS = 20 * 1000; // 20 seconds

export function FloatingMessenger() {
  const { messages, sendMessage, clearChat, decryptMessage } = useChat();
  const { user, isAdmin, managedUsers } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"public" | "private" | "spy">("public");
  const [selectedPeer, setSelectedPeer] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [encryptToggle, setEncryptToggle] = useState(false);
  const [encryptKey, setEncryptKey] = useState("");

  // Auto-lock after 5 min idle
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Unblur unlocked state for session
  const [isContentUnblurred, setIsContentUnblurred] = useState(false);
  const [showUnblurModal, setShowUnblurModal] = useState(false);
  const [unblurPin, setUnblurPin] = useState("");
  const [unblurError, setUnblurError] = useState<string | null>(null);

  // Inline decryption prompt for individual cipher text
  const [decryptModalMsgId, setDecryptModalMsgId] = useState<string | null>(null);
  const [decryptGuess, setDecryptGuess] = useState("");
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

  // Admin Spy targets
  const [spyUserA, setSpyUserA] = useState<string>("");
  const [spyUserB, setSpyUserB] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Available users to chat with (excluding current user)
  const peerUsers = managedUsers.filter((u) => u.username !== user?.username);

  // Set default peer if empty
  useEffect(() => {
    if (peerUsers.length > 0 && !selectedPeer) {
      setSelectedPeer(peerUsers[0].username);
    }
    if (peerUsers.length >= 2 && !spyUserA && !spyUserB) {
      setSpyUserA(peerUsers[0].username);
      setSpyUserB(peerUsers[1].username);
    }
  }, [peerUsers, selectedPeer, spyUserA, spyUserB]);

  // Activity tracking for 5m idle lock
  const registerActivity = () => {
    setLastActivity(Date.now());
  };

  useEffect(() => {
    if (isLocked || !isOpen) return;
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
        setIsLocked(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lastActivity, isLocked, isOpen]);

  // Periodic tick to re-evaluate 20s blur
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, activeTab, selectedPeer]);

  // Handle Lock / Unlock PIN
  const handleUnlock = () => {
    if (enteredPin === MASTER_PIN) {
      setIsLocked(false);
      setEnteredPin("");
      setPinError(null);
      setFailedAttempts(0);
      setLastActivity(Date.now());
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      if (nextFail >= 3) {
        // SELF DESTRUCT MECHANISM!
        clearChat();
        localStorage.removeItem("txclonedriver_chat_messages");
        setPinError("🚨 CẢNH BÁO: Nhập sai quá 3 lần! Lịch sử trò chuyện đã tự hủy hoàn toàn!");
        setEnteredPin("");
      } else {
        setPinError(`Mã PIN không đúng! Còn ${3 - nextFail} lần thử trước khi tự hủy.`);
      }
    }
  };

  // Handle Unblur PIN
  const handleConfirmUnblur = () => {
    if (unblurPin === MASTER_PIN) {
      setIsContentUnblurred(true);
      setShowUnblurModal(false);
      setUnblurPin("");
      setUnblurError(null);
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      if (nextFail >= 3) {
        clearChat();
        setShowUnblurModal(false);
        setIsLocked(true);
        setPinError("🚨 CẢNH BÁO: Nhập sai PIN mở khóa 3 lần! Dữ liệu đã tự hủy!");
      } else {
        setUnblurError(`Mã PIN không đúng! (${3 - nextFail} lần thử còn lại)`);
      }
    }
  };

  // Handle Send
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    registerActivity();

    const target = activeTab === "public" ? "public" : selectedPeer;
    sendMessage(inputText.trim(), target, encryptToggle, encryptKey);

    setInputText("");
    if (encryptToggle) {
      setEncryptToggle(false);
      setEncryptKey("");
    }
  };

  // Handle decrypt individual encrypted message
  const handleDecryptSingle = (msgId: string, cipherText?: string, keyHash?: string) => {
    if (!cipherText || !keyHash) return;
    const res = decryptMessage(cipherText, keyHash, decryptGuess);
    if (res.success) {
      setDecryptedCache((prev) => ({ ...prev, [msgId]: res.text }));
      setDecryptModalMsgId(null);
      setDecryptGuess("");
    } else {
      alert("Mật mã giải mã không chính xác!");
    }
  };

  // Filter messages based on active tab
  const currentUsername = user?.username || "";
  let displayedMessages = messages.filter((m) => {
    if (activeTab === "public") {
      return !m.targetUser || m.targetUser === "public";
    }
    if (activeTab === "private") {
      if (!selectedPeer) return false;
      return (
        (m.sender === currentUsername && m.targetUser === selectedPeer) ||
        (m.sender === selectedPeer && m.targetUser === currentUsername)
      );
    }
    if (activeTab === "spy") {
      if (!spyUserA || !spyUserB) return false;
      return (
        (m.sender === spyUserA && m.targetUser === spyUserB) ||
        (m.sender === spyUserB && m.targetUser === spyUserA)
      );
    }
    return false;
  });

  return (
    <>
      {/* Floating Messenger Icon Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <button
            onClick={() => {
              setIsOpen(true);
              setLastActivity(Date.now());
            }}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
            title="Mở Chat Messenger Nổi"
          >
            <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md">
              {messages.length > 99 ? "99+" : messages.length}
            </span>
            <span className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" />
          </button>
        </div>
      )}

      {/* Floating Messenger Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[620px] h-[85vh] flex flex-col rounded-3xl glass-card border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-xs shadow-md">
                <MessageCircle className="w-4 h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-black text-white flex items-center gap-1.5 leading-tight">
                  TxMessenger
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-sky-400" /> Tự khóa 5p • Mờ 20s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Manual Lock Now Button */}
              <button
                onClick={() => setIsLocked(true)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-300 transition-colors"
                title="Khóa bảo mật ngay lập tức"
              >
                <Lock className="w-4 h-4" />
              </button>

              {/* Close / Minimize */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                title="Đóng Messenger"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Channels */}
          <div className="flex items-center bg-slate-950/60 p-1 border-b border-white/10 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab("public");
                registerActivity();
              }}
              className={cn(
                "flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all",
                activeTab === "public"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Chung</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("private");
                registerActivity();
              }}
              className={cn(
                "flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all",
                activeTab === "private"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>Chat Riêng</span>
            </button>

            {/* Secret Admin Super Spy God Vision */}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab("spy");
                  registerActivity();
                }}
                className={cn(
                  "flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all",
                  activeTab === "spy"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 font-black"
                    : "text-rose-400/80 hover:text-rose-300"
                )}
                title="Admin God Vision: Giám sát toàn bộ chat riêng"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>God Vision</span>
              </button>
            )}
          </div>

          {/* Sub-bar for Private Chat Selector */}
          {activeTab === "private" && (
            <div className="p-2 px-3 bg-slate-900/50 border-b border-white/5 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-muted-foreground font-semibold shrink-0">
                Nhắn với:
              </span>
              <select
                value={selectedPeer}
                onChange={(e) => {
                  setSelectedPeer(e.target.value);
                  registerActivity();
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                {peerUsers.map((u) => (
                  <option key={u.id} value={u.username} className="bg-slate-900 text-white">
                    {u.name} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sub-bar for Admin Spy Selector */}
          {activeTab === "spy" && isAdmin && (
            <div className="p-2.5 bg-rose-950/40 border-b border-rose-500/20 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>GIÁM SÁT HỘI THOẠI BÍ MẬT GIỮA:</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={spyUserA}
                  onChange={(e) => setSpyUserA(e.target.value)}
                  className="flex-1 bg-black/60 border border-rose-500/30 rounded-xl px-2 py-1 text-xs text-rose-200"
                >
                  {managedUsers.map((u) => (
                    <option key={u.id} value={u.username} className="bg-slate-900">
                      {u.name}
                    </option>
                  ))}
                </select>
                <span className="text-rose-400 font-black">↔</span>
                <select
                  value={spyUserB}
                  onChange={(e) => setSpyUserB(e.target.value)}
                  className="flex-1 bg-black/60 border border-rose-500/30 rounded-xl px-2 py-1 text-xs text-rose-200"
                >
                  {managedUsers.map((u) => (
                    <option key={u.id} value={u.username} className="bg-slate-900">
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 relative">
            {/* INACTIVITY LOCK OVERLAY */}
            {isLocked ? (
              <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <div className="w-14 h-14 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-lg shadow-rose-500/20">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-white">PHIÊN CHAT ĐÃ KHÓA</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                  Tự động khóa sau 5 phút không tương tác để bảo vệ thông tin. Vui lòng nhập mã PIN bảo mật.
                </p>

                <div className="mt-4 w-full max-w-[240px] space-y-2">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Mã PIN (Mặc định: 080497)"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                    className="w-full text-center tracking-[0.3em] font-mono text-base px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white focus:outline-none focus:border-rose-500"
                  />
                  {pinError && <p className="text-[11px] font-bold text-rose-400">{pinError}</p>}
                  <button
                    onClick={handleUnlock}
                    className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    Mở Khóa Chat
                  </button>
                </div>
              </div>
            ) : null}

            {displayedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs">Chưa có tin nhắn nào trong hội thoại này.</p>
                <p className="text-[11px] opacity-70 mt-0.5">Hãy là người gửi tin nhắn đầu tiên!</p>
              </div>
            ) : (
              displayedMessages.map((msg) => {
                const isMe = msg.sender === currentUsername;
                const isBlurred =
                  !isContentUnblurred &&
                  Date.now() - msg.createdAt > BLUR_TIMEOUT_MS;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col group max-w-[85%]",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    {/* Sender Label */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-muted-foreground">
                      <span className="font-bold text-slate-300">
                        {isMe ? "Bạn" : msg.name}
                      </span>
                      {msg.role === "admin" && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold">
                          ADMIN
                        </span>
                      )}
                      <span>{msg.time}</span>
                    </div>

                    {/* Bubble Content with 20s Anti-Peep Blur */}
                    <div
                      onClick={() => {
                        if (isBlurred) {
                          setShowUnblurModal(true);
                        }
                      }}
                      className={cn(
                        "p-3 rounded-2xl text-xs relative transition-all duration-500",
                        isMe
                          ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                          : "bg-slate-800/80 text-slate-100 rounded-tl-none border border-white/10",
                        isBlurred &&
                          "blur-[5px] select-none opacity-40 cursor-pointer hover:opacity-60"
                      )}
                    >
                      {/* Decrypted or normal text */}
                      {decryptedCache[msg.id] ? (
                        <div className="text-emerald-300 font-mono">
                          🔓 {decryptedCache[msg.id]}
                        </div>
                      ) : (
                        <div>{msg.text}</div>
                      )}

                      {/* If encrypted, show prompt */}
                      {msg.isEncrypted && !decryptedCache[msg.id] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDecryptModalMsgId(msg.id);
                          }}
                          className="mt-1.5 px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30"
                        >
                          <KeyRound className="w-3 h-3" /> Nhập mật khẩu giải mã
                        </button>
                      )}
                    </div>

                    {/* Notice when blurred */}
                    {isBlurred && (
                      <span className="text-[9px] text-sky-400 font-bold mt-0.5 cursor-pointer flex items-center gap-1">
                        🔒 Đã làm mờ chống nhìn trộm (Nhấp để mở)
                      </span>
                    )}
                  </div>
                );
              })
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input & Action Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-slate-900/95 border-t border-white/10 space-y-2"
          >
            {/* Encryption toggle row */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={encryptToggle}
                  onChange={(e) => setEncryptToggle(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-blue-500 focus:ring-0"
                />
                <span className="text-[11px] font-bold flex items-center gap-1">
                  🔒 Mã hóa tin nhắn
                </span>
              </label>

              {encryptToggle && (
                <input
                  type="text"
                  placeholder="Mật khẩu mã hóa..."
                  value={encryptKey}
                  onChange={(e) => setEncryptKey(e.target.value)}
                  className="flex-1 max-w-[170px] bg-black/40 border border-white/15 rounded-xl px-2 py-0.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* Input row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  activeTab === "public"
                    ? "Nhắn tin công khai..."
                    : `Nhắn riêng với @${selectedPeer}...`
                }
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  registerActivity();
                }}
                className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/30 hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* MODAL: UNBLUR PIN PROMPT */}
          {showUnblurModal && (
            <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in">
              <div className="w-full max-w-[280px] p-5 rounded-3xl glass-card border border-white/20 shadow-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
                  <Eye className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-white">MỞ KHÓA TIN NHẮN MỜ</h4>
                <p className="text-[11px] text-muted-foreground">
                  Nhập mã PIN bảo mật để đọc lại các tin nhắn đã mờ chống nhìn trộm.
                </p>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Mã PIN (080497)"
                  value={unblurPin}
                  onChange={(e) => setUnblurPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirmUnblur()}
                  className="w-full text-center tracking-[0.25em] font-mono text-sm px-3 py-1.5 rounded-xl bg-black/50 border border-white/20 text-white focus:outline-none focus:border-sky-500"
                />
                {unblurError && (
                  <p className="text-[10px] font-bold text-rose-400">{unblurError}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowUnblurModal(false);
                      setUnblurPin("");
                      setUnblurError(null);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-muted-foreground"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmUnblur}
                    className="flex-1 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow"
                  >
                    Xác Nhận
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: SINGLE MESSAGE DECRYPT */}
          {decryptModalMsgId && (
            <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in">
              <div className="w-full max-w-[280px] p-5 rounded-3xl glass-card border border-white/20 shadow-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-white">GIẢI MÃ TIN NHẮN</h4>
                <input
                  type="text"
                  placeholder="Nhập mật mã người gửi cung cấp..."
                  value={decryptGuess}
                  onChange={(e) => setDecryptGuess(e.target.value)}
                  className="w-full text-center text-xs px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDecryptModalMsgId(null);
                      setDecryptGuess("");
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-muted-foreground"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      const msg = messages.find((m) => m.id === decryptModalMsgId);
                      if (msg) {
                        handleDecryptSingle(msg.id, msg.cipherText, msg.keyHash);
                      }
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow"
                  >
                    Giải Mã
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
