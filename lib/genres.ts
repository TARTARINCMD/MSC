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

// Tailwind bg classes for genre tiles — white text on all
const GENRE_COLORS: Record<string, string> = {
  // Hip-hop family — indigo/violet
  "Hip Hop":             "bg-indigo-600",
  "Experimental Hip Hop":"bg-violet-700",
  "Grime":               "bg-violet-600",
  "Drill":               "bg-indigo-800",

  // Rock family — red/rose
  "Rock":                "bg-red-600",
  "Alternative Rock":    "bg-lime-700",
  "Soft Rock":           "bg-rose-500",
  "Alternative":         "bg-lime-600",
  "Punk":                "bg-red-700",
  "Metal":               "bg-red-900",

  // Electronic / Dance family — cyan/teal
  "Electronic":          "bg-cyan-600",
  "EDM":                 "bg-cyan-500",
  "Dance":               "bg-teal-500",
  "House":               "bg-teal-600",
  "Techno":              "bg-cyan-800",
  "Ambient":             "bg-teal-700",
  "Lo-Fi":               "bg-teal-800",

  // Soul / R&B / Funk — amber/orange
  "R&B":                 "bg-amber-600",
  "Soul":                "bg-amber-700",
  "Funk":                "bg-orange-600",

  // Folk / Country / Acoustic — stone/brown
  "Folk":                "bg-stone-600",
  "Alt Folk":            "bg-stone-500",
  "Country":             "bg-yellow-700",

  // Jazz / Blues — blue/slate
  "Jazz":                "bg-blue-700",
  "Japanese Jazz":       "bg-blue-800",
  "Blues":               "bg-blue-900",

  // Pop / Latin / Reggae — pink/green
  "Pop":                 "bg-pink-600",
  "Latin":               "bg-green-600",
  "Reggae":              "bg-green-700",
  "Brazilian":           "bg-green-500",

  // Classical / Fusion — purple/slate
  "Classical":           "bg-purple-700",
  "Fusion":              "bg-purple-600",
  "Indie":               "bg-sky-600",

  // Other
  "Other":               "bg-zinc-500",
};

export function getGenreColor(genre: string): string {
  return GENRE_COLORS[genre] ?? "bg-zinc-500";
}

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
