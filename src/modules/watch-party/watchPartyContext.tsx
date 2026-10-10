"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  SyncRoom,
  MediaItem,
  RoomMember,
  RoomChatMessage,
  UserSavedBookmark,
  MediaSourceType,
  RoomReaction,
} from "./types";
import { useAuth } from "@/modules/auth/authContext";
import { extractYouTubeId, getYouTubeThumbnail, detectMediaSource } from "./youtubeHelper";

interface WatchPartyContextType {
  rooms: SyncRoom[];
  currentRoom: SyncRoom | null;
  savedBookmarks: UserSavedBookmark[];
  reactions: RoomReaction[];
  createRoom: (name: string, description: string, isPrivate?: boolean, password?: string) => SyncRoom;
  joinRoom: (codeOrId: string, password?: string) => { success: boolean; error?: string };
  leaveRoom: () => void;
  orderSong: (
    url: string,
    title?: string,
    isVideo?: boolean,
    artistOrChannel?: string
  ) => { success: boolean; error?: string };
  playNextInQueue: () => void;
  removeQueueItem: (itemId: string) => void;
  kickMember: (targetUsername: string) => { success: boolean; error?: string };
  sendChatMessage: (text: string) => void;
  sendReaction: (emoji: string) => void;
  togglePlayPause: () => void;
  seekMedia: (timeSeconds: number) => void;
  saveBookmark: (title: string, url: string, isVideo?: boolean, note?: string) => void;
  deleteBookmark: (bookmarkId: string) => void;
  playSavedBookmark: (bookmark: UserSavedBookmark) => void;
}

const WatchPartyContext = createContext<WatchPartyContextType | undefined>(undefined);

const STORAGE_ROOMS_KEY = "txclonedriver_watch_rooms";

// Initial active rooms for immediate testing & party experience
const INITIAL_ROOMS: SyncRoom[] = [
  {
    id: "room-lofi",
    code: "LOFI-VIP",
    name: "Phòng Âm Nhạc Lofi & Chillout 24/7",
    description: "Nghe nhạc thư giãn cùng nhau, cùng chia sẻ playlist học tập và làm việc.",
    isPrivate: false,
    hostUsername: "admin",
    currentMedia: {
      id: "media-lofi-1",
      title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
      artistOrChannel: "Lofi Girl",
      source: "youtube",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      youtubeId: "jfKfPfyJRdk",
      isVideo: true,
      addedBy: { username: "admin", name: "Quản trị viên" },
      requestedAt: "Vừa xong",
      likes: 12,
    },
    isPlaying: true,
    currentTimeSeconds: 45,
    lastSyncTimestamp: Date.now(),
    members: [
      {
        id: "m-1",
        username: "admin",
        name: "Quản trị viên",
        avatarInitials: "AD",
        isHost: true,
        joinedAt: "10 phút trước",
      },
      {
        id: "m-2",
        username: "11",
        name: "Thành viên A",
        avatarInitials: "11",
        isHost: false,
        joinedAt: "5 phút trước",
      },
      {
        id: "m-3",
        username: "userb",
        name: "Thành viên B",
        avatarInitials: "UB",
        isHost: false,
        joinedAt: "2 phút trước",
      },
    ],
    queue: [
      {
        id: "media-queue-1",
        title: "Synthwave Radio - Chill Synth / Retro Beats",
        artistOrChannel: "Lofi Girl Synth",
        source: "youtube",
        url: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
        youtubeId: "4xDzrJKXOOY",
        isVideo: true,
        addedBy: { username: "11", name: "Thành viên A" },
        requestedAt: "3 phút trước",
        likes: 5,
      },
      {
        id: "media-queue-2",
        title: "Bản Nhạc Acoustic Guitar Nhẹ Nhàng (Google Drive)",
        artistOrChannel: "Google Drive • TxCloneDriver",
        source: "drive",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        isVideo: false,
        addedBy: { username: "userb", name: "Thành viên B" },
        requestedAt: "1 phút trước",
        likes: 3,
      },
    ],
    chat: [
      {
        id: "c-1",
        username: "admin",
        name: "Quản trị viên",
        text: "Chào mừng các bạn đến phòng nghe nhạc chung TxCloneDriver! Mọi người có thể paste link YouTube vào để order bài hát nhé 🎉",
        timestamp: "10:30",
        isSystem: false,
      },
      {
        id: "c-2",
        username: "11",
        name: "Thành viên A",
        text: "Em vừa order thêm bài Synthwave vào hàng đợi rồi ạ!",
        timestamp: "10:32",
        isSystem: false,
      },
    ],
    createdAt: "10/10/2026",
  },
  {
    id: "room-cinema",
    code: "CINEMA-4K",
    name: "Rạp Chiếu Phim Cinema TxCloneDriver",
    description: "Xem phim bom tấn, trailer điện ảnh độ nét cao và bàn luận trực tiếp cùng bạn bè.",
    isPrivate: false,
    hostUsername: "admin",
    currentMedia: {
      id: "media-cinema-1",
      title: "Big Buck Bunny 4K Cinema Special Edition",
      artistOrChannel: "Blender Animation Studio",
      source: "direct",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      isVideo: true,
      addedBy: { username: "admin", name: "Quản trị viên" },
      requestedAt: "15 phút trước",
      likes: 8,
    },
    isPlaying: true,
    currentTimeSeconds: 12,
    lastSyncTimestamp: Date.now(),
    members: [
      {
        id: "m-c1",
        username: "admin",
        name: "Quản trị viên",
        avatarInitials: "AD",
        isHost: true,
        joinedAt: "15 phút trước",
      },
    ],
    queue: [],
    chat: [
      {
        id: "c-c1",
        username: "admin",
        name: "Quản trị viên",
        text: "Phim đang chạy chế độ Cinema 4K đồng bộ. Chủ phòng có quyền tua và chuyển cảnh.",
        timestamp: "10:15",
      },
    ],
    createdAt: "10/10/2026",
  },
];

export function WatchPartyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [rooms, setRooms] = useState<SyncRoom[]>(INITIAL_ROOMS);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [savedBookmarks, setSavedBookmarks] = useState<UserSavedBookmark[]>([]);
  const [reactions, setReactions] = useState<RoomReaction[]>([]);

  // Load rooms and user bookmarks from localStorage
  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem(STORAGE_ROOMS_KEY);
      if (savedRooms) {
        setRooms(JSON.parse(savedRooms));
      } else {
        localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(INITIAL_ROOMS));
      }
    } catch {
      // ignore
    }
  }, []);

  // Load user-specific bookmarks
  useEffect(() => {
    if (!user) {
      setSavedBookmarks([]);
      return;
    }
    try {
      const key = `txclonedriver_saved_media_${user.username}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setSavedBookmarks(JSON.parse(saved));
      } else {
        // Pre-populate with nice starter bookmarks
        const starter: UserSavedBookmark[] = [
          {
            id: "bm-1",
            username: user.username,
            title: "Lofi Hip Hop Radio (Lofi Girl)",
            artistOrChannel: "YouTube Music",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            source: "youtube",
            youtubeId: "jfKfPfyJRdk",
            isVideo: true,
            savedAt: "10/10/2026",
            note: "Nhạc chill học tập",
          },
          {
            id: "bm-2",
            username: user.username,
            title: "Chill Piano Relaxation & Nature Rain",
            artistOrChannel: "Soothing Sounds",
            url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
            source: "youtube",
            youtubeId: "lTRiuFIWV54",
            isVideo: true,
            savedAt: "10/10/2026",
            note: "Tiếng mưa và piano êm dịu",
          },
        ];
        setSavedBookmarks(starter);
        localStorage.setItem(key, JSON.stringify(starter));
      }
    } catch {
      // ignore
    }
  }, [user]);

  const saveRoomsList = (updated: SyncRoom[]) => {
    setRooms(updated);
    try {
      localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const currentRoom = rooms.find((r) => r.id === currentRoomId) || null;

  // Create Room
  const createRoom = (
    name: string,
    description: string,
    isPrivate = false,
    password?: string
  ): SyncRoom => {
    const code = `TX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now()
      .toString(36)
      .slice(-3)
      .toUpperCase()}`;

    const hostMember: RoomMember = {
      id: `m-${Date.now()}`,
      username: user?.username || "guest",
      name: user?.name || "Người dùng",
      avatarInitials: user?.avatarInitials || "TX",
      isHost: true,
      joinedAt: "Vừa xong",
    };

    const newRoom: SyncRoom = {
      id: `room-${Date.now()}`,
      code,
      name: name.trim() || "Phòng Xem Chung TxCloneDriver",
      description: description.trim() || "Phòng thưởng thức âm nhạc và video trực tiếp",
      isPrivate,
      password: password?.trim(),
      hostUsername: user?.username || "guest",
      currentMedia: null,
      isPlaying: false,
      currentTimeSeconds: 0,
      lastSyncTimestamp: Date.now(),
      members: [hostMember],
      queue: [],
      chat: [
        {
          id: `c-${Date.now()}`,
          username: "system",
          name: "Hệ thống TxCloneDriver",
          text: `Phòng "${name}" đã được tạo bởi @${user?.username || "admin"}. Hãy gửi mã "${code}" cho bạn bè để cùng tham gia!`,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          isSystem: true,
        },
      ],
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    const updated = [newRoom, ...rooms];
    saveRoomsList(updated);
    setCurrentRoomId(newRoom.id);
    return newRoom;
  };

  // Join Room
  const joinRoom = (codeOrId: string, password?: string): { success: boolean; error?: string } => {
    const query = codeOrId.trim().toUpperCase();
    const target = rooms.find(
      (r) => r.id === codeOrId || r.code.toUpperCase() === query
    );

    if (!target) {
      return { success: false, error: "Không tìm thấy phòng với mã hoặc ID này." };
    }

    if (target.isPrivate && target.password && target.password !== password?.trim()) {
      return { success: false, error: "Mật khẩu phòng không chính xác." };
    }

    // Add current user to members if not already inside
    const currentUsername = user?.username || "guest";
    const alreadyMember = target.members.some((m) => m.username === currentUsername);

    let updatedMembers = target.members;
    if (!alreadyMember) {
      const newMember: RoomMember = {
        id: `m-${Date.now()}`,
        username: currentUsername,
        name: user?.name || "Người dùng",
        avatarInitials: user?.avatarInitials || "TX",
        isHost: target.hostUsername === currentUsername,
        joinedAt: "Vừa xong",
      };
      updatedMembers = [...target.members, newMember];
    }

    const joinMessage: RoomChatMessage = {
      id: `c-${Date.now()}`,
      username: "system",
      name: "Hệ thống",
      text: `@${currentUsername} (${user?.name || "Thành viên"}) vừa tham gia phòng.`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isSystem: true,
    };

    const updatedRoom: SyncRoom = {
      ...target,
      members: updatedMembers,
      chat: [...target.chat, joinMessage],
    };

    const updatedRooms = rooms.map((r) => (r.id === target.id ? updatedRoom : r));
    saveRoomsList(updatedRooms);
    setCurrentRoomId(target.id);
    return { success: true };
  };

  // Leave Room
  const leaveRoom = () => {
    if (!currentRoom || !user) {
      setCurrentRoomId(null);
      return;
    }

    // Remove user from room members
    const updatedMembers = currentRoom.members.filter((m) => m.username !== user.username);
    const leaveMsg: RoomChatMessage = {
      id: `c-${Date.now()}`,
      username: "system",
      name: "Hệ thống",
      text: `@${user.username} đã rời phòng.`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isSystem: true,
    };

    const updatedRoom: SyncRoom = {
      ...currentRoom,
      members: updatedMembers,
      chat: [...currentRoom.chat, leaveMsg],
    };

    const updatedRooms = rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r));
    saveRoomsList(updatedRooms);
    setCurrentRoomId(null);
  };

  // Order Song / Video into Queue
  const orderSong = (
    url: string,
    title?: string,
    isVideo = true,
    artistOrChannel?: string
  ): { success: boolean; error?: string } => {
    if (!currentRoom) {
      return { success: false, error: "Bạn chưa tham gia phòng nào." };
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return { success: false, error: "Vui lòng nhập đường link bài hát/video." };
    }

    const source: MediaSourceType = detectMediaSource(trimmedUrl);
    let ytId: string | undefined;
    let autoTitle = title?.trim();
    let autoThumb: string | undefined;

    if (source === "youtube") {
      const extracted = extractYouTubeId(trimmedUrl);
      if (!extracted) {
        return { success: false, error: "Đường link YouTube không hợp lệ. Vui lòng kiểm tra lại." };
      }
      ytId = extracted;
      autoThumb = getYouTubeThumbnail(extracted);
      if (!autoTitle) {
        autoTitle = `YouTube Media (${extracted})`;
      }
    } else if (source === "drive") {
      if (!autoTitle) autoTitle = "Google Drive Audio/Video Track";
    } else {
      if (!autoTitle) autoTitle = "Media Stream Trực Tiếp";
    }

    const newMedia: MediaItem = {
      id: `media-${Date.now()}`,
      title: autoTitle,
      artistOrChannel: artistOrChannel?.trim() || (source === "youtube" ? "YouTube Channel" : "TxCloneDriver"),
      source,
      url: trimmedUrl,
      youtubeId: ytId,
      thumbnailUrl: autoThumb,
      isVideo,
      addedBy: {
        username: user?.username || "guest",
        name: user?.name || "Thành viên",
      },
      requestedAt: "Vừa xong",
      likes: 1,
    };

    // If room currently has nothing playing, play this immediately!
    let updatedCurrent = currentRoom.currentMedia;
    let updatedQueue = [...currentRoom.queue];
    let isPlaying = currentRoom.isPlaying;

    if (!updatedCurrent) {
      updatedCurrent = newMedia;
      isPlaying = true;
    } else {
      updatedQueue.push(newMedia);
    }

    const orderMsg: RoomChatMessage = {
      id: `c-${Date.now()}`,
      username: "system",
      name: "Hệ thống",
      text: `🎵 @${user?.username || "user"} vừa order bài: "${newMedia.title}"`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isSystem: true,
    };

    const updatedRoom: SyncRoom = {
      ...currentRoom,
      currentMedia: updatedCurrent,
      isPlaying,
      queue: updatedQueue,
      chat: [...currentRoom.chat, orderMsg],
    };

    const updatedRooms = rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r));
    saveRoomsList(updatedRooms);
    return { success: true };
  };

  // Play next song in Queue
  const playNextInQueue = () => {
    if (!currentRoom || currentRoom.queue.length === 0) {
      if (currentRoom) {
        const updatedRoom = { ...currentRoom, currentMedia: null, isPlaying: false };
        saveRoomsList(rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
      }
      return;
    }

    const nextMedia = currentRoom.queue[0];
    const remainingQueue = currentRoom.queue.slice(1);

    const nextMsg: RoomChatMessage = {
      id: `c-${Date.now()}`,
      username: "system",
      name: "Hệ thống",
      text: `▶️ Đang chuyển sang bài tiếp theo: "${nextMedia.title}"`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isSystem: true,
    };

    const updatedRoom: SyncRoom = {
      ...currentRoom,
      currentMedia: nextMedia,
      isPlaying: true,
      currentTimeSeconds: 0,
      queue: remainingQueue,
      chat: [...currentRoom.chat, nextMsg],
    };

    saveRoomsList(rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
  };

  // Remove item from Queue
  const removeQueueItem = (itemId: string) => {
    if (!currentRoom) return;
    const updatedQueue = currentRoom.queue.filter((q) => q.id !== itemId);
    const updatedRoom = { ...currentRoom, queue: updatedQueue };
    saveRoomsList(rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
  };

  // Host Action: Kick member from room
  const kickMember = (targetUsername: string): { success: boolean; error?: string } => {
    if (!currentRoom) return { success: false, error: "Chưa ở trong phòng." };

    const isHost = currentRoom.hostUsername === user?.username || user?.role === "admin";
    if (!isHost) {
      return { success: false, error: "Chỉ Chủ phòng mới có quyền kích thành viên." };
    }

    if (targetUsername === currentRoom.hostUsername) {
      return { success: false, error: "Không thể kích Chủ phòng ra khỏi phòng." };
    }

    const updatedMembers = currentRoom.members.filter((m) => m.username !== targetUsername);
    const kickMsg: RoomChatMessage = {
      id: `c-${Date.now()}`,
      username: "system",
      name: "Hệ thống",
      text: `🚫 Thành viên @${targetUsername} đã bị Chủ phòng mời ra khỏi phòng.`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isSystem: true,
    };

    const updatedRoom: SyncRoom = {
      ...currentRoom,
      members: updatedMembers,
      chat: [...currentRoom.chat, kickMsg],
    };

    saveRoomsList(rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
    return { success: true };
  };

  // Send Chat Message
  const sendChatMessage = (text: string) => {
    if (!currentRoom || !text.trim()) return;

    const newMsg: RoomChatMessage = {
      id: `c-${Date.now()}`,
      username: user?.username || "guest",
      name: user?.name || "Thành viên",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedRoom = {
      ...currentRoom,
      chat: [...currentRoom.chat, newMsg],
    };
    saveRoomsList(rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
  };

  // Send Floating Live Reaction
  const sendReaction = (emoji: string) => {
    const newReaction: RoomReaction = {
      id: `rx-${Date.now()}-${Math.random()}`,
      emoji,
      username: user?.username || "user",
      timestamp: Date.now(),
    };
    setReactions((prev) => [...prev.slice(-20), newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3000);
  };

  // Toggle Play / Pause
  const togglePlayPause = () => {
    if (!currentRoom) return;
    const isHost = currentRoom.hostUsername === user?.username || user?.role === "admin";
    if (!isHost) return;

    const updatedRoom = {
      ...currentRoom,
      isPlaying: !currentRoom.isPlaying,
      lastSyncTimestamp: Date.now(),
    };
    saveRoomsList(rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
  };

  // Seek Media
  const seekMedia = (timeSeconds: number) => {
    if (!currentRoom) return;
    const isHost = currentRoom.hostUsername === user?.username || user?.role === "admin";
    if (!isHost) return;

    const updatedRoom = {
      ...currentRoom,
      currentTimeSeconds: timeSeconds,
      lastSyncTimestamp: Date.now(),
    };
    saveRoomsList(rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
  };

  // User Favorite Bookmark Manager (Lưu link theo tài khoản)
  const saveBookmark = (title: string, url: string, isVideo = true, note?: string) => {
    if (!user) return;
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    const source = detectMediaSource(trimmedUrl);
    let ytId: string | undefined;
    if (source === "youtube") {
      ytId = extractYouTubeId(trimmedUrl) || undefined;
    }

    const newBookmark: UserSavedBookmark = {
      id: `bm-${Date.now()}`,
      username: user.username,
      title: title.trim() || (ytId ? `YouTube (${ytId})` : "Link đã lưu"),
      url: trimmedUrl,
      source,
      youtubeId: ytId,
      isVideo,
      savedAt: new Date().toLocaleDateString("vi-VN"),
      note: note?.trim(),
    };

    const updated = [newBookmark, ...savedBookmarks];
    setSavedBookmarks(updated);
    try {
      localStorage.setItem(`txclonedriver_saved_media_${user.username}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const deleteBookmark = (bookmarkId: string) => {
    if (!user) return;
    const updated = savedBookmarks.filter((b) => b.id !== bookmarkId);
    setSavedBookmarks(updated);
    try {
      localStorage.setItem(`txclonedriver_saved_media_${user.username}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const playSavedBookmark = (bookmark: UserSavedBookmark) => {
    orderSong(bookmark.url, bookmark.title, bookmark.isVideo, bookmark.artistOrChannel);
  };

  return (
    <WatchPartyContext.Provider
      value={{
        rooms,
        currentRoom,
        savedBookmarks,
        reactions,
        createRoom,
        joinRoom,
        leaveRoom,
        orderSong,
        playNextInQueue,
        removeQueueItem,
        kickMember,
        sendChatMessage,
        sendReaction,
        togglePlayPause,
        seekMedia,
        saveBookmark,
        deleteBookmark,
        playSavedBookmark,
      }}
    >
      {children}
    </WatchPartyContext.Provider>
  );
}

export function useWatchParty() {
  const context = useContext(WatchPartyContext);
  if (!context) {
    throw new Error("useWatchParty must be used within a WatchPartyProvider");
  }
  return context;
}
