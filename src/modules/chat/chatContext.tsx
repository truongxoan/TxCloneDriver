"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ChatMessage, ChatContextType } from "./types";
import { useAuth } from "@/modules/auth/authContext";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = "txclonedriver_chat_messages";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    sender: "admin",
    name: "Quản trị viên Tối cao",
    role: "admin",
    avatar: "TX",
    text: "Chào mừng toàn thể anh em đến với TxCloneDriver Cloud Hub! Hãy cùng trải nghiệm xem phim, nghe nhạc và các trò chơi mới nhé!",
    time: "08:00",
  },
  {
    id: "m-2",
    sender: "userb",
    name: "Thành viên B",
    role: "user",
    avatar: "UB",
    text: "Game Tài Xỉu và Cờ Tướng chơi rất mượt admin ơi! Cảm ơn sếp!",
    time: "08:15",
  },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
      }
    } catch {}
  }, []);

  const saveMessages = (list: ChatMessage[]) => {
    setMessages(list);
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || !user) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatarInitials || "TX",
      avatarUrl: user.avatarUrl,
      text: text.trim(),
      time: timeStr,
    };

    saveMessages([...messages, newMsg]);
  };

  const clearChat = () => {
    saveMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
