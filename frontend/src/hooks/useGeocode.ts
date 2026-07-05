import { useCallback, useRef, useState } from 'react';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
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
        setResults(data);
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
