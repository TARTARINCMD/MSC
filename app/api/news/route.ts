import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";

const MAX_ARTICLES_PER_ARTIST = 5;
const FETCH_TIMEOUT_MS = 5000;
const FETCH_INTERVAL_MS = 15 * 60 * 1000; // Fetch new articles every 15 minutes

const FOLLOWING_TOPICS = [
  "spotify",
  "apple music",
  "billboard charts",
  "music tours",
];

let lastFetchTimestamp = 0;

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

async function fetchNewsForQuery(
  queryTerm: string,
  opts: { artist?: string; genre?: string; artistImageUrl?: string | null }
): Promise<Omit<NewsArticle, "artistImageUrl">[]> {
  const query = encodeURIComponent(`${queryTerm} music`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=en&gl=US&ceid=US:en`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const itemArray = Array.isArray(items) ? items : [items];

    return itemArray.slice(0, MAX_ARTICLES_PER_ARTIST).map((item: any) => ({
      title: cleanTitle(item.title || ""),
      link: item.link || "",
      source: extractSource(item.source || item.title || ""),
      pubDate: item.pubDate || "",
      artist: opts.artist ?? "",
      genre: opts.genre ?? null,
      keyword: queryTerm,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function cleanTitle(title: string): string {
  // Google News appends " - Source Name" to titles
  const dashIndex = title.lastIndexOf(" - ");
  return dashIndex > 0 ? title.substring(0, dashIndex).trim() : title;
}

function extractSource(source: string): string {
  if (typeof source === "object" && source !== null) {
    return (source as any)["#text"] || "Unknown";
  }
  // If source is a string from title fallback, extract after last " - "
  const dashIndex = source.lastIndexOf(" - ");
  return dashIndex > 0 ? source.substring(dashIndex + 3).trim() : "Unknown";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if database is empty (first time)
    const articleCount = await prisma.newsArticle.count();
    
    if (articleCount === 0) {
      // First time - fetch and wait
      console.log("First time fetch - populating database...");
      await fetchAndStoreNewArticles();
      lastFetchTimestamp = Date.now();
    } else {
      const shouldFetchNew = Date.now() - lastFetchTimestamp > FETCH_INTERVAL_MS;

      if (shouldFetchNew) {
        // Fetch new articles in background
        fetchAndStoreNewArticles().catch((err) =>
          console.error("Error fetching new articles:", err)
        );
        lastFetchTimestamp = Date.now();
      }
    }

    // Always return from database, newest fetches first.
    // We sort by fetchedAt (DateTime) instead of pubDate (string) because pubDate is RFC822
    // and string sorting can put old articles above new ones.
    const storedArticles = await prisma.newsArticle.findMany({
      orderBy: { fetchedAt: "desc" },
      take: 150,
    });

    const articles = storedArticles.map((a) => ({
      title: a.title,
      link: a.link,
      source: a.source,
      pubDate: a.pubDate,
      artist: a.artist,
      artistImageUrl: a.artistImageUrl,
      genre: a.genre,
      keyword: a.keyword,
    }));

    return NextResponse.json(articles, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

async function fetchAndStoreNewArticles() {
  try {

    const artistRecords = await prisma.spotifyFind.findMany({
      distinct: ["artist"],
      select: { artist: true, imageUrl: true, genre: true },
      orderBy: { dateAdded: "desc" },
    });

    const genreRecords = await prisma.spotifyFind.findMany({
      distinct: ["genre"],
      where: { genre: { not: null } },
      select: { genre: true },
    });

    const artistImageMap = new Map<string, string | null>();
    const artistGenreMap = new Map<string, string | null>();
    for (const r of artistRecords) {
      if (!artistImageMap.has(r.artist)) {
        artistImageMap.set(r.artist, r.imageUrl);
        artistGenreMap.set(r.artist, r.genre);
      }
    }

    const artists = Array.from(artistImageMap.keys());
    const genres = Array.from(
      new Set(genreRecords.map((r) => r.genre).filter(Boolean) as string[])
    );

    const artistPromises = artists.map((artist) =>
      fetchNewsForQuery(artist, {
        artist,
        genre: artistGenreMap.get(artist) ?? undefined,
        artistImageUrl: artistImageMap.get(artist) ?? null,
      })
    );
    const genrePromises = genres.map((genre) =>
      fetchNewsForQuery(genre, { genre })
    );
    const topicPromises = FOLLOWING_TOPICS.map((topic) =>
      fetchNewsForQuery(topic, {})
    );

    const results = await Promise.allSettled([
      ...artistPromises,
      ...genrePromises,
      ...topicPromises,
    ]);

    const allArticles: NewsArticle[] = [];
    const seenLinks = new Set<string>();

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      for (const article of result.value) {
        if (!article.link || seenLinks.has(article.link)) continue;
        seenLinks.add(article.link);
        allArticles.push({
          ...article,
          artistImageUrl: article.artist
            ? artistImageMap.get(article.artist) ?? null
            : null,
        });
      }
    }

    allArticles.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    // Store new articles in database (dedupe by unique `link`)
    const result = await prisma.newsArticle.createMany({
      data: allArticles.map((article) => ({
        title: article.title,
        link: article.link,
        source: article.source,
        pubDate: article.pubDate,
        artist: article.artist,
        artistImageUrl: article.artistImageUrl,
        genre: article.genre,
        keyword: article.keyword,
        fetchedAt: new Date(),
      })),
      skipDuplicates: true,
    });

    console.log(
      `Processed ${allArticles.length} articles, added ${result.count} new ones`
    );
  } catch (error) {
    console.error("Error in fetchAndStoreNewArticles:", error);
    throw error;
  }
}
