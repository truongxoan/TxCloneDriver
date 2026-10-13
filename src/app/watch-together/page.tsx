"use client";

import React, { useState, useMemo } from "react";
import {
  Users2,
  Tv,
  Play,
  Pause,
  SkipForward,
  Plus,
  Send,
  Heart,
  Flame,
  Sparkles,
  Music,
  Film,
  Lock,
  Unlock,
  Copy,
  Check,
  UserX,
  Bookmark,
  Trash2,
  ExternalLink,
  Crown,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Share2,
  Radio,
  Layers,
  ArrowRight,
  LogOut,
  Moon,
  Folder,
  HardDrive,
  Globe,
  ListMusic,
  KeyRound,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { useWatchParty } from "@/modules/watch-party/watchPartyContext";
import { useAuth } from "@/modules/auth/authContext";
import { useDriveEndpoints, DriveFileItem } from "@/modules/storage/driveEndpointsContext";
import {
  getYouTubeEmbedUrl,
  detectMediaSource,
  resolveEmbedUrl,
} from "@/modules/watch-party/youtubeHelper";
import { LofiCyberRoomWidget } from "@/modules/exotic/LofiCyberRoomWidget";
import { TarotDreamWidget } from "@/modules/exotic/TarotDreamWidget";
import { SelfDestructNoteWidget } from "@/modules/exotic/SelfDestructNoteWidget";

export default function WatchTogetherPage() {
  const { user } = useAuth();
  const { files: driveFiles } = useDriveEndpoints();
  const {
    rooms,
    currentRoom,
    savedBookmarks,
    reactions,
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
    saveBookmark,
    deleteBookmark,
    playSavedBookmark,
  } = useWatchParty();

  // Lobby states
  const [activeLobbyTab, setActiveLobbyTab] = useState<
    "rooms" | "create" | "bookmarks" | "lofi_room" | "tarot_dream" | "burn_note"
  >("rooms");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinPassInput, setJoinPassInput] = useState("");

  // Create room form
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);
  const [newRoomPass, setNewRoomPass] = useState("");

  // Order media modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalTab, setOrderModalTab] = useState<"url" | "drive">("url");
  const [orderUrl, setOrderUrl] = useState("");
  const [orderTitle, setOrderTitle] = useState("");
  const [orderIsVideo, setOrderIsVideo] = useState(true);
  const [driveSearch, setDriveSearch] = useState("");

  // Bookmark modal
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [bmTitle, setBmTitle] = useState("");
  const [bmUrl, setBmUrl] = useState("");
  const [bmNote, setBmNote] = useState("");

  // Chat input
  const [chatInput, setChatInput] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Filter Drive audio and media files
  const filteredDriveMedia = useMemo(() => {
    return driveFiles.filter((f) => {
      const name = f.name.toLowerCase();
      const isMedia =
        f.mimeType?.includes("audio") ||
        f.mimeType?.includes("video") ||
        name.endsWith(".mp3") ||
        name.endsWith(".m4a") ||
        name.endsWith(".wav") ||
        name.endsWith(".flac") ||
        name.endsWith(".ogg") ||
        name.endsWith(".mp4") ||
        name.endsWith(".mkv") ||
        name.endsWith(".webm");

      if (!isMedia) return false;
      if (!driveSearch.trim()) return true;
      return name.includes(driveSearch.trim().toLowerCase());
    });
  }, [driveFiles, driveSearch]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const room = createRoom(newRoomName, newRoomDesc, newRoomPrivate, newRoomPass);
    triggerToast(`Đã tạo phòng "${room.name}" thành công!`);
    setNewRoomName("");
    setNewRoomDesc("");
    setNewRoomPass("");
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = joinRoom(joinCodeInput, joinPassInput);
    if (res.success) {
      triggerToast("Đã tham gia phòng thành công!");
      setJoinCodeInput("");
      setJoinPassInput("");
    } else {
      triggerToast(res.error || "Không thể vào phòng.");
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderUrl.trim()) return;
    const res = orderSong(orderUrl, orderTitle, orderIsVideo);
    if (res.success) {
      triggerToast("Đã thêm bài hát vào hàng đợi phát lần lượt!");
      setOrderUrl("");
      setOrderTitle("");
      setShowOrderModal(false);
    } else {
      triggerToast(res.error || "Không thể order bài hát.");
    }
  };

  const handleOrderDriveItem = (file: DriveFileItem) => {
    const isVideo =
      file.mimeType?.includes("video") ||
      file.name.endsWith(".mp4") ||
      file.name.endsWith(".mkv") ||
      file.name.endsWith(".webm");

    const streamUrl = `/api/drive/stream?id=${file.id}`;
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

    const res = orderSong(streamUrl, cleanTitle, isVideo, "Google Drive");
    if (res.success) {
      triggerToast(`Đã thêm tệp "${cleanTitle}" từ Google Drive vào phòng!`);
      setShowOrderModal(false);
    } else {
      triggerToast(res.error || "Không thể mở tệp từ Google Drive.");
    }
  };

  const handleSaveCurrentBookmark = () => {
    if (!currentRoom?.currentMedia) return;
    saveBookmark(
      currentRoom.currentMedia.title,
      currentRoom.currentMedia.url,
      currentRoom.currentMedia.isVideo,
      `Lưu từ phòng ${currentRoom.name}`
    );
    triggerToast("Đã lưu bài hát vào danh sách yêu thích của bạn!");
  };

  const handleAddBookmarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmUrl.trim()) return;
    saveBookmark(bmTitle, bmUrl, true, bmNote);
    triggerToast("Đã thêm liên kết vào kho yêu thích cá nhân!");
    setBmTitle("");
    setBmUrl("");
    setBmNote("");
    setShowAddBookmarkModal(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    triggerToast(`Đã sao chép mã phòng: ${currentRoom.code}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isCurrentHost =
    currentRoom?.hostUsername === user?.username || user?.role === "admin";

  return (
    <ModuleGuard moduleId="watch_together" moduleName="Phòng Xem & Nghe Chung">
      <div className="space-y-6 pb-24">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW A: ACTIVE WATCH PARTY ROOM (INSIDE ROOM) */}
        {/* ============================================================== */}
        {currentRoom ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Top Room Banner */}
            <div className="p-4 rounded-3xl glass-panel border border-white/15 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 shrink-0">
                  <Tv className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-white">{currentRoom.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Trực Tiếp Đồng Bộ
                    </span>
                    {isCurrentHost && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                        <Crown className="h-3 w-3 text-amber-400" />
                        Bạn là Chủ Phòng
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                    <span>Mã phòng: <strong className="font-mono text-sky-400">{currentRoom.code}</strong></span>
                    <button
                      onClick={handleCopyCode}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Sao chép mã phòng"
                    >
                      {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <span>&bull;</span>
                    <span>{currentRoom.members.length} thành viên online</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveCurrentBookmark}
                  disabled={!currentRoom.currentMedia}
                  className="h-8 text-xs gap-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-400/20"
                >
                  <Bookmark className="h-3.5 w-3.5 text-pink-400" />
                  <span>Lưu yêu thích</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowOrderModal(true)}
                  className="h-8 text-xs gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Order Link / Google Drive</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={leaveRoom}
                  className="h-8 text-xs gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Rời phòng</span>
                </Button>
              </div>
            </div>

            {/* Main Stage: Player + Side Controls (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Synchronized Media Stage (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Media Screen Container */}
                <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/15 bg-black shadow-2xl aspect-video flex items-center justify-center">
                  {currentRoom.currentMedia ? (
                    currentRoom.currentMedia.source === "youtube" && currentRoom.currentMedia.youtubeId ? (
                      /* YouTube Player */
                      <iframe
                        src={getYouTubeEmbedUrl(currentRoom.currentMedia.youtubeId, currentRoom.isPlaying)}
                        title={currentRoom.currentMedia.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : currentRoom.currentMedia.source === "spotify" ? (
                      /* Spotify Embed Web Player */
                      <iframe
                        src={currentRoom.currentMedia.embedUrl || currentRoom.currentMedia.url}
                        title={currentRoom.currentMedia.title}
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        className="w-full h-full border-0 rounded-2xl"
                      />
                    ) : currentRoom.currentMedia.source === "drive" && currentRoom.currentMedia.isVideo ? (
                      /* Google Drive / Direct Video Player */
                      <video
                        src={currentRoom.currentMedia.url}
                        controls
                        autoPlay={currentRoom.isPlaying}
                        className="w-full h-full object-contain"
                        onEnded={playNextInQueue}
                      />
                    ) : currentRoom.currentMedia.source === "drive" ? (
                      /* Google Drive Audio Player */
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-emerald-950/40 to-black text-center space-y-4">
                        <div className="h-28 w-28 rounded-full border-4 border-emerald-500/30 shadow-2xl shadow-emerald-500/30 flex items-center justify-center bg-slate-900 animate-spin duration-700">
                          <HardDrive className="h-10 w-10 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white max-w-md truncate">
                            {currentRoom.currentMedia.title}
                          </h3>
                          <p className="text-xs text-emerald-300 mt-1">
                            Google Drive Audio Track &bull; TxCloneDriver Cloud
                          </p>
                        </div>
                        <audio
                          src={currentRoom.currentMedia.url}
                          autoPlay={currentRoom.isPlaying}
                          controls
                          className="w-full max-w-md mt-2"
                          onEnded={playNextInQueue}
                        />
                      </div>
                    ) : currentRoom.currentMedia.isVideo ? (
                      /* Direct Web Video / Iframe */
                      <video
                        src={currentRoom.currentMedia.url}
                        controls
                        autoPlay={currentRoom.isPlaying}
                        className="w-full h-full object-contain"
                        onEnded={playNextInQueue}
                      />
                    ) : (
                      /* Audio Player with Turntable Visualizer (MP3, ZingMP3, NhacCuaTui, Direct) */
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-black text-center space-y-4">
                        <div className="h-28 w-28 rounded-full border-4 border-white/10 shadow-2xl shadow-blue-500/30 flex items-center justify-center bg-slate-900 animate-spin duration-700">
                          <Music className="h-10 w-10 text-sky-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white max-w-md truncate">
                            {currentRoom.currentMedia.title}
                          </h3>
                          <p className="text-xs text-sky-300 mt-1">
                            {currentRoom.currentMedia.artistOrChannel || "Trình phát Nhạc Đa Nền Tảng"}
                          </p>
                        </div>
                        {currentRoom.currentMedia.embedUrl && currentRoom.currentMedia.embedUrl.startsWith("http") ? (
                          <div className="w-full max-w-md space-y-2">
                            <audio
                              src={currentRoom.currentMedia.url}
                              autoPlay={currentRoom.isPlaying}
                              controls
                              className="w-full"
                              onEnded={playNextInQueue}
                              onError={(e) => {
                                // fallback if CORS prevents direct audio
                                console.warn("Audio direct stream blocked, can be opened in browser frame");
                              }}
                            />
                            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
                              <span>Mở link gốc:</span>
                              <a
                                href={currentRoom.currentMedia.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 underline flex items-center gap-1 font-mono"
                              >
                                {currentRoom.currentMedia.source.toUpperCase()} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <audio
                            src={currentRoom.currentMedia.url}
                            autoPlay={currentRoom.isPlaying}
                            controls
                            className="w-full max-w-md mt-2"
                            onEnded={playNextInQueue}
                          />
                        )}
                      </div>
                    )
                  ) : (
                    /* Stage Empty State */
                    <div className="text-center p-8 space-y-3">
                      <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400">
                        <Tv className="h-8 w-8" />
                      </div>
                      <h3 className="text-base font-bold text-white">Chưa có bài hát hoặc video nào được phát</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Hãy bấm nút <strong>&ldquo;Order Link / Google Drive&rdquo;</strong> để dán link YouTube, ZingMP3, NhacCuaTui, Spotify hoặc chọn nhạc từ Google Drive vào phòng!
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowOrderModal(true)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Order bài hát ngay
                      </Button>
                    </div>
                  )}

                  {/* Floating Live Reactions Layer */}
                  <div className="absolute bottom-4 right-4 pointer-events-none flex flex-col gap-2 items-end">
                    {reactions.map((rx) => (
                      <div
                        key={rx.id}
                        className="text-2xl animate-in slide-in-from-bottom fade-out zoom-out-50 duration-1000"
                      >
                        {rx.emoji}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media Meta & Host Playback Controls Bar */}
                {currentRoom.currentMedia && (
                  <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30 uppercase">
                          {currentRoom.currentMedia.source}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate max-w-md">
                          {currentRoom.currentMedia.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Order bởi: <strong className="text-sky-300">@{currentRoom.currentMedia.addedBy.username}</strong> ({currentRoom.currentMedia.addedBy.name})
                      </p>
                    </div>

                    {/* Host Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrentHost ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={togglePlayPause}
                            className="h-8 text-xs gap-1.5"
                          >
                            {currentRoom.isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            <span>{currentRoom.isPlaying ? "Tạm dừng" : "Tiếp tục"}</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={playNextInQueue}
                            className="h-8 text-xs gap-1.5"
                            title="Chuyển sang bài tiếp theo trong hàng đợi"
                          >
                            <SkipForward className="h-3.5 w-3.5" />
                            <span>Bài tiếp</span>
                          </Button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Chủ phòng (@{currentRoom.hostUsername}) đang điều khiển phát
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Floating Reaction Emojis Bar */}
                <div className="p-2.5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 flex items-center justify-between gap-2 overflow-x-auto">
                  <span className="text-xs font-semibold text-slate-400 shrink-0 ml-2">Thả biểu cảm:</span>
                  <div className="flex items-center gap-1.5">
                    {["❤️", "🔥", "👏", "🍿", "🎵", "🚀", "😂", "✨"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-lg hover:scale-125 active:scale-95 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Queue, Members & Live Chat (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Order Queue Card (Hàng đợi phát theo lượt) */}
                <Card className="p-4 bg-slate-950/60 border-white/10 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-sky-400" />
                      <h3 className="font-bold text-white text-xs">
                        Hàng Đợi Phát Theo Lượt ({currentRoom.queue.length})
                      </h3>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowOrderModal(true)}
                      className="h-6 text-[11px] px-2"
                    >
                      + Thêm bài
                    </Button>
                  </div>

                  {currentRoom.queue.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {currentRoom.queue.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-2 group hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono font-bold text-sky-400 shrink-0">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate" title={item.title}>
                                {item.title}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate uppercase">
                                @{item.addedBy.username} &bull; {item.source}
                              </p>
                            </div>
                          </div>

                          {(isCurrentHost || item.addedBy.username === user?.username) && (
                            <button
                              onClick={() => removeQueueItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                              title="Xóa khỏi hàng đợi"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      Hàng đợi đang trống. Hãy order bài tiếp theo!
                    </p>
                  )}
                </Card>

                {/* Members in Room Card */}
                <Card className="p-4 bg-slate-950/60 border-white/10 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-emerald-400" />
                      <h3 className="font-bold text-white text-xs">
                        Thành Viên Online ({currentRoom.members.length})
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {currentRoom.members.map((member) => (
                      <div
                        key={member.id}
                        className="p-2 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {member.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-white truncate block">
                              {member.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              @{member.username} {member.isHost && "👑"}
                            </span>
                          </div>
                        </div>

                        {/* Kick Member Control (Host Only) */}
                        {isCurrentHost && member.username !== currentRoom.hostUsername && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 gap-1"
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn kích @${member.username} ra khỏi phòng không?`)) {
                                kickMember(member.username);
                                triggerToast(`Đã kích @${member.username} khỏi phòng.`);
                              }
                            }}
                          >
                            <UserX className="h-3 w-3" />
                            <span>Kích</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Live Room Chat Card */}
                <Card className="p-4 bg-slate-950/60 border-white/10 space-y-3 flex flex-col h-72">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <h3 className="font-bold text-white text-xs">Trò Chuyện Trực Tiếp</h3>
                  </div>

                  {/* Chat Messages Log */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                    {currentRoom.chat.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded-xl ${
                          msg.isSystem
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]"
                            : msg.username === user?.username
                            ? "bg-blue-600/20 border border-blue-500/30 text-white ml-2"
                            : "bg-slate-900 border border-white/5 text-slate-200 mr-2"
                        }`}
                      >
                        {!msg.isSystem && (
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="font-bold text-sky-400">@{msg.username}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                        )}
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input Form */}
                  <form onSubmit={handleSendChat} className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                    />
                    <Button type="submit" variant="primary" size="sm" className="h-8 px-3">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VIEW B: WATCH PARTY LOBBY (DANH SÁCH PHÒNG & TẠO PHÒNG) */
          /* ============================================================== */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Lobby Banner */}
            <div className="p-6 rounded-3xl glass-panel border border-white/15 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-950/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-sky-400/30">
                  <Radio className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                  TxCloneDriver Sync Station
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Phòng Nghe Nhạc & Xem Phim Chung
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Thưởng thức âm nhạc đa nền tảng cùng bạn bè: dán link YouTube, ZingMP3, NhacCuaTui, Spotify, liên kết ngoài hoặc mở trực tiếp tệp từ <strong>Google Drive</strong>!
                </p>
              </div>

              {/* Quick Join by Code Box */}
              <form
                onSubmit={handleJoinByCode}
                className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 space-y-3 w-full md:w-80 shrink-0"
              >
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <KeyRound className="h-4 w-4 text-sky-400" />
                  <span>Vào Nhanh Bằng Mã Phòng</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Nhập mã phòng (vd: ROOM-ABC)..."
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono text-white"
                  />
                  <input
                    type="password"
                    value={joinPassInput}
                    onChange={(e) => setJoinPassInput(e.target.value)}
                    placeholder="Mật khẩu (nếu có)..."
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" className="w-full text-xs">
                  Tham gia phòng &rarr;
                </Button>
              </form>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "rooms", label: "Phòng Hoạt Động", icon: Users2, count: rooms.length },
                  { id: "create", label: "Tạo Phòng Mới", icon: Plus },
                  { id: "bookmarks", label: "Kho Bài Hát Yêu Thích", icon: Bookmark, count: savedBookmarks.length },
                  { id: "lofi_room", label: "📻 Phòng Chill Lo-fi 3D", icon: Sparkles },
                  { id: "tarot_dream", label: "🔮 Tarot & Giấc Mơ AI", icon: Moon },
                  { id: "burn_note", label: "🔥 Thư Mật Tự Hủy 60s", icon: Flame },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeLobbyTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLobbyTab(tab.id as typeof activeLobbyTab)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                          : "bg-surface-elevated text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {rooms.length > 0 && user?.role === "admin" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Bạn có chắc chắn muốn dọn sạch tất cả các phòng không?")) {
                      clearAllRooms();
                      triggerToast("Đã xóa toàn bộ phòng.");
                    }
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa tất cả phòng
                </Button>
              )}
            </div>

            {/* TAB 1: LIST OF ROOMS */}
            {activeLobbyTab === "rooms" && (
              <div>
                {rooms.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 bg-slate-900/40 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center mx-auto">
                      <Users2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">Chưa có phòng nào được tạo</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Đã xóa sạch các phòng ví dụ mặc định. Bạn có thể nhấn nút <strong>&ldquo;Tạo Phòng Mới&rdquo;</strong> bên dưới để tạo phòng riêng của mình!
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveLobbyTab("create")}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Tạo phòng đầu tiên ngay
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                      <Card
                        key={room.id}
                        className="p-5 bg-slate-900/50 border-white/10 space-y-4 hover:border-white/25 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-white text-sm">{room.name}</h3>
                              <span className="font-mono text-[11px] text-sky-400">Mã: {room.code}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge variant={room.isPrivate ? "warning" : "success"} size="sm">
                                {room.isPrivate ? "Riêng tư" : "Công khai"}
                              </Badge>
                              {(user?.role === "admin" || room.hostUsername === user?.username) && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Xóa phòng "${room.name}"?`)) {
                                      deleteRoom(room.id);
                                      triggerToast("Đã xóa phòng.");
                                    }
                                  }}
                                  className="text-slate-500 hover:text-rose-400 p-1"
                                  title="Xóa phòng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                            {room.description}
                          </p>

                          {/* Current Playing Preview */}
                          <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1 text-xs">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                              Đang phát:
                            </span>
                            <p className="font-bold text-white truncate">
                              {room.currentMedia ? room.currentMedia.title : "Chưa có bài nào"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Chủ phòng: <strong className="text-sky-300">@{room.hostUsername}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Users2 className="h-3.5 w-3.5 text-emerald-400" />
                            {room.members.length} người đang nghe
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              const res = joinRoom(room.id);
                              if (!res.success) triggerToast(res.error || "Không thể vào phòng");
                            }}
                            className="text-xs"
                          >
                            Vào phòng &rarr;
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CREATE ROOM */}
            {activeLobbyTab === "create" && (
              <Card className="p-6 max-w-xl space-y-4">
                <h3 className="font-bold text-white text-base">Tạo Phòng Xem & Nghe Chung Mới</h3>
                <p className="text-xs text-slate-400">
                  Bạn sẽ trở thành Chủ phòng (Host) với toàn quyền thêm nhạc từ link ngoài, Google Drive, phát lần lượt và điều khiển phòng.
                </p>

                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200 block">Tên phòng</label>
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Ví dụ: Phòng Nghe Nhạc Chill Của Tôi..."
                      className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200 block">Mô tả phòng</label>
                    <textarea
                      value={newRoomDesc}
                      onChange={(e) => setNewRoomDesc(e.target.value)}
                      placeholder="Mô tả thể loại nhạc hoặc danh sách bài hát dự kiến..."
                      className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white h-20"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRoomPrivate}
                        onChange={(e) => setNewRoomPrivate(e.target.checked)}
                        className="rounded border-white/20 bg-slate-900 text-blue-600"
                      />
                      <span>Đặt phòng ở chế độ Riêng tư (Yêu cầu mật khẩu để vào)</span>
                    </label>
                  </div>

                  {newRoomPrivate && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200 block">Mật khẩu phòng</label>
                      <input
                        type="password"
                        value={newRoomPass}
                        onChange={(e) => setNewRoomPass(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                        required={newRoomPrivate}
                      />
                    </div>
                  )}

                  <Button type="submit" variant="primary" size="sm" className="w-full text-xs mt-2">
                    Tạo phòng và bắt đầu phát &rarr;
                  </Button>
                </form>
              </Card>
            )}

            {/* TAB 3: USER SAVED BOOKMARKS */}
            {activeLobbyTab === "bookmarks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Kho Bài Hát Yêu Thích Cá Nhân</h3>
                    <p className="text-[11px] text-slate-400">
                      Lưu trữ độc lập theo tài khoản @{user?.username}. Nhấn &ldquo;Phát ngay&rdquo; để đưa bài vào phòng đang mở!
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddBookmarkModal(true)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm liên kết</span>
                  </Button>
                </div>

                {savedBookmarks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedBookmarks.map((bm) => (
                      <Card key={bm.id} className="p-4 bg-slate-900/50 border-white/10 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30 uppercase">
                              {bm.source}
                            </span>
                            <h4 className="font-bold text-white text-xs truncate mt-1.5" title={bm.title}>
                              {bm.title}
                            </h4>
                          </div>
                          <button
                            onClick={() => deleteBookmark(bm.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Xóa liên kết"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {bm.note && <p className="text-[11px] text-slate-400 italic">&ldquo;{bm.note}&rdquo;</p>}

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                          <span className="text-slate-500">{bm.savedAt}</span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={bm.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-white p-1"
                              title="Mở link ngoài"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 text-xs px-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-sky-300 border border-sky-400/20"
                              onClick={() => {
                                if (rooms.length > 0) {
                                  joinRoom(rooms[0].id);
                                  setTimeout(() => playSavedBookmark(bm), 300);
                                  triggerToast(`Đang phát "${bm.title}" trong phòng ${rooms[0].name}`);
                                } else {
                                  triggerToast("Vui lòng tạo một phòng trước để phát bài này!");
                                }
                              }}
                            >
                              Phát ngay
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center space-y-3">
                    <Bookmark className="h-10 w-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">Bạn chưa lưu liên kết nào vào kho cá nhân.</p>
                  </Card>
                )}
              </div>
            )}

            {/* TAB 4: LO-FI CYBER ROOM 3D */}
            {activeLobbyTab === "lofi_room" && <LofiCyberRoomWidget />}

            {/* TAB 5: TAROT & AI DREAM JOURNAL */}
            {activeLobbyTab === "tarot_dream" && <TarotDreamWidget />}

            {/* TAB 6: SELF DESTRUCT BURN NOTE */}
            {activeLobbyTab === "burn_note" && <SelfDestructNoteWidget />}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: ORDER SONG / VIDEO (YOUTUBE, ZINGMP3, NHACCUATUI, SPOTIFY, DRIVE) */}
        {/* ============================================================== */}
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white">
                    <ListMusic className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Thêm Bài Hát Vào Hàng Đợi Phát Theo Lượt</h3>
                    <p className="text-[11px] text-slate-400">Link ngoài trình duyệt hoặc mở trực tiếp từ Google Drive</p>
                  </div>
                </div>
              </div>

              {/* Sub-tabs: Link ngoài vs Google Drive */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setOrderModalTab("url")}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    orderModalTab === "url"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Dán Link Trình Duyệt / Ngoài</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderModalTab("drive")}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    orderModalTab === "drive"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Chọn Từ Google Drive ({driveFiles.length})</span>
                </button>
              </div>

              {/* TAB A: PASTE URL */}
              {orderModalTab === "url" && (
                <form onSubmit={handleOrderSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Đường dẫn URL bài hát hoặc video
                    </label>
                    <input
                      type="url"
                      value={orderUrl}
                      onChange={(e) => setOrderUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... hoặc Spotify, ZingMP3, Nhaccuatui..."
                      className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-white"
                      required
                      autoFocus
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-sky-400">Hỗ trợ tự động:</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono">YouTube</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Spotify</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Zing MP3</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">NhacCuaTui</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">MP3/MP4 Web</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Tên hiển thị (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={orderTitle}
                      onChange={(e) => setOrderTitle(e.target.value)}
                      placeholder="Để trống hệ thống sẽ tự đặt tên theo link..."
                      className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderIsVideo}
                        onChange={(e) => setOrderIsVideo(e.target.checked)}
                        className="rounded border-white/20 bg-slate-900 text-blue-600"
                      />
                      <span>Phát dưới dạng Video màn ảnh (Bỏ tích nếu là Audio/Nhạc nền)</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowOrderModal(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Gửi Order Vào Hàng Đợi
                    </Button>
                  </div>
                </form>
              )}

              {/* TAB B: PICK FROM GOOGLE DRIVE */}
              {orderModalTab === "drive" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Tìm kiếm bài hát / video trong Google Drive
                    </label>
                    <input
                      type="text"
                      value={driveSearch}
                      onChange={(e) => setDriveSearch(e.target.value)}
                      placeholder="Gõ tên bài hát, ca sĩ hoặc định dạng .mp3, .mp4..."
                      className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {filteredDriveMedia.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-white/5">
                        {driveFiles.length === 0
                          ? "Chưa có tệp nào trong Google Drive hoặc chưa cấu hình Apps Script."
                          : "Không tìm thấy tệp nhạc/video nào khớp với tìm kiếm."}
                      </div>
                    ) : (
                      filteredDriveMedia.map((f) => {
                        const isVid =
                          f.mimeType?.includes("video") ||
                          f.name.endsWith(".mp4") ||
                          f.name.endsWith(".mkv") ||
                          f.name.endsWith(".webm");
                        return (
                          <div
                            key={f.id}
                            className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 hover:border-emerald-500/40 flex items-center justify-between gap-2 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isVid ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                                }`}
                              >
                                {isVid ? <Film className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{f.name}</p>
                                <p className="text-[10px] text-slate-400">
                                  {isVid ? "Video Drive" : "Audio Drive"} &bull; {(f.sizeBytes / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOrderDriveItem(f)}
                              className="h-7 text-xs px-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shrink-0"
                            >
                              Phát bài này
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-white/10">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowOrderModal(false)}
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: ADD BOOKMARK TO PERSONAL VAULT */}
        {/* ============================================================== */}
        {showAddBookmarkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Lưu Liên Kết Vào Kho Cá Nhân</h3>
                  <p className="text-[11px] text-slate-400">Lưu trữ độc lập theo tài khoản @{user?.username}</p>
                </div>
              </div>

              <form onSubmit={handleAddBookmarkSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">Tên bài hát / video</label>
                  <input
                    type="text"
                    value={bmTitle}
                    onChange={(e) => setBmTitle(e.target.value)}
                    placeholder="Ví dụ: Lofi Chill Học Tập..."
                    className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">Đường dẫn URL</label>
                  <input
                    type="url"
                    value={bmUrl}
                    onChange={(e) => setBmUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">Ghi chú cá nhân</label>
                  <input
                    type="text"
                    value={bmNote}
                    onChange={(e) => setBmNote(e.target.value)}
                    placeholder="Ví dụ: Nghe lúc làm việc..."
                    className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddBookmarkModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Lưu vào Kho
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ModuleGuard>
  );
}
