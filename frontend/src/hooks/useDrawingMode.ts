import { useCallback, useEffect, useReducer } from 'react';
import { drawingReducer } from '../types/drawing';
import { useCreateLandmark } from './useLandmarks';
import { useCreateCircle } from './useCircles';
import { useCreatePolygon } from './usePolygons';
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
          const item = await createLandmark.mutateAsync({
            name: 'New Landmark',
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
          const item = await createCircle.mutateAsync({
            name: 'New Circle',
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
    const item = await createPolygon.mutateAsync({
      name: 'New Polygon',
      points: state.vertices,
      style: DEFAULT_GEO_STYLE,
    });
    dispatch({ type: 'CANCEL' });
    onItemCreated({ type: 'polygon', item });
  }, [state, isSubmitting, createPolygon, onItemCreated]);

  return { state, dispatch, isSubmitting, handleMapClick, handlePolygonClose };
}
