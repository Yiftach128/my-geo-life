import { useMapEvents } from 'react-leaflet';

/** Default map view when nothing has been saved yet (centered on Israel). */
export const DEFAULT_CENTER: [number, number] = [31.77, 35.21];
export const DEFAULT_ZOOM = 8;

const STORAGE_KEY = 'ui.mapView';

interface MapView {
  center: [number, number];
  zoom: number;
}

/**
 * Reads the saved map view from `sessionStorage`, falling back to the defaults.
 * Safe against missing/corrupt data. Call once at mount to seed `<MapContainer>`'s
 * initial `center`/`zoom` (react-leaflet only reads those props on first mount).
 */
export function readMapView(): MapView {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as MapView;
      if (
        Array.isArray(parsed.center) &&
        parsed.center.length === 2 &&
        typeof parsed.center[0] === 'number' &&
        typeof parsed.center[1] === 'number' &&
        typeof parsed.zoom === 'number'
      ) {
        return parsed;
      }
    }
  } catch {
    /* fall through to defaults */
  }
  return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
}

/**
 * Renders nothing; lives inside `<MapContainer>` and saves the current center/zoom to
 * `sessionStorage` on every `moveend`. `moveend` fires at the end of both pan and zoom
 * gestures (and after `flyTo` animations), so a single listener captures both — and it's
 * naturally debounced to once per gesture.
 */
export function MapViewPersistence() {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const { lat, lng } = map.getCenter();
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ center: [lat, lng], zoom: map.getZoom() }),
        );
      } catch {
        /* storage full or unavailable — ignore */
      }
    },
  });
  return null;
}
