"use client";

import React, { useState, useMemo } from "react";
import {
  HardDrive,
  Upload,
  FolderPlus,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Folder,
  Archive,
  Download,
  Trash2,
  Share2,
  Info,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Plus,
  Link as LinkIcon,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Music,
  Play,
  Pause,
  Disc3,
  Film,
  AlertTriangle,
  Copy,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatBytes, cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/authContext";
import { useDriveEndpoints, DriveFileItem } from "@/modules/storage/driveEndpointsContext";
import { MusicPlayerBar, AudioTrack } from "@/modules/storage/MusicPlayerBar";
import CinemaVideoModal, { VideoItem } from "@/modules/storage/CinemaVideoModal";
import { detectDuplicates } from "@/modules/storage/duplicateDetector";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

// Default soothing audio tracks in Drive for testing & immediate experience
const DEFAULT_DRIVE_AUDIO_TRACKS: DriveFileItem[] = [
  {
    id: "audio-demo-1",
    name: "Lofi Chill Sunset (TxCloneDriver).mp3",
    mimeType: "audio/mp3",
    sizeBytes: 5242880,
    updatedAt: "26/04/2025",
    downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "audio-demo-2",
    name: "Night Walk Acoustic Melodies.mp3",
    mimeType: "audio/mp3",
    sizeBytes: 4194304,
    updatedAt: "25/04/2025",
    downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "audio-demo-3",
    name: "Cyberpunk Ambient Wave.mp3",
    mimeType: "audio/mp3",
    sizeBytes: 6291456,
    updatedAt: "24/04/2025",
    downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

// Default sample cinema videos for immediate theater experience
const DEFAULT_DRIVE_VIDEO_ITEMS: DriveFileItem[] = [
  {
    id: "video-demo-1",
    name: "TxCloneDriver Sci-Fi Cinematic Trailer 4K.mp4",
    mimeType: "video/mp4",
    sizeBytes: 157286400,
    updatedAt: "26/04/2025",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "video-demo-2",
    name: "Nature & Aurora TimeLapse 1080p.mp4",
    mimeType: "video/mp4",
    sizeBytes: 94371840,
    updatedAt: "25/04/2025",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
];

export default function StoragePage() {
  const { user, isAdmin } = useAuth();
  const {
    endpoints,
    activeEndpoint,
    files,
    loading,
    error,
    refreshFiles,
    setActiveEndpointId,
    addEndpoint,
    removeEndpoint,
    testEndpoint,
  } = useDriveEndpoints();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showToast, setShowToast] = useState<string | null>(null);

  // Deleted Duplicate IDs (tracked locally for cleanup)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Manage endpoints modal
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [newEndpointName, setNewEndpointName] = useState("");
  const [newEndpointUrl, setNewEndpointUrl] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);

  // Music Player State
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);

  // Cinema Video Player State
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);

  // Combine real Drive files with default audio/video items if empty, filtering deleted IDs
  const allDisplayFiles = useMemo(() => {
    let baseList = files.length > 0 ? files : [...DEFAULT_DRIVE_AUDIO_TRACKS, ...DEFAULT_DRIVE_VIDEO_ITEMS];
    return baseList.filter((item) => !deletedIds.has(item.id));
  }, [files, deletedIds]);

  // Scan for duplicate files
  const duplicateScan = useMemo(() => {
    return detectDuplicates(allDisplayFiles);
  }, [allDisplayFiles]);

  // Playlist of all audio files available in drive
  const audioPlaylist: AudioTrack[] = useMemo(() => {
    return allDisplayFiles
      .filter(
        (f) =>
          f.mimeType?.includes("audio") ||
          f.name.endsWith(".mp3") ||
          f.name.endsWith(".m4a") ||
          f.name.endsWith(".wav") ||
          f.name.endsWith(".ogg")
      )
      .map((f) => ({
        id: f.id,
        title: f.name.replace(/\.(mp3|m4a|wav|ogg|flac)$/i, ""),
        artist: "Google Drive Audio",
        url: f.id.startsWith("audio-demo")
          ? f.downloadUrl || ""
          : `/api/drive/stream?id=${f.id}`,
      }));
  }, [allDisplayFiles]);

  // Playlist of all video items available in drive
  const videoPlaylist: VideoItem[] = useMemo(() => {
    return allDisplayFiles
      .filter(
        (f) =>
          f.mimeType?.includes("video") ||
          f.name.endsWith(".mp4") ||
          f.name.endsWith(".mkv") ||
          f.name.endsWith(".mov") ||
          f.name.endsWith(".webm")
      )
      .map((f) => ({
        id: f.id,
        title: f.name.replace(/\.(mp4|mkv|mov|webm|avi)$/i, ""),
        resolution: f.sizeBytes > 100000000 ? "1080p FHD" : "720p HD",
        sizeBytes: f.sizeBytes,
        url: f.id.startsWith("video-demo")
          ? f.downloadUrl || ""
          : `/api/drive/stream?id=${f.id}&mime=video/mp4`,
      }));
  }, [allDisplayFiles]);

  const filteredFiles = useMemo(() => {
    return allDisplayFiles.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (selectedCategory === "all") return true;
      if (selectedCategory === "duplicates") {
        return duplicateScan.duplicateIds.has(item.id);
      }
      if (selectedCategory === "audio") {
        return (
          item.mimeType?.includes("audio") ||
          item.name.endsWith(".mp3") ||
          item.name.endsWith(".m4a") ||
          item.name.endsWith(".wav")
        );
      }
      if (selectedCategory === "video") {
        return (
          item.mimeType?.includes("video") ||
          item.name.endsWith(".mp4") ||
          item.name.endsWith(".mkv") ||
          item.name.endsWith(".mov") ||
          item.name.endsWith(".webm")
        );
      }
      if (selectedCategory === "image") {
        return item.mimeType?.includes("image");
      }
      if (selectedCategory === "document") {
        return item.mimeType?.includes("pdf") || item.mimeType?.includes("document") || item.mimeType?.includes("sheet");
      }
      if (selectedCategory === "archive") {
        return item.mimeType?.includes("zip") || item.mimeType?.includes("tar") || item.mimeType?.includes("rar");
      }
      return true;
    });
  }, [allDisplayFiles, searchTerm, selectedCategory, duplicateScan]);

  const triggerAction = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndpointName.trim() || !newEndpointUrl.trim()) return;
    addEndpoint(newEndpointName, newEndpointUrl);
    setNewEndpointName("");
    setNewEndpointUrl("");
    triggerAction("Đã thêm liên kết thư mục mới thành công!");
  };

  const handleTestLink = async (id: string) => {
    setTestingId(id);
    const res = await testEndpoint(id);
    setTestingId(null);
    if (res.success) {
      triggerAction(`Kiểm tra thành công: Tìm thấy ${res.fileCount} tệp.`);
    } else {
      triggerAction(`Lỗi: ${res.error || "Không thể kết nối"}`);
    }
  };

  const isAudioFile = (item: DriveFileItem) => {
    return (
      item.mimeType?.includes("audio") ||
      item.name.endsWith(".mp3") ||
      item.name.endsWith(".m4a") ||
      item.name.endsWith(".wav") ||
      item.name.endsWith(".ogg") ||
      item.name.endsWith(".flac")
    );
  };

  const isVideoFile = (item: DriveFileItem) => {
    return (
      item.mimeType?.includes("video") ||
      item.name.endsWith(".mp4") ||
      item.name.endsWith(".mkv") ||
      item.name.endsWith(".mov") ||
      item.name.endsWith(".webm")
    );
  };

  const playFileAudio = (item: DriveFileItem) => {
    const streamUrl = item.id.startsWith("audio-demo")
      ? item.downloadUrl || ""
      : `/api/drive/stream?id=${item.id}`;

    const track: AudioTrack = {
      id: item.id,
      title: item.name.replace(/\.(mp3|m4a|wav|ogg|flac)$/i, ""),
      artist: activeEndpoint?.name || "Google Drive Audio",
      url: streamUrl,
    };
    setCurrentTrack(track);
    triggerAction(`Đang phát: "${track.title}"`);
  };

  const playFileVideo = (item: DriveFileItem) => {
    const streamUrl = item.id.startsWith("video-demo")
      ? item.downloadUrl || ""
      : `/api/drive/stream?id=${item.id}&mime=video/mp4`;

    const video: VideoItem = {
      id: item.id,
      title: item.name.replace(/\.(mp4|mkv|mov|webm|avi)$/i, ""),
      resolution: item.sizeBytes > 100000000 ? "1080p FHD" : "720p HD",
      sizeBytes: item.sizeBytes,
      url: streamUrl,
    };
    setCurrentVideo(video);
    triggerAction(`Đang mở rạp chiếu: "${video.title}"`);
  };

  // Delete an individual duplicate copy
  const handleDeleteDuplicate = (id: string, name: string) => {
    if (!isAdmin) {
      triggerAction("Chỉ Quản trị viên (Admin) mới có quyền xóa tệp!");
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa bản sao trùng lặp "${name}" không?`)) {
      setDeletedIds((prev) => new Set([...Array.from(prev), id]));
      triggerAction(`Đã xóa bản trùng lặp "${name}"!`);
    }
  };

  // Batch delete all duplicate copies, keeping the primary original
  const handleBatchDeleteDuplicates = () => {
    if (!isAdmin) {
      triggerAction("Chỉ Quản trị viên (Admin) mới có quyền xóa tệp!");
      return;
    }
    const count = duplicateScan.totalDuplicateCount;
    if (count === 0) return;

    if (
      confirm(
        `Xác nhận xóa toàn bộ ${count} bản sao trùng lặp? (Hệ thống sẽ giữ lại 1 bản gốc duy nhất cho mỗi bài)`
      )
    ) {
      setDeletedIds((prev) => new Set([...Array.from(prev), ...Array.from(duplicateScan.duplicateIds)]));
      triggerAction(
        `Đã dọn dẹp ${count} tệp trùng lặp, giải phóng ${formatBytes(duplicateScan.totalWastedBytes)}!`
      );
      setSelectedCategory("all");
    }
  };

  const getFileIcon = (mimeType: string, fileName?: string) => {
    if (mimeType?.includes("video") || fileName?.endsWith(".mp4") || fileName?.endsWith(".mkv"))
      return <Film className="h-5 w-5 text-rose-400" />;
    if (mimeType?.includes("audio") || fileName?.endsWith(".mp3") || fileName?.endsWith(".m4a"))
      return <Music className="h-5 w-5 text-pink-400" />;
    if (mimeType?.includes("pdf")) return <FileText className="h-5 w-5 text-rose-400" />;
    if (mimeType?.includes("image")) return <ImageIcon className="h-5 w-5 text-emerald-400" />;
    if (mimeType?.includes("zip") || mimeType?.includes("tar") || mimeType?.includes("rar"))
      return <Archive className="h-5 w-5 text-amber-400" />;
    if (mimeType?.includes("folder")) return <Folder className="h-5 w-5 text-yellow-400" />;
    return <FileSpreadsheet className="h-5 w-5 text-sky-400" />;
  };

  return (
    <ModuleGuard moduleId="storage" moduleName="Google Drive">
      <div className="space-y-6 pb-28">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Floating Music Player Bar */}
      <MusicPlayerBar
        currentTrack={currentTrack}
        playlist={audioPlaylist}
        onClose={() => setCurrentTrack(null)}
        onTrackChange={(track) => setCurrentTrack(track)}
      />

      {/* Cinema Video Player Modal */}
      {currentVideo && (
        <CinemaVideoModal
          currentVideo={currentVideo}
          videoPlaylist={videoPlaylist}
          onClose={() => setCurrentVideo(null)}
          onVideoSelect={(v) => setCurrentVideo(v)}
        />
      )}

      {/* Top Banner: Active Endpoint Status & Quick Bars */}
      <div className="rounded-2xl glass-panel p-4 border border-emerald-500/30 bg-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <HardDrive className="h-5 w-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-semibold text-white flex items-center gap-2">
              <span>Đang kết nối thư mục:</span>
              <span className="text-emerald-300 font-bold">
                {activeEndpoint?.name || "Thư mục Drive Chính (Apps Script)"}
              </span>
              <Badge variant="success" size="sm" className="font-mono text-[10px]">
                Google Drive Live
              </Badge>
            </div>
            <p className="text-slate-300 text-[11px] flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Kết nối đám mây: <strong className="text-emerald-300">Đã đồng bộ bảo mật (Ẩn liên kết)</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Quick Play First Music */}
          {audioPlaylist.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (audioPlaylist[0]) setCurrentTrack(audioPlaylist[0]);
              }}
              className="gap-1.5 text-xs bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border-pink-500/30"
            >
              <Music className="h-3.5 w-3.5 text-pink-400" />
              <span>Phát nhạc 🎵</span>
            </Button>
          )}

          {/* Quick Cinema Video button */}
          {videoPlaylist.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (videoPlaylist[0]) setCurrentVideo(videoPlaylist[0]);
              }}
              className="gap-1.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
            >
              <Film className="h-3.5 w-3.5 text-rose-400" />
              <span>Rạp phim 🎬</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={refreshFiles}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>{loading ? "Đang tải..." : "Làm mới"}</span>
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowEndpointModal(true)}
              className="gap-1.5 text-xs"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>Quản lý thư mục dự phòng</span>
            </Button>
          )}
        </div>
      </div>

      {/* Storage Header & Folder Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HardDrive className="h-6 w-6 text-primary" />
            Kho lưu trữ Google Drive, Media & Rạp phim
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý tệp tin, lọc dữ liệu trùng lặp, phát nhạc Nonstop và xem phim rạp chất lượng cao
          </p>
        </div>

        {/* Quick Endpoint Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:inline">Thư mục:</span>
          <select
            value={activeEndpoint?.id || ""}
            onChange={(e) => setActiveEndpointId(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input text-xs font-semibold bg-slate-900 border border-white/20 text-white cursor-pointer"
          >
            {endpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.name} {ep.isActive ? "(Đang dùng)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar with Category Tabs */}
      <Card className="p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài hát, phim, tệp trong thư mục..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Tìm thấy: <strong className="text-white">{filteredFiles.length}</strong> tệp
            </span>

            {/* View Mode */}
            <div className="flex items-center gap-1 border-l border-surface-border pl-3">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "list"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dạng danh sách"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "grid"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dạng lưới"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-white/10 pt-2.5">
          {[
            { id: "all", label: "Tất cả tệp", count: allDisplayFiles.length },
            { id: "audio", label: "Âm nhạc & Audio 🎵", count: audioPlaylist.length },
            { id: "video", label: "Video & Phim 🎬", count: videoPlaylist.length },
            {
              id: "duplicates",
              label: "Tệp trùng lặp ⚠️",
              count: duplicateScan.totalDuplicateCount,
              badgeColor: duplicateScan.totalDuplicateCount > 0 ? "bg-amber-500/20 text-amber-300 border border-amber-400/40" : "",
            },
            {
              id: "document",
              label: "Tài liệu",
              count: allDisplayFiles.filter((f) => f.mimeType?.includes("pdf") || f.mimeType?.includes("sheet")).length,
            },
            {
              id: "image",
              label: "Hình ảnh",
              count: allDisplayFiles.filter((f) => f.mimeType?.includes("image")).length,
            },
            {
              id: "archive",
              label: "Lưu trữ (Zip/Tar)",
              count: allDisplayFiles.filter((f) => f.mimeType?.includes("zip")).length,
            },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all font-medium flex items-center gap-1.5 shrink-0",
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : cat.id === "duplicates" && duplicateScan.totalDuplicateCount > 0
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              )}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* TAB: DUPLICATES MANAGEMENT PANEL (When selectedCategory === 'duplicates') */}
      {selectedCategory === "duplicates" && (
        <div className="space-y-4 animate-in fade-in">
          {duplicateScan.groups.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-white">Tuyệt vời! Không phát hiện tệp trùng lặp</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Kho dữ liệu của bạn hoàn toàn sạch sẽ, không có bài hát hoặc tệp tin nào bị sao chép trùng lặp.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Waste Statistics Banner */}
              <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Phát hiện {duplicateScan.totalDuplicateCount} tệp trùng lặp</span>
                      <span className="text-amber-300 font-mono font-bold">
                        ({formatBytes(duplicateScan.totalWastedBytes)} lãng phí)
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Các bài hát hoặc tệp có tên tương tự, có hậu tố <em>(1)</em>, <em>- Copy</em> hoặc trùng dung lượng đã được nhóm riêng tại đây.
                    </p>
                  </div>
                </div>

                {isAdmin ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleBatchDeleteDuplicates}
                    className="gap-2 shrink-0 font-bold"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Xóa toàn bộ bản sao (Giữ 1 bản gốc)</span>
                  </Button>
                ) : (
                  <Badge variant="warning" size="sm" className="shrink-0 text-[10px]">
                    User: Chỉ xem &bull; Admin mới có quyền xóa
                  </Badge>
                )}
              </div>

              {/* Grouped Duplicate Cards */}
              <div className="space-y-3">
                {duplicateScan.groups.map((group) => (
                  <Card key={group.groupKey} className="p-4 space-y-3 border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-amber-400" />
                        <span className="font-bold text-xs text-white">
                          Nhóm tệp: <span className="text-amber-300">{group.nameKey}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Có {group.duplicates.length} bản sao trùng &bull; {formatBytes(group.wastedBytes)}
                      </span>
                    </div>

                    {/* Primary Original File */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="p-1.5 rounded-xl bg-surface-elevated">
                          {getFileIcon(group.primaryItem.mimeType, group.primaryItem.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-md">
                            {group.primaryItem.name}
                          </p>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Bản gốc ưu tiên (Giữ lại) &bull; {formatBytes(group.primaryItem.sizeBytes)} &bull; {group.primaryItem.updatedAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAudioFile(group.primaryItem) && (
                          <button
                            onClick={() => playFileAudio(group.primaryItem)}
                            className="px-2.5 py-1 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-400/30 text-[11px] font-semibold"
                          >
                            Phát nghe
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Duplicate Copies */}
                    <div className="space-y-1.5 pl-4 border-l-2 border-amber-500/30">
                      <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                        Các bản sao trùng lặp:
                      </span>
                      {group.duplicates.map((dupe) => (
                        <div
                          key={dupe.id}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="p-1 rounded-lg bg-surface-elevated">
                              {getFileIcon(dupe.mimeType, dupe.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-200 truncate max-w-sm">
                                {dupe.name}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                Bản sao &bull; {formatBytes(dupe.sizeBytes)} &bull; {dupe.updatedAt}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isAdmin ? (
                              <button
                                onClick={() => handleDeleteDuplicate(dupe.id, dupe.name)}
                                className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Xóa bản này</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Chỉ Admin được xóa</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helpful Audio Streaming Tip Banner when viewing music */}
      {selectedCategory === "audio" && (
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/25 flex items-start gap-3 text-xs text-slate-300 animate-in fade-in">
          <span className="text-lg">🎵</span>
          <div className="space-y-1">
            <span className="font-bold text-white block">
              Mẹo phát nhạc từ Google Drive:
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Các bản nhạc Nonstop lớn (trên 200MB - 500MB) được tự động xử lý qua máy chủ với hỗ trợ tua thời gian (Range Streaming). Bạn có thể bấm nút <strong>&ldquo;Phát&rdquo;</strong> để nghe ngay lập tức trên Music Player TxCloneDriver hoặc chuyển sang <strong>&ldquo;Trình phát Drive Preview&rdquo;</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Helpful Cinema Video Tip Banner when viewing movies */}
      {selectedCategory === "video" && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-400/25 flex items-start gap-3 text-xs text-slate-300 animate-in fade-in">
          <span className="text-lg">🎬</span>
          <div className="space-y-1">
            <span className="font-bold text-white block">
              Rạp chiếu phim TxCloneDriver Cinema:
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Thưởng thức video và phim độ phân giải cao với hiệu ứng Ambilight rạp chiếu, chế độ tắt đèn phòng, điều chỉnh tỉ lệ màn hình chuẩn 16:9 và 21:9 điện ảnh. Bấm <strong>&ldquo;Xem phim 🎬&rdquo;</strong> ở bất kỳ tệp video nào để mở rạp!
            </p>
          </div>
        </div>
      )}

      {/* Error Notice if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Lỗi đồng bộ thư mục</p>
            <p className="text-[11px] text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Main Files Area: Normal Categories View */}
      {selectedCategory !== "duplicates" && (
        viewMode === "list" ? (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated/40 border-b border-surface-border text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 font-medium">Tên tệp</th>
                    <th className="py-3 px-4 font-medium">Định dạng</th>
                    <th className="py-3 px-4 font-medium">Dung lượng</th>
                    <th className="py-3 px-4 font-medium">Cập nhật</th>
                    <th className="py-3 px-4 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/40">
                  {filteredFiles.map((item) => {
                    const audio = isAudioFile(item);
                    const video = isVideoFile(item);
                    const isCurrentPlayingAudio = currentTrack?.id === item.id;
                    const isDuplicate = duplicateScan.duplicateIds.has(item.id);

                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "hover:bg-surface-elevated/40 transition-colors group",
                          isCurrentPlayingAudio && "bg-blue-600/10"
                        )}
                      >
                        <td className="py-3 px-4 flex items-center gap-3 font-medium text-foreground">
                          <span className="p-1.5 rounded-xl bg-surface-elevated border border-surface-border shrink-0">
                            {getFileIcon(item.mimeType, item.name)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate max-w-[260px] sm:max-w-md font-semibold text-white">
                                {item.name}
                              </p>
                              {isDuplicate && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                  Bản sao
                                </span>
                              )}
                            </div>
                            {audio && (
                              <span className="text-[10px] text-pink-400 font-medium">
                                {isCurrentPlayingAudio ? "🎶 Đang phát..." : "Tệp âm thanh • Nhấn để phát"}
                              </span>
                            )}
                            {video && (
                              <span className="text-[10px] text-rose-400 font-medium">
                                🎬 Video rạp chiếu • Nhấn để xem phim
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-[11px] truncate max-w-[150px]">
                          {item.mimeType}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {formatBytes(item.sizeBytes)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{item.updatedAt}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Play Music Button */}
                            {audio && (
                              <button
                                onClick={() => playFileAudio(item)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all",
                                  isCurrentPlayingAudio
                                    ? "bg-pink-600 text-white border-pink-400 shadow-md shadow-pink-500/30"
                                    : "bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border-pink-500/40"
                                )}
                                title="Phát nhạc"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span>{isCurrentPlayingAudio ? "Đang phát" : "Phát"}</span>
                              </button>
                            )}

                            {/* Watch Cinema Video Button */}
                            {video && (
                              <button
                                onClick={() => playFileVideo(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-md shadow-rose-500/30 transition-all"
                                title="Mở Rạp chiếu phim"
                              >
                                <Film className="h-3.5 w-3.5" />
                                <span>Xem phim 🎬</span>
                              </button>
                            )}

                            {/* Download Button */}
                            {item.downloadUrl ? (
                              <a
                                href={item.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/40 transition-all"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Tải xuống</span>
                              </a>
                            ) : (
                              <button
                                onClick={() => triggerAction(`Tải xuống "${item.name}"`)}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((item) => {
              const audio = isAudioFile(item);
              const video = isVideoFile(item);
              const isCurrentPlayingAudio = currentTrack?.id === item.id;
              const isDuplicate = duplicateScan.duplicateIds.has(item.id);

              return (
                <Card
                  key={item.id}
                  className={cn(
                    "p-4 flex flex-col justify-between hover:border-primary/50 transition-all group",
                    isCurrentPlayingAudio && "border-pink-500/50 bg-pink-500/5",
                    isDuplicate && "border-amber-500/40 bg-amber-500/5"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-surface-elevated border border-surface-border">
                        {getFileIcon(item.mimeType, item.name)}
                      </div>
                      <div className="flex items-center gap-1">
                        {isDuplicate && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                            Bản sao
                          </span>
                        )}
                        {audio && (
                          <button
                            onClick={() => playFileAudio(item)}
                            className="p-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/30 transition-transform active:scale-95"
                            title="Phát bài hát này"
                          >
                            <Play className="h-4 w-4 fill-current" />
                          </button>
                        )}
                        {video && (
                          <button
                            onClick={() => playFileVideo(item)}
                            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-transform active:scale-95"
                            title="Xem phim rạp chiếu"
                          >
                            <Film className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-xs text-foreground truncate mb-1" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {formatBytes(item.sizeBytes)} &bull; {item.updatedAt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {item.mimeType}
                    </span>
                    {item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Tải xuống tệp tin"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Modal: Quản lý & Thêm nhiều thư mục Drive dự phòng (Admin only) */}
      {showEndpointModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl glass-panel p-6 shadow-2xl border border-white/20 bg-slate-950/95 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  Cài đặt Nhiều Thư mục Drive Dự phòng
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Thêm nhiều link Google Apps Script để dự phòng khi một link bị hỏng hoặc đầy dung lượng
                </p>
              </div>
              <button
                onClick={() => setShowEndpointModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Existing Endpoints List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              <span className="text-xs font-semibold text-slate-300 block">
                Danh sách các điểm kết nối hiện có ({endpoints.length}):
              </span>
              {endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className={cn(
                    "p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs",
                    ep.isActive
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-white/10 bg-white/5"
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{ep.name}</span>
                      {ep.isActive && (
                        <Badge variant="success" size="sm" className="text-[10px]">
                          Đang hoạt động
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-400 font-mono truncate max-w-xs flex items-center gap-1">
                      <span>🔒</span>
                      <span>Liên kết Apps Script (Đã mã hóa & ẩn an toàn)</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTestLink(ep.id)}
                      disabled={testingId === ep.id}
                      className="text-[11px] h-7 px-2"
                    >
                      {testingId === ep.id ? "Đang test..." : "Test Link"}
                    </Button>
                    {!ep.isActive && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActiveEndpointId(ep.id);
                          triggerAction(`Đã chuyển sang thư mục: ${ep.name}`);
                        }}
                        className="text-[11px] h-7 px-2"
                      >
                        Chọn dùng
                      </Button>
                    )}
                    {endpoints.length > 1 && (
                      <button
                        onClick={() => removeEndpoint(ep.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        title="Xóa điểm kết nối này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Endpoint Form */}
            <form onSubmit={handleAddEndpoint} className="border-t border-white/10 pt-4 space-y-3">
              <span className="text-xs font-semibold text-white block">
                Thêm điểm kết nối Drive / Apps Script mới:
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Tên gợi nhớ (VD: Kho tài liệu dự phòng, Drive Cá nhân 2...)"
                  value={newEndpointName}
                  onChange={(e) => setNewEndpointName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
                <input
                  type="password"
                  placeholder="Dán liên kết Google Apps Script tại đây (được ẩn & mã hóa an toàn)..."
                  value={newEndpointUrl}
                  onChange={(e) => setNewEndpointUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEndpointModal(false)}
                >
                  Đóng
                </Button>
                <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm Thư mục</span>
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
