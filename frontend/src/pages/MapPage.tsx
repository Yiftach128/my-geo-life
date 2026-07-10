import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Box } from '@mui/material';
import type L from 'leaflet';
import { AppMap } from '../components/map/AppMap';
import { AuthButton } from '../components/overlay/AuthButton';
import { SearchBar } from '../components/overlay/SearchBar';
import { LayerToggles } from '../components/overlay/LayerToggles';
import { AddItemButton } from '../components/overlay/AddItemButton';
import { MapObjectsList } from '../components/overlay/MapObjectsList';
import { ObjectContextMenu, type ObjectContextMenuState } from '../components/overlay/ObjectContextMenu';
import { DrawingModeBanner } from '../components/overlay/DrawingModeBanner';
import { BrandLogo } from '../components/overlay/BrandLogo';
import { SidePanel } from '../components/panel/SidePanel';
import { AuthModal } from '../components/auth/AuthModal';
import { ProfileModal } from '../components/profile/ProfileModal';
import { useAuth } from '../hooks/useAuth';
import { useLandmarks, useCreateLandmark } from '../hooks/useLandmarks';
import { useCircles } from '../hooks/useCircles';
import { usePolygons } from '../hooks/usePolygons';
import { useDrawingMode } from '../hooks/useDrawingMode';
import { reverseGeocode } from '../hooks/useGeocode';
import { usePersistentState } from '../hooks/usePersistentState';
import { DEFAULT_COLOR, type SelectedItem } from '../types/api';

interface LayerVisibility {
  landmarks: boolean;
  circles: boolean;
  polygons: boolean;
}

/** Default/reset state: every layer visible. Shared by the initial value and the sign-in reset. */
const ALL_LAYERS_VISIBLE: LayerVisibility = { landmarks: true, circles: true, polygons: true };

export default function MapPage() {
  const { isAuthenticated } = useAuth();
  const mapRef = useRef<L.Map | null>(null) as MutableRefObject<L.Map | null>;

  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [contextMenu, setContextMenu] = useState<ObjectContextMenuState | null>(null);
  const [probe, setProbe] = useState<
    { lat: number; lng: number; loading: boolean; text: string | null } | null
  >(null);
  const probeIdRef = useRef(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [layerVisibility, setLayerVisibility] = usePersistentState<LayerVisibility>(
    'ui.layerVisibility',
    ALL_LAYERS_VISIBLE,
  );

  // On an actual sign-in (isAuthenticated false → true), reset every layer to ON. The ref is
  // seeded with the initial auth value, so an already-authenticated first render/refresh does
  // not fire — only a real sign-in or registration during the session does.
  const wasAuthenticated = useRef(isAuthenticated);
  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current) {
      setLayerVisibility(ALL_LAYERS_VISIBLE);
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, setLayerVisibility]);

  const drawingMode = useDrawingMode({
    onItemCreated: setSelectedItem,
  });
  const createLandmark = useCreateLandmark();

  // Reverse-geocode a clicked (non-drawing) map location, dropping a pin there and showing
  // its address in a popup. A request id guards against out-of-order responses on rapid clicks.
  const handleMapProbe = async (lat: number, lng: number) => {
    const id = ++probeIdRef.current;
    setProbe({ lat, lng, loading: true, text: null });
    const text = await reverseGeocode(lat, lng).catch(() => null);
    if (probeIdRef.current === id) setProbe({ lat, lng, loading: false, text });
  };

  // Picking a search result drops the same address probe pin/popup a double-click would, reusing
  // the result's own display_name as the text (no reverse-geocode needed). Bumping the probe id
  // invalidates any in-flight double-click reverse-geocode so a late response can't overwrite this.
  const handlePickSearchResult = (lat: number, lng: number, address: string) => {
    probeIdRef.current++;
    setProbe({ lat, lng, loading: false, text: address });
  };

  // "+" in the probe popup: create a landmark at the pin, then open its edit panel and clear the
  // pin/popup. The backend reverse-geocodes the position into the landmark's addressLabel — served
  // from the shared server-side cache the probe above just warmed for these coords, so it's a cache
  // hit, not a second Nominatim request (and still correct on a cold cache: it just does the lookup).
  const handleAddLandmarkAtProbe = async () => {
    if (!probe) return;
    const item = await createLandmark.mutateAsync({
      name: 'New Landmark',
      position: { lat: probe.lat, lng: probe.lng },
      color: DEFAULT_COLOR,
    });
    setSelectedItem({ type: 'landmark', item });
    setProbe(null);
  };

  // Hide any address popup/pin once the user starts drawing.
  useEffect(() => {
    if (drawingMode.state.mode !== 'idle') setProbe(null);
  }, [drawingMode.state.mode]);

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
          onMapProbe={handleMapProbe}
          probe={probe}
          onProbeAdd={handleAddLandmarkAtProbe}
          onProbeDismiss={() => setProbe(null)}
          onContextMenuItem={(selected, e) => {
            e.originalEvent.preventDefault(); // suppress the browser's native context menu
            setContextMenu({
              selected,
              anchorPosition: { top: e.originalEvent.clientY, left: e.originalEvent.clientX },
            });
          }}
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
          <SearchBar mapRef={mapRef} onPickResult={handlePickSearchResult} />
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
              onEditItem={setSelectedItem}
              onDeleted={(selected) => {
                // If the deleted object is open in the edit panel, close it so no stale form remains.
                if (selectedItem?.item.id === selected.item.id) setSelectedItem(null);
              }}
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

      {/* Right-click delete menu */}
      <ObjectContextMenu
        state={contextMenu}
        onClose={() => setContextMenu(null)}
        onDeleted={(selected) => {
          setContextMenu(null);
          // If the deleted object is open in the edit panel, close it so no stale form remains.
          if (selectedItem?.item.id === selected.item.id) setSelectedItem(null);
        }}
      />

      {/* Side panel */}
      <SidePanel selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Auth modal */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Manage-profile modal */}
      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </Box>
  );
}
