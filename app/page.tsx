"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { useSidebar } from "@/components/SidebarContext";
import { type FindType } from "@/lib/data";
import { GENRES, normalizeGenre } from "@/lib/genres";
import FindList from "@/components/FindList";
import FindCardSkeleton from "@/components/FindCardSkeleton";
import FindListHorizontal, { FindListHorizontalSkeleton } from "@/components/FindListHorizontal";
import TypeFilter from "@/components/TypeFilter";
import GenreFilter from "@/components/GenreFilter";
import DateSort from "@/components/DateSort";
import WelcomePage from "@/components/WelcomePage";
import AddMusicModal from "@/components/AddMusicModal";
import MusicDetailModal from "@/components/MusicDetailModal";
import LayoutSelector from "@/components/LayoutSelector";
import MasonryView from "@/components/MasonryView";
import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { fetchSWR, invalidateCache, getCached } from "@/lib/cache";

type LayoutType = "grid" | "compact" | "tiles";

type SortOrder = "newest" | "oldest" | "most_liked";

interface SpotifyFindWithLikes {
  id: string;
  title: string;
  artist: string;
  type: FindType;
  spotifyUrl: string;
  spotifyId?: string;
  imageUrl?: string;
  description?: string;
  dateAdded: string;
  genre?: string;
  userId: string;
  likeCount?: number;
  liked?: boolean;
  commentCount?: number;
  user?: {
    name: string | null;
    email: string;
  };
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { isOpen: sidebarOpen } = useSidebar();
  const [finds, setFinds] = useState<SpotifyFindWithLikes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "following" | "mine">("all");
  const [selectedType, setSelectedType] = useState<FindType | "all">("all");
  const [selectedGenre, setSelectedGenre] = useState<string | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<SpotifyFindWithLikes | null>(null);
  const [layout, setLayout] = useState<LayoutType>("grid");
  const [toolbarVisible, setToolbarVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setToolbarVisible(true);
      } else if (currentY < lastY) {
        setToolbarVisible(true);
      } else if (currentY > lastY + 8) {
        setToolbarVisible(false);
      }
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchFinds = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const key = `finds:${viewMode}`;
    await fetchSWR<SpotifyFindWithLikes[]>(
      key,
      async () => {
        const res = await apiFetch(`/api/finds?scope=${viewMode}`);
        if (!res.ok) throw new Error("Failed to load music");
        return res.json();
      },
      (data, isBackground) => {
        setFinds(data);
        if (!isBackground) setLoading(false);
        setError("");
      },
      () => {
        setError("Failed to load music");
        setLoading(false);
      },
    );
  }, [user, viewMode]);

  useEffect(() => {
    setLoading(!getCached(`finds:${viewMode}`));
    fetchFinds();
  }, [fetchFinds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top when layout changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [layout]);

  const filteredFinds = finds.filter((find) => {
    const typeMatch = selectedType === "all" || find.type === selectedType;
    const knownGenres = GENRES.filter((genre) => normalizeGenre(genre) !== "other");
    const isKnownGenre =
      !!find.genre &&
      knownGenres.some((genre) => normalizeGenre(genre) === normalizeGenre(find.genre || ""));
    const genreMatch =
      selectedGenre === "all" ||
      (selectedGenre === "Other"
        ? !isKnownGenre
        : normalizeGenre(find.genre || "") === normalizeGenre(selectedGenre));

    return typeMatch && genreMatch;
  });

  const sortedFinds = [...filteredFinds].sort((a, b) => {
    if (sortOrder === "most_liked") {
      return (b.likeCount || 0) - (a.likeCount || 0);
    }
    const dateA = new Date(a.dateAdded).getTime();
    const dateB = new Date(b.dateAdded).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const handleLikeUpdate = useCallback((findId: string, liked: boolean, likeCount: number) => {
    setFinds((prevFinds) =>
      prevFinds.map((find) =>
        find.id === findId ? { ...find, liked, likeCount } : find
      )
    );
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCardClick = useCallback((find: any) => {
    setSelectedMusic(find as SpotifyFindWithLikes);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <WelcomePage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top fade gradient overlay */}
      <div
        className="pointer-events-none fixed top-0 right-0 h-[5rem] bg-gradient-to-b from-background via-background/60 to-transparent"
        style={{ zIndex: 35, left: 0 }}
      />

      {/* Main content area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:blur-sm' : ''}`}>
        <main className="container mx-auto px-4 pt-4 pb-8">
          {/* Sticky Toolbar */}
          <div className={`sticky top-4 z-40 mb-6 transition-all duration-300 ${toolbarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <div id="toolbar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border-0 bg-card/95 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                {user && (
                  <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("all")}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "all"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Feed
                    </button>
                    <button
                      onClick={() => setViewMode("mine")}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "mine"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      My Music
                    </button>
                    <button
                      onClick={() => setViewMode("following")}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "following"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Following
                    </button>
                  </div>
                )}
                <LayoutSelector currentLayout={layout} onLayoutChange={setLayout} />
                <TypeFilter selectedType={selectedType} onTypeChange={setSelectedType} />
                <GenreFilter selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />
                <DateSort sortOrder={sortOrder} onSortChange={setSortOrder} />
              </div>

              {user && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors whitespace-nowrap flex-shrink-0 self-end sm:self-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add Music
                </button>
              )}
            </div>
          </div>

          {loading && layout !== "tiles" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <FindCardSkeleton key={i} />
              ))}
            </div>
          )}
          {loading && layout === "tiles" && <FindListHorizontalSkeleton />}

          {error && (
            <div className="text-center py-12 text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && sortedFinds.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No music found. {user && "Be the first to add some!"}
            </div>
          )}

          {!loading && !error && sortedFinds.length > 0 && (
            <>
              {layout === "grid" && (
                <FindList
                  finds={sortedFinds}
                  onTypeClick={setSelectedType}
                  onGenreClick={setSelectedGenre}
                  onLikeUpdate={handleLikeUpdate}
                  onCardClick={handleCardClick}
                />
              )}
              {layout === "compact" && (
                <MasonryView
                  finds={sortedFinds}
                  onCardClick={handleCardClick}
                />
              )}
              {layout === "tiles" && (
                <FindListHorizontal
                  finds={sortedFinds}
                  onTypeClick={setSelectedType}
                  onGenreClick={setSelectedGenre}
                  onLikeUpdate={handleLikeUpdate}
                  onCardClick={handleCardClick}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Add Music Modal */}
      <AddMusicModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          invalidateCache(`finds:${viewMode}`);
          fetchFinds();
        }}
      />

      {/* Music Detail Modal */}
      <MusicDetailModal
        isOpen={!!selectedMusic}
        onClose={() => setSelectedMusic(null)}
        onUpdate={() => {
          fetchFinds();
          setSelectedMusic(null);
        }}
        onCommentChange={() => fetchFinds()}
        music={selectedMusic}
        onLikeUpdate={handleLikeUpdate}
      />
    </div>
  );
}
