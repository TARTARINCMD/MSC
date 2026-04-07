/** Public Supabase project URL (Settings → API → Project URL). */
const FALLBACK_URL = "https://placeholder.supabase.co";

/** Well-known demo anon JWT (Supabase JS requires non-empty strings at init). */
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

function trimmed(s: string | undefined) {
  return s?.trim() ?? "";
}

/**
 * Returns URL + anon key for createClient. Uses env when both are set; otherwise
 * fallbacks so `next build` can run before `.env` is complete. Set both
 * `NEXT_PUBLIC_SUPABASE_*` for real auth against your project.
 */
export function getSupabasePublicConfig() {
  const url = trimmed(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = trimmed(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (url && anonKey) {
    return { url, anonKey };
  }
  return { url: FALLBACK_URL, anonKey: FALLBACK_ANON_KEY };
}
