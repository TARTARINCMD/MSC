/**
 * Tiny in-memory SWR-style cache for client-side fetches.
 * - Returns stale data immediately so the UI never blanks out.
 * - Revalidates in the background and calls onUpdate with fresh data.
 */

interface CacheEntry {
  data: unknown;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

const TTL_MS = 30_000; // treat data as fresh for 30s — background revalidate after that

export function getCached<T>(key: string): T | undefined {
  return cache.get(key)?.data as T | undefined;
}

export function setCached(key: string, data: unknown) {
  cache.set(key, { data, fetchedAt: Date.now() });
}

export function invalidateCache(key: string) {
  cache.delete(key);
}

export function invalidateCachePrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

function isStale(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return true;
  return Date.now() - entry.fetchedAt > TTL_MS;
}

/**
 * Silently populate the cache for a key without triggering any UI updates.
 * Safe to call fire-and-forget. Skips if already fresh in cache.
 */
export async function prefetch(key: string, fetcher: () => Promise<unknown>): Promise<void> {
  if (!isStale(key)) return; // already fresh, skip
  try {
    const data = await fetcher();
    setCached(key, data);
  } catch {
    // silent — prefetch failures are non-critical
  }
}

/**
 * Fetch with stale-while-revalidate.
 * - If cached data exists, calls onData immediately with stale data and
 *   sets loading=false, then revalidates in the background.
 * - If no cached data, fetches normally (loading=true until done).
 */
export async function fetchSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  onData: (data: T, isBackground: boolean) => void,
  onError?: (err: unknown) => void,
): Promise<void> {
  const stale = getCached<T>(key);

  if (stale !== undefined) {
    // Serve stale immediately
    onData(stale, false);
    if (!isStale(key)) return; // still fresh, skip revalidation
    // Revalidate in background — no loading spinner
    try {
      const fresh = await fetcher();
      setCached(key, fresh);
      onData(fresh, true);
    } catch (err) {
      onError?.(err);
    }
  } else {
    // No cache — fetch normally
    try {
      const data = await fetcher();
      setCached(key, data);
      onData(data, false);
    } catch (err) {
      onError?.(err);
    }
  }
}
