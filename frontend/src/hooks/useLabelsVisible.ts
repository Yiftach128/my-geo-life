import { useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

/** Below this zoom level, name labels are hidden to avoid clutter on far-out views. */
export const LABEL_MIN_ZOOM = 10;

/** True when the map is zoomed in enough (>= minZoom) to show item name labels. */
export function useLabelsVisible(minZoom: number = LABEL_MIN_ZOOM): boolean {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });
  return zoom >= minZoom;
}
