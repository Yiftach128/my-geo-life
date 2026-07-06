import { useCallback, useRef, useState } from 'react';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Nominatim's display_name is long and comma-heavy. Keep the 3 most specific
 * leading segments plus the country (last segment) — enough to identify a
 * place without the middle noise. Short names (<= 3 parts) are returned as-is.
 */
function shortenDisplayName(name: string): string {
  const parts = name.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 3) return parts.join(', ');
  const country = parts[parts.length - 1];
  return [...parts.slice(0, 3), country].join(', ');
}

export function useGeocode() {
  const [results, setResults] = useState<NominatimResult[]>([]);
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
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          { headers: { 'Accept-Language': 'en' }, signal: controller.signal },
        );
        const data: NominatimResult[] = await res.json();
        setResults(data.map((r) => ({ ...r, display_name: shortenDisplayName(r.display_name) })));
        setLoading(false);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return; // superseded by a newer query
        setResults([]);
        setLoading(false);
      }
    }, 400);
  }, []);

  return { results, loading, search };
}
