export const GENRES = [
  "Alternative",
  "Alternative Rock",
  "Alt Folk",
  "Ambient",
  "Brazilian",
  "Blues",
  "Classical",
  "Country",
  "Dance",
  "EDM",
  "Electronic",
  "Experimental Hip Hop",
  "Folk",
  "Fusion",
  "Funk",
  "Grime",
  "House",
  "Hip Hop",
  "Indie",
  "Japanese Jazz",
  "Jazz",
  "Latin",
  "Lo-Fi",
  "Metal",
  "Pop",
  "Drill",
  "Punk",
  "R&B",
  "Reggae",
  "Rock",
  "Soft Rock",
  "Soul",
  "Techno",
  "Other",
] as const;

export type Genre = (typeof GENRES)[number];

export function normalizeGenre(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\w& ]+/g, "")
    .replace(/\s+/g, " ");
}

export function isKnownGenre(value: string): boolean {
  const normalized = normalizeGenre(value);
  return GENRES.some((genre) => normalizeGenre(genre) === normalized);
}
