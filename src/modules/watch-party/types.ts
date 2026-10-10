export type MediaSourceType = "youtube" | "drive" | "direct";

export interface MediaItem {
  id: string;
  title: string;
  artistOrChannel?: string;
  source: MediaSourceType;
  url: string;
  youtubeId?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  isVideo: boolean;
  addedBy: {
    username: string;
    name: string;
  };
  requestedAt: string;
  likes?: number;
}

export interface RoomMember {
  id: string;
  username: string;
  name: string;
  avatarInitials: string;
  isHost: boolean;
  joinedAt: string;
}

export interface RoomChatMessage {
  id: string;
  username: string;
  name: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface RoomReaction {
  id: string;
  emoji: string;
  username: string;
  timestamp: number;
}

export interface SyncRoom {
  id: string;
  code: string;
  name: string;
  description: string;
  isPrivate: boolean;
  password?: string;
  hostUsername: string;
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  currentTimeSeconds: number;
  lastSyncTimestamp: number;
  members: RoomMember[];
  queue: MediaItem[];
  chat: RoomChatMessage[];
  createdAt: string;
}

export interface UserSavedBookmark {
  id: string;
  username: string;
  title: string;
  artistOrChannel?: string;
  url: string;
  source: MediaSourceType;
  youtubeId?: string;
  isVideo: boolean;
  savedAt: string;
  note?: string;
}
