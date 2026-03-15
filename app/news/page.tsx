"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Newspaper, Bookmark } from "lucide-react";
import SearchableDropdown from "@/components/SearchableDropdown";
import { useSidebar } from "@/components/SidebarContext";

interface NewsArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  artist: string;
  artistImageUrl: string | null;
  genre: string | null;
  keyword: string;
}

interface SavedArticleItem {
  id: string;
  title: string;
  link: string;
  keyword: string;
  pubDate: string | null;
  savedAt: string;
}

function NewsCard({
  article,
  isSaved,
  onSave,
  onUnsave,
}: {
  article: NewsArticle;
  isSaved: boolean;
  onSave: () => void;
  onUnsave: () => void;
}) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg px-2 py-2 border border-transparent hover:bg-muted/30 hover:border-black dark:hover:border-white/60 transition-colors">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
      >
        <h2 className="text-sm sm:text-base font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
          {article.keyword && (
            <span className="text-muted-foreground font-normal"> · {article.keyword}</span>
          )}
        </h2>
      </a>
      <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">{formatDate(article.pubDate)}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (isSaved) onUnsave();
          else onSave();
        }}
        className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
        aria-label={isSaved ? "Remove from saved" : "Save for later"}
      >
        {isSaved ? <Bookmark className="h-5 w-5 fill-pink-400 text-pink-400" /> : <Bookmark className="h-5 w-5" />}
      </button>
    </div>
  );
}

function SavedCard({
  article,
  onUnsave,
}: {
  article: SavedArticleItem;
  onUnsave: () => void;
}) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg px-2 py-2 border border-transparent hover:bg-muted/30 hover:border-black dark:hover:border-white/60 transition-colors">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
      >
        <h2 className="text-sm sm:text-base font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
          {article.keyword && (
            <span className="text-muted-foreground font-normal"> · {article.keyword}</span>
          )}
        </h2>
      </a>
      <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">{formatDate(article.pubDate ?? "")}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onUnsave();
        }}
        className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors"
        aria-label="Remove from saved"
      >
        <Bookmark className="h-5 w-5 fill-pink-400 text-pink-400" />
      </button>
    </div>
  );
}

export default function NewsPage() {
  const { data: session } = useSession();
  const { isOpen: sidebarOpen } = useSidebar();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"news" | "saved">("news");

  const genres = useMemo(() => {
    const set = new Set(articles.map((a) => a.genre).filter(Boolean) as string[]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (selectedGenre !== "all" && a.genre !== selectedGenre) return false;
      return true;
    });
  }, [articles, selectedGenre]);

  const savedLinks = useMemo(() => new Set(savedArticles.map((s) => s.link)), [savedArticles]);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/news/saved");
      if (res.ok) {
        const data = await res.json();
        setSavedArticles(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveArticle = useCallback(
    async (article: NewsArticle) => {
      try {
        const res = await fetch("/api/news/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: article.title,
            link: article.link,
            keyword: article.keyword,
            pubDate: article.pubDate,
          }),
        });
        if (res.ok) await fetchSaved();
      } catch {
        // ignore
      }
    },
    [fetchSaved]
  );

  const unsaveArticle = useCallback(
    async (link: string) => {
      try {
        const res = await fetch(`/api/news/saved?link=${encodeURIComponent(link)}`, { method: "DELETE" });
        if (res.ok) {
          setSavedArticles((prev) => prev.filter((s) => s.link !== link));
        }
      } catch {
        // ignore
      }
    },
    []
  );

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

  useEffect(() => {
    if (session) fetchSaved();
  }, [session, fetchSaved]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view news.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${sidebarOpen ? "blur-sm" : ""}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-left">
            <h1 className="text-4xl font-bold mb-2">News</h1>
            <p className="text-muted-foreground">
              Latest news about artists on Sharetune
            </p>
          </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center bg-secondary/50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab("news")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === "news"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === "saved"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Saved{savedArticles.length > 0 ? ` (${savedArticles.length})` : ""}
            </button>
          </div>
          {!loading && !error && articles.length > 0 && activeTab === "news" && (
            <>
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
              {selectedGenre !== "all" && (
                <button
                  onClick={() => setSelectedGenre("all")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              )}
            </>
          )}
        </div>

        {loading && (
          <div className="space-y-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg px-2 py-2 animate-pulse"
              >
                <div className="flex-1 min-w-0">
                  <div className="h-3 bg-muted rounded w-5/6 mb-1" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-20" />
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

        {activeTab === "news" && !loading && !error && articles.length > 0 && filteredArticles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No articles match the selected filters.
          </div>
        )}

        {activeTab === "news" && !loading && !error && filteredArticles.length > 0 && (
          <div className="space-y-5">
            {filteredArticles.map((article, i) => (
              <NewsCard
                key={`${article.link}-${i}`}
                article={article}
                isSaved={savedLinks.has(article.link)}
                onSave={() => saveArticle(article)}
                onUnsave={() => unsaveArticle(article.link)}
              />
            ))}
          </div>
        )}

        {activeTab === "saved" && (
          <>
            {savedArticles.length === 0 && (
              <div className="text-center py-16">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">
                  No saved articles yet. Save articles from the News tab to build your collection.
                </p>
              </div>
            )}
            {savedArticles.length > 0 && (
              <div className="space-y-5">
                {savedArticles.map((article) => (
                  <SavedCard
                    key={article.id}
                    article={article}
                    onUnsave={() => unsaveArticle(article.link)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        </div>
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
