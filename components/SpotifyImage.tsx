"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getPlatformFromUrl, getYouTubeThumbnailUrl } from "@/lib/streaming";

interface SpotifyImageProps {
  spotifyUrl: string;
  imageUrl?: string;
  alt: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function SpotifyImage({
  spotifyUrl,
  imageUrl: providedImageUrl,
  alt,
  fill = false,
  className = "",
  width,
  height,
}: SpotifyImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(providedImageUrl || null);
  const [isLoading, setIsLoading] = useState(!providedImageUrl);

  useEffect(() => {
    if (providedImageUrl) {
      setImageUrl(providedImageUrl);
      setIsLoading(false);
      return;
    }

    async function fetchImage() {
      try {
        const platform = getPlatformFromUrl(spotifyUrl);
        if (platform === "youtube" || platform === "youtube_music") {
          const thumbnail = getYouTubeThumbnailUrl(spotifyUrl);
          if (thumbnail) {
            setImageUrl(thumbnail);
          }
          setIsLoading(false);
          return;
        }
        if (platform === "apple_music") {
          const response = await fetch("/api/apple/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: spotifyUrl }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
              setImageUrl(data.imageUrl);
            }
          }
          setIsLoading(false);
          return;
        }
        if (platform !== "spotify") {
          setIsLoading(false);
          return;
        }
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
        const response = await fetch(oembedUrl);
        const data = await response.json();

        if (data.thumbnail_url) {
          setImageUrl(data.thumbnail_url);
        }
      } catch (error) {
        console.error("Failed to fetch image:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImage();
  }, [spotifyUrl, providedImageUrl]);

  if (isLoading || !imageUrl) {
    return (
      <div
        className={`bg-muted animate-pulse ${className}`}
        style={fill ? {} : { width, height }}
      />
    );
  }
  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={className}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}

