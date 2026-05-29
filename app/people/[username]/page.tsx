"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Flame, ChevronRight, X, Link2, Check } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { fetchSWR, getCached } from "@/lib/cache";
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

interface FollowUser {
  id: string;
  name: string | null;
  isOwnProfile: boolean;
  isFollowing: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: usernameParam } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Resolved real userId (may differ from param if param is a name)
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("User");
  const [notFound, setNotFound] = useState(false);
  const [finds, setFinds] = useState<UserFind[]>([]);
  const [findsLoading, setFindsLoading] = useState(true);
  const [xpProfile, setXpProfile] = useState<XpProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [followList, setFollowList] = useState<{
    type: "followers" | "following";
    users: FollowUser[];
    loading: boolean;
  } | null>(null);

  // Step 1: resolve username param → real userId
  useEffect(() => {
    setUserId(null);
    setNotFound(false);
    setFinds([]);
    setXpProfile(null);

    fetch(`/api/users/${encodeURIComponent(usernameParam)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { id: string; name: string | null } | null) => {
        if (!data) { setNotFound(true); return; }
        // If param was a UUID (old link), redirect to clean username URL
        if (UUID_RE.test(usernameParam) && data.name) {
          router.replace(`/people/${encodeURIComponent(data.name)}`);
          return;
        }
        setUserId(data.id);
        if (data.name) setDisplayName(data.name);
      })
      .catch(() => setNotFound(true));
  }, [usernameParam, router]);

  // Step 2: load profile data once userId is known
  useEffect(() => {
    if (!userId) return;

    setFindsLoading(!getCached(`user-finds:${userId}`));

    fetchSWR<UserFind[]>(
      `user-finds:${userId}`,
      () => fetch(`/api/users/${userId}/finds`).then((r) => r.ok ? r.json() : []),
      (data, isBackground) => { setFinds(data); if (!isBackground) setFindsLoading(false); },
      () => setFindsLoading(false),
    );

    fetchSWR<XpProfile | null>(
      `user-xp:${userId}`,
      () => fetch(`/api/users/${userId}/xp`).then((r) => r.ok ? r.json() : null),
      (data) => { if (data) setXpProfile(data); },
      () => {},
    );
  }, [userId]);

  // Step 3: load auth-specific data once both userId and auth are ready
  useEffect(() => {
    if (!user || !userId) return;

    const isOwn = user.id === userId;
    if (isOwn) {
      fetchSWR<XpProfile | null>(
        "me-xp",
        () => apiFetch("/api/users/me/xp").then((r) => r.ok ? r.json() : null),
        (data) => { if (data) setXpProfile(data); },
        () => {},
      );
    }

    fetchSWR<Array<{ id: string; name: string | null; isFollowing: boolean }>>(
      "people",
      () => apiFetch("/api/users").then((r) => r.ok ? r.json() : []),
      (allUsers) => {
        const match = allUsers.find((u) => u.id === userId);
        if (match) {
          setIsFollowing(match.isFollowing);
          if (match.name) setDisplayName(match.name);
        }
      },
      () => {},
    );
  }, [userId, user]);

  const toggleFollow = () => {
    if (!userId) return;
    setIsFollowing((prev) => !prev);
    apiFetch(`/api/users/${userId}/follow`, { method: "POST" })
      .then((res) => { if (!res.ok) setIsFollowing((prev) => !prev); })
      .catch(() => setIsFollowing((prev) => !prev));
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openFollowList = async (type: "followers" | "following") => {
    if (!userId) return;
    const cacheKey = `user-${type}:${userId}`;
    const hasCached = !!getCached(cacheKey);
    setFollowList({ type, users: [], loading: !hasCached });
    await fetchSWR<FollowUser[]>(
      cacheKey,
      async () => {
        const r = await fetch(`/api/users/${userId}/${type}`);
        return r.ok ? r.json() : [];
      },
      (users) => setFollowList((prev) => prev ? { ...prev, users, loading: false } : null),
      () => setFollowList((prev) => prev ? { ...prev, loading: false } : null),
    );
  };

  const toggleFollowInList = (targetId: string, currentlyFollowing: boolean) => {
    if (!user) return;
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
    return new Date(isoDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (authLoading || (!userId && !notFound)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">User not found</p>
          <p className="text-muted-foreground mb-4">No one goes by that name.</p>
          <Link href="/people" className="text-primary hover:underline">Back to People</Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = !!user && user.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">People</span>
        </button>

        {/* Profile header */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                {displayName[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {isOwnProfile && (
                    <span className="text-xs bg-primary/15 text-primary rounded-full px-2 py-0.5 font-medium">you</span>
                  )}
                </div>
                {xpProfile?.joinedAt && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Joined {formatJoinDate(xpProfile.joinedAt)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:bg-muted transition-colors"
                title="Copy profile link"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                <span>{copied ? "Copied!" : "Copy link"}</span>
              </button>
              {user && !isOwnProfile && (
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
              {!user && (
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Follow
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          {xpProfile && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <span className="font-semibold">{xpProfile.findsCount}</span>
                  <span className="text-muted-foreground"> finds</span>
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
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

              {/* Level + streak */}
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
                  <p className="text-xs text-muted-foreground">{xpProfile.totalXp.toLocaleString()} total XP</p>
                </div>
              </div>

              {/* XP bar — own profile only */}
              {isOwnProfile && (
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
                    {xpProfile.nextLevelName && <span>Next: {xpProfile.nextLevelName}</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Finds grid */}
        <h2 className="text-lg font-semibold mb-3">Music</h2>
        {findsLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-3 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!findsLoading && finds.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">No music posted yet.</div>
        )}
        {!findsLoading && finds.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {finds.map((find) => (
              <a
                key={find.id}
                href={find.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/card block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="relative aspect-square w-full bg-muted">
                  {find.imageUrl ? (
                    <Image
                      src={find.imageUrl}
                      alt={`${find.title} by ${find.artist}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
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

        {/* Login prompt for guests */}
        {!user && !authLoading && (
          <div className="mt-10 py-8 text-center border border-border rounded-2xl bg-card">
            <p className="text-muted-foreground mb-3">Join to follow {displayName} and share your own music</p>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Sign up or log in
            </Link>
          </div>
        )}
      </div>

      {/* Followers / Following overlay */}
      {followList && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setFollowList(null); }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm max-h-[60vh] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                  <Link
                    href={`/people/${encodeURIComponent(u.name || u.id)}`}
                    className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-sm shrink-0 hover:ring-2 ring-primary transition-all"
                    onClick={() => setFollowList(null)}
                  >
                    {(u.name || "?")[0].toUpperCase()}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/people/${encodeURIComponent(u.name || u.id)}`} onClick={() => setFollowList(null)} className="hover:underline">
                      <p className="font-medium text-sm truncate">
                        {u.name || "Unnamed User"}
                        {u.isOwnProfile && <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>}
                      </p>
                    </Link>
                  </div>
                  {user && !u.isOwnProfile && (
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
