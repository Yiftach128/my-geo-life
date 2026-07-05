import { useEffect, type MutableRefObject } from 'react';
import { useMap } from 'react-leaflet';
import type L from 'leaflet';

interface Props {
  mapRef: MutableRefObject<L.Map | null>;
}

export function MapRefCapture({ mapRef }: Props) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}
