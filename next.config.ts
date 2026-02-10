import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        // This allows all paths from Spotify's image CDN
      },
      {
        protocol: "https",
        hostname: "image-cdn-ak.spotifycdn.com",
        // Alternative Spotify CDN domain
      },
      {
        protocol: "https",
        hostname: "image-cdn-fa.spotifycdn.com",
        // Another Spotify CDN domain
      },
      {
        protocol: "https",
        hostname: "seed-mix-image.spotifycdn.com",
        // Spotify seed/mix image CDN
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        // YouTube thumbnail images
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        // YouTube image CDN
      },
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
        // Apple Music image CDN
      },
      {
        protocol: "https",
        hostname: "is2-ssl.mzstatic.com",
        // Apple Music image CDN
      },
      {
        protocol: "https",
        hostname: "is3-ssl.mzstatic.com",
        // Apple Music image CDN
      },
      {
        protocol: "https",
        hostname: "is4-ssl.mzstatic.com",
        // Apple Music image CDN
      },
      {
        protocol: "https",
        hostname: "is5-ssl.mzstatic.com",
        // Apple Music image CDN
      },
    ],
  },
};

export default nextConfig;
