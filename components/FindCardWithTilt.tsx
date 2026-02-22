"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { SpotifyFind } from "@/lib/data";
import TiltedCard from "./TiltedCard";
import { Heart } from "lucide-react";
import { getPlatformFromUrl, getYouTubeThumbnailUrl } from "@/lib/streaming";

interface FindCardProps {
  find: SpotifyFind & { likeCount?: number; liked?: boolean };
  onTypeClick?: (type: string) => void;
  onGenreClick?: (genre: string) => void;
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
  onCardClick?: (find: SpotifyFind & { likeCount?: number; liked?: boolean }) => void;
}

export default function FindCardWithTilt({ find, onTypeClick, onGenreClick, onLikeUpdate, onCardClick }: FindCardProps) {
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

          // Save the image URL to the database for future use
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

  if (!imageUrl) {
    return (
      <div className="w-full">
        <div className="h-80 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

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
    // Don't trigger if clicking on badges or like button
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.badge-click')) {
      return;
    }
    e.preventDefault();
    onCardClick?.(find);
  };

  return (
    <div
      onClick={handleCardClick}
      className="block w-full h-full group cursor-pointer"
    >
      <div className="rounded-lg bg-card p-4 h-full flex flex-col transition-colors duration-200 group-hover:bg-muted relative">
        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={!session || isLiking}
          className={`absolute bottom-4 right-4 z-10 flex items-center gap-1 transition-all ${
            !session ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
          } ${isAnimating ? "animate-bounce" : ""}`}
        >
          <Heart
            className={`h-5 w-5 transition-all duration-200 ${liked ? "fill-pink-500 text-pink-500" : "text-muted-foreground hover:text-pink-400"} ${isAnimating ? "scale-125" : ""}`}
          />
          <span className={`text-sm font-medium transition-colors ${liked ? "text-pink-500" : "text-muted-foreground"}`}>{likeCount}</span>
        </button>

        <TiltedCard
          imageSrc={imageUrl}
          altText={`${find.title} by ${find.artist}`}
          captionText={`${find.title} - ${find.artist}`}
          containerHeight="300px"
          containerWidth="100%"
          imageHeight="300px"
          imageWidth="100%"
          rotateAmplitude={12}
          scaleOnHover={1.2}
          showMobileWarning={false}
          showTooltip={false}
          displayOverlayContent={false}
        />

        <div className="mt-4 flex flex-col flex-grow">
          <div className="mb-2 flex flex-wrap gap-2">
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
          <h3 className="mb-1 text-lg font-semibold text-card-foreground line-clamp-1">
            {find.title}
          </h3>
          <p className="mb-1 text-sm font-semibold text-card-foreground line-clamp-1">
            {find.artist}
          </p>
          <div className="mt-2 min-h-[2.5rem]">
            {find.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2 italic">
                {find.description}
              </p>
            ) : (
              <p className="text-sm text-transparent line-clamp-2 italic">
                &nbsp;
              </p>
            )}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
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

