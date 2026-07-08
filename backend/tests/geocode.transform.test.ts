import { describe, it, expect } from 'vitest';
import {
  shortenDisplayName,
  toSearchResults,
  toReverseResult,
} from '../src/modules/geo/geocode/geocode.transform.js';
import { UpstreamGeocodingError } from '../src/shared/errors/index.js';

const LONG_NAME =
  'Eiffel Tower, 5, Avenue Anatole France, Gros-Caillou, Paris, Ile-de-France, 75007, France';
const SHORT_NAME = 'Eiffel Tower, 5, Avenue Anatole France, France';

describe('shortenDisplayName', () => {
  it('keeps the 3 leading segments plus the country', () => {
    expect(shortenDisplayName(LONG_NAME)).toBe(SHORT_NAME);
  });

  it('returns short names (<= 3 parts) unchanged', () => {
    expect(shortenDisplayName('Paris, France')).toBe('Paris, France');
  });
});

describe('toSearchResults', () => {
  it('coerces coordinates to numbers, shortens the label, and drops extra fields', () => {
    const raw = [
      { place_id: 123, lat: '48.8584', lon: '2.2945', display_name: LONG_NAME, boundingbox: [] },
    ];
    expect(toSearchResults(raw)).toEqual([
      { place_id: 123, lat: 48.8584, lon: 2.2945, label: SHORT_NAME },
    ]);
  });

  it('returns an empty array for no results', () => {
    expect(toSearchResults([])).toEqual([]);
  });

  it('throws UpstreamGeocodingError on an unexpected shape', () => {
    expect(() => toSearchResults({ not: 'an array' })).toThrow(UpstreamGeocodingError);
    expect(() => toSearchResults([{ place_id: 1 }])).toThrow(UpstreamGeocodingError);
  });
});

describe('toReverseResult', () => {
  it('returns the shortened label when a place is found', () => {
    expect(toReverseResult({ display_name: LONG_NAME })).toEqual({ label: SHORT_NAME });
  });

  it('returns label null for a no-result (error) response', () => {
    expect(toReverseResult({ error: 'Unable to geocode' })).toEqual({ label: null });
  });

  it('throws UpstreamGeocodingError on an unexpected shape', () => {
    expect(() => toReverseResult(null)).toThrow(UpstreamGeocodingError);
  });
});
