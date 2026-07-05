import { Circle, CircleMarker, Polyline } from 'react-leaflet';
import { DEFAULT_COLOR } from '../../types/api';
import type { DrawingState } from '../../types/drawing';

interface Props {
  drawingState: DrawingState;
}

export function DrawingPreview({ drawingState: state }: Props) {
  if (state.mode === 'circle-radius' && state.previewRadius > 0) {
    return (
      <Circle
        center={[state.center.lat, state.center.lng]}
        radius={state.previewRadius}
        pathOptions={{ color: DEFAULT_COLOR, dashArray: '6', fillOpacity: 0.1, weight: 2 }}
        interactive={false}
      />
    );
  }

  if (state.mode === 'polygon' && state.vertices.length > 0) {
    const positions = state.cursorPos
      ? [...state.vertices, state.cursorPos]
      : state.vertices;

    return (
      <>
        <Polyline
          positions={positions.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{ color: DEFAULT_COLOR, dashArray: '6', weight: 2 }}
          interactive={false}
        />
        {state.vertices.map((v, i) => (
          <CircleMarker
            key={i}
            center={[v.lat, v.lng]}
            radius={i === 0 && state.vertices.length >= 3 ? 8 : 4}
            pathOptions={{
              color: DEFAULT_COLOR,
              fillColor: i === 0 && state.vertices.length >= 3 ? '#fff' : DEFAULT_COLOR,
              fillOpacity: 1,
              weight: 2,
            }}
            interactive={false}
          />
        ))}
      </>
    );
  }

  return null;
}
