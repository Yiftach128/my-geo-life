import { useMapEvents } from 'react-leaflet';

interface Props {
  /** Only probe when true (i.e. not in a drawing mode). */
  active: boolean;
  onProbe: (lat: number, lng: number) => void;
}

/**
 * Reports base-map double-clicks (when not drawing) so the page can reverse-geocode them.
 * Co-exists with MapClickHandler's own `useMapEvents` — react-leaflet attaches both.
 * Shape/marker double-clicks are excluded upstream: markers don't bubble to the map, and the
 * circle/polygon layers set `bubblingMouseEvents={false}`.
 */
export function ClickAddressProbe({ active, onProbe }: Props) {
  useMapEvents({
    dblclick(e) {
      if (!active) return;
      // Normalize the longitude into [-180, 180]; a click on a wrapped world copy
      // (map panned past the antimeridian) otherwise yields lng like 394.9.
      const { lat, lng } = e.latlng.wrap();
      onProbe(lat, lng);
    },
  });
  return null;
}
