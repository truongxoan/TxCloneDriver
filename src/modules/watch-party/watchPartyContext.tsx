"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  detectMediaSource,
  resolveEmbedUrl,
} from "./youtubeHelper";

interface WatchPartyContextType {
  rooms: SyncRoom[];
  currentRoom: SyncRoom | null;
  savedBookmarks: UserSavedBookmark[];
  reactions: RoomReaction[];
  createRoom: (name: string, description: string, isPrivate?: boolean, password?: string) => SyncRoom;
  deleteRoom: (roomId: string) => { success: boolean; error?: string };
  clearAllRooms: () => void;
  joinRoom: (codeOrId: string, password?: string) => { success: boolean; error?: string };
  leaveRoom: () => void;
  orderSong: (
    url: string,
    title?: string,
    isVideo?: boolean,
    artistOrChannel?: string,
    forceQueue?: boolean,
    playImmediate?: boolean
  ) => { success: boolean; error?: string };
  playNextInQueue: () => void;
  removeQueueItem: (itemId: string) => void;
  kickMember: (targetUsername: string) => { success: boolean; error?: string };
  sendChatMessage: (text: string) => void;
  sendReaction: (emoji: string) => void;
  orderBatchSongs: (urls: string[]) => { addedCount: number; errors: string[] };
  togglePlayPause: () => void;
  seekMedia: (timeSeconds: number) => void;
  saveBookmark: (title: string, url: string, isVideo?: boolean, note?: string) => void;
  deleteBookmark: (bookmarkId: string) => void;
  playSavedBookmark: (bookmark: UserSavedBookmark) => void;
}

const WatchPartyContext = createContext<WatchPartyContextType | undefined>(undefined);

const STORAGE_ROOMS_KEY = "txclonedriver_watch_rooms";
const STORAGE_CURRENT_ROOM_KEY = "txclonedriver_watch_current_room_id";

// Xóa bỏ tất cả phòng ví dụ mặc định theo yêu cầu của người dùng. Ban đầu là danh sách trống.
const INITIAL_ROOMS: SyncRoom[] = [];

export function WatchPartyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [rooms, setRooms] = useState<SyncRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [savedBookmarks, setSavedBookmarks] = useState<UserSavedBookmark[]>([]);
  const [reactions, setReactions] = useState<RoomReaction[]>([]);

  // Function to pull rooms from server API (ZERO-CACHE) and merge smartly
  const refreshRoomsFromServer = async () => {
    try {
      const res = await fetch(`/api/auth?type=rooms&_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.rooms)) {
          const serverRooms: SyncRoom[] = data.rooms.filter(
            (r: SyncRoom) => r.id !== "room-lofi" && r.id !== "room-cinema"
          );

          setRooms((prev) => {
            // Smart merge: Preserve active local rooms that might not have landed on server yet
            const map = new Map<string, SyncRoom>();
            serverRooms.forEach((r) => map.set(r.id, r));
            prev.forEach((r) => {
              if (!map.has(r.id)) {
                map.set(r.id, r);
              }
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
          return serverRooms;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Load rooms and user bookmarks from localStorage & fast server poll
  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem(STORAGE_ROOMS_KEY);
      if (savedRooms) {
        const parsed = JSON.parse(savedRooms);
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((r: SyncRoom) => r.id !== "room-lofi" && r.id !== "room-cinema")
          : [];
        setRooms(cleaned);
      }
      const savedActiveRoom = localStorage.getItem(STORAGE_CURRENT_ROOM_KEY);
      if (savedActiveRoom) {
        setCurrentRoomId(savedActiveRoom);
      }
    } catch {
      setRooms([]);
    }

    refreshRoomsFromServer();

    // Ultra-Fast polling fallback (1s) for instant responsiveness
    const interval = setInterval(() => {
      refreshRoomsFromServer();
    }, 1000);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "tx_latest_reaction" && e.newValue) {
        try {
          const rx = JSON.parse(e.newValue);
          setReactions((prev) => [...prev.slice(-25), rx]);
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== rx.id));
          }, 3500);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    // Zero-Latency Real-Time WebSocket Push (< 50ms)
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket("wss://ntfy.sh/txclonedriver_hub_events/ws");
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === "message" || parsed.event === "sync_update") {
            refreshRoomsFromServer();
          }
        } catch {}
      };
    } catch {}

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageEvent);
      if (ws) {
        try {
          ws.close();
        } catch {}
      }
    };
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
        setSavedBookmarks([]);
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

    // Sync to Cloud Store immediately so other devices see rooms instantly!
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_rooms", rooms: updated }),
    }).catch(() => {});

    // Broadcast instant update signal to all connected clients
    fetch("https://ntfy.sh/txclonedriver_hub_events", {
      method: "POST",
      body: JSON.stringify({ event: "sync_update", timestamp: Date.now() }),
    }).catch(() => {});
  };

  const changeCurrentRoom = (id: string | null) => {
    setCurrentRoomId(id);
    try {
      if (id) {
        localStorage.setItem(STORAGE_CURRENT_ROOM_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_CURRENT_ROOM_KEY);
      }
    } catch {}
  };

  const currentRoom = rooms.find((r) => r.id === currentRoomId) || null;

  // Create Room
  const createRoom = (
    name: string,
    description: string,
    isPrivate = false,
    password = ""
  ): SyncRoom => {
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = isPrivate ? `PRIV-${randomCode}` : `ROOM-${randomCode}`;

    const newRoom: SyncRoom = {
      id: `room-${Date.now()}`,
      code,
      name: name.trim(),
      description: description.trim() || "Phòng xem và nghe nhạc chung không giới hạn",
      isPrivate,
      password: isPrivate ? password.trim() : undefined,
      hostUsername: user?.username || "admin",
      currentMedia: null,
      isPlaying: false,
      currentTimeSeconds: 0,
      lastSyncTimestamp: Date.now(),
      members: [
        {
          id: `m-${Date.now()}`,
          username: user?.username || "admin",
          name: user?.name || "Chủ phòng",
          avatarInitials: user?.avatarInitials || "TX",
          isHost: true,
          joinedAt: "Vừa xong",
        },
      ],
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
    changeCurrentRoom(newRoom.id);
    return newRoom;
  };

  // Delete Room (Chủ phòng hoặc Admin xóa phòng)
  const deleteRoom = (roomId: string): { success: boolean; error?: string } => {
    const target = rooms.find((r) => r.id === roomId);
    if (!target) return { success: false, error: "Phòng không tồn tại." };

    if (user?.role !== "admin" && target.hostUsername !== user?.username) {
      return { success: false, error: "Chỉ chủ phòng hoặc Quản trị viên mới được xóa phòng này." };
    }

    const updated = rooms.filter((r) => r.id !== roomId);
    saveRoomsList(updated);
    if (currentRoomId === roomId) {
      changeCurrentRoom(null);
    }
    return { success: true };
  };

  // Clear all rooms
  const clearAllRooms = () => {
    saveRoomsList([]);
    changeCurrentRoom(null);
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
    changeCurrentRoom(target.id);
    return { success: true };
  };

  // Leave Room
  const leaveRoom = () => {
    if (!currentRoom || !user) {
      changeCurrentRoom(null);
      return;
    }

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
    changeCurrentRoom(null);
  };

  // Order Song / Video into Queue (Hỗ trợ YouTube, Spotify, ZingMP3, NhacCuaTui, Google Drive, Direct)
  const orderSong = (
    url: string,
    title?: string,
    isVideo = true,
    artistOrChannel?: string,
    forceQueue = false,
    playImmediate = false
  ): { success: boolean; error?: string } => {
    if (!currentRoom) {
      return { success: false, error: "Bạn chưa tham gia phòng nào." };
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return { success: false, error: "Vui lòng nhập đường link bài hát/video/web." };
    }

    const source: MediaSourceType = detectMediaSource(trimmedUrl);
    let ytId: string | undefined;
    let autoTitle = title?.trim();
    let autoThumb: string | undefined;
    const embedUrl = resolveEmbedUrl(trimmedUrl, source, true);

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
    } else if (source === "spotify") {
      if (!autoTitle) autoTitle = "Spotify Music Track";
    } else if (source === "zingmp3") {
      if (!autoTitle) autoTitle = "Zing MP3 Bài Hát";
    } else if (source === "nhaccuatui") {
      if (!autoTitle) autoTitle = "NhacCuaTui Bài Hát";
    } else if (source === "drive") {
      if (!autoTitle) autoTitle = "Google Drive Audio/Video Track";
    } else {
      if (!autoTitle) autoTitle = "Media Stream / Trình duyệt Ngoài";
    }

    const newMedia: MediaItem = {
      id: `media-${Date.now()}`,
      title: autoTitle,
      artistOrChannel:
        artistOrChannel?.trim() ||
        (source === "youtube"
          ? "YouTube Channel"
          : source === "spotify"
          ? "Spotify"
          : source === "zingmp3"
          ? "Zing MP3"
          : source === "nhaccuatui"
          ? "NhacCuaTui"
          : source === "drive"
          ? "Google Drive"
          : "Web Browser"),
      source,
      url: trimmedUrl,
      embedUrl,
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

    let updatedCurrent = currentRoom.currentMedia;
    const updatedQueue = [...currentRoom.queue];
    let isPlaying = currentRoom.isPlaying;

    if (playImmediate) {
      // Nếu chọn "Phát ngay": Thay bài đang phát hiện tại và giữ nguyên hàng đợi
      updatedCurrent = newMedia;
      isPlaying = true;
    } else if (forceQueue) {
      // Nếu chọn "Thêm vào hàng chờ": Bắt buộc đẩy vào hàng đợi
      if (!updatedCurrent) {
        updatedCurrent = newMedia;
        isPlaying = true;
      } else {
        updatedQueue.push(newMedia);
      }
    } else {
      // Mặc định: Nếu chưa có bài thì phát ngay, nếu có bài đang phát thì vào hàng đợi
      if (!updatedCurrent) {
        updatedCurrent = newMedia;
        isPlaying = true;
      } else {
        updatedQueue.push(newMedia);
      }
    }

    const orderMsg: RoomChatMessage = {
      id: `c-${Date.now()}`,
      username: "system",
      name: "Hệ thống",
      text: playImmediate
        ? `⚡ @${user?.username || "user"} đã phát ngay: "${newMedia.title}"`
        : `🎵 @${user?.username || "user"} đã thêm vào hàng chờ: "${newMedia.title}" (#${updatedQueue.length})`,
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

  // Play next song in Queue (Phát lần lượt theo hàng đợi)
  const playNextInQueue = () => {
    if (!currentRoom) return;

    if (currentRoom.queue.length === 0) {
      const updatedRoom = { ...currentRoom, currentMedia: null, isPlaying: false };
      saveRoomsList(rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r)));
      return;
    }

    const nextMedia = currentRoom.queue[0];
    const remainingQueue = currentRoom.queue.slice(1);

    const nextMsg: RoomChatMessage = {
      id: `c-${Date.now()}`,
      username: "system",
      name: "Hệ thống",
      text: `▶️ Đang chuyển sang bài tiếp theo: "${nextMedia.title}" (${nextMedia.source.toUpperCase()})`,
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

  // Send Floating Live Reaction with cross-tab broadcast
  const sendReaction = (emoji: string) => {
    const newReaction: RoomReaction = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      emoji,
      username: user?.username || "user",
      timestamp: Date.now(),
    };
    setReactions((prev) => [...prev.slice(-25), newReaction]);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tx_latest_reaction", JSON.stringify(newReaction));
      } catch {}
    }

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3500);
  };

  // Order Batch Songs / Playlist tracks
  const orderBatchSongs = (urls: string[]): { addedCount: number; errors: string[] } => {
    if (!currentRoom) {
      return { addedCount: 0, errors: ["Chưa tham gia phòng nào."] };
    }
    let addedCount = 0;
    const errors: string[] = [];

    urls.forEach((url) => {
      const res = orderSong(url, undefined, true, undefined, true, false);
      if (res.success) {
        addedCount++;
      } else if (res.error) {
        errors.push(res.error);
      }
    });

    return { addedCount, errors };
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

  // User Favorite Bookmark Manager
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
        orderBatchSongs,
        createRoom,
        deleteRoom,
        clearAllRooms,
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
