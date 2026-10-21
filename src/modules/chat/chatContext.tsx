"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { ChatMessage, ChatContextType } from "./types";
import { useAuth } from "@/modules/auth/authContext";
import {
  encryptChatMessage,
  decryptChatMessage,
  encodeSteganography,
  SAMPLE_COVER_TEXTS,
} from "./cryptoHelper";
import { playMessageChime } from "@/lib/soundEffects";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = "txclonedriver_chat_messages";
const CHAT_VISIBLE_STORAGE_KEY = "txclonedriver_chat_widget_visible";
const BROADCAST_CHANNEL_NAME = "txclonedriver_realtime_chat";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    sender: "admin",
    targetUser: "public",
    name: "Quản trị viên Tối cao",
    role: "admin",
    avatar: "TX",
    text: "Chào mừng toàn thể anh em đến với TxCloneDriver Cloud Hub! Hệ thống hỗ trợ kênh chat trực tiếp, mã hóa ngụy trang tàng hình và tin nhắn tự hủy.",
    time: "08:00",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "m-2",
    sender: "admin",
    targetUser: "public",
    name: "Quản trị viên Tối cao",
    role: "admin",
    avatar: "TX",
    text: "Chào bạn, tài liệu dự án tuần này mình đã gửi email rồi nhé.",
    coverText: "Chào bạn, tài liệu dự án tuần này mình đã gửi email rồi nhé.",
    time: "08:05",
    createdAt: Date.now() - 1800000,
    isSteganography: true,
    stegoHash: "6c2",
  },
  {
    id: "m-3",
    sender: "userb",
    targetUser: "public",
    name: "Thành viên B",
    role: "user",
    avatar: "UB",
    text: "Game Tài Xỉu và Cờ Tướng chơi rất mượt admin ơi! Cảm ơn sếp!",
    time: "08:15",
    createdAt: Date.now() - 900000,
  },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isChatWidgetVisible, setIsChatWidgetVisible] = useState<boolean>(true);
  const [isIncognitoMode, setIsIncognitoMode] = useState<boolean>(false);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const userRef = useRef(user);
  userRef.current = user;

  // 1. Initialize local cache and BroadcastChannel (0ms in-memory tab-to-tab sync)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
      }
      const savedVisibility = localStorage.getItem(CHAT_VISIBLE_STORAGE_KEY);
      if (savedVisibility !== null) {
        setIsChatWidgetVisible(savedVisibility === "true");
      }
    } catch {}

    // Setup BroadcastChannel for zero-latency cross-tab communication
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, message, targetUser, msgId, readAt } = event.data || {};

        if (type === "NEW_MESSAGE" && message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            const updated = [...prev, message];
            if (!message.isEphemeral) {
              try {
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
              } catch {}
            }
            return updated;
          });

          // Play incoming chime if message is from someone else
          if (message.sender !== userRef.current?.username) {
            playMessageChime();
          }
        } else if (type === "MARK_READ" && msgId) {
          setMessages((prev) => {
            const updated = prev.map((m) =>
              m.id === msgId && !m.readAt ? { ...m, readAt: readAt || Date.now() } : m
            );
            try {
              localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        } else if (type === "DESTROY_MESSAGE" && msgId) {
          setMessages((prev) => {
            const updated = prev.filter((m) => m.id !== msgId);
            try {
              localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        } else if (type === "CLEAR_CHAT") {
          setMessages((prev) => {
            let updated = prev;
            if (!targetUser || targetUser === "public") {
              updated = prev.filter((m) => m.targetUser && m.targetUser !== "public");
            } else {
              const currentUsername = userRef.current?.username;
              updated = prev.filter(
                (m) =>
                  !(
                    (m.sender === currentUsername && m.targetUser === targetUser) ||
                    (m.sender === targetUser && m.targetUser === currentUsername)
                  )
              );
            }
            try {
              localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      };

      return () => {
        channel.close();
        broadcastChannelRef.current = null;
      };
    }
  }, []);

  // 2. Fetch and merge latest messages from server API, and run fast adaptive polling
  useEffect(() => {
    let isSubscribed = true;

    const pullServerMessages = async () => {
      try {
        const res = await fetch("/api/chat", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.messages) && isSubscribed) {
          setMessages((prev) => {
            const existingMap = new Map(prev.map((m) => [m.id, m]));
            let hasNew = false;
            let hasIncomingOther = false;

            data.messages.forEach((srvMsg: ChatMessage) => {
              const existing = existingMap.get(srvMsg.id);
              if (!existing) {
                existingMap.set(srvMsg.id, srvMsg);
                hasNew = true;
                if (srvMsg.sender !== userRef.current?.username) {
                  hasIncomingOther = true;
                }
              } else if (srvMsg.readAt && !existing.readAt) {
                // Sync readAt from another device
                existing.readAt = srvMsg.readAt;
                hasNew = true;
              }
            });

            if (hasNew) {
              const combined = Array.from(existingMap.values());
              combined.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
              try {
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(combined));
              } catch {}
              if (hasIncomingOther) {
                playMessageChime();
              }
              return combined;
            }
            return prev;
          });
        }
      } catch {
        // Silently tolerate network blip
      }
    };

    // Initial pull
    pullServerMessages();

    // Fast polling interval (2.5 seconds)
    const interval = setInterval(pullServerMessages, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  // 3. Local Self-Destruct countdown ticker (Runs every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => {
        let hasExpired = false;
        const remaining: ChatMessage[] = [];

        prev.forEach((m) => {
          if (m.selfDestructSeconds && m.readAt && now >= m.readAt + m.selfDestructSeconds * 1000) {
            hasExpired = true;
            // Trigger server-side and cross-tab deletion
            fetch(`/api/chat?id=${encodeURIComponent(m.id)}`, { method: "DELETE" }).catch(() => {});
            try {
              broadcastChannelRef.current?.postMessage({ type: "DESTROY_MESSAGE", msgId: m.id });
            } catch {}
          } else {
            remaining.push(m);
          }
        });

        if (hasExpired) {
          try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(remaining));
          } catch {}
          return remaining;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleChatWidget = (visible?: boolean) => {
    setIsChatWidgetVisible((prev) => {
      const next = typeof visible === "boolean" ? visible : !prev;
      try {
        localStorage.setItem(CHAT_VISIBLE_STORAGE_KEY, String(next));
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("txclonedriver-chat-visibility-change", { detail: next }));
      }
      return next;
    });
  };

  const saveMessages = (list: ChatMessage[]) => {
    setMessages(list);
    if (!isIncognitoMode) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(list));
      } catch {}
    }
  };

  const destroyMessage = (msgId: string) => {
    setMessages((prev) => {
      const remaining = prev.filter((m) => m.id !== msgId);
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(remaining));
      } catch {}
      return remaining;
    });

    // Broadcast destroy event to all other tabs
    try {
      broadcastChannelRef.current?.postMessage({
        type: "DESTROY_MESSAGE",
        msgId,
      });
    } catch {}

    // Delete on server
    fetch(`/api/chat?id=${encodeURIComponent(msgId)}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const markMessageRead = (msgId: string) => {
    const now = Date.now();
    setMessages((prev) => {
      const updated = prev.map((m) =>
        m.id === msgId && !m.readAt ? { ...m, readAt: now } : m
      );
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Broadcast mark read event
    try {
      broadcastChannelRef.current?.postMessage({
        type: "MARK_READ",
        msgId,
        readAt: now,
      });
    } catch {}

    // Patch on server
    fetch("/api/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msgId, readAt: now }),
    }).catch(() => {});
  };

  const sendMessage = (
    text: string,
    targetUser?: string,
    isEncrypted?: boolean,
    password?: string,
    options?: {
      selfDestructSeconds?: number;
      isSteganography?: boolean;
      coverText?: string;
    }
  ) => {
    if (!text.trim() || !user) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let cipherText: string | undefined;
    let keyHash: string | undefined;
    let displayText = text.trim();
    let isStego = false;
    let cover = options?.coverText;
    let stegoHash: string | undefined;

    // A. Undetectable Steganography Mode
    if (options?.isSteganography && password && password.trim()) {
      isStego = true;
      const effectiveCover = cover?.trim() || SAMPLE_COVER_TEXTS[0];
      const stego = encodeSteganography(effectiveCover, text.trim(), password.trim());
      displayText = stego.fullText;
      cover = effectiveCover;
      stegoHash = stego.stegoHash;
    }
    // B. Standard Cryptographic Cipher Mode
    else if (isEncrypted && password && password.trim()) {
      const encrypted = encryptChatMessage(text.trim(), password.trim());
      cipherText = encrypted.cipherText;
      keyHash = encrypted.keyHash;
      displayText = `🔒 [Tin nhắn mã hóa bảo mật #${encrypted.keyHash}]`;
    }

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sender: user.username,
      targetUser: targetUser || "public",
      name: user.name,
      role: user.role,
      avatar: user.avatarInitials || "TX",
      avatarUrl: user.avatarUrl,
      text: displayText,
      time: timeStr,
      createdAt: Date.now(),
      isEncrypted: !!isEncrypted,
      cipherText,
      keyHash,
      isSteganography: isStego,
      coverText: cover,
      stegoHash,
      selfDestructSeconds: options?.selfDestructSeconds,
      isEphemeral: isIncognitoMode,
    };

    // 1. Optimistic UI update (0ms instant display)
    const updated = [...messages, newMsg];
    saveMessages(updated);

    // 2. BroadcastChannel instant sync (<1ms to all other tabs)
    try {
      broadcastChannelRef.current?.postMessage({
        type: "NEW_MESSAGE",
        message: newMsg,
      });
    } catch {}

    // 3. Asynchronously persist to server API (unless in incognito RAM-only mode)
    if (!isIncognitoMode) {
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMsg }),
      }).catch((err) => console.error("Error broadcasting chat message to server:", err));
    }
  };

  const clearChat = (targetUser?: string) => {
    let updated: ChatMessage[];
    if (!targetUser || targetUser === "public") {
      updated = messages.filter((m) => m.targetUser && m.targetUser !== "public");
    } else {
      const currentUsername = user?.username;
      updated = messages.filter(
        (m) =>
          !(
            (m.sender === currentUsername && m.targetUser === targetUser) ||
            (m.sender === targetUser && m.targetUser === currentUsername)
          )
      );
    }
    saveMessages(updated);

    // Broadcast clear event
    try {
      broadcastChannelRef.current?.postMessage({
        type: "CLEAR_CHAT",
        targetUser,
      });
    } catch {}

    // Clear on server
    fetch(`/api/chat?target=${encodeURIComponent(targetUser || "public")}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isChatWidgetVisible,
        toggleChatWidget,
        sendMessage,
        clearChat,
        destroyMessage,
        markMessageRead,
        decryptMessage: decryptChatMessage,
        isIncognitoMode,
        setIsIncognitoMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return ctx;
}
