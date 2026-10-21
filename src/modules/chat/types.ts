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

  // Steganography & Camouflage
  isSteganography?: boolean;
  coverText?: string; // Visible normal cover text
  stegoHash?: string;

  // Self-Destruct Timers (5s, 10s, 20s, 30s)
  selfDestructSeconds?: number;
  readAt?: number;
  isBurned?: boolean;

  // Zero-persistence RAM-only mode
  isEphemeral?: boolean;
}

export interface ChatContextType {
  messages: ChatMessage[];
  isChatWidgetVisible: boolean;
  toggleChatWidget: (visible?: boolean) => void;
  sendMessage: (
    text: string,
    targetUser?: string,
    isEncrypted?: boolean,
    password?: string,
    options?: {
      selfDestructSeconds?: number;
      isSteganography?: boolean;
      coverText?: string;
    }
  ) => void;
  clearChat: (targetUser?: string) => void;
  destroyMessage: (msgId: string) => void;
  markMessageRead: (msgId: string) => void;
  decryptMessage: (
    cipherText: string,
    keyHash: string,
    guessKey: string
  ) => { success: boolean; text: string };
  isIncognitoMode: boolean;
  setIsIncognitoMode: (val: boolean) => void;
}
