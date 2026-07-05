import type { Point } from './api';

export type DrawingState =
  | { mode: 'idle' }
  | { mode: 'landmark' }
  | { mode: 'circle-center' }
  | { mode: 'circle-radius'; center: Point; previewRadius: number }
  | { mode: 'polygon'; vertices: Point[]; cursorPos?: Point };

export type DrawingAction =
  | { type: 'START_LANDMARK' }
  | { type: 'START_CIRCLE' }
  | { type: 'START_POLYGON' }
  | { type: 'SET_CIRCLE_CENTER'; center: Point }
  | { type: 'UPDATE_PREVIEW_RADIUS'; radius: number }
  | { type: 'ADD_VERTEX'; point: Point }
  | { type: 'UPDATE_CURSOR'; pos: Point }
  | { type: 'CANCEL' };

export function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'START_LANDMARK':
      return { mode: 'landmark' };
    case 'START_CIRCLE':
      return { mode: 'circle-center' };
    case 'START_POLYGON':
      return { mode: 'polygon', vertices: [] };
    case 'SET_CIRCLE_CENTER':
      return { mode: 'circle-radius', center: action.center, previewRadius: 0 };
    case 'UPDATE_PREVIEW_RADIUS':
      if (state.mode !== 'circle-radius') return state;
      return { ...state, previewRadius: action.radius };
    case 'ADD_VERTEX':
      if (state.mode !== 'polygon') return state;
      return { ...state, vertices: [...state.vertices, action.point] };
    case 'UPDATE_CURSOR':
      if (state.mode !== 'polygon') return state;
      return { ...state, cursorPos: action.pos };
    case 'CANCEL':
      return { mode: 'idle' };
    default:
      return state;
  }
}
