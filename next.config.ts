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
    ],
  },
};

export default nextConfig;
