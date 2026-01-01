"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddFindPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    type: "track" as "track" | "album" | "playlist",
    spotifyUrl: "",
    imageUrl: "",
    description: "",
    genre: "",
  });

  if (!session) {
    router.push("/login");
    return null;
  }

  const extractSpotifyId = (url: string): string | null => {
    const match = url.match(/spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    return match ? match[2] : null;
  };

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  const fetchMetadata = async (url: string) => {
    if (!url) return;

    // Check if it's a valid spotify URL before making an API call
    const match = url.match(/spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    if (!match) return;

    setIsFetchingMetadata(true);
    try {
      const res = await fetch("/api/spotify/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        const metadata = await res.json();

        let type = metadata.type;
        if (type === 'episode' || type === 'show') {
          type = 'podcast';
        }

        setFormData((prev) => ({
          ...prev,
          title: metadata.title || prev.title,
          artist: metadata.artist || prev.artist,
          type: type as any,
          spotifyUrl: url,
          imageUrl: metadata.imageUrl || "",
        }));
      }
    } catch (e) {
      console.error("Failed to fetch metadata", e);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Debounce the call or just call on blur? 
  // Let's call onBlur for simplicity or when the user stops typing for a second.
  // Actually, since it's a copy-paste action usually, onBlur is simplest, or a simple useEffect with a small timeout.


  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, spotifyUrl: url });
    // If it looks like a full URL, try to fetch (or we can just do it on blur to avoid spamming)
    if (url.includes("spotify.com/")) {
      // Optional: could add debounce here
    }
  };

  const handleUrlBlur = () => {
    fetchMetadata(formData.spotifyUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const spotifyId = extractSpotifyId(formData.spotifyUrl);
    if (!spotifyId) {
      setError("Invalid Spotify URL. Please use a valid track, album, or playlist URL.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/finds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          spotifyId,
          imageUrl: formData.imageUrl || null,
          description: formData.description || null,
          genre: formData.genre || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to add find");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to finds
        </Link>

        <h1 className="text-3xl font-bold mb-6">Add New Find</h1>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="spotifyUrl" className="block text-sm font-medium mb-2">
              Spotify URL *
            </label>
            <div className="relative">
              <input
                id="spotifyUrl"
                type="url"
                value={formData.spotifyUrl}
                onChange={handleUrlChange}
                onBlur={handleUrlBlur}
                required
                placeholder="https://open.spotify.com/track/..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-10"
              />
              {isFetchingMetadata && (
                <div className="absolute right-3 top-2.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste the Spotify URL for a track, album, or playlist
            </p>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="track">Track</option>
              <option value="album">Album</option>
              <option value="playlist">Playlist</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium mb-2">
              Artist *
            </label>
            <input
              id="artist"
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium mb-2">
              Genre
            </label>
            <input
              id="genre"
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="e.g., Hip Hop, Jazz, Rock"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Find"}
          </button>
        </form>
      </div>
    </div>
  );
}

