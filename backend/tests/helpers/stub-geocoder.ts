import { ReverseGeocoder } from '../../src/modules/geo/geocode/geocode.service.js';
import { GeocodeReverseResult } from '../../src/modules/geo/geocode/geocode.schemas.js';

/**
 * Configurable ReverseGeocoder test double. Records each call and returns a fixed
 * label, so a service test can assert what got stored without hitting Nominatim.
 */
export class StubGeocoder implements ReverseGeocoder {
  readonly calls: Array<{ lat: number; lon: number }> = [];

  constructor(private label: string | null = 'Test Address') {}

  async reverse(lat: number, lon: number): Promise<GeocodeReverseResult> {
    this.calls.push({ lat, lon });
    return { label: this.label };
  }
}

/** A ReverseGeocoder that always throws — proves a lookup failure never blocks a write. */
export class ThrowingGeocoder implements ReverseGeocoder {
  async reverse(): Promise<GeocodeReverseResult> {
    throw new Error('upstream geocoder down');
  }
}
