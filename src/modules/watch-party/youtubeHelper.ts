import { MediaSourceType } from "./types";

/**
 * Extracts YouTube Video ID from various link formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://music.youtube.com/watch?v=dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Standard v parameter or youtu.be or shorts/live
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    return match[1];
  }

  // Pure 11-char ID
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Returns thumbnail image URL for YouTube video
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Returns embed URL for YouTube iframe
 */
export function getYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    enablejsapi: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Extracts Spotify track/album/playlist ID and builds embed URL:
 * https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT -> https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT
 */
export function getSpotifyEmbedUrl(url: string): string | null {
  try {
    const trimmed = url.trim();
    const match = trimmed.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
    if (match) {
      const type = match[1];
      const id = match[2];
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Determines media source based on URL
 */
export function detectMediaSource(url: string): MediaSourceType {
  if (!url) return "direct";
  const lower = url.toLowerCase().trim();

  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }

  if (lower.includes("spotify.com")) {
    return "spotify";
  }

  if (lower.includes("zingmp3.vn")) {
    return "zingmp3";
  }

  if (lower.includes("nhaccuatui.com")) {
    return "nhaccuatui";
  }

  if (
    lower.includes("drive.google.com") ||
    lower.includes("script.google.com") ||
    lower.includes("/api/drive")
  ) {
    return "drive";
  }

  return "direct";
}

/**
 * Resolves embeddable or streamable player URL for all external sources:
 * - YouTube: embed URL
 * - Spotify: embed player
 * - ZingMP3 / NhacCuaTui / Web links: direct embed or iframe
 * - Google Drive: direct stream / export URL
 */
export function resolveEmbedUrl(url: string, source: MediaSourceType, autoplay = true): string {
  const trimmed = url.trim();

  if (source === "youtube") {
    const ytId = extractYouTubeId(trimmed);
    return ytId ? getYouTubeEmbedUrl(ytId, autoplay) : trimmed;
  }

  if (source === "spotify") {
    const spot = getSpotifyEmbedUrl(trimmed);
    if (spot) return spot;
  }

  if (source === "drive") {
    // If it's a drive.google.com/file/d/ID/view link, convert to preview embed or export=download
    const match = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  return trimmed;
}
