"use client";

import Masonry from "./Masonry";

interface MasonryViewProps {
  finds: any[];
  onCardClick: (find: any) => void;
}

export default function MasonryView({ finds, onCardClick }: MasonryViewProps) {
  const masonryItems = finds.map((find) => ({
    id: find.id,
    img: find.imageUrl || 'https://via.placeholder.com/600x600?text=No+Image',
    url: find.spotifyUrl,
    height: Math.random() * 400 + 300, // Random heights for masonry effect
    title: find.title,
    artist: find.artist,
  }));

  return (
    <>
      {/* Top fade gradient overlay */}
      <div 
        className="pointer-events-none fixed top-0 left-0 right-0 h-40 bg-gradient-to-b from-background via-background/70 to-transparent"
        style={{ zIndex: 10 }}
      />
      <div style={{ height: '1000px', position: 'relative', paddingTop: '20px', paddingBottom: '160px' }}>
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
      {/* Bottom fade gradient overlay */}
      <div 
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/70 to-transparent"
        style={{ zIndex: 10 }}
      />
    </>
  );
}

