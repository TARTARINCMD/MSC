"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { ExternalLink, Newspaper } from "lucide-react";
import SearchableDropdown from "@/components/SearchableDropdown";

interface NewsArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  artist: string;
  artistImageUrl: string | null;
  genre: string | null;
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]"
    >
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {article.artistImageUrl ? (
          <img
            src={article.artistImageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-[0.7]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Newspaper className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="h-4 w-4 text-white drop-shadow-md" />
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-card-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(article.pubDate)}</span>
          <span className="inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {article.artist}
          </span>
        </div>
      </div>
    </a>
  );
}

export default function NewsPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const artists = useMemo(() => {
    const set = new Set(articles.map((a) => a.artist));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const genres = useMemo(() => {
    const set = new Set(articles.map((a) => a.genre).filter(Boolean) as string[]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (selectedArtist !== "all" && a.artist !== selectedArtist) return false;
      if (selectedGenre !== "all" && a.genre !== selectedGenre) return false;
      return true;
    });
  }, [articles, selectedArtist, selectedGenre]);

  const fetchNews = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/news");
      if (!response.ok) {
        setError("Failed to load news");
        return;
      }
      const data = await response.json();
      setArticles(data);
    } catch {
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view news.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">News</h1>
          <p className="text-muted-foreground">
            Latest news about artists on Sharetune
          </p>
        </div>

        {!loading && !error && articles.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <SearchableDropdown
              value={selectedArtist}
              onChange={setSelectedArtist}
              options={artists}
              allLabel="All Artists"
              placeholder="All Artists"
              searchPlaceholder="Search artists..."
            />

            {genres.length > 0 && (
              <SearchableDropdown
                value={selectedGenre}
                onChange={setSelectedGenre}
                options={genres}
                allLabel="All Genres"
                placeholder="All Genres"
                searchPlaceholder="Search genres..."
              />
            )}

            {(selectedArtist !== "all" || selectedGenre !== "all") && (
              <button
                onClick={() => { setSelectedArtist("all"); setSelectedGenre("all"); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/9] bg-muted" />
                <div className="p-4">
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-destructive">{error}</div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-16">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              No news found. Add some music to Sharetune and news about those
              artists will appear here.
            </p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && filteredArticles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No articles match the selected filters.
          </div>
        )}

        {!loading && !error && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredArticles.map((article, i) => (
              <NewsCard key={`${article.link}-${i}`} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateStr;
  }
}
