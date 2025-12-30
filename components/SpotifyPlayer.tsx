interface SpotifyPlayerProps {
  spotifyId: string;
  type: "track" | "album" | "playlist";
}

export default function SpotifyPlayer({ spotifyId, type }: SpotifyPlayerProps) {
  const embedUrl = `https://open.spotify.com/embed/${type}/${spotifyId}?utm_source=generator`;

  return (
    <div className="w-full">
      <iframe
        src={embedUrl}
        width="100%"
        height={type === "track" ? "152" : "352"}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
    </div>
  );
}

