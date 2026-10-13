"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ChatMessage, ChatContextType } from "./types";
import { useAuth } from "@/modules/auth/authContext";
import { encryptChatMessage, decryptChatMessage } from "./cryptoHelper";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = "txclonedriver_chat_messages";
const CHAT_VISIBLE_STORAGE_KEY = "txclonedriver_chat_widget_visible";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    sender: "admin",
    targetUser: "public",
    name: "Quản trị viên Tối cao",
    role: "admin",
    avatar: "TX",
    text: "Chào mừng toàn thể anh em đến với TxCloneDriver Cloud Hub! Hệ thống hỗ trợ kênh chat trực tiếp và chat mã hóa bảo mật bí mật.",
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
    text: "🔒 [Tin nhắn mật đã mã hóa] (Mật mã mở: 080497)",
    time: "08:05",
    createdAt: Date.now() - 1800000,
    isEncrypted: true,
    cipherText: "0b1d03091942000f1a4e10170a4501170705",
    keyHash: "6c2",
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
  }, []);

  const toggleChatWidget = (visible?: boolean) => {
    setIsChatWidgetVisible((prev) => {
      const next = typeof visible === "boolean" ? visible : !prev;
      try {
        localStorage.setItem(CHAT_VISIBLE_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const saveMessages = (list: ChatMessage[]) => {
    setMessages(list);
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const sendMessage = (
    text: string,
    targetUser?: string,
    isEncrypted?: boolean,
    password?: string
  ) => {
    if (!text.trim() || !user) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let cipherText: string | undefined;
    let keyHash: string | undefined;
    let displayText = text.trim();

    if (isEncrypted && password && password.trim()) {
      const encrypted = encryptChatMessage(text.trim(), password.trim());
      cipherText = encrypted.cipherText;
      keyHash = encrypted.keyHash;
      displayText = `🔒 [Tin nhắn mã hóa bảo mật #${encrypted.keyHash}]`;
    }

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
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
    };

    saveMessages([...messages, newMsg]);
  };

  const clearChat = (targetUser?: string) => {
    if (!targetUser || targetUser === "public") {
      saveMessages(messages.filter((m) => m.targetUser && m.targetUser !== "public"));
    } else {
      // Clear conversation between current user and targetUser
      const currentUsername = user?.username;
      saveMessages(
        messages.filter(
          (m) =>
            !(
              (m.sender === currentUsername && m.targetUser === targetUser) ||
              (m.sender === targetUser && m.targetUser === currentUsername)
            )
        )
      );
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isChatWidgetVisible,
        toggleChatWidget,
        sendMessage,
        clearChat,
        decryptMessage: decryptChatMessage,
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
