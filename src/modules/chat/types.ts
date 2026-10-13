export interface ChatMessage {
  id: string;
  sender: string;
  targetUser?: string; // "public" or username of recipient
  name: string;
  role: "admin" | "user";
  avatar: string;
  avatarUrl?: string;
  text: string;
  time: string;
  createdAt: number;
  isEncrypted?: boolean;
  cipherText?: string;
  keyHash?: string;
}

export interface ChatContextType {
  messages: ChatMessage[];
  isChatWidgetVisible: boolean;
  toggleChatWidget: (visible?: boolean) => void;
  sendMessage: (
    text: string,
    targetUser?: string,
    isEncrypted?: boolean,
    password?: string
  ) => void;
  clearChat: (targetUser?: string) => void;
  decryptMessage: (
    cipherText: string,
    keyHash: string,
    guessKey: string
  ) => { success: boolean; text: string };
}

