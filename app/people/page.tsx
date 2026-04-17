"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import Link from "next/link";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { useSidebar } from "@/components/SidebarContext";
import { apiFetch } from "@/lib/api-fetch";
import { getGenreColor } from "@/lib/genres";
import UserProfileModal from "@/components/UserProfileModal";

interface Person {
  id: string;
  name: string | null;
  isFollowing: boolean;
  topGenres: string[];
  findCount: number;
}

interface UserFind {
  id: string;
  title: string;
  artist: string;
  type: string;
  genre: string | null;
  spotifyUrl: string;
  imageUrl: string | null;
  dateAdded: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  totalXp: number;
  level: number;
  levelName: string;
}

export default function PeoplePage() {
  const { user, loading: authLoading } = useAuth();
  const { isOpen: sidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState<"people" | "leaderboard">("people");
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPersonFinds, setSelectedPersonFinds] = useState<UserFind[]>([]);
  const [findsLoading, setFindsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const leaderboardLoaded = useRef(false);
  // My Profile modal from leaderboard own-row click
  const [myProfileOpen, setMyProfileOpen] = useState(false);

  useEffect(() => {
    const fetchPeople = async () => {
      if (!user) { setLoading(false); return; }
      try {
        setLoading(true);
        setError("");
        const response = await apiFetch("/api/users");
        if (!response.ok) { setError("Failed to load people"); return; }
        setPeople(await response.json());
      } catch {
        setError("Failed to load people");
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, [user]);

  useEffect(() => {
    if (activeTab !== "leaderboard" || leaderboardLoaded.current) return;
    leaderboardLoaded.current = true;
    setLeaderboardLoading(true);
    apiFetch("/api/xp/leaderboard")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLeaderboard)
      .catch(() => {})
      .finally(() => setLeaderboardLoading(false));
  }, [activeTab]);

  const openPersonPosts = async (person: Person) => {
    setSelectedPerson(person);
    setFindsLoading(true);
    setSelectedPersonFinds([]);
    try {
      const response = await apiFetch(`/api/users/${person.id}/finds`);
      if (!response.ok) { setSelectedPersonFinds([]); return; }
      setSelectedPersonFinds(await response.json());
    } catch {
      setSelectedPersonFinds([]);
    } finally {
      setFindsLoading(false);
    }
  };

  const toggleFollow = (userId: string, currentlyFollowing: boolean) => {
    setPeople((prev) =>
      prev.map((p) => p.id === userId ? { ...p, isFollowing: !currentlyFollowing } : p)
    );
    setSelectedPerson((prev) =>
      prev?.id === userId ? { ...prev, isFollowing: !currentlyFollowing } : prev
    );
    apiFetch(`/api/users/${userId}/follow`, { method: "POST" }).then((res) => {
      if (!res.ok) {
        setPeople((prev) =>
          prev.map((p) => p.id === userId ? { ...p, isFollowing: currentlyFollowing } : p)
        );
        setSelectedPerson((prev) =>
          prev?.id === userId ? { ...prev, isFollowing: currentlyFollowing } : prev
        );
      }
    }).catch(() => {
      setPeople((prev) =>
        prev.map((p) => p.id === userId ? { ...p, isFollowing: currentlyFollowing } : p)
      );
      setSelectedPerson((prev) =>
        prev?.id === userId ? { ...prev, isFollowing: currentlyFollowing } : prev
      );
    });
  };

  const closeModal = () => {
    setSelectedPerson(null);
    setSelectedPersonFinds([]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">People</h1>
          <p className="text-muted-foreground mb-6">Please log in to see people and their music</p>
          <Link href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const userName =
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null) || "User";

  return (
    <div className="min-h-screen">
      <div className={`transition-all duration-300 ${sidebarOpen ? "blur-sm" : ""}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-1">People</h1>
              <p className="text-muted-foreground">Discover music lovers and see what they are sharing</p>
            </div>
            {activeTab === "people" && (
              <div className="relative shrink-0 w-56 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-0 mb-6 border-b border-border">
            {(["people", "leaderboard"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* People tab */}
          {activeTab === "people" && (
            <>
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-card p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full skeleton shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-2/3 rounded skeleton" />
                          <div className="h-3 w-1/3 rounded skeleton" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-5 w-14 rounded-full skeleton" />
                        <div className="h-5 w-12 rounded-full skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {error && <div className="text-center py-12 text-destructive">{error}</div>}
              {!loading && !error && people.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No other users yet.</div>
              )}
              {!loading && !error && people.length > 0 && (() => {
                const filtered = people.filter((p) =>
                  (p.name || "").toLowerCase().includes(search.toLowerCase())
                );
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.length === 0 && (
                      <p className="col-span-full text-center py-12 text-muted-foreground">
                        No users match &quot;{search}&quot;
                      </p>
                    )}
                    {filtered.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => openPersonPosts(person)}
                        className="group text-left rounded-2xl border-0 bg-card p-5 hover:bg-muted hover:shadow-lg hover:scale-[1.02] transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 duration-500"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {(person.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate">{person.name || "Unnamed User"}</p>
                            <p className="text-xs text-muted-foreground">
                              {person.findCount} {person.findCount === 1 ? "find" : "finds"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 min-h-[1.75rem]">
                          {person.topGenres.length > 0 ? (
                            person.topGenres.map((genre) => (
                              <span
                                key={genre}
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white leading-none ${getGenreColor(genre)}`}
                              >
                                {genre}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No music yet</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </>
          )}

          {/* Leaderboard tab */}
          {activeTab === "leaderboard" && (
            <div className="max-w-2xl mx-auto">
              {leaderboardLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card">
                      <div className="w-6 h-4 rounded skeleton shrink-0" />
                      <div className="h-9 w-9 rounded-full skeleton shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-1/2 rounded skeleton" />
                        <div className="h-3 w-1/3 rounded skeleton" />
                      </div>
                      <div className="h-4 w-16 rounded skeleton" />
                    </div>
                  ))}
                </div>
              )}
              {!leaderboardLoading && leaderboard.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No rankings yet.</div>
              )}
              {!leaderboardLoading && leaderboard.length > 0 && (
                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const isOwn = entry.userId === user.id;
                    const medal =
                      entry.rank === 1
                        ? { card: "bg-yellow-500/10 border border-yellow-500/30", rank: "text-yellow-500", avatar: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" }
                        : entry.rank === 2
                        ? { card: "bg-slate-400/10 border border-slate-400/30", rank: "text-slate-400", avatar: "bg-slate-400/20 text-slate-500 dark:text-slate-300" }
                        : entry.rank === 3
                        ? { card: "bg-orange-600/10 border border-orange-600/30", rank: "text-orange-600 dark:text-orange-400", avatar: "bg-orange-600/20 text-orange-700 dark:text-orange-400" }
                        : null;
                    return (
                      <button
                        key={entry.userId}
                        onClick={() => {
                          if (isOwn) {
                            setMyProfileOpen(true);
                          } else {
                            const person = people.find((p) => p.id === entry.userId);
                            if (person) {
                              openPersonPosts(person);
                            } else {
                              openPersonPosts({
                                id: entry.userId,
                                name: entry.name,
                                isFollowing: false,
                                topGenres: [],
                                findCount: 0,
                              });
                            }
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left hover:opacity-90 ${
                          medal
                            ? medal.card
                            : isOwn
                            ? "bg-primary/5 border border-primary/20"
                            : "bg-card"
                        }`}
                      >
                        {/* Rank */}
                        <span className={`text-sm font-bold w-6 text-right shrink-0 ${medal ? medal.rank : "text-muted-foreground font-mono"}`}>
                          {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                        </span>
                        {/* Avatar */}
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${medal ? medal.avatar : "bg-primary/10 text-primary"}`}>
                          {(entry.name || "?")[0].toUpperCase()}
                        </div>
                        {/* Name + level name */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {entry.name || "Unnamed User"}
                            {isOwn && (
                              <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{entry.levelName}</p>
                        </div>
                        {/* Level pill + XP */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="bg-primary/15 text-primary text-xs rounded-full px-2 py-0.5 font-semibold">
                            Lv.{entry.level}
                          </span>
                          <span className="text-muted-foreground text-sm hidden sm:block">
                            {entry.totalXp.toLocaleString()} XP
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* People modal (inline, for other users) */}
      {selectedPerson && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {(selectedPerson.name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold leading-tight">{selectedPerson.name || "Unnamed User"}</h2>
                  <p className="text-xs text-muted-foreground">{selectedPersonFinds.length} finds</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFollow(selectedPerson.id, selectedPerson.isFollowing)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedPerson.isFollowing
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {selectedPerson.isFollowing ? "Unfollow" : "Follow"}
                </button>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-5">
              {findsLoading && (
                <div className="py-12 text-center text-muted-foreground">Loading...</div>
              )}
              {!findsLoading && selectedPersonFinds.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No music posted yet.</div>
              )}
              {!findsLoading && selectedPersonFinds.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedPersonFinds.map((find) => (
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
      )}

      {/* My Profile modal (from leaderboard own-row click) */}
      {myProfileOpen && (
        <UserProfileModal
          userId={user.id}
          userName={userName}
          isOwnProfile={true}
          onClose={() => setMyProfileOpen(false)}
        />
      )}
    </div>
  );
}
