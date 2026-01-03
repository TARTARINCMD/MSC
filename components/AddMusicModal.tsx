"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMusicModal({ isOpen, onClose }: AddMusicModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    type: "track" as "track" | "album" | "playlist" | "podcast",
    spotifyUrl: "",
    description: "",
    genre: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingImage, setFetchingImage] = useState(false);

  if (!isOpen) return null;

  const extractSpotifyId = (url: string): string | null => {
    const match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    return match ? match[2] : null;
  };

  const fetchCoverImage = async (url: string) => {
    if (!url || !url.includes("spotify.com/")) return;

    setFetchingImage(true);
    try {
      const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail_url) {
          setFormData(prev => ({ ...prev, imageUrl: data.thumbnail_url }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch cover image:", err);
    } finally {
      setFetchingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const spotifyId = extractSpotifyId(formData.spotifyUrl);
    if (!spotifyId) {
      setError("Invalid Spotify URL");
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
        const errorData = await response.json();
        setError(errorData.error || "Failed to save");
        setLoading(false);
        return;
      }

      // Success - close modal and reset form
      setFormData({
        title: "",
        artist: "",
        type: "track",
        spotifyUrl: "",
        description: "",
        genre: "",
        imageUrl: "",
      });
      onClose();
      router.refresh();
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Music</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="spotifyUrl" className="block text-sm font-medium mb-2">
              Spotify URL *
            </label>
            <input
              id="spotifyUrl"
              type="url"
              value={formData.spotifyUrl}
              onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
              onBlur={(e) => fetchCoverImage(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Paste a Spotify link - cover image will be fetched automatically
            </p>
          </div>

          {/* Preview cover image */}
          {(formData.imageUrl || fetchingImage) && (
            <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-md">
              {fetchingImage ? (
                <div className="h-16 w-16 bg-muted animate-pulse rounded-md" />
              ) : (
                <img
                  src={formData.imageUrl}
                  alt="Cover"
                  className="h-16 w-16 object-cover rounded-md"
                />
              )}
              <span className="text-sm text-muted-foreground">
                {fetchingImage ? "Fetching cover..." : "Cover image ready"}
              </span>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Song or album name"
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
              placeholder="Artist name"
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
            <label htmlFor="genre" className="block text-sm font-medium mb-2">
              Genre (Optional)
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
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Why do you love this?"
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Music"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
