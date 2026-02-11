"use client";

import type { SpotifyFind } from "@/lib/data";
import FindCardHorizontal from "./FindCardHorizontal";

interface FindListHorizontalProps {
  finds: (SpotifyFind & { likeCount?: number; liked?: boolean })[];
  onTypeClick?: (type: any) => void;
  onGenreClick?: (genre: string) => void;
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
  onCardClick?: (find: SpotifyFind & { likeCount?: number; liked?: boolean }) => void;
}

export default function FindListHorizontal({ 
  finds, 
  onTypeClick, 
  onGenreClick, 
  onLikeUpdate, 
  onCardClick 
}: FindListHorizontalProps) {
  if (finds.length === 0) {
    return (
      <div className="py-12 text-center animate-in fade-in duration-300">
        <p className="text-muted-foreground">No finds yet. Add some in lib/data.ts!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {finds.map((find, index) => (
        <div
          key={find.id}
          className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: "both",
          }}
        >
          <FindCardHorizontal
            find={find}
            onTypeClick={onTypeClick}
            onGenreClick={onGenreClick}
            onLikeUpdate={onLikeUpdate}
            onCardClick={onCardClick}
          />
        </div>
        ))}
    </div>
  );
}
