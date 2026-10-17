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
  Search,
  CheckCircle2,
  Smile,
  ChevronRight,
} from "lucide-react";
import { useChat } from "./chatContext";
import { useAuth } from "@/modules/auth/authContext";
import { cn } from "@/lib/utils";

const MASTER_PIN = "080497";
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes inactivity lock
const BLUR_TIMEOUT_MS = 20 * 1000; // 20 seconds anti-peep blur
const UNBLUR_SESSION_MS = 60 * 1000; // 60 seconds unblur session expiry

type SizeMode = "compact" | "expanded" | "fullscreen";

export function FloatingMessenger() {
  const { messages, isChatWidgetVisible, toggleChatWidget, sendMessage, clearChat, decryptMessage } = useChat();
  const { user, isAdmin, managedUsers } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [sizeMode, setSizeMode] = useState<SizeMode>("expanded");
  const [activeTab, setActiveTab] = useState<"public" | "private" | "spy">("public");
  const [selectedPeer, setSelectedPeer] = useState<string>("");
  const [peerSearchQuery, setPeerSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [encryptToggle, setEncryptToggle] = useState(false);
  const [encryptKey, setEncryptKey] = useState("");

  // Load size mode preference from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("txclonedriver_chat_size_mode") as SizeMode;
      if (savedMode && ["compact", "expanded", "fullscreen"].includes(savedMode)) {
        setSizeMode(savedMode);
      }
    } catch {}
  }, []);

  // Hover timer state for the subtle edge bubble (reveal full bubble after 1s hover)
  const [isEdgeHovered, setIsEdgeHovered] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleEdgeMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsEdgeHovered(true);
    }, 1000); // 1-second hover requirement
  };

  const handleEdgeMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsEdgeHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // Listen for open/close floating messenger events
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setLastActivity(Date.now());
    };
    const handleClose = () => {
      setIsOpen(false);
    };
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
      setLastActivity(Date.now());
    };
    window.addEventListener("open-floating-messenger", handleOpen);
    window.addEventListener("close-floating-messenger", handleClose);
    window.addEventListener("toggle-floating-messenger", handleToggle);
    return () => {
      window.removeEventListener("open-floating-messenger", handleOpen);
      window.removeEventListener("close-floating-messenger", handleClose);
      window.removeEventListener("toggle-floating-messenger", handleToggle);
    };
  }, []);

  const changeSizeMode = (mode: SizeMode) => {
    setSizeMode(mode);
    try {
      localStorage.setItem("txclonedriver_chat_size_mode", mode);
    } catch {}
  };

  // Auto-lock after 5 min idle
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Unblur unlocked state for session
  const [isContentUnblurred, setIsContentUnblurred] = useState(false);
  const [unblurExpiresAt, setUnblurExpiresAt] = useState<number | null>(null);
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
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Available users to chat with (excluding current user)
  const peerUsers = managedUsers.filter((u) => u.username !== user?.username);
  const filteredPeerUsers = peerUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(peerSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(peerSearchQuery.toLowerCase())
  );

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

  // Idle timer for 5 minutes
  useEffect(() => {
    if (isLocked || !isOpen) return;
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
        setIsLocked(true);
        setIsContentUnblurred(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lastActivity, isLocked, isOpen]);

  // Periodic tick to re-evaluate 20s blur & 60s unblur session expiry
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);

      // Auto re-blur when unblur session expires
      if (unblurExpiresAt && Date.now() > unblurExpiresAt) {
        setIsContentUnblurred(false);
        setUnblurExpiresAt(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [unblurExpiresAt]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, activeTab, selectedPeer, sizeMode]);

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
        setPinError("🚨 CẢNH BÁO AN NINH: Nhập sai PIN quá 3 lần! Lịch sử trò chuyện đã tự hủy hoàn toàn!");
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
      setUnblurExpiresAt(Date.now() + UNBLUR_SESSION_MS); // Auto re-blur after 60 seconds
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

  // Re-blur immediately
  const handleLockBlurNow = () => {
    setIsContentUnblurred(false);
    setUnblurExpiresAt(null);
  };

  // Handle Send
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  // Quick Emoji Inject
  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    registerActivity();
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
      // Wrong key -> runic scrambler output
      setDecryptedCache((prev) => ({ ...prev, [msgId]: res.text }));
      setDecryptModalMsgId(null);
      setDecryptGuess("");
      alert("Mật khẩu giải mã sai! Nội dung đã bị mã hóa thành ký tự cổ không đọc được.");
    }
  };

  // Filter messages based on active tab
  const currentUsername = user?.username || "";
  const displayedMessages = messages.filter((m) => {
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

  // Calculate unread / message counts
  const publicCount = messages.filter((m) => !m.targetUser || m.targetUser === "public").length;
  const privateCount = messages.filter(
    (m) =>
      m.targetUser !== "public" &&
      (m.sender === currentUsername || m.targetUser === currentUsername)
  ).length;

  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  useEffect(() => {
    const update = () => {
      setIsCinemaOpen(document.body.classList.contains("cinema-video-open"));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (isCinemaOpen) return null;

  return (
    <>
      {/* DOCKED FLOATING LAUNCHER: Tọa lạc gọn gàng ở góc dưới phải (bottom-24 right-4),
          trên thanh dock, không che thanh cuộn, không đè nút của các ứng dụng/game */}
      {isChatWidgetVisible && !isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[60] flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200 select-none">
          {/* Nút Ẩn Nhanh Hoàn Toàn */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleChatWidget(false);
            }}
            className="h-8 w-8 rounded-full bg-slate-900/90 hover:bg-rose-600/90 text-slate-400 hover:text-white border border-white/10 shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Ẩn nút chat này (Bật lại bất cứ lúc nào ở thanh Header)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          {/* Nút Bong Bóng Chat Chính */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setLastActivity(Date.now());
            }}
            className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            title="Bấm để mở khung chat TxMessenger"
          >
            <div className="relative">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-blue-600 animate-pulse" />
            </div>

            <div className="flex items-center gap-1.5 text-left">
              <span className="text-xs font-bold leading-tight">TxMessenger</span>
              {messages.length > 0 && (
                <span className="text-[10px] font-black text-white px-1.5 py-0.2 rounded-full bg-rose-500 shadow-sm font-mono">
                  {messages.length > 99 ? "99+" : messages.length}
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Floating Messenger Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex flex-col rounded-3xl glass-card border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300",
            sizeMode === "compact" &&
              "bottom-5 right-4 sm:right-6 w-[95vw] sm:w-[480px] md:w-[520px] max-h-[660px] h-[82vh]",
            sizeMode === "expanded" &&
              "bottom-4 right-2 sm:right-6 w-[96vw] sm:w-[740px] md:w-[860px] lg:w-[940px] max-h-[820px] h-[88vh]",
            sizeMode === "fullscreen" &&
              "inset-2 sm:inset-4 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] rounded-2xl"
          )}
        >
          {/* Top Window Header Bar */}
          <div className="p-3 px-4 bg-slate-900/95 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-xs shadow-md">
                <MessageCircle className="w-4 h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-black text-white flex items-center gap-1.5 leading-tight">
                  TxMessenger &bull; Khung Chat Mở Rộng
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-300 flex items-center gap-1.5">
                  <span className="text-sky-300 flex items-center gap-1 font-semibold">
                    <Clock className="w-2.5 h-2.5" /> Tự khóa 5p
                  </span>
                  <span>&bull;</span>
                  <span className="text-pink-300 flex items-center gap-1 font-semibold">
                    <EyeOff className="w-2.5 h-2.5" /> Mờ 20s
                  </span>
                  <span>&bull;</span>
                  <span className="text-emerald-300 font-mono text-[9px]">PIN: 080497</span>
                </span>
              </div>
            </div>

            {/* Action Buttons: Size Toggle, Lock Now, Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Unblur status / Manual Re-blur button */}
              {isContentUnblurred && (
                <button
                  onClick={handleLockBlurNow}
                  className="px-2 py-1 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Làm mờ lại ngay lập tức"
                >
                  <EyeOff className="w-3 h-3" />
                  <span className="hidden sm:inline">Khóa mờ ngay</span>
                </button>
              )}

              {/* Size Mode Switcher: Compact <-> Expanded <-> Fullscreen */}
              <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
                <button
                  onClick={() => changeSizeMode(sizeMode === "compact" ? "expanded" : "compact")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                    sizeMode === "compact"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                  title={sizeMode === "compact" ? "Đang ở chế độ Thu gọn" : "Thu gọn cửa sổ"}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => changeSizeMode(sizeMode === "expanded" ? "compact" : "expanded")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                    sizeMode === "expanded"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                  title={sizeMode === "expanded" ? "Đang ở chế độ Mở Rộng" : "Mở rộng khung chat"}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Manual Instant Lock Button */}
              <button
                onClick={() => {
                  setIsLocked(true);
                  setIsContentUnblurred(false);
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-300 transition-colors cursor-pointer"
                title="Khóa bảo mật ngay lập tức (Yêu cầu PIN 080497)"
              >
                <Lock className="w-4 h-4" />
              </button>

              {/* Turn Off / Hide Messenger completely */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  toggleChatWidget(false);
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-300 transition-colors cursor-pointer"
                title="Tắt khung chat hoàn toàn (Ẩn cả icon góc màn hình, bật lại ở Header)"
              >
                <EyeOff className="w-4 h-4" />
              </button>

              {/* Close Messenger (Collapse to icon) */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                title="Thu nhỏ khung chat xuống góc màn hình"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body: Dual-Pane (when expanded or fullscreen) or Single-Pane (when compact) */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* INACTIVITY / PIN LOCK OVERLAY */}
            {isLocked && (
              <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 shadow-2xl shadow-rose-500/30 animate-pulse">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-white">PHIÊN CHAT ĐANG KHÓA BẢO MẬT</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-[300px] leading-relaxed">
                  Tự động khóa sau 5 phút không tương tác để chống nhìn lén. Nhập mã PIN két sắt để mở khóa.
                </p>

                <div className="mt-4 w-full max-w-[260px] space-y-2.5">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Mã PIN (Mặc định: 080497)"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                    className="w-full text-center tracking-[0.3em] font-mono text-base px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white focus:outline-none focus:border-rose-500 shadow-inner"
                  />
                  {pinError && (
                    <p className="text-[11px] font-bold text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 leading-tight">
                      {pinError}
                    </p>
                  )}
                  <button
                    onClick={handleUnlock}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    Mở Khóa Trò Chuyện
                  </button>
                </div>
              </div>
            )}

            {/* LEFT SIDEBAR: Channels & Member List (Visible in Expanded / Fullscreen mode) */}
            {sizeMode !== "compact" && (
              <div className="w-60 sm:w-64 border-r border-white/10 bg-slate-950/70 flex flex-col shrink-0">
                {/* Search member input */}
                <div className="p-2.5 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm thành viên..."
                      value={peerSearchQuery}
                      onChange={(e) => setPeerSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Channels List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {/* Public Channel */}
                  <button
                    onClick={() => {
                      setActiveTab("public");
                      registerActivity();
                    }}
                    className={cn(
                      "w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer",
                      activeTab === "public"
                        ? "bg-blue-600 text-white shadow-md font-bold"
                        : "hover:bg-white/5 text-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold leading-tight truncate">Kênh Chung</p>
                        <p className="text-[10px] text-slate-400 truncate opacity-80">
                          {publicCount} tin nhắn cộng đồng
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Section: Direct 1-1 Chats */}
                  <div className="pt-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Nhắn Tin Riêng 1-1 ({filteredPeerUsers.length})
                    </span>
                  </div>

                  {filteredPeerUsers.map((u) => {
                    const isSelected = activeTab === "private" && selectedPeer === u.username;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setActiveTab("private");
                          setSelectedPeer(u.username);
                          registerActivity();
                        }}
                        className={cn(
                          "w-full p-2 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer",
                          isSelected
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold"
                            : "hover:bg-white/5 text-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative w-7 h-7 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                            {u.avatarInitials || u.username.slice(0, 2).toUpperCase()}
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                          </div>
                          <div className="truncate min-w-0">
                            <p className="text-xs font-semibold truncate leading-tight">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate font-mono">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                      </button>
                    );
                  })}

                  {/* Admin God Vision Channel */}
                  {isAdmin && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setActiveTab("spy");
                          registerActivity();
                        }}
                        className={cn(
                          "w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border",
                          activeTab === "spy"
                            ? "bg-rose-600 border-rose-400 text-white shadow-md font-bold"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Eye className="w-4 h-4 text-rose-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-black leading-tight">Admin God Vision</p>
                            <p className="text-[10px] text-rose-300/80 truncate">
                              Giám sát toàn bộ chat riêng
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RIGHT MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
              {/* Channel Header (When in Compact Mode: Show tab buttons. When Expanded: Show active chat header) */}
              {sizeMode === "compact" ? (
                <div className="flex items-center bg-slate-950/60 p-1 border-b border-white/10 text-xs font-bold shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab("public");
                      registerActivity();
                    }}
                    className={cn(
                      "flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                      activeTab === "public"
                        ? "bg-blue-600 text-white shadow-md font-black"
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
                      "flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                      activeTab === "private"
                        ? "bg-blue-600 text-white shadow-md font-black"
                        : "text-muted-foreground hover:text-white"
                    )}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Chat Riêng</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab("spy");
                        registerActivity();
                      }}
                      className={cn(
                        "flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                        activeTab === "spy"
                          ? "bg-rose-600 text-white shadow-md font-black"
                          : "text-rose-400/80 hover:text-rose-300"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>God Vision</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Header in Expanded mode */
                <div className="p-2.5 px-4 bg-slate-900/60 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {activeTab === "public" && "🌐 Kênh Trò Chuyện Chung"}
                      {activeTab === "private" && `🔒 Chat Riêng Với: @${selectedPeer}`}
                      {activeTab === "spy" && "👁️ Giám Sát Hội Thoại Bí Mật"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      Online Live
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">
                    {displayedMessages.length} tin nhắn trong phòng
                  </div>
                </div>
              )}

              {/* Sub-bar for Compact Mode Private Selector */}
              {sizeMode === "compact" && activeTab === "private" && (
                <div className="p-2 px-3 bg-slate-900/50 border-b border-white/5 flex items-center justify-between gap-2 text-xs shrink-0">
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

              {/* Sub-bar for Admin Spy Targets */}
              {activeTab === "spy" && isAdmin && (
                <div className="p-2 px-3 bg-rose-950/40 border-b border-rose-500/20 text-xs flex items-center gap-2 shrink-0">
                  <span className="text-rose-300 font-bold text-[10px] flex items-center gap-1 shrink-0">
                    <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                    KÊNH GIÁM SÁT:
                  </span>
                  <select
                    value={spyUserA}
                    onChange={(e) => setSpyUserA(e.target.value)}
                    className="bg-black/60 border border-rose-500/30 rounded-xl px-2 py-0.5 text-xs text-rose-200"
                  >
                    {managedUsers.map((u) => (
                      <option key={u.id} value={u.username} className="bg-slate-900">
                        {u.name} (@{u.username})
                      </option>
                    ))}
                  </select>
                  <span className="text-rose-400 font-black">&harr;</span>
                  <select
                    value={spyUserB}
                    onChange={(e) => setSpyUserB(e.target.value)}
                    className="bg-black/60 border border-rose-500/30 rounded-xl px-2 py-0.5 text-xs text-rose-200"
                  >
                    {managedUsers.map((u) => (
                      <option key={u.id} value={u.username} className="bg-slate-900">
                        {u.name} (@{u.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3">
                {displayedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mb-2 opacity-25" />
                    <p className="text-sm font-semibold text-slate-300">
                      Chưa có tin nhắn nào trong hội thoại này
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      Hãy nhập tin nhắn bên dưới để bắt đầu trò chuyện!
                    </p>
                  </div>
                ) : (
                  displayedMessages.map((msg) => {
                    const isMe = msg.sender === currentUsername;
                    const isBlurred =
                      !isContentUnblurred && Date.now() - msg.createdAt > BLUR_TIMEOUT_MS;

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col group",
                          sizeMode === "compact" ? "max-w-[85%]" : "max-w-[75%]",
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        {/* Sender Label */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                          <span className="font-bold text-slate-200">
                            {isMe ? "Bạn" : msg.name}
                          </span>
                          {msg.role === "admin" && (
                            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold">
                              ADMIN
                            </span>
                          )}
                          <span>&bull;</span>
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
                            "p-3 rounded-2xl text-xs sm:text-sm relative transition-all duration-500",
                            isMe
                              ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                              : "bg-slate-800/90 text-slate-100 rounded-tl-none border border-white/10 shadow-sm",
                            isBlurred &&
                              "blur-[6px] select-none opacity-40 cursor-pointer hover:opacity-60"
                          )}
                        >
                          {/* Decrypted or normal text */}
                          {decryptedCache[msg.id] ? (
                            <div className="text-emerald-300 font-mono">
                              🔓 {decryptedCache[msg.id]}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap break-words leading-relaxed">
                              {msg.text}
                            </div>
                          )}

                          {/* If encrypted, show prompt */}
                          {msg.isEncrypted && !decryptedCache[msg.id] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDecryptModalMsgId(msg.id);
                              }}
                              className="mt-2 px-2.5 py-1 rounded-xl bg-black/50 hover:bg-black/70 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 border border-amber-500/40 cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                              <span>Nhập mật khẩu giải mã</span>
                            </button>
                          )}
                        </div>

                        {/* Notice when blurred */}
                        {isBlurred && (
                          <span
                            onClick={() => setShowUnblurModal(true)}
                            className="text-[10px] text-sky-400 font-bold mt-1 cursor-pointer flex items-center gap-1 hover:underline"
                          >
                            <Lock className="w-3 h-3" /> Đã làm mờ chống nhìn trộm (Nhấn để mở bằng
                            PIN 080497)
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
                className="p-3 sm:p-3.5 bg-slate-900/95 border-t border-white/10 space-y-2.5 shrink-0"
              >
                {/* Top Quick Bar: Emoji bar & Encryption toggle */}
                <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                  {/* Quick Emojis */}
                  <div className="flex items-center gap-1">
                    {["👍", "❤️", "🔥", "👏", "😂", "🚀", "🎯", "🔒"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleAddEmoji(emoji)}
                        className="px-1.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs transition-colors cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Encryption Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={encryptToggle}
                        onChange={(e) => setEncryptToggle(e.target.checked)}
                        className="rounded border-white/20 bg-black/40 text-blue-500 focus:ring-0 cursor-pointer"
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
                        className="w-32 sm:w-40 bg-black/60 border border-amber-500/40 rounded-xl px-2.5 py-0.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    )}
                  </div>
                </div>

                {/* Main Text Input Area */}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={sizeMode === "compact" ? 1 : 2}
                    placeholder={
                      activeTab === "public"
                        ? "Nhập tin nhắn công khai... (Enter: Gửi, Shift+Enter: Xuống dòng)"
                        : `Nhắn riêng bảo mật với @${selectedPeer}...`
                    }
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      registerActivity();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 bg-black/50 border border-white/15 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all leading-normal"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="flex h-10 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                    title="Gửi tin nhắn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* MODAL: UNBLUR PIN PROMPT */}
          {showUnblurModal && (
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in">
              <div className="w-full max-w-[300px] p-5 rounded-3xl glass-card border border-white/20 shadow-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
                  <Eye className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-white">MỞ KHÓA TIN NHẮN MỜ</h4>
                <p className="text-[11px] text-slate-300">
                  Nhập mã PIN bảo mật két sắt để đọc lại các tin nhắn. Phiên mở kéo dài 60s và tự động mờ lại.
                </p>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Mã PIN (080497)"
                  value={unblurPin}
                  onChange={(e) => setUnblurPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirmUnblur()}
                  className="w-full text-center tracking-[0.25em] font-mono text-sm px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white focus:outline-none focus:border-sky-500"
                />
                {unblurError && (
                  <p className="text-[10px] font-bold text-rose-400">{unblurError}</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowUnblurModal(false);
                      setUnblurPin("");
                      setUnblurError(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmUnblur}
                    className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow cursor-pointer"
                  >
                    Xác Nhận PIN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: SINGLE MESSAGE DECRYPT */}
          {decryptModalMsgId && (
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in">
              <div className="w-full max-w-[300px] p-5 rounded-3xl glass-card border border-white/20 shadow-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-white">GIẢI MÃ TIN NHẮN BÍ MẬT</h4>
                <p className="text-[11px] text-slate-300">
                  Nhập đúng mật mã người gửi đã đặt khi gửi tin nhắn này:
                </p>
                <input
                  type="text"
                  placeholder="Mật mã giải mã..."
                  value={decryptGuess}
                  onChange={(e) => setDecryptGuess(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const msg = messages.find((m) => m.id === decryptModalMsgId);
                      if (msg) handleDecryptSingle(msg.id, msg.cipherText, msg.keyHash);
                    }
                  }}
                  className="w-full text-center text-xs px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setDecryptModalMsgId(null);
                      setDecryptGuess("");
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 cursor-pointer"
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
                    className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow cursor-pointer"
                  >
                    Giải Mã Ngay
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
