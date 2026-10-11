export interface ChatMessage {
  id: string;
  sender: string;
  name: string;
  role: "admin" | "user";
  avatar: string;
  avatarUrl?: string;
  text: string;
  time: string;
}

export interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  clearChat: () => void;
}
