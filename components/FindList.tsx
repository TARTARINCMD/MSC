"use client";

import type { SpotifyFind } from "@/lib/data";
import FindCardWithTilt from "./FindCardWithTilt";

interface FindListProps {
  finds: (SpotifyFind & { likeCount?: number; liked?: boolean })[];
  onTypeClick?: (type: any) => void;
  onGenreClick?: (genre: string) => void;
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
  onCardClick?: (find: SpotifyFind & { likeCount?: number; liked?: boolean }) => void;
}

export default function FindList({ finds, onTypeClick, onGenreClick, onLikeUpdate, onCardClick }: FindListProps) {
  if (finds.length === 0) {
    return (
      <div className="py-12 text-center animate-in fade-in duration-300">
        <p className="text-muted-foreground">No finds yet. Add some in lib/data.ts!</p>
      </div>
    );
  }

  return (
    <>
      {/* Top fade gradient overlay */}
      <div 
        className="pointer-events-none fixed top-0 left-0 right-0 h-[10rem] bg-gradient-to-b from-background via-background/70 to-transparent"
        style={{ zIndex: 10 }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 pb-[5rem]">
        {finds.map((find, index) => (
          <div
            key={find.id}
            className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "both",
            }}
          >
            <FindCardWithTilt
              find={find}
              onTypeClick={onTypeClick}
              onGenreClick={onGenreClick}
              onLikeUpdate={onLikeUpdate}
              onCardClick={onCardClick}
            />
          </div>
        ))}
      </div>
      {/* Bottom fade gradient overlay */}
      <div 
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-[10rem] bg-gradient-to-t from-background via-background/70 to-transparent"
        style={{ zIndex: 10 }}
      />
    </>
  );
}

