import { type MutableRefObject } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { MapRefCapture } from './MapRefCapture';
import { MapClickHandler } from './MapClickHandler';
import { LandmarkLayer } from './LandmarkLayer';
import { CircleLayer } from './CircleLayer';
import { PolygonLayer } from './PolygonLayer';
import { DrawingPreview } from './DrawingPreview';
import type L from 'leaflet';
import type { LandmarkDto, CircleDto, PolygonDto, SelectedItem } from '../../types/api';
import type { DrawingMode } from '../../hooks/useDrawingMode';

interface LayerVisibility {
  landmarks: boolean;
  circles: boolean;
  polygons: boolean;
}

interface Props {
  mapRef: MutableRefObject<L.Map | null>;
  drawingMode: DrawingMode;
  layerVisibility: LayerVisibility;
  landmarks: LandmarkDto[];
  circles: CircleDto[];
  polygons: PolygonDto[];
  isAuthenticated: boolean;
  onSelectItem: (item: SelectedItem) => void;
}

export function AppMap({
  mapRef,
  drawingMode,
  layerVisibility,
  landmarks,
  circles,
  polygons,
  isAuthenticated,
  onSelectItem,
}: Props) {
  return (
    <MapContainer
      center={[31.77, 35.21]}
      zoom={8}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      preferCanvas={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        keepBuffer={4}
        updateWhenZooming={false}
      />
      <ZoomControl position="bottomleft" />
      <MapRefCapture mapRef={mapRef} />
      <MapClickHandler drawingMode={drawingMode} />
      <DrawingPreview drawingState={drawingMode.state} />

      {isAuthenticated && layerVisibility.landmarks && (
        <LandmarkLayer landmarks={landmarks} onSelect={onSelectItem} />
      )}
      {isAuthenticated && layerVisibility.circles && (
        <CircleLayer circles={circles} onSelect={onSelectItem} />
      )}
      {isAuthenticated && layerVisibility.polygons && (
        <PolygonLayer polygons={polygons} onSelect={onSelectItem} />
      )}
    </MapContainer>
  );
}
