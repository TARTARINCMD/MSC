"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { type FindType } from "@/lib/data";
import FindList from "@/components/FindList";
import TypeFilter from "@/components/TypeFilter";
import GenreFilter from "@/components/GenreFilter";
import DateSort from "@/components/DateSort";
import WelcomePage from "@/components/WelcomePage";
import AddMusicModal from "@/components/AddMusicModal";
import MusicDetailModal from "@/components/MusicDetailModal";
import LayoutSelector from "@/components/LayoutSelector";
import MasonryView from "@/components/MasonryView";
import { Plus } from "lucide-react";

type LayoutType = "grid" | "compact";

type SortOrder = "newest" | "oldest" | "most_liked";

interface SpotifyFindWithLikes {
  id: string;
  title: string;
  artist: string;
  type: FindType;
  spotifyUrl: string;
  spotifyId: string;
  imageUrl?: string;
  description?: string;
  dateAdded: string;
  genre?: string;
  userId: string;
  likeCount?: number;
  liked?: boolean;
  user?: {
    name: string | null;
    email: string;
  };
}

export default function Home() {
  const { data: session } = useSession();
  const [finds, setFinds] = useState<SpotifyFindWithLikes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");
  const [selectedType, setSelectedType] = useState<FindType | "all">("all");
  const [selectedGenre, setSelectedGenre] = useState<string | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<SpotifyFindWithLikes | null>(null);
  const [layout, setLayout] = useState<LayoutType>("grid");

  const fetchFinds = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/finds");
      if (response.ok) {
        const data = await response.json();
        setFinds(data);
      } else {
        setError("Failed to load music");
      }
    } catch (error) {
      setError("Failed to load music");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchFinds();
  }, [fetchFinds]);

  const filteredFinds = finds.filter((find) => {
    const typeMatch = selectedType === "all" || find.type === selectedType;
    const genreMatch = selectedGenre === "all" || find.genre === selectedGenre;

    // Filter by view mode
    let viewMatch = true;
    if (viewMode === "mine" && session?.user) {
      viewMatch = find.userId === (session.user as any).id;
    }

    return typeMatch && genreMatch && viewMatch;
  });

  const sortedFinds = [...filteredFinds].sort((a, b) => {
    if (sortOrder === "most_liked") {
      return (b.likeCount || 0) - (a.likeCount || 0);
    }
    const dateA = new Date(a.dateAdded).getTime();
    const dateB = new Date(b.dateAdded).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const handleLikeUpdate = (findId: string, liked: boolean, likeCount: number) => {
    setFinds((prevFinds) =>
      prevFinds.map((find) =>
        find.id === findId ? { ...find, liked, likeCount } : find
      )
    );
  };

  // Show welcome page if not logged in
  if (!session) {
    return <WelcomePage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main content area */}
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-4 mb-6 p-3 rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-visible relative z-30">
            <div className="flex items-center gap-3 flex-wrap">
              {session && (
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
                </div>
              )}
              <LayoutSelector currentLayout={layout} onLayoutChange={setLayout} />
              <TypeFilter selectedType={selectedType} onTypeChange={setSelectedType} />
              <GenreFilter selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />
              <DateSort sortOrder={sortOrder} onSortChange={setSortOrder} />
            </div>

            {session && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add Music
              </button>
            )}
          </div>

          {loading && (
            <div className="text-center py-12 text-muted-foreground">
              Loading music...
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && sortedFinds.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No music found. {session && "Be the first to add some!"}
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
                  onCardClick={(find) => setSelectedMusic(find as SpotifyFindWithLikes)}
                />
              )}
              {layout === "compact" && (
                <MasonryView
                  finds={sortedFinds}
                  onCardClick={(find) => setSelectedMusic(find as SpotifyFindWithLikes)}
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
        music={selectedMusic}
        onLikeUpdate={handleLikeUpdate}
      />
    </div>
  );
}
