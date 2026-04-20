"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Flame, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { fetchSWR, getCached } from "@/lib/cache";
import { getGenreColor } from "@/lib/genres";


interface FollowUser {
  id: string;
  name: string | null;
  isOwnProfile: boolean;
  isFollowing: boolean;
}

interface UserFind {
  id: string;
  title: string;
  artist: string;
  type: string;
  genre: string | null;
  spotifyUrl: string;
  imageUrl: string | null;
}

interface XpProfile {
  totalXp: number;
  level: number;
  levelName: string;
  progressPercent: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  nextLevelName: string | null;
  currentStreak: number;
  longestStreak: number;
  findsCount: number;
  likesReceivedCount: number;
  followersCount: number;
  followingCount: number;
  joinedAt: string | null;
}

interface UserProfileModalProps {
  userId: string;
  userName: string | null;
  isOwnProfile?: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  userId,
  userName,
  isOwnProfile = false,
  onClose,
}: UserProfileModalProps) {
  const [finds, setFinds] = useState<UserFind[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [findsLoading, setFindsLoading] = useState(!getCached(`user-finds:${userId}`));
  const [xpProfile, setXpProfile] = useState<XpProfile | null>(null);
  const [followList, setFollowList] = useState<{
    type: "followers" | "following";
    users: FollowUser[];
    loading: boolean;
  } | null>(null);

  useEffect(() => {
    const xpEndpoint = isOwnProfile ? "/api/users/me/xp" : `/api/users/${userId}/xp`;
    const xpCacheKey = isOwnProfile ? "me-xp" : `user-xp:${userId}`;

    fetchSWR<UserFind[]>(
      `user-finds:${userId}`,
      () => apiFetch(`/api/users/${userId}/finds`).then((r) => r.ok ? r.json() : []),
      (data, isBackground) => { setFinds(data); if (!isBackground) setFindsLoading(false); },
      () => setFindsLoading(false),
    );

    fetchSWR<XpProfile | null>(
      xpCacheKey,
      () => apiFetch(xpEndpoint).then((r) => r.ok ? r.json() : null),
      (data) => { if (data) setXpProfile(data); },
      () => {},
    );

    if (!isOwnProfile) {
      fetchSWR<{ id: string; isFollowing: boolean }[]>(
        "people",
        () => apiFetch("/api/users").then((r) => r.ok ? r.json() : []),
        (allUsers) => {
          const match = allUsers.find((u) => u.id === userId);
          if (match) setIsFollowing(match.isFollowing);
        },
        () => {},
      );
    }
  }, [userId, isOwnProfile]);

  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
    apiFetch(`/api/users/${userId}/follow`, { method: "POST" })
      .then((res) => {
        if (!res.ok) setIsFollowing((prev) => !prev);
      })
      .catch(() => setIsFollowing((prev) => !prev));
  };

  const openFollowList = async (type: "followers" | "following") => {
    const cacheKey = `user-${type}:${userId}`;
    const hasCached = !!getCached(cacheKey);
    setFollowList({ type, users: [], loading: !hasCached });
    await fetchSWR<FollowUser[]>(
      cacheKey,
      async () => {
        const r = await apiFetch(`/api/users/${userId}/${type}`);
        return r.ok ? r.json() : [];
      },
      (users) => setFollowList((prev) => prev ? { ...prev, users, loading: false } : null),
      () => setFollowList((prev) => prev ? { ...prev, loading: false } : null),
    );
  };

  const toggleFollowInList = (targetId: string, currentlyFollowing: boolean) => {
    setFollowList((prev) =>
      prev ? { ...prev, users: prev.users.map((u) => u.id === targetId ? { ...u, isFollowing: !currentlyFollowing } : u) } : null
    );
    apiFetch(`/api/users/${targetId}/follow`, { method: "POST" }).catch(() => {
      setFollowList((prev) =>
        prev ? { ...prev, users: prev.users.map((u) => u.id === targetId ? { ...u, isFollowing: currentlyFollowing } : u) } : null
      );
    });
  };

  const formatJoinDate = (isoDate: string | null) => {
    if (!isoDate) return null;
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
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
            {!isOwnProfile && (
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
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats + XP panel */}
        {xpProfile && (
          <div className="px-6 py-4 border-b border-border space-y-4 shrink-0">
            {/* Stat pills row */}
            <div className="flex flex-wrap gap-2">
              {xpProfile.joinedAt && (
                <div className="bg-muted rounded-lg px-3 py-2 text-center text-sm">
                  <span className="text-muted-foreground">Joined </span>
                  <span className="font-medium">{formatJoinDate(xpProfile.joinedAt)}</span>
                </div>
              )}
              <div className="bg-muted rounded-lg px-3 py-2 text-center text-sm">
                <span className="font-semibold">{xpProfile.findsCount}</span>
                <span className="text-muted-foreground"> finds</span>
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-center text-sm">
                <span className="font-semibold">{xpProfile.likesReceivedCount}</span>
                <span className="text-muted-foreground"> likes received</span>
              </div>
              <button
                type="button"
                onClick={() => openFollowList("followers")}
                className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
              >
                <span className="font-semibold">{xpProfile.followersCount}</span>
                <span className="text-muted-foreground">followers</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => openFollowList("following")}
                className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
              >
                <span className="font-semibold">{xpProfile.followingCount}</span>
                <span className="text-muted-foreground">following</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* XP panel — own profile only */}
            {isOwnProfile && (
              <div className="space-y-3">
                {/* Level + streak row */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {xpProfile.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{xpProfile.levelName}</span>
                      {xpProfile.currentStreak > 0 && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground shrink-0">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {xpProfile.currentStreak}-day streak
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {xpProfile.totalXp.toLocaleString()} total XP
                    </p>
                  </div>
                </div>

                {/* XP progress bar */}
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-2.5 bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${xpProfile.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {xpProfile.xpNeededForNext > 0 ? (
                      <span>
                        <span className="font-medium text-foreground">
                          {(xpProfile.xpNeededForNext - xpProfile.xpIntoLevel).toLocaleString()} XP
                        </span>
                        {" "}to next level
                        <span className="ml-1 opacity-60">
                          ({xpProfile.xpIntoLevel.toLocaleString()} / {xpProfile.xpNeededForNext.toLocaleString()})
                        </span>
                      </span>
                    ) : (
                      <span className="font-medium text-foreground">Max level</span>
                    )}
                    {xpProfile.nextLevelName && (
                      <span>Next: {xpProfile.nextLevelName}</span>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* Finds grid */}
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
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white mb-1.5 ${getGenreColor(find.genre)}`}
                      >
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

      {/* Followers / Following list — floats centered over the modal */}
      {followList && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setFollowList(null); }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 max-h-[60vh] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 className="font-semibold text-base">
                {followList.type === "followers" ? "Followers" : "Following"}
              </h3>
              <button onClick={() => setFollowList(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-1">
              {followList.loading && (
                <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>
              )}
              {!followList.loading && followList.users.length === 0 && (
                <div className="py-10 text-center text-muted-foreground text-sm">Nobody here yet.</div>
              )}
              {!followList.loading && followList.users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-sm shrink-0">
                    {(u.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {u.name || "Unnamed User"}
                      {u.isOwnProfile && <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>}
                    </p>
                  </div>
                  {!u.isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => toggleFollowInList(u.id, u.isFollowing)}
                      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        u.isFollowing
                          ? "border-border text-foreground hover:bg-muted"
                          : "bg-foreground text-background border-transparent hover:opacity-90"
                      }`}
                    >
                      {u.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
