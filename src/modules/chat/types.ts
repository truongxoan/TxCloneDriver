export interface ChatMessage {
  id: string;
  sender: string;
  name: string;
  role: "admin" | "user";
  avatar: string;
  avatarUrl?: string;
  text: string;
  time: string;
  isEncrypted?: boolean;
  cipherText?: string;
  keyHash?: string;
}

export interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (text: string, isEncrypted?: boolean, password?: string) => void;
  clearChat: () => void;
  decryptMessage: (
    cipherText: string,
    keyHash: string,
    guessKey: string
  ) => { success: boolean; text: string };
}
