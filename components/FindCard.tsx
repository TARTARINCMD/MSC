"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { SpotifyFind } from "@/lib/data";
import SpotifyImage from "./SpotifyImage";
import { Heart } from "lucide-react";

interface FindCardProps {
  find: SpotifyFind & {
    likeCount?: number;
    liked?: boolean;
  };
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
}

export default function FindCard({ find, onLikeUpdate }: FindCardProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(find.liked || false);
  const [likeCount, setLikeCount] = useState(find.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  return (
    <a
      href={find.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="h-full rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:scale-[1.02] group-hover:border-primary/50 relative">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
          <SpotifyImage
            spotifyUrl={find.spotifyUrl}
            imageUrl={find.imageUrl}
            alt={`${find.title} by ${find.artist}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Like button overlay */}
          <button
            onClick={handleLike}
            disabled={!session || isLiking}
            className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-md backdrop-blur-sm bg-background/60 transition-all ${
              !session ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
            } ${isAnimating ? "animate-bounce" : ""}`}
          >
            <Heart
              className={`h-5 w-5 transition-all duration-200 ${liked ? "fill-pink-500 text-pink-500" : "text-foreground/80 hover:text-pink-400"} ${isAnimating ? "scale-125" : ""}`}
            />
            <span className={`text-sm font-medium transition-colors ${liked ? "text-pink-500" : "text-foreground/80"}`}>{likeCount}</span>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            {isNew && (
              <span className="inline-block rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-500 capitalize animate-pulse">
                New
              </span>
            )}
            <span className="inline-block rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground capitalize">
              {find.type}
            </span>
            {find.genre && (
              <span className="inline-block rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
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
          {find.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 italic">
              {find.description}
            </p>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Added on {new Date(find.dateAdded).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </a>
  );
}
