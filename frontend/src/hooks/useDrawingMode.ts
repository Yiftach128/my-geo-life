import { useCallback, useEffect, useReducer } from 'react';
import { drawingReducer } from '../types/drawing';
import { useCreateLandmark } from './useLandmarks';
import { useCreateCircle } from './useCircles';
import { useCreatePolygon } from './usePolygons';
import { reverseGeocode } from './useGeocode';
import { DEFAULT_COLOR, DEFAULT_GEO_STYLE } from '../types/api';
import type { Point, SelectedItem } from '../types/api';
import type { DrawingAction, DrawingState } from '../types/drawing';

interface Options {
  onItemCreated: (item: SelectedItem) => void;
}

export interface DrawingMode {
  state: DrawingState;
  dispatch: React.Dispatch<DrawingAction>;
  isSubmitting: boolean;
  handleMapClick: (point: Point) => Promise<void>;
  handlePolygonClose: () => Promise<void>;
}

/**
 * Reverse-geocode a point into a description string for a newly placed item.
 * `Point.lng` is passed as Nominatim's `lon`. Errors are swallowed so a failed
 * lookup never blocks item creation — the item is just created without a description.
 */
async function resolveAddress(lat: number, lng: number): Promise<string | undefined> {
  return (await reverseGeocode(lat, lng).catch(() => null)) ?? undefined;
}

export function useDrawingMode({ onItemCreated }: Options): DrawingMode {
  const [state, dispatch] = useReducer(drawingReducer, { mode: 'idle' });
  const createLandmark = useCreateLandmark();
  const createCircle = useCreateCircle();
  const createPolygon = useCreatePolygon();

  const isSubmitting =
    createLandmark.isPending || createCircle.isPending || createPolygon.isPending;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'CANCEL' });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleMapClick = useCallback(
    async (point: Point) => {
      if (isSubmitting) return;
      switch (state.mode) {
        case 'landmark': {
          const description = await resolveAddress(point.lat, point.lng);
          const item = await createLandmark.mutateAsync({
            name: 'New Landmark',
            description,
            position: point,
            color: DEFAULT_COLOR,
          });
          dispatch({ type: 'CANCEL' });
          onItemCreated({ type: 'landmark', item });
          break;
        }
        case 'circle-center': {
          dispatch({ type: 'SET_CIRCLE_CENTER', center: point });
          break;
        }
        case 'circle-radius': {
          if (state.previewRadius <= 0) return;
          const description = await resolveAddress(state.center.lat, state.center.lng);
          const item = await createCircle.mutateAsync({
            name: 'New Circle',
            description,
            center: state.center,
            radius: state.previewRadius,
            style: DEFAULT_GEO_STYLE,
          });
          dispatch({ type: 'CANCEL' });
          onItemCreated({ type: 'circle', item });
          break;
        }
        case 'polygon': {
          dispatch({ type: 'ADD_VERTEX', point });
          break;
        }
      }
    },
    [state, isSubmitting, createLandmark, createCircle, onItemCreated],
  );

  const handlePolygonClose = useCallback(async () => {
    if (state.mode !== 'polygon' || state.vertices.length < 3 || isSubmitting) return;
    const first = state.vertices[0];
    const description = await resolveAddress(first.lat, first.lng);
    const item = await createPolygon.mutateAsync({
      name: 'New Polygon',
      description,
      points: state.vertices,
      style: DEFAULT_GEO_STYLE,
    });
    dispatch({ type: 'CANCEL' });
    onItemCreated({ type: 'polygon', item });
  }, [state, isSubmitting, createPolygon, onItemCreated]);

  return { state, dispatch, isSubmitting, handleMapClick, handlePolygonClose };
}
