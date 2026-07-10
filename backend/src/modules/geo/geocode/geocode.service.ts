import { UpstreamGeocodingError } from '../../../shared/errors/index.js';
import { toSearchResults, toReverseResult } from './geocode.transform.js';
import type { GeocodeSearchResult, GeocodeReverseResult } from './geocode.schemas.js';

export interface GeocodingServiceConfig {
  baseUrl: string;
  userAgent: string;
  /** Default `Accept-Language` sent upstream when a request omits `lang`. */
  language: string;
}

/**
 * The narrow reverse-geocoding capability the geo services depend on, so they
 * rely on an abstraction (and can be stubbed in tests) rather than the whole
 * `GeocodingService` — which satisfies this interface.
 */
export interface ReverseGeocoder {
  reverse(lat: number, lon: number, lang?: string): Promise<GeocodeReverseResult>;
}

/** Nominatim allows at most 1 req/sec per IP; 1100ms leaves a safety margin. */
const MIN_INTERVAL_MS = 1100;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h — a coordinate's address is stable
const CACHE_MAX = 500; // cap unbounded growth; evict oldest (insertion order)

interface CacheEntry {
  value: unknown;
  expires: number;
}

/**
 * Server-side proxy for the Nominatim geocoder. Satisfies the Nominatim usage
 * policy the browser cannot: it sends an identifying `User-Agent`, serializes every
 * outbound call to <= 1/sec via a FIFO queue, and caches responses so repeats never
 * leave the process (this is what stops the app self-inflicting HTTP 429s). It also
 * validates each upstream response and shapes it into the client DTO, so all
 * geocoding data manipulation lives here rather than in the browser.
 */
export class GeocodingService {
  private readonly cache = new Map<string, CacheEntry>();
  private chain: Promise<unknown> = Promise.resolve();
  private lastAt = 0;

  constructor(private readonly config: GeocodingServiceConfig) {}

  async search(q: string, limit: number, lang?: string): Promise<GeocodeSearchResult[]> {
    const language = lang ?? this.config.language;
    const key = `search:${q.trim().toLowerCase()}:${limit}:${language}`;
    return this.fetchCached(key, async () => {
      const url = new URL('/search', this.config.baseUrl);
      url.searchParams.set('format', 'json');
      url.searchParams.set('q', q);
      url.searchParams.set('limit', String(limit));
      return toSearchResults(await this.request(url, language));
    });
  }

  async reverse(lat: number, lon: number, lang?: string): Promise<GeocodeReverseResult> {
    const language = lang ?? this.config.language;
    const key = `reverse:${lat.toFixed(5)}:${lon.toFixed(5)}:${language}`;
    return this.fetchCached(key, async () => {
      const url = new URL('/reverse', this.config.baseUrl);
      url.searchParams.set('format', 'json');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lon));
      return toReverseResult(await this.request(url, language));
    });
  }

  /** Return a fresh cache hit, otherwise run `fetcher` (throttled) and cache it. */
  private async fetchCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as T;

    const value = await this.schedule(fetcher);
    this.setCache(key, value);
    return value;
  }

  private setCache(key: string, value: unknown): void {
    this.cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
    if (this.cache.size > CACHE_MAX) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
  }

  /**
   * Serialize `fn` behind every previously scheduled call, spacing consecutive
   * runs at least MIN_INTERVAL_MS apart. The chain is kept alive across failures
   * so one bad request never stalls the queue.
   */
  private schedule<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.chain.then(async () => {
      const wait = this.lastAt + MIN_INTERVAL_MS - Date.now();
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      this.lastAt = Date.now();
      return fn();
    });
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private async request(url: URL, language: string): Promise<unknown> {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept-Language': language,
        },
      });
    } catch (err) {
      console.error(`[geocode] network error for ${url.pathname}:`, err);
      throw new UpstreamGeocodingError();
    }

    if (!res.ok) {
      console.error(`[geocode] upstream returned ${res.status} for ${url.pathname}`);
      throw new UpstreamGeocodingError();
    }

    return res.json();
  }
}
