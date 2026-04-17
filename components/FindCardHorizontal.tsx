"use client";

import { useState, useEffect, memo } from "react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import type { SpotifyFind } from "@/lib/data";
import { Heart, MessageCircle } from "lucide-react";
import { getGenreColor } from "@/lib/genres";
import { getPlatformFromUrl, getYouTubeThumbnailUrl } from "@/lib/streaming";
import { apiFetch } from "@/lib/api-fetch";
import Image from "next/image";

interface FindCardHorizontalProps {
  find: SpotifyFind & { likeCount?: number; liked?: boolean; commentCount?: number };
  onTypeClick?: (type: string) => void;
  onGenreClick?: (genre: string) => void;
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
  onCardClick?: (find: SpotifyFind & { likeCount?: number; liked?: boolean; commentCount?: number }) => void;
}

function FindCardHorizontal({
  find, 
  onTypeClick, 
  onGenreClick, 
  onLikeUpdate, 
  onCardClick 
}: FindCardHorizontalProps) {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(find.imageUrl || null);
  const [liked, setLiked] = useState(find.liked || false);
  const [likeCount, setLikeCount] = useState(find.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (find.imageUrl) {
      setImageUrl(find.imageUrl);
      return;
    }

    async function fetchImage() {
      try {
        const platform = getPlatformFromUrl(find.spotifyUrl);
        if (platform === "youtube" || platform === "youtube_music") {
          const thumbnail = getYouTubeThumbnailUrl(find.spotifyUrl);
          if (thumbnail) {
            setImageUrl(thumbnail);
            fetch(`/api/finds/${find.id}/image`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: thumbnail }),
            }).catch((err) => console.error("Failed to save image URL:", err));
          }
          return;
        }
        if (platform === "apple_music") {
          const response = await fetch("/api/apple/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: find.spotifyUrl }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
              setImageUrl(data.imageUrl);
              fetch(`/api/finds/${find.id}/image`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: data.imageUrl }),
              }).catch((err) => console.error("Failed to save image URL:", err));
            }
          }
          return;
        }
        if (platform !== "spotify") return;

        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(find.spotifyUrl)}`;
        const response = await fetch(oembedUrl);
        const data = await response.json();

        if (data.thumbnail_url) {
          setImageUrl(data.thumbnail_url);
          fetch(`/api/finds/${find.id}/image`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: data.thumbnail_url }),
          }).catch((err) => console.error("Failed to save image URL:", err));
        }
      } catch (error) {
        console.error("Failed to fetch image:", error);
      }
    }

    fetchImage();
  }, [find.spotifyUrl, find.imageUrl, find.id]);

  const isNew = (() => {
    const addedDate = new Date(find.dateAdded);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  })();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || isLiking) return;

    setIsLiking(true);

    try {
      const response = await apiFetch(`/api/finds/${find.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        onLikeUpdate?.(find.id, data.liked, data.likeCount);
      }
    } catch (error) {
      console.error("Error liking:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.badge-click')) {
      return;
    }
    e.preventDefault();
    onCardClick?.(find);
  };

  return (
    <div className="flex justify-center">
      <div
        onClick={handleCardClick}
        className="group cursor-pointer rounded-lg bg-card border-0 p-6 w-full max-w-2xl h-full flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 transition-all duration-200 hover:bg-muted hover:scale-[1.01] hover:shadow-lg"
      >
        {/* Cover Image */}
        <div className="relative w-full h-48 sm:w-40 sm:h-40 md:w-48 md:h-48 shrink-0 rounded-lg overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${find.title} by ${find.artist}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 160px, 192px"
            />
          ) : (
            <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
              <span className="text-muted-foreground text-xs">Loading...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
          {/* Title + Artist */}
          <div className="min-w-0">
            <h3 className="text-xl md:text-2xl font-semibold text-card-foreground line-clamp-1">
              {find.title}
            </h3>
            <p className="text-base font-medium text-muted-foreground line-clamp-1">
              {find.artist}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {isNew && (
              <span className="inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-500 capitalize animate-pulse">
                New
              </span>
            )}
            <span
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTypeClick?.(find.type); }}
              className="badge-click inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize cursor-pointer hover:opacity-80 transition-opacity"
            >
              {find.type}
            </span>
            {find.genre && (
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGenreClick?.(find.genre!); }}
                className={`badge-click inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white cursor-pointer hover:opacity-80 transition-opacity ${getGenreColor(find.genre!)}`}
              >
                {find.genre}
              </span>
            )}
            {find.user?.name && (
              <span className="inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                by {find.user.name}
              </span>
            )}
          </div>

          {find.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 italic">{find.description}</p>
          )}

          {/* Date + actions */}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {new Date(find.dateAdded).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCardClick?.(find); }}
                className={`flex items-center gap-1 transition-all ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
              >
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{find.commentCount || 0}</span>
              </button>
              <button
                onClick={handleLike}
                disabled={!user || isLiking}
                className={`flex items-center gap-1 transition-all ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
              >
                <Heart className={`h-5 w-5 transition-all duration-200 ${liked ? "fill-pink-500 text-pink-500" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium transition-colors ${liked ? "text-pink-500" : "text-muted-foreground"}`}>{likeCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(FindCardHorizontal);
