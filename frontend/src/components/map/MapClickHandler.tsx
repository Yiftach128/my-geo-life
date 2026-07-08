import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { DrawingMode } from '../../hooks/useDrawingMode';

interface Props {
  drawingMode: DrawingMode;
}

export function MapClickHandler({ drawingMode }: Props) {
  const map = useMap();
  const { state, dispatch, handleMapClick, handlePolygonClose } = drawingMode;

  const isDrawing = state.mode !== 'idle';

  useEffect(() => {
    map.getContainer().style.cursor = isDrawing ? 'crosshair' : '';
  }, [map, isDrawing]);

  useMapEvents({
    click(e) {
      if (state.mode === 'idle') return;

      if (state.mode === 'polygon' && state.vertices.length >= 3) {
        const firstVertex = state.vertices[0];
        const firstPixel = map.latLngToContainerPoint([firstVertex.lat, firstVertex.lng]);
        const dist = firstPixel.distanceTo(e.containerPoint);
        if (dist < 15) {
          void handlePolygonClose();
          return;
        }
      }

      // Wrap lng into [-180, 180] so items placed on a wrapped world copy (map
      // panned past the antimeridian) store canonical, in-range coordinates.
      const ll = e.latlng.wrap();
      void handleMapClick({ lat: ll.lat, lng: ll.lng });
    },
    mousemove(e) {
      const ll = e.latlng.wrap();
      if (state.mode === 'circle-radius') {
        const radius = L.latLng(state.center.lat, state.center.lng).distanceTo(ll);
        dispatch({ type: 'UPDATE_PREVIEW_RADIUS', radius });
      } else if (state.mode === 'polygon') {
        dispatch({ type: 'UPDATE_CURSOR', pos: { lat: ll.lat, lng: ll.lng } });
      }
    },
  });

  return null;
}
