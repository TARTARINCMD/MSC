"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { Newspaper, Bookmark } from "lucide-react";
import { useSidebar } from "@/components/SidebarContext";
import { apiFetch } from "@/lib/api-fetch";

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

type HighlightTerm = { value: string | null | undefined; className: string };

function renderHighlightedTitle(title: string, terms: HighlightTerm[]) {
  const normalizedMap = new Map<
    string,
    { original: string; className: string }
  >();

  for (const term of terms) {
    if (!term.value || !term.value.trim()) continue;
    const key = term.value.toLowerCase();
    if (!normalizedMap.has(key)) {
      normalizedMap.set(key, { original: term.value, className: term.className });
    }
  }

  if (normalizedMap.size === 0) return title;

  const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pattern = Array.from(normalizedMap.keys())
    .map(escapeRegex)
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  const parts = title.split(regex);

  return parts.map((part, index) => {
    const key = part.toLowerCase();
    const match = normalizedMap.get(key);
    if (!match) return <span key={index}>{part}</span>;
    return (
      <span key={index} className={match.className}>
        {part}
      </span>
    );
  });
}

function NewsCard({
  article,
  isSaved,
  onSave,
  onUnsave,
  highlightTerms,
}: {
  article: NewsArticle;
  isSaved: boolean;
  onSave: () => void;
  onUnsave: () => void;
  highlightTerms: HighlightTerm[];
}) {
  const fresh = isFresh(article.pubDate);

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg px-2 py-2 transition-all hover:bg-muted hover:scale-[1.01] hover:shadow-sm ${
        fresh
          ? "border-l-2 border-l-primary bg-primary/5 border-t border-r border-b border-transparent"
          : "border border-transparent"
      }`}
    >
      {/* Main content */}
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
      >
        <h2 className="text-base sm:text-lg font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {renderHighlightedTitle(article.title, highlightTerms)}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {[article.keyword, article.genre, formatDate(article.pubDate)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </a>

      {/* Bookmark — always visible */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (isSaved) onUnsave();
          else onSave();
        }}
        className="flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-muted/50"
        aria-label={isSaved ? "Remove from saved" : "Save for later"}
      >
        {isSaved ? (
          <Bookmark className="h-5 w-5 fill-pink-400 text-pink-400" />
        ) : (
          <Bookmark className="h-5 w-5 text-muted-foreground opacity-50" />
        )}
      </button>
    </div>
  );
}

function SavedCard({
  article,
  onUnsave,
  highlightTerms,
}: {
  article: SavedArticleItem;
  onUnsave: () => void;
  highlightTerms: HighlightTerm[];
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-2 border-0 transition-all hover:bg-muted hover:scale-[1.01] hover:shadow-sm">
      {/* Main content */}
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
      >
        <h2 className="text-base sm:text-lg font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {renderHighlightedTitle(article.title, highlightTerms)}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {[article.keyword, formatDate(article.pubDate ?? "")]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </a>

      {/* Bookmark — always filled pink in saved tab */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onUnsave();
        }}
        className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
        aria-label="Remove from saved"
      >
        <Bookmark className="h-5 w-5 fill-pink-400 text-pink-400" />
      </button>
    </div>
  );
}

export default function NewsPage() {
  const { user, loading: authLoading } = useAuth();
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

  const artists = useMemo(() => {
    const set = new Set(articles.map((a) => a.artist).filter(Boolean) as string[]);
    return Array.from(set);
  }, [articles]);

  const keywords = useMemo(() => {
    const set = new Set(articles.map((a) => a.keyword).filter(Boolean) as string[]);
    return Array.from(set);
  }, [articles]);

  const allHighlightTerms = useMemo(() => {
    const terms: HighlightTerm[] = [];
    keywords.forEach((keyword) => terms.push({ value: keyword, className: "underline decoration-1 underline-offset-2" }));
    genres.forEach((genre) => terms.push({ value: genre, className: "underline decoration-1 underline-offset-2" }));
    artists.forEach((artist) => terms.push({ value: artist, className: "underline decoration-1 underline-offset-2" }));
    return terms;
  }, [artists, genres, keywords]);

  const filteredArticles = useMemo(() => {
    const filtered = articles.filter((a) => {
      if (selectedGenre !== "all" && a.genre !== selectedGenre) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });
  }, [articles, selectedGenre]);

  const savedLinks = useMemo(() => new Set(savedArticles.map((s) => s.link)), [savedArticles]);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await apiFetch("/api/news/saved");
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
        const res = await apiFetch("/api/news/saved", {
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
        const res = await apiFetch(`/api/news/saved?link=${encodeURIComponent(link)}`, { method: "DELETE" });
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
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/api/news");
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
  }, [user]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (user) fetchSaved();
  }, [user, fetchSaved]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
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
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">News</h1>
            <p className="text-muted-foreground">
              Latest news about artists on Sharetune
            </p>
          </div>

          {/* Controls bar — tab switcher only */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
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
          </div>

          {/* Genre pill row */}
          {activeTab === "news" && !loading && !error && genres.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
              {(["all", ...genres] as string[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedGenre === g
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {g === "all" ? "All" : g}
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, groupIdx) => (
                <div key={groupIdx} className="grid grid-cols-[7rem_1fr] gap-x-4">
                  {/* Bucket label */}
                  <div className="pt-2">
                    <div className="h-3 skeleton rounded w-4/5" />
                  </div>
                  {/* Articles */}
                  <div className="space-y-0.5 border-l border-border pl-4">
                    {Array.from({ length: groupIdx === 0 ? 4 : 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-2 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="h-4 skeleton rounded w-5/6 mb-1.5" />
                          <div className="h-3 skeleton rounded w-2/5" />
                        </div>
                        <div className="h-5 w-5 skeleton rounded flex-shrink-0" />
                      </div>
                    ))}
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

          {/* News feed — grouped by time */}
          {activeTab === "news" && !loading && !error && filteredArticles.length > 0 && (
            <div className="space-y-1">
              {groupArticlesByTime(filteredArticles).map(({ bucket, items }) => (
                <div key={bucket} className="grid grid-cols-[7rem_1fr] gap-x-4 mt-4 first:mt-0">
                  {/* Bucket label — left column */}
                  <div className="pt-2">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                      {bucket}
                    </span>
                  </div>
                  {/* Articles — right column */}
                  <div className="space-y-0.5 border-l border-border pl-4">
                    {items.map((article, i) => (
                      <NewsCard
                        key={`${article.link}-${i}`}
                        article={article}
                        isSaved={savedLinks.has(article.link)}
                        onSave={() => saveArticle(article)}
                        onUnsave={() => unsaveArticle(article.link)}
                        highlightTerms={allHighlightTerms}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved tab */}
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
                <div className="space-y-0.5">
                  {savedArticles.map((article) => (
                    <SavedCard
                      key={article.id}
                      article={article}
                      onUnsave={() => unsaveArticle(article.link)}
                      highlightTerms={allHighlightTerms}
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

function isFresh(pubDate: string): boolean {
  return (new Date().getTime() - new Date(pubDate).getTime()) < 2 * 3600000;
}

type TimeBucket = "Today" | "Yesterday" | "This Week" | "Earlier";

function getTimeBucket(pubDate: string): TimeBucket {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const date = new Date(pubDate);
  if (date >= todayStart) return "Today";
  if (date >= yesterdayStart) return "Yesterday";
  if ((now.getTime() - date.getTime()) < 7 * 86400000) return "This Week";
  return "Earlier";
}

function groupArticlesByTime(articles: NewsArticle[]): { bucket: TimeBucket; items: NewsArticle[] }[] {
  const order: TimeBucket[] = ["Today", "Yesterday", "This Week", "Earlier"];
  const map = new Map<TimeBucket, NewsArticle[]>();
  for (const a of articles) {
    const b = getTimeBucket(a.pubDate);
    if (!map.has(b)) map.set(b, []);
    map.get(b)!.push(a);
  }
  return order.filter((b) => map.has(b)).map((b) => ({ bucket: b, items: map.get(b)! }));
}
