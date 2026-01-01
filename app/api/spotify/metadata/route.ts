import { NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing Spotify credentials");
    }

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
                `${clientId}:${clientSecret}`
            ).toString("base64")}`,
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to get Spotify token");
    }

    const data = await response.json();
    return data.access_token;
}

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Basic parsing of Spotify URL
        // Formats:
        // https://open.spotify.com/track/ID?si=...
        // https://open.spotify.com/album/ID?si=...
        // https://open.spotify.com/playlist/ID?si=...

        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/").filter(Boolean); // Remove empty strings

        // pathParts should be ['track', 'ID'] or ['album', 'ID'] etc.
        if (pathParts.length < 2) {
            return NextResponse.json({ error: "Invalid Spotify URL format" }, { status: 400 });
        }

        const type = pathParts[pathParts.length - 2];
        const id = pathParts[pathParts.length - 1];

        if (!["track", "album", "playlist"].includes(type)) {
            return NextResponse.json({ error: "Unsupported Spotify link type" }, { status: 400 });
        }

        const token = await getSpotifyToken();
        const headers = { Authorization: `Bearer ${token}` };

        let metadata = {
            title: "",
            artist: "",
            imageUrl: "",
            type: type,
            spotifyId: id,
        };

        if (type === "track") {
            const res = await fetch(`${SPOTIFY_API_BASE}/tracks/${id}`, { headers });
            if (!res.ok) throw new Error("Failed to fetch track");
            const data = await res.json();
            metadata.title = data.name;
            metadata.artist = data.artists.map((a: any) => a.name).join(", ");
            metadata.imageUrl = data.album.images[0]?.url;
        } else if (type === "album") {
            const res = await fetch(`${SPOTIFY_API_BASE}/albums/${id}`, { headers });
            if (!res.ok) throw new Error("Failed to fetch album");
            const data = await res.json();
            metadata.title = data.name;
            metadata.artist = data.artists.map((a: any) => a.name).join(", ");
            metadata.imageUrl = data.images[0]?.url;
        } else if (type === "playlist") {
            const res = await fetch(`${SPOTIFY_API_BASE}/playlists/${id}`, { headers });
            if (!res.ok) throw new Error("Failed to fetch playlist");
            const data = await res.json();
            metadata.title = data.name;
            metadata.artist = data.owner.display_name; // For playlists, maybe owner name?
            metadata.imageUrl = data.images[0]?.url;
        }

        return NextResponse.json(metadata);

    } catch (error: any) {
        console.error("Spotify Metadata Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch metadata" },
            { status: 500 }
        );
    }
}
