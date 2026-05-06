import { getPlatformFromUrl, extractSpotifyId, extractYouTubeId } from "@/lib/streaming";

export function canEmbed(url: string): boolean {
  const platform = getPlatformFromUrl(url);
  return platform === "spotify" || platform === "youtube" || platform === "youtube_music";
}

interface EmbedPlayerProps {
  url: string;
  className?: string;
}

export default function EmbedPlayer({ url, className = "" }: EmbedPlayerProps) {
  const platform = getPlatformFromUrl(url);

  if (platform === "spotify") {
    const id = extractSpotifyId(url);
    if (!id) return null;
    const match = url.match(/spotify\.com\/(track|album|playlist|episode)\//);
    const type = match ? match[1] : "track";
    const height = type === "track" || type === "episode" ? 152 : 352;
    return (
      <div className={className}>
        <iframe
          src={`https://open.spotify.com/embed/${type}/${id}?utm_source=generator`}
          width="100%"
          height={height}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
      </div>
    );
  }

  if (platform === "youtube" || platform === "youtube_music") {
    const id = extractYouTubeId(url);
    if (!id) return null;
    return (
      <div className={className}>
        <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return null;
}
