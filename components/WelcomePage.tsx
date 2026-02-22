"use client";

import Link from "next/link";
import CircularText from "./CircularText";
import { Music, Heart, Users, Share2 } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo - centered at top */}
          <div className="mb-8 flex justify-center">
            <CircularText
              text="SHARE+TUNE+"
              onHover="goBonkers"
              spinDuration={30}
              className="custom-class"
            />
          </div>

          {/* Hero text */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
            Welcome to Sharetune
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Discover, share, and celebrate music with friends.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="p-6 rounded-xl bg-card border border-border">
              <Music className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Share Your Finds</h3>
              <p className="text-sm text-muted-foreground">
                Share your favorite tracks, albums, playlists, and podcasts from any platform
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <Heart className="h-8 w-8 text-pink-500 mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Like & Discover</h3>
              <p className="text-sm text-muted-foreground">
                Like what you love and discover what others are listening to
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <Users className="h-8 w-8 text-foreground mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Follow Friends</h3>
              <p className="text-sm text-muted-foreground">
                See what your friends are sharing in your personalized feed
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <Share2 className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Build Your Collection</h3>
              <p className="text-sm text-muted-foreground">
                Curate your music discoveries and share your taste
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link
              href="/signup"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-card border border-border text-foreground rounded-lg font-semibold text-lg hover:bg-accent transition-all hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

