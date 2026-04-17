"use client";

import type { SpotifyFind } from "@/lib/data";
import FindCardHorizontal from "./FindCardHorizontal";

export function FindListHorizontalSkeleton() {
  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg bg-card p-6 max-w-2xl mx-auto w-full flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Cover */}
          <div className="w-full h-48 sm:w-40 sm:h-40 md:w-48 md:h-48 shrink-0 rounded-lg skeleton" />
          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2">
                <div className="h-5 w-12 rounded-full skeleton" />
                <div className="h-5 w-16 rounded-full skeleton" />
                <div className="h-5 w-14 rounded-full skeleton" />
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="h-5 w-8 rounded skeleton" />
                <div className="h-5 w-8 rounded skeleton" />
              </div>
            </div>
            <div className="h-7 w-3/4 rounded skeleton" />
            <div className="h-5 w-1/2 rounded skeleton" />
            <div className="h-4 w-2/3 rounded skeleton" />
            <div className="h-4 w-1/4 rounded skeleton mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface FindListHorizontalProps {
  finds: (SpotifyFind & { likeCount?: number; liked?: boolean; commentCount?: number })[];
  onTypeClick?: (type: any) => void;
  onGenreClick?: (genre: string) => void;
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
  onCardClick?: (find: SpotifyFind & { likeCount?: number; liked?: boolean; commentCount?: number }) => void;
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
