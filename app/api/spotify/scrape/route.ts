import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)" },
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch page" }, { status: 502 });

    const html = await res.text();

    const get = (prop: string) => {
      const match = html.match(new RegExp(`"${prop}" content="([^"]+)"`));
      return match?.[1] ?? "";
    };

    const title = get("og:title");
    // og:description format: "Artist · Album · Song · Year"
    const description = get("og:description");
    const artist = description.split("·")[0].trim();

    return NextResponse.json({ title, artist });
  } catch {
    return NextResponse.json({ error: "Scrape failed" }, { status: 500 });
  }
}
