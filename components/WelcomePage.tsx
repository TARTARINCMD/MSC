"use client";

import Link from "next/link";
import Image from "next/image";
import CircularText from "./CircularText";
import { Heart, MessageCircle } from "lucide-react";
import { getGenreColor } from "@/lib/genres";

interface PreviewFind {
  id: string;
  title: string;
  artist: string;
  type: string;
  genre: string | null;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  userName: string;
  description?: string;
}

const PREVIEW_FINDS: PreviewFind[] = [
  {
    id: "p1",
    title: "mistake",
    artist: "loafers.",
    type: "track",
    genre: "Rock",
    imageUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02706af2acf45fbe2935fa919e",
    likeCount: 0,
    commentCount: 0,
    userName: "ruslan",
    description: "a good friend of mine plays in a band, checkirout",
  },
  {
    id: "p2",
    title: "i'm old fashioned",
    artist: "chet baker",
    type: "track",
    genre: "Jazz",
    imageUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e021200e79c84a8d967d5f727e9",
    likeCount: 1,
    commentCount: 0,
    userName: "tulu",
  },
  {
    id: "p3",
    title: "Bela Lugosi's Dead (Official Version)",
    artist: "Bauhaus",
    type: "track",
    genre: "Post-Punk",
    imageUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02811ad026ea2061659268b964",
    likeCount: 1,
    commentCount: 0,
    userName: "tara",
  },
  {
    id: "p4",
    title: "Marian - Version",
    artist: "Sisters of Mercy",
    type: "track",
    genre: "Alternative Rock",
    imageUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0264c2b18bd4c21cb4a21e4f46",
    likeCount: 1,
    commentCount: 0,
    userName: "sulli",
    description: "andrew eldritch's german just tickles my brain in the right way idk",
  },
  {
    id: "p5",
    title: "Someone Like You",
    artist: "Mac Miller",
    type: "track",
    genre: "Experimental Hip Hop",
    imageUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0295d73e298e50c58ad161f696",
    likeCount: 1,
    commentCount: 2,
    userName: "ruslan",
  },
  {
    id: "p6",
    title: "20191009 I Like Her",
    artist: "Mac DeMarco",
    type: "track",
    genre: "Pop",
    imageUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0240461e96808378ae2787a7e4",
    likeCount: 2,
    commentCount: 0,
    userName: "nadski",
    description: "Love at the first hear",
  },
  {
    id: "p7",
    title: "Private Investigations",
    artist: "Dire Straits",
    type: "track",
    genre: "Rock",
    imageUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e026eb1486e037eba0ff701df77",
    likeCount: 0,
    commentCount: 0,
    userName: "Udit",
  },
  {
    id: "p8",
    title: "Lovers In The Parking Lot",
    artist: "Solange",
    type: "track",
    genre: "Neo Soul",
    imageUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02e8fab319c5faaa6d84ffcfcd",
    likeCount: 0,
    commentCount: 0,
    userName: "richie",
  },
  {
    id: "p9",
    title: "You're Not Good Enough",
    artist: "Blood Orange",
    type: "track",
    genre: "Indie",
    imageUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02327b623a41d3bcc67aee0ebc",
    likeCount: 0,
    commentCount: 0,
    userName: "dharmay",
  },
  {
    id: "p10",
    title: "i need to be alone.",
    artist: "girl in red",
    type: "track",
    genre: "Indie",
    imageUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0248af67646b3ad95b427527b7",
    likeCount: 0,
    commentCount: 0,
    userName: "sonyashik",
  },
  {
    id: "p11",
    title: "Echoes",
    artist: "Pink Floyd",
    type: "track",
    genre: "Rock",
    imageUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e029eee212bba82bed8da96a8f7",
    likeCount: 0,
    commentCount: 0,
    userName: "Udit",
  },
  {
    id: "p12",
    title: "Found God in a Tomato",
    artist: "psychedelic porn crumpets",
    type: "track",
    genre: "Rock",
    imageUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02e9fc848924f30c739ff693a8",
    likeCount: 0,
    commentCount: 0,
    userName: "richie",
  },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center pt-16 pb-10 px-4">
        <div className="mb-8 flex justify-center">
          <CircularText
            text="SHARE+TUNE+"
            onHover="goBonkers"
            spinDuration={30}
            className="custom-class"
          />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
          Welcome to Sharetune
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Discover, share, and celebrate music with friends.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
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

      {/* Feed preview */}
      <div className="relative px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pointer-events-none select-none">
          {PREVIEW_FINDS.map((find) => (
            <div
              key={find.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="relative aspect-square w-full bg-muted">
                {find.imageUrl ? (
                  <Image
                    src={find.imageUrl}
                    alt={`${find.title} by ${find.artist}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800/80 text-xs text-white">
                    <MessageCircle className="h-3 w-3" /> {find.commentCount}
                  </span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800/80 text-xs text-white">
                    <Heart className="h-3 w-3" /> {find.likeCount}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap gap-1 mb-1.5">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                    {find.type}
                  </span>
                  {find.genre && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${getGenreColor(find.genre)}`}>
                      {find.genre}
                    </span>
                  )}
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    by {find.userName}
                  </span>
                </div>
                <p className="font-semibold text-sm line-clamp-1">{find.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{find.artist}</p>
                {find.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 italic">{find.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Fade overlay + CTA */}
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background via-background/80 to-transparent flex flex-col items-center justify-end pb-12 gap-3">
          <p className="text-lg font-semibold text-foreground">Join to see the full feed</p>
          <div className="flex gap-3">
            <Link
              href="/signup"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-accent transition-all hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
