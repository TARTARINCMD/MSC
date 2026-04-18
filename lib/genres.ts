export const PODCAST_TOPICS = [
  "Business",
  "Comedy",
  "Crime",
  "Culture",
  "Education",
  "Finance",
  "Food",
  "Gaming",
  "Health",
  "History",
  "Interviews",
  "Lifestyle",
  "Mental Health",
  "News",
  "Philosophy",
  "Politics",
  "Science",
  "Society",
  "Sports",
  "Storytelling",
  "Tech",
  "Travel",
  "True Crime",
  "Other",
] as const;

export type PodcastTopic = (typeof PODCAST_TOPICS)[number];

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
  "Grunge",
  "House",
  "Hip Hop",
  "Indie",
  "Japanese Jazz",
  "Jazz",
  "Latin",
  "Lo-Fi",
  "Metal",
  "Neo Soul",
  "Pop",
  "Post-Punk",
  "Post-Rock",
  "Rap",
  "Dream Pop",
  "Bedroom Pop",
  "Drill",
  "Dancehall",
  "Cloud Rap",
  "Punk",
  "R&B",
  "Reggae",
  "Rock",
  "Soft Rock",
  "Soul",
  "Soul Jazz",
  "Synthpop",
  "Techno",
  "Trap",
  "UK Garage",
  "UK Rap",
  "West Coast",
  "East Coast",
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
  "Rap":                 "bg-indigo-500",
  "Trap":                "bg-violet-800",
  "Cloud Rap":           "bg-purple-400",
  "West Coast":          "bg-indigo-400",
  "East Coast":          "bg-indigo-700",
  "UK Rap":              "bg-violet-500",
  "UK Garage":           "bg-purple-600",

  // Rock family — red/rose
  "Rock":                "bg-red-600",
  "Alternative Rock":    "bg-lime-700",
  "Soft Rock":           "bg-rose-500",
  "Alternative":         "bg-lime-600",
  "Punk":                "bg-red-700",
  "Post-Punk":           "bg-rose-700",
  "Post-Rock":           "bg-red-800",
  "Grunge":              "bg-stone-700",
  "Metal":               "bg-red-900",

  // Electronic / Dance family — cyan/teal
  "Electronic":          "bg-cyan-600",
  "EDM":                 "bg-cyan-500",
  "Dance":               "bg-teal-500",
  "House":               "bg-teal-600",
  "Techno":              "bg-cyan-800",
  "Ambient":             "bg-teal-700",
  "Lo-Fi":               "bg-teal-800",
  "Synthpop":            "bg-cyan-400",
  "Dream Pop":           "bg-sky-400",
  "Bedroom Pop":         "bg-sky-500",
  "Dancehall":           "bg-emerald-600",

  // Soul / R&B / Funk — amber/orange
  "R&B":                 "bg-amber-600",
  "Soul":                "bg-amber-700",
  "Neo Soul":            "bg-amber-500",
  "Funk":                "bg-orange-600",

  // Folk / Country / Acoustic — stone/brown
  "Folk":                "bg-stone-600",
  "Alt Folk":            "bg-stone-500",
  "Country":             "bg-yellow-700",

  // Jazz / Blues — blue/slate
  "Jazz":                "bg-blue-700",
  "Japanese Jazz":       "bg-blue-800",
  "Soul Jazz":           "bg-blue-600",
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
