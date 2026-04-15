"use client";

import { useState, useEffect, memo, useRef } from "react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import type { SpotifyFind } from "@/lib/data";
import { getGenreColor } from "@/lib/genres";
import SpotifyImage from "./SpotifyImage";
import { Heart, MessageCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";

const PARTICLES = [
  { tx: "-28px", ty: "-28px" },
  { tx: "0px",   ty: "-36px" },
  { tx: "28px",  ty: "-28px" },
  { tx: "36px",  ty: "0px"   },
  { tx: "28px",  ty: "28px"  },
  { tx: "-36px", ty: "0px"   },
];

interface FindCardProps {
  find: SpotifyFind & {
    likeCount?: number;
    liked?: boolean;
    commentCount?: number;
  };
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
  onCardClick?: (find: SpotifyFind & { likeCount?: number; liked?: boolean; commentCount?: number }) => void;
}

function FindCard({ find, onLikeUpdate, onCardClick }: FindCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(find.liked || false);
  const [likeCount, setLikeCount] = useState(find.likeCount || 0);

  useEffect(() => {
    setLiked(find.liked || false);
    setLikeCount(find.likeCount || 0);
  }, [find.liked, find.likeCount]);
  const [isLiking, setIsLiking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const particleKey = useRef(0);

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

    if (!user || isLiking) return;

    setIsLiking(true);
    setIsAnimating(true);
    particleKey.current += 1;
    setShowParticles(true);
    setTimeout(() => setIsAnimating(false), 450);
    setTimeout(() => setShowParticles(false), 600);

    try {
      const response = await apiFetch(`/api/finds/${find.id}/like`, { method: "POST" });
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

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCardClick?.({ ...find, liked, likeCount });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onCardClick?.({ ...find, liked, likeCount });
  };

  return (
    <div className="group block cursor-pointer" onClick={handleCardClick}>
      <div className="h-full rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:scale-[1.02] group-hover:border-primary/50 relative">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
          <SpotifyImage
            spotifyUrl={find.spotifyUrl}
            imageUrl={find.imageUrl}
            alt={`${find.title} by ${find.artist}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              onClick={handleCommentClick}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md backdrop-blur-sm bg-background/60 transition-all ${
                !user ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
              }`}
            >
              <MessageCircle className="h-4 w-4 text-white" />
              <span className="text-xs font-semibold text-white">{find.commentCount || 0}</span>
            </button>
            <button
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`relative flex items-center gap-1.5 px-2 py-1 rounded-md backdrop-blur-sm bg-background/60 transition-all ${
                !user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {showParticles && PARTICLES.map((p, i) => (
                <span
                  key={`${particleKey.current}-${i}`}
                  className="animate-particle pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400"
                  style={{ "--tx": p.tx, "--ty": p.ty, animationDelay: `${i * 30}ms` } as React.CSSProperties}
                />
              ))}
              <Heart
                className={`h-4 w-4 transition-colors duration-200 ${
                  liked ? "fill-pink-500 text-pink-500" : "text-white"
                } ${isAnimating ? "animate-heart-pop" : ""}`}
              />
              <span className={`text-xs font-semibold transition-colors ${liked ? "text-pink-500" : "text-white"}`}>
                {likeCount}
              </span>
            </button>
          </div>
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
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium text-white ${getGenreColor(find.genre)}`}>
                {find.genre}
              </span>
            )}
            {find.user?.name && (
              <span className="inline-block rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary capitalize flex items-center gap-1">
                <span className="opacity-70">by</span> {find.user.name}
              </span>
            )}
          </div>
          <h3 className="mb-1 text-lg font-semibold text-card-foreground line-clamp-1">{find.title}</h3>
          <p className="mb-1 text-sm font-semibold text-card-foreground line-clamp-1">{find.artist}</p>
          {find.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 italic">{find.description}</p>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            {new Date(find.dateAdded).toLocaleDateString("en-US", {
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

export default memo(FindCard);
