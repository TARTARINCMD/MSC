"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import Link from "next/link";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { useSidebar } from "@/components/SidebarContext";
import { apiFetch } from "@/lib/api-fetch";
import { getGenreColor } from "@/lib/genres";

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

export default function PeoplePage() {
  const { user, loading: authLoading } = useAuth();
  const { isOpen: sidebarOpen } = useSidebar();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPersonFinds, setSelectedPersonFinds] = useState<UserFind[]>([]);
  const [findsLoading, setFindsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
    // Optimistic update
    setPeople((prev) =>
      prev.map((p) => p.id === userId ? { ...p, isFollowing: !currentlyFollowing } : p)
    );
    setSelectedPerson((prev) =>
      prev?.id === userId ? { ...prev, isFollowing: !currentlyFollowing } : prev
    );
    // Fire and revert on failure
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

  return (
    <div className="min-h-screen">
      <div className={`transition-all duration-300 ${sidebarOpen ? "blur-sm" : ""}`}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">People</h1>
          <p className="text-muted-foreground mb-6">Discover music lovers and see what they are sharing</p>

          {/* Search */}
          <div className="relative mb-8 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

          {loading && (
            <div className="text-center py-12 text-muted-foreground">Loading people...</div>
          )}
          {error && (
            <div className="text-center py-12 text-destructive">{error}</div>
          )}
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
                <p className="col-span-full text-center py-12 text-muted-foreground">No users match &quot;{search}&quot;</p>
              )}
              {filtered.map((person) => (
                <button
                  key={person.id}
                  onClick={() => openPersonPosts(person)}
                  className="group text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  {/* Avatar placeholder + name */}
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

                  {/* Top genres */}
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
        </div>
      </div>

      {/* Modal */}
      {selectedPerson && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Header — name on tape style */}
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

            {/* Content */}
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
                      {/* Cover */}
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
                      {/* Info */}
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
    </div>
  );
}
