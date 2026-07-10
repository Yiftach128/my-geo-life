import { useCallback, useRef, useState } from 'react';
import { serverStatus } from '../services/server-status';

/** A search suggestion as shaped by our backend: numeric coords + a short label. */
export interface GeocodeResult {
  place_id: number;
  lat: number;
  lon: number;
  label: string;
}

export function useGeocode() {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (query.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true); // show spinner immediately; keep popup open during debounce
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        // Proxied through our backend (see backend geocode module): adds an
        // identifying User-Agent, throttles to Nominatim's 1 req/sec, caches, and
        // shapes each result (numeric coords + shortened label) so we render it as-is.
        const res = await fetch(
          `/api/geo/geocode/search?q=${encodeURIComponent(query)}&limit=5`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setResults([]);
          setLoading(false);
          return;
        }
        const data: GeocodeResult[] = await res.json();
        setResults(data);
        setLoading(false);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return; // superseded by a newer query
        void serverStatus.reportSuspectedOutage(); // fetch failed -> confirm via /health
        setResults([]);
        setLoading(false);
      }
    }, 400);
  }, []);

  return { results, loading, search };
}

/**
 * Reverse geocode: coordinates -> the backend's shortened display label.
 * Goes through our backend proxy, which sets the User-Agent, language, throttle,
 * and cache, and does the shortening — so this just returns its `label`. Throws on a
 * non-OK response so callers can distinguish a failed lookup from an empty one.
 * Note: Nominatim's longitude param is `lon`; our DTO `Point` uses `lng`, so callers
 * must pass `point.lng` as the `lon` argument. Returns null when no place is found.
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const res = await fetch(
    `/api/geo/geocode/reverse?lat=${lat}&lon=${lon}`,
    { signal },
  );
  if (!res.ok) throw new Error(`reverse geocode failed: ${res.status}`);
  const data: { label: string | null } = await res.json();
  return data.label;
}
