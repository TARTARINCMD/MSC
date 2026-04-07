/** Same-origin fetch that always sends cookies (required for Supabase SSR session on API routes). */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}
