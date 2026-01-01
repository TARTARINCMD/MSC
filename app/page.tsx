"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { type FindType } from "@/lib/data";
import FindList from "@/components/FindList";
import { ThemeToggle } from "@/components/theme-toggle";
import CircularText from "@/components/CircularText";
import TypeFilter from "@/components/TypeFilter";
import GenreFilter from "@/components/GenreFilter";
import DateSort from "@/components/DateSort";
import { Plus } from "lucide-react";

type SortOrder = "newest" | "oldest";

interface SpotifyFind {
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
  user?: {
    name: string | null;
    email: string;
  };
}

export default function Home() {
  const { data: session } = useSession();
  const [finds, setFinds] = useState<SpotifyFind[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");
  const [selectedType, setSelectedType] = useState<FindType | "all">("all");
  const [selectedGenre, setSelectedGenre] = useState<string | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  useEffect(() => {
    async function fetchFinds() {
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
    }

    fetchFinds();
  }, []);

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
    const dateA = new Date(a.dateAdded).getTime();
    const dateB = new Date(b.dateAdded).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Left sidebar for logo - hidden on mobile, visible on larger screens */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex md:items-start md:justify-center md:pt-6 z-40">
        <div>
          <CircularText
            text="SHARE+TUNE+"
            onHover="goBonkers"
            spinDuration={30}
            className="custom-class"
          />
        </div>
      </aside>

      {/* Mobile logo - shown only on small screens */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <div className="scale-50 origin-top-left">
          <CircularText
            text="SHARE+TUNE+"
            onHover="goBonkers"
            spinDuration={30}
            className="custom-class"
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="md:ml-64">
        <div className="fixed bottom-0 left-0 z-50 p-4 md:p-6">
          <ThemeToggle />
        </div>
        <main className="container mx-auto px-4 py-8 pt-24 md:pt-8">
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            {session && (
              <div className="flex items-center bg-secondary/50 rounded-lg p-1 mr-4">
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Following
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
            <TypeFilter selectedType={selectedType} onTypeChange={setSelectedType} />
            <GenreFilter selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />
            <DateSort sortOrder={sortOrder} onSortChange={setSortOrder} />

            {session && (
              <Link
                href="/add"
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Music
              </Link>
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
            <FindList finds={sortedFinds} />
          )}
        </main>
      </div>
    </div>
  );
}
