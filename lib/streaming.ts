export type StreamingPlatform =
  | "spotify"
  | "apple_music"
  | "youtube_music"
  | "youtube"
  | "unknown";

export function getPlatformFromUrl(url: string): StreamingPlatform {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "open.spotify.com") return "spotify";
    if (host === "music.apple.com") return "apple_music";
    if (host === "music.youtube.com") return "youtube_music";
    if (host === "youtube.com" || host === "youtu.be") return "youtube";
    return "unknown";
  } catch {
    return "unknown";
  }
}

export function getPlatformLabel(platform: StreamingPlatform): string {
  switch (platform) {
    case "spotify":
      return "Spotify";
    case "apple_music":
      return "Apple Music";
    case "youtube_music":
      return "YouTube Music";
    case "youtube":
      return "YouTube";
    default:
      return "Streaming";
  }
}

export function isSupportedStreamingUrl(url: string): boolean {
  return getPlatformFromUrl(url) !== "unknown";
}

export function extractSpotifyId(url: string): string | null {
  const match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  return match ? match[2] : null;
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }
    const match = parsed.pathname.match(/\/shorts\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function extractAppleMusicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("music.apple.com")) return null;
    const trackId = parsed.searchParams.get("i");
    if (trackId) return trackId;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^\d+$/.test(last)) return last;
    return null;
  } catch {
    return null;
  }
}

export function normalizeAppleArtworkUrl(url: string): string {
  return url.replace(/\/\d+x\d+bb\./, "/600x600bb.");
}
