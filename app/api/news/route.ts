import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";

const MAX_ARTICLES_PER_ARTIST = 5;
const MAX_TOTAL_ARTICLES = 50;
const FETCH_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedArticles: NewsArticle[] | null = null;
let cacheTimestamp = 0;

interface NewsArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  artist: string;
  artistImageUrl: string | null;
  genre: string | null;
}

async function fetchNewsForArtist(artist: string): Promise<Omit<NewsArticle, "artistImageUrl" | "genre">[]> {
  const query = encodeURIComponent(`${artist} music`);
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
      artist,
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

    if (cachedArticles && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedArticles);
    }

    const artistRecords = await prisma.spotifyFind.findMany({
      distinct: ["artist"],
      select: { artist: true, imageUrl: true, genre: true },
      orderBy: { dateAdded: "desc" },
    });

    if (artistRecords.length === 0) {
      return NextResponse.json([]);
    }

    const artistImageMap = new Map<string, string | null>();
    const artistGenreMap = new Map<string, string | null>();
    for (const r of artistRecords) {
      if (!artistImageMap.has(r.artist)) {
        artistImageMap.set(r.artist, r.imageUrl);
        artistGenreMap.set(r.artist, r.genre);
      }
    }

    const artists = Array.from(artistImageMap.keys());

    const results = await Promise.allSettled(
      artists.map((artist) => fetchNewsForArtist(artist))
    );

    const allArticles: NewsArticle[] = [];
    const seenLinks = new Set<string>();

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      for (const article of result.value) {
        if (!article.link || seenLinks.has(article.link)) continue;
        seenLinks.add(article.link);
        allArticles.push({
          ...article,
          artistImageUrl: artistImageMap.get(article.artist) ?? null,
          genre: artistGenreMap.get(article.artist) ?? null,
        });
      }
    }

    allArticles.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    const result = allArticles.slice(0, MAX_TOTAL_ARTICLES);
    cachedArticles = result;
    cacheTimestamp = Date.now();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
