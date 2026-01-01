interface SpotifyPlayerProps {
  spotifyId: string;
  type: "track" | "album" | "playlist" | "podcast";
}

export default function SpotifyPlayer({ spotifyId, type }: SpotifyPlayerProps) {
  // Map our internal 'podcast' type back to 'episode' for the embed URL
  // If we wanted to support 'show', we would need to store that distinction or try to guess.
  // For now, assuming standard episode links map to 'podcast'.
  const embedType = type === "podcast" ? "episode" : type;
  const embedUrl = `https://open.spotify.com/embed/${embedType}/${spotifyId}?utm_source=generator`;

  return (
    <div className="w-full">
      <iframe
        src={embedUrl}
        width="100%"
        height={type === "track" || type === "podcast" ? "152" : "352"}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
    </div>
  );
}

