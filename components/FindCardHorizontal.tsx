"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { SpotifyFind } from "@/lib/data";
import { Heart } from "lucide-react";
import { getPlatformFromUrl, getYouTubeThumbnailUrl } from "@/lib/streaming";
import Image from "next/image";

interface FindCardHorizontalProps {
  find: SpotifyFind & { likeCount?: number; liked?: boolean };
  onTypeClick?: (type: string) => void;
  onGenreClick?: (genre: string) => void;
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
  onCardClick?: (find: SpotifyFind & { likeCount?: number; liked?: boolean }) => void;
}

export default function FindCardHorizontal({ 
  find, 
  onTypeClick, 
  onGenreClick, 
  onLikeUpdate, 
  onCardClick 
}: FindCardHorizontalProps) {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(find.imageUrl || null);
  const [liked, setLiked] = useState(find.liked || false);
  const [likeCount, setLikeCount] = useState(find.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
    return diffDays <= 3;
  })();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session || isLiking) return;

    setIsLiking(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    try {
      const response = await fetch(`/api/finds/${find.id}/like`, {
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
    <div
      onClick={handleCardClick}
      className="group cursor-pointer"
    >
      <div className="rounded-lg bg-card border border-border p-6 max-w-2xl mx-auto h-full flex items-center gap-6 transition-colors duration-200 group-hover:bg-muted/50 hover:border-border/80">
        {/* Cover Image */}
        <div className="relative shrink-0 w-40 h-40 md:w-48 md:h-48 rounded-lg overflow-hidden bg-muted">
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
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Badges and Like Button */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {isNew && (
                <span className="inline-block rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-500 capitalize animate-pulse">
                  New
                </span>
              )}
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTypeClick?.(find.type);
                }}
                className="badge-click inline-block rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground capitalize cursor-pointer hover:opacity-80 transition-opacity"
              >
                {find.type}
              </span>
              {find.genre && (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onGenreClick?.(find.genre!);
                  }}
                  className="badge-click inline-block rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {find.genre}
                </span>
              )}
              {find.user?.name && (
                <span className="inline-block rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary capitalize flex items-center gap-1">
                  <span className="opacity-70">by</span> {find.user.name}
                </span>
              )}
            </div>
            <button
              onClick={handleLike}
              disabled={!session || isLiking}
              className={`shrink-0 flex items-center gap-1 transition-all ${
                !session ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
              } ${isAnimating ? "animate-bounce" : ""}`}
            >
              <Heart
                className={`h-5 w-5 transition-all duration-200 ${liked ? "fill-pink-500 text-pink-500" : "text-muted-foreground hover:text-pink-400"} ${isAnimating ? "scale-125" : ""}`}
              />
              <span className={`text-sm font-medium transition-colors ${liked ? "text-pink-500" : "text-muted-foreground"}`}>
                {likeCount}
              </span>
            </button>
          </div>

          {/* Title and Artist */}
          <div className="min-w-0">
            <h3 className="text-xl md:text-2xl font-semibold text-card-foreground line-clamp-1 mb-2">
              {find.title}
            </h3>
            <p className="text-base md:text-lg font-medium text-muted-foreground line-clamp-1">
              {find.artist}
            </p>
          </div>

          {/* Description */}
          {find.description && (
            <p className="text-base text-muted-foreground line-clamp-3 italic">
              {find.description}
            </p>
          )}

          {/* Date */}
          <p className="text-sm text-muted-foreground">
            Added on {new Date(find.dateAdded).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
