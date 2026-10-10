"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface TelegramBotInfo {
  id: number;
  name: string;
  username: string;
}

interface TelegramContextType {
  botToken: string;
  chatId: string;
  botInfo: TelegramBotInfo | null;
  isConnected: boolean;
  saveConfig: (token: string, chatId: string) => void;
  testConnection: (tokenToTest?: string) => Promise<{ success: boolean; bot?: TelegramBotInfo; error?: string }>;
  sendTestMessage: (customText?: string) => Promise<{ success: boolean; error?: string }>;
  autoDetectChatId: () => Promise<{ success: boolean; chatId?: string; error?: string }>;
  disconnect: () => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [botInfo, setBotInfo] = useState<TelegramBotInfo | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("datavault_telegram_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.botToken) setBotToken(parsed.botToken);
        if (parsed.chatId) setChatId(parsed.chatId);
        if (parsed.botInfo) setBotInfo(parsed.botInfo);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveConfig = (token: string, chat: string) => {
    setBotToken(token.trim());
    setChatId(chat.trim());
    try {
      localStorage.setItem(
        "datavault_telegram_config",
        JSON.stringify({
          botToken: token.trim(),
          chatId: chat.trim(),
          botInfo,
        })
      );
    } catch {
      // ignore
    }
  };

  const testConnection = async (tokenToTest?: string) => {
    const t = (tokenToTest || botToken).trim();
    if (!t) return { success: false, error: "Vui lòng nhập Token Bot Telegram." };

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_bot", token: t }),
      });
      const data = await res.json();
      if (data.success && data.bot) {
        setBotInfo(data.bot);
        try {
          localStorage.setItem(
            "datavault_telegram_config",
            JSON.stringify({
              botToken: t,
              chatId,
              botInfo: data.bot,
            })
          );
        } catch {
          // ignore
        }
        return { success: true, bot: data.bot };
      } else {
        return { success: false, error: data.error || "Token không hợp lệ." };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối tới Telegram.";
      return { success: false, error: msg };
    }
  };

  const sendTestMessage = async (customText?: string) => {
    if (!botToken.trim()) return { success: false, error: "Chưa cấu hình Bot Token." };
    if (!chatId.trim()) return { success: false, error: "Chưa cấu hình Chat ID." };

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          token: botToken.trim(),
          chatId: chatId.trim(),
          text: customText || "🚀 <b>[DataVault Cloud Hub]</b> Xin chào! Bot Telegram đã được kết nối thành công với trạm dữ liệu của bạn.",
        }),
      });
      const data = await res.json();
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi gửi tin nhắn.";
      return { success: false, error: msg };
    }
  };

  const autoDetectChatId = async () => {
    if (!botToken.trim()) return { success: false, error: "Chưa nhập Bot Token." };

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_updates", token: botToken.trim() }),
      });
      const data = await res.json();
      if (data.success && data.chats && data.chats.length > 0) {
        const found = String(data.chats[data.chats.length - 1].id);
        setChatId(found);
        saveConfig(botToken, found);
        return { success: true, chatId: found };
      }
      return {
        success: false,
        error: "Chưa tìm thấy tin nhắn nào. Vui lòng mở Telegram, tìm bot và bấm 'Start' hoặc gửi 1 tin nhắn bất kỳ cho bot rồi bấm thử lại!",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi kiểm tra tin nhắn gần đây.";
      return { success: false, error: msg };
    }
  };

  const disconnect = () => {
    setBotToken("");
    setChatId("");
    setBotInfo(null);
    try {
      localStorage.removeItem("datavault_telegram_config");
    } catch {
      // ignore
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        botToken,
        chatId,
        botInfo,
        isConnected: !!botInfo && !!botToken,
        saveConfig,
        testConnection,
        sendTestMessage,
        autoDetectChatId,
        disconnect,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }
  return context;
}
