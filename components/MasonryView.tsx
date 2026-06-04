"use client";

import { useMemo, useRef } from "react";
import Masonry from "./Masonry";

interface MasonryViewProps {
  finds: any[];
  onCardClick: (find: any) => void;
}

// Stable per-id heights — generated once, never change for the same id
const heightCache = new Map<string, number>();

export default function MasonryView({ finds, onCardClick }: MasonryViewProps) {
  const masonryItems = useMemo(() => finds.map((find) => {
    if (!heightCache.has(find.id)) {
      heightCache.set(find.id, Math.random() * 400 + 300);
    }
    return {
      id: find.id,
      img: find.imageUrl || 'https://via.placeholder.com/600x600?text=No+Image',
      url: find.spotifyUrl,
      spotifyUrl: find.spotifyUrl,
      height: heightCache.get(find.id)!,
      title: find.title,
      artist: find.artist,
    };
  }), [finds]);

  const estimatedHeight = Math.max(600, Math.ceil(finds.length / 4) * 280);

  return (
    <div style={{ height: estimatedHeight, position: 'relative' }}>
      <Masonry
        items={masonryItems}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover={true}
        hoverScale={0.95}
        blurToFocus={true}
        colorShiftOnHover={false}
        onItemClick={(item) => {
          const find = finds.find(f => f.id === item.id);
          if (find) onCardClick(find);
        }}
      />
    </div>
  );
}

