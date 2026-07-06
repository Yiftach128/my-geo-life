import { useRef, useState, type MutableRefObject } from 'react';
import { Box } from '@mui/material';
import type L from 'leaflet';
import { AppMap } from '../components/map/AppMap';
import { AuthButton } from '../components/overlay/AuthButton';
import { SearchBar } from '../components/overlay/SearchBar';
import { LayerToggles } from '../components/overlay/LayerToggles';
import { AddItemButton } from '../components/overlay/AddItemButton';
import { MapObjectsList } from '../components/overlay/MapObjectsList';
import { DrawingModeBanner } from '../components/overlay/DrawingModeBanner';
import { BrandLogo } from '../components/overlay/BrandLogo';
import { SidePanel } from '../components/panel/SidePanel';
import { AuthModal } from '../components/auth/AuthModal';
import { ProfileModal } from '../components/profile/ProfileModal';
import { useAuth } from '../hooks/useAuth';
import { useLandmarks } from '../hooks/useLandmarks';
import { useCircles } from '../hooks/useCircles';
import { usePolygons } from '../hooks/usePolygons';
import { useDrawingMode } from '../hooks/useDrawingMode';
import { usePersistentState } from '../hooks/usePersistentState';
import type { SelectedItem } from '../types/api';

interface LayerVisibility {
  landmarks: boolean;
  circles: boolean;
  polygons: boolean;
}

export default function MapPage() {
  const { isAuthenticated } = useAuth();
  const mapRef = useRef<L.Map | null>(null) as MutableRefObject<L.Map | null>;

  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [layerVisibility, setLayerVisibility] = usePersistentState<LayerVisibility>(
    'ui.layerVisibility',
    { landmarks: true, circles: true, polygons: true },
  );

  const drawingMode = useDrawingMode({
    onItemCreated: setSelectedItem,
  });

  const { data: landmarks = [] } = useLandmarks();
  const { data: circles = [] } = useCircles();
  const { data: polygons = [] } = usePolygons();

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Map — fills full screen */}
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <AppMap
          mapRef={mapRef}
          drawingMode={drawingMode}
          layerVisibility={layerVisibility}
          landmarks={landmarks}
          circles={circles}
          polygons={polygons}
          isAuthenticated={isAuthenticated}
          onSelectItem={setSelectedItem}
        />
      </Box>

      {/* Overlays — pointer-events none on wrapper, auto on children */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1100,
        }}
      >
        {/* Top-left: Auth + Search */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            pointerEvents: 'auto',
          }}
        >
          <AuthButton
            onSignInClick={() => setAuthModalOpen(true)}
            onManageProfileClick={() => setProfileModalOpen(true)}
          />
          <SearchBar mapRef={mapRef} />
        </Box>

        {/* Top-right: Layer toggles + Add button, with the objects list below */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'flex-end',
            pointerEvents: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
            <LayerToggles
              visibility={layerVisibility}
              onChange={setLayerVisibility}
              disabled={!isAuthenticated}
            />
            <AddItemButton dispatch={drawingMode.dispatch} disabled={!isAuthenticated} />
          </Box>
          <Box sx={{ mt: 4 }}>
            <MapObjectsList
              landmarks={landmarks}
              circles={circles}
              polygons={polygons}
              visibility={layerVisibility}
              mapRef={mapRef}
            />
          </Box>
        </Box>

        {/* Centered top: Drawing mode banner */}
        <DrawingModeBanner
          state={drawingMode.state}
          dispatch={drawingMode.dispatch}
          isSubmitting={drawingMode.isSubmitting}
        />

        {/* Bottom-right: brand logo (decorative — pointerEvents left off so the map stays draggable) */}
        <Box sx={{ position: 'absolute', bottom: 28, right: 16 }}>
          <BrandLogo />
        </Box>
      </Box>

      {/* Side panel */}
      <SidePanel selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Auth modal */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Manage-profile modal */}
      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </Box>
  );
}
