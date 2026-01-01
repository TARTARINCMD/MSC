"use client";

import { useState, useEffect } from "react";
import type { SpotifyFind } from "@/lib/data";
import TiltedCard from "./TiltedCard";

interface FindCardProps {
  find: SpotifyFind;
  onTypeClick?: (type: string) => void;
  onGenreClick?: (genre: string) => void;
}

export default function FindCardWithTilt({ find, onTypeClick, onGenreClick }: FindCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(find.imageUrl || null);

  useEffect(() => {
    if (find.imageUrl) {
      setImageUrl(find.imageUrl);
      return;
    }

    async function fetchImage() {
      try {
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(find.spotifyUrl)}`;
        const response = await fetch(oembedUrl);
        const data = await response.json();

        if (data.thumbnail_url) {
          setImageUrl(data.thumbnail_url);
        }
      } catch (error) {
        console.error("Failed to fetch Spotify image:", error);
      }
    }

    fetchImage();
  }, [find.spotifyUrl, find.imageUrl]);

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

  return (
    <a
      href={find.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full h-full group"
    >
      <div className="rounded-lg bg-card p-4 h-full flex flex-col transition-colors duration-200 group-hover:bg-muted relative">
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
                onTypeClick?.(find.type);
              }}
              className="inline-block rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground capitalize cursor-pointer hover:opacity-80 transition-opacity"
            >
              {find.type}
            </span>
            {find.genre && (
              <span
                onClick={(e) => {
                  e.preventDefault();
                  onGenreClick?.(find.genre!);
                }}
                className="inline-block rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground cursor-pointer hover:opacity-80 transition-opacity"
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
    </a>
  );
}

