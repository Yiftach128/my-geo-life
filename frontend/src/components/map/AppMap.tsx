import { useMemo, type MutableRefObject } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Tooltip } from 'react-leaflet';
import { landmarkDivIcon } from './landmarkIcons';
import { MapRefCapture } from './MapRefCapture';
import { MapViewPersistence, readMapView } from './MapViewPersistence';
import { MapClickHandler } from './MapClickHandler';
import { ClickAddressProbe } from './ClickAddressProbe';
import { ProbePopup } from './ProbePopup';
import { LandmarkLayer } from './LandmarkLayer';
import { CircleLayer } from './CircleLayer';
import { PolygonLayer } from './PolygonLayer';
import { DrawingPreview } from './DrawingPreview';
import type L from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
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
  onContextMenuItem: (item: SelectedItem, e: LeafletMouseEvent) => void;
  onMapProbe: (lat: number, lng: number) => void;
  probe: { lat: number; lng: number; loading: boolean; text: string | null } | null;
  onProbeAdd: () => void;
  onProbeDismiss: () => void;
}

/** Red tint for the transient click-to-address pin, matching the popup's + button accent. */
const PROBE_COLOR = '#d32f2f';

export function AppMap({
  mapRef,
  drawingMode,
  layerVisibility,
  landmarks,
  circles,
  polygons,
  isAuthenticated,
  onSelectItem,
  onContextMenuItem,
  onMapProbe,
  probe,
  onProbeAdd,
  onProbeDismiss,
}: Props) {
  // Read the saved view once at mount; react-leaflet only reads these props on first mount.
  const initialView = useMemo(readMapView, []);
  return (
    <MapContainer
      center={initialView.center}
      zoom={initialView.zoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      doubleClickZoom={false}
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
      <MapViewPersistence />
      <MapClickHandler drawingMode={drawingMode} />
      <ClickAddressProbe active={drawingMode.state.mode === 'idle'} onProbe={onMapProbe} />
      {probe && (
        <Marker
          position={[probe.lat, probe.lng]}
          icon={landmarkDivIcon('place', PROBE_COLOR)}
          interactive={false}
        >
          <Tooltip permanent interactive direction="right" offset={[20, 0]} className="probe-popup">
            <ProbePopup
              loading={probe.loading}
              text={probe.text}
              canAdd={isAuthenticated}
              onAdd={onProbeAdd}
              onDismiss={onProbeDismiss}
            />
          </Tooltip>
        </Marker>
      )}
      <DrawingPreview drawingState={drawingMode.state} />

      {isAuthenticated && layerVisibility.landmarks && (
        <LandmarkLayer
          landmarks={landmarks}
          onSelect={onSelectItem}
          onContextMenu={onContextMenuItem}
        />
      )}
      {isAuthenticated && layerVisibility.circles && (
        <CircleLayer circles={circles} onSelect={onSelectItem} onContextMenu={onContextMenuItem} />
      )}
      {isAuthenticated && layerVisibility.polygons && (
        <PolygonLayer
          polygons={polygons}
          onSelect={onSelectItem}
          onContextMenu={onContextMenuItem}
        />
      )}
    </MapContainer>
  );
}
