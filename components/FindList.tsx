"use client";

import type { SpotifyFind } from "@/lib/data";
import FindCardWithTilt from "./FindCardWithTilt";

interface FindListProps {
  finds: SpotifyFind[];
  onTypeClick?: (type: any) => void;
  onGenreClick?: (genre: string) => void;
}

export default function FindList({ finds, onTypeClick, onGenreClick }: FindListProps) {
  if (finds.length === 0) {
    return (
      <div className="py-12 text-center animate-in fade-in duration-300">
        <p className="text-muted-foreground">No finds yet. Add some in lib/data.ts!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
      {finds.map((find, index) => (
        <div
          key={find.id}
          className="w-full max-w-[300px] animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: "both",
          }}
        >
          <FindCardWithTilt
            find={find}
            onTypeClick={onTypeClick}
            onGenreClick={onGenreClick}
          />
        </div>
      ))}
    </div>
  );
}

