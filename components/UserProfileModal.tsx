"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { getGenreColor } from "@/lib/genres";

interface UserFind {
  id: string;
  title: string;
  artist: string;
  type: string;
  genre: string | null;
  spotifyUrl: string;
  imageUrl: string | null;
}

interface UserProfileModalProps {
  userId: string;
  userName: string | null;
  onClose: () => void;
}

export default function UserProfileModal({ userId, userName, onClose }: UserProfileModalProps) {
  const [finds, setFinds] = useState<UserFind[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [findsLoading, setFindsLoading] = useState(true);

  useEffect(() => {
    // Load finds + follow status in parallel
    Promise.all([
      apiFetch(`/api/users/${userId}/finds`).then((r) => r.ok ? r.json() : []),
      apiFetch("/api/users").then((r) => r.ok ? r.json() : []),
    ]).then(([userFinds, allUsers]) => {
      setFinds(userFinds);
      const match = allUsers.find((u: { id: string; isFollowing: boolean }) => u.id === userId);
      if (match) setIsFollowing(match.isFollowing);
    }).finally(() => setFindsLoading(false));
  }, [userId]);

  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
    apiFetch(`/api/users/${userId}/follow`, { method: "POST" }).then((res) => {
      if (!res.ok) setIsFollowing((prev) => !prev); // revert
    }).catch(() => setIsFollowing((prev) => !prev));
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              {(userName || "?")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{userName || "Unnamed User"}</h2>
              <p className="text-xs text-muted-foreground">
                {findsLoading ? "…" : `${finds.length} ${finds.length === 1 ? "find" : "finds"}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFollow}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isFollowing
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5">
          {findsLoading && (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          )}
          {!findsLoading && finds.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No music posted yet.</div>
          )}
          {!findsLoading && finds.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {finds.map((find) => (
                <a
                  key={find.id}
                  href={find.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/card block rounded-xl border border-border bg-background overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative aspect-square w-full bg-muted">
                    {find.imageUrl ? (
                      <Image
                        src={find.imageUrl}
                        alt={`${find.title} by ${find.artist}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">No cover</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    {find.genre && (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white mb-1.5 ${getGenreColor(find.genre)}`}>
                        {find.genre}
                      </span>
                    )}
                    <p className="font-semibold text-sm line-clamp-1">{find.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{find.artist}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
