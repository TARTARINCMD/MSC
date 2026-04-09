"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import GenreSelect from "@/components/GenreSelect";
import {
  extractSpotifyId,
  getPlatformFromUrl,
  getYouTubeThumbnailUrl,
  isSupportedStreamingUrl,
} from "@/lib/streaming";
import { apiFetch } from "@/lib/api-fetch";

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
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        artist: "",
        type: "track",
        spotifyUrl: "",
        description: "",
        genre: "",
        imageUrl: "",
      });
      setError("");
      setLoading(false);
      setFetchingImage(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchMetadata = async (url: string) => {
    if (!url) return;
    const platform = getPlatformFromUrl(url);
    setFetchingImage(true);
    try {
      if (platform === "youtube" || platform === "youtube_music") {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        );
        if (response.ok) {
          const data = await response.json();
          const thumbnail = getYouTubeThumbnailUrl(url);
          setFormData((prev) => ({
            ...prev,
            imageUrl: thumbnail || prev.imageUrl,
            title: prev.title || data.title || "",
          }));
        }
        return;
      }

      if (platform === "apple_music") {
        const response = await fetch("/api/apple/metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (response.ok) {
          const data = await response.json();
          setFormData((prev) => ({
            ...prev,
            imageUrl: data.imageUrl || prev.imageUrl,
            title: prev.title || data.title || "",
          }));
        }
        return;
      }

      if (platform === "spotify") {
        const response = await fetch(
          `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
        );
        if (response.ok) {
          const data = await response.json();
          // oEmbed title is "Song · Artist" format — split on " · "
          setFormData((prev) => ({
            ...prev,
            imageUrl: data.thumbnail_url || prev.imageUrl,
            title: prev.title || data.title || "",
          }));
        }
        return;
      }
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
    } finally {
      setFetchingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.genre) {
      setError("Please select a genre");
      setLoading(false);
      return;
    }

    if (!isSupportedStreamingUrl(formData.spotifyUrl)) {
      setError("Unsupported link. Use Spotify, Apple Music, YouTube Music, or YouTube.");
      setLoading(false);
      return;
    }

    const platform = getPlatformFromUrl(formData.spotifyUrl);
    const spotifyId = platform === "spotify" ? extractSpotifyId(formData.spotifyUrl) : null;
    if (platform === "spotify" && !spotifyId) {
      setError("Invalid link format");
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch("/api/finds", {
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
        return;
      }

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
    } finally {
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Music</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="spotifyUrl" className="block text-sm font-medium mb-2 px-1">
                Streaming URL
              </label>
              <input
                id="spotifyUrl"
                type="url"
                value={formData.spotifyUrl}
                onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                onBlur={(e) => fetchMetadata(e.target.value)}
                placeholder="Spotify, Apple Music, YouTube Music, or YouTube link"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

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
              <label htmlFor="title" className="block text-sm font-medium mb-2 px-1">
                Title
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
              <label htmlFor="artist" className="block text-sm font-medium mb-2 px-1">
                Artist
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
              <label className="block text-sm font-medium mb-2 px-1">
                Type
              </label>
              <div className="relative" ref={typeRef}>
                <button
                  type="button"
                  onClick={() => setTypeOpen((prev) => !prev)}
                  className="w-full px-3 py-2 pr-9 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-left"
                >
                  {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                </button>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground pointer-events-none">
                  <ChevronDown className={`h-4 w-4 transition-transform ${typeOpen ? "rotate-180" : ""}`} />
                </span>
                {typeOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-md shadow-lg z-[120]">
                    {(["track", "album", "playlist", "podcast"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFormData({ ...formData, type: opt });
                          setTypeOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="genre" className="block text-sm font-medium mb-2 px-1">
                Genre
              </label>
              <GenreSelect
                value={formData.genre}
                onChange={(value) => setFormData({ ...formData, genre: value })}
                placeholder="Select a genre"
                inputClassName="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-10">
            <label htmlFor="description" className="block text-sm font-medium mb-2 px-1">
              Description{" "}
              <span className="text-muted-foreground font-normal">(Optional)</span>
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
