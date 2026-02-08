import { NextResponse } from "next/server";
import { extractAppleMusicId, normalizeAppleArtworkUrl } from "@/lib/streaming";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const id = extractAppleMusicId(url);
    if (!id) {
      return NextResponse.json({ error: "Invalid Apple Music link" }, { status: 400 });
    }

    const response = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch Apple Music metadata" }, { status: 502 });
    }

    const data = await response.json();
    const item = data?.results?.[0];
    const artwork =
      item?.artworkUrl600 ||
      item?.artworkUrl100 ||
      item?.artworkUrl60 ||
      item?.artworkUrl30 ||
      null;

    const title = item?.trackName || item?.collectionName || item?.collectionCensoredName || "";
    const artist = item?.artistName || "";

    return NextResponse.json({
      imageUrl: artwork ? normalizeAppleArtworkUrl(artwork) : null,
      title,
      artist,
    });
  } catch (error) {
    console.error("Apple Music metadata error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
