/**
 * Framework-free visual styling value object shared by Circle and Polygon
 * (Landmark uses a simple iconUrl + color instead). Mirrors the Leaflet path
 * options the frontend renders.
 */
export interface GeoStyle {
  strokeColor: string;
  fillColor: string;
  weight: number;
  opacity: number;
  fillOpacity: number;
  dashArray?: string;
}

/** Single source of truth for the default marker/shape color (Leaflet blue). */
export const DEFAULT_COLOR = '#3388ff';

/** The default style applied when a client omits some or all style fields. */
export const DEFAULT_GEO_STYLE: GeoStyle = {
  strokeColor: DEFAULT_COLOR,
  fillColor: DEFAULT_COLOR,
  weight: 3,
  opacity: 1,
  fillOpacity: 0.2,
};
