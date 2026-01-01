export type FindType = "track" | "album" | "playlist" | "podcast";

export interface SpotifyFind {
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
  userId?: string;
  user?: {
    name: string | null;
    email: string | null;
  };
}
export const spotifyFinds: SpotifyFind[] = [
  {
    id: "find-1",
    title: "SS'25",
    artist: "ALBLAK 52",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/00nhmDdsCimbaOXOt511u4",
    spotifyId: "00nhmDdsCimbaOXOt511u4",
    description: "CWALK SONG",
    dateAdded: "2025-12-30",
    genre: "Hip Hop",
  },
  {
    id: "find-2",
    title: "Impossible Germany",
    artist: "Wilco",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/6L0BBPYeWnaQJeDa0ox0IA",
    spotifyId: "6L0BBPYeWnaQJeDa0ox0IA",
    description: "The Bear",
    dateAdded: "2025-12-31",
    genre: "Alternative Rock",
  },
  {
    id: "find-3",
    title: "SICK!",
    artist: "Earl Sweatshirt",
    type: "album",
    spotifyUrl: "https://open.spotify.com/album/51heTwkSfb4Z5dRIgwU2bd",
    spotifyId: "51heTwkSfb4Z5dRIgwU2bd",
    description: "not drumless anymore",
    dateAdded: "2025-12-31",
    genre: "Hip Hop",
  },
  {
    id: "find-4",
    title: "The very best of",
    artist: "Nina Simone",
    type: "album",
    spotifyUrl: "https://open.spotify.com/album/2HwQNLQBZNvOf55mJeKDvC",
    spotifyId: "2HwQNLQBZNvOf55mJeKDvC",
    description: "Before Sunset",
    dateAdded: "2025-12-31",
    genre: "Jazz",
  },
  {
    id: "find-5",
    title: "Jazz Rap",
    artist: "Spotify",
    type: "playlist",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX8Kgdykz6OKj",
    spotifyId: "37i9dQZF1DX8Kgdykz6OKj",
    description: "Background music",
    dateAdded: "2025-12-31",
    genre: "Jazz Rap",
  },
  {
    id: "find-6",
    title: "Bossa Nova Classics",
    artist: "Spotify",
    type: "playlist",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWWgccrbg3zbJ",
    spotifyId: "37i9dQZF1DWWgccrbg3zbJ",
    description: "",
    dateAdded: "2025-12-31",
    genre: "Bossa Nova",
  },
  {
    id: "find-7",
    title: "Просунь палец сквозь горло",
    artist: "УННВ",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/6rDuRW9cLbooQyyETAlQJH",
    spotifyId: "6rDuRW9cLbooQyyETAlQJH",
    description: "Андер",
    dateAdded: "2025-12-31",
    genre: "Hip Hop",
  },
  {
    id: "find-8",
    title: "m.p",
    artist: "maslo chernogo tmina",
    type: "album",
    spotifyUrl: "https://open.spotify.com/track/1NJZhsQrLfoJLsJTZg2uoY",
    spotifyId: "1NJZhsQrLfoJLsJTZg2uoY",
    description: "Джазик",
    dateAdded: "2025-12-31",
    genre: "Jazz",
  },
  {
    id: "find-9",
    title: "Brotha Man",
    artist: "A$AP Rocky",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/6MmtDonkpvSoRx9ACwrGDu",
    spotifyId: "6MmtDonkpvSoRx9ACwrGDu",
    description: "",
    dateAdded: "2025-12-31",
    genre: "Hip Hop",
  },
  {
    id: "find-10",
    title: "Balloonerism",
    artist: "Mac Miller",
    type: "album",
    spotifyUrl: "https://open.spotify.com/album/2ANFIaCb53iam0MBkFFoxY",
    spotifyId: "2ANFIaCb53iam0MBkFFoxY",
    description: ";((",
    dateAdded: "2025-12-31",
    genre: "Hip Hop",
  },
  {
    id: "find-11",
    title: "E.V.P.",
    artist: "Blood Orange",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/0e43YnIeghIkDOW146x3G5",
    spotifyId: "0e43YnIeghIkDOW146x3G5",
    description: "",
    dateAdded: "2025-12-31",
    genre: "Alternative",
  },
  {
    id: "find-12",
    title: "FEAR.",
    artist: "Kendrick Lamar",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/23luOrEVHMfoX0AhfbQuS6",
    spotifyId: "23luOrEVHMfoX0AhfbQuS6",
    description: "",
    dateAdded: "2025-12-31",
    genre: "Hip Hop",
  },
  {
    id: "find-13",
    title: "海辺の葬列",
    artist: "Ichiko Aoba",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/6ReZJe3uY6iRIoXHrDNI6R",
    spotifyId: "6ReZJe3uY6iRIoXHrDNI6R",
    description: "",
    dateAdded: "2025-12-31",
    genre: "Indie",
  },
  {
    id: "find-14",
    title: "Dead Presidents II",
    artist: "JAY-Z",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/4hjxVY7QYNDmOclMny7hVY",
    spotifyId: "4hjxVY7QYNDmOclMny7hVY",
    description: "",
    dateAdded: "2025-12-31",
    genre: "Hip Hop",
  },
  {
    id: "find-15",
    title: "18",
    artist: "Mosquit",
    type: "track",
    spotifyUrl: "https://open.spotify.com/track/2s4v4UNqeWab6KIP7Axwha",
    spotifyId: "2s4v4UNqeWab6KIP7Axwha",
    description: "",
    dateAdded: "2025-12-31",
    genre: "Hip Hop",
  },
];
export function getFindById(id: string): SpotifyFind | undefined {
  return spotifyFinds.find((find) => find.id === id);
}

