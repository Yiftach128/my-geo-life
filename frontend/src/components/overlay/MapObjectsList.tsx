import { type MutableRefObject } from 'react';
import {
  Box,
  ButtonBase,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';
import L from 'leaflet';
import { POINT_FLY_ZOOM, type CircleDto, type LandmarkDto, type PolygonDto, type SelectedItem } from '../../types/api';
import { LANDMARK_ICONS, resolveIconKey } from '../map/landmarkIcons';
import { useAuth } from '../../hooks/useAuth';
import { usePersistentState } from '../../hooks/usePersistentState';

interface LayerVisibility {
  landmarks: boolean;
  circles: boolean;
  polygons: boolean;
}

interface Props {
  landmarks: LandmarkDto[];
  circles: CircleDto[];
  polygons: PolygonDto[];
  visibility: LayerVisibility;
  mapRef: MutableRefObject<L.Map | null>;
}

const FLY_OPTIONS: L.ZoomPanOptions = { duration: 1.25 };
const BOUNDS_OPTIONS: L.FitBoundsOptions = { duration: 1.25, padding: [40, 40] };

/** Colored MUI icon matching how each item is drawn on the map. */
function ItemIcon({ selected }: { selected: SelectedItem }) {
  if (selected.type === 'landmark') {
    const { Icon } = LANDMARK_ICONS[resolveIconKey(selected.item.iconUrl)];
    return <Icon fontSize="small" sx={{ color: selected.item.color }} />;
  }
  if (selected.type === 'circle') {
    return <CircleOutlinedIcon fontSize="small" sx={{ color: selected.item.style.strokeColor }} />;
  }
  return <PentagonOutlinedIcon fontSize="small" sx={{ color: selected.item.style.strokeColor }} />;
}

export function MapObjectsList({ landmarks, circles, polygons, visibility, mapRef }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = usePersistentState<boolean>('ui.objectsListOpen', true);

  const items: SelectedItem[] = [
    ...(visibility.landmarks ? landmarks.map((item) => ({ type: 'landmark', item }) as const) : []),
    ...(visibility.circles ? circles.map((item) => ({ type: 'circle', item }) as const) : []),
    ...(visibility.polygons ? polygons.map((item) => ({ type: 'polygon', item }) as const) : []),
  ].sort((a, b) => b.item.createdAt.localeCompare(a.item.createdAt));

  const flyToItem = (selected: SelectedItem) => {
    const map = mapRef.current;
    if (!map) return;
    if (selected.type === 'landmark') {
      const { lat, lng } = selected.item.position;
      map.flyTo([lat, lng], POINT_FLY_ZOOM, FLY_OPTIONS);
    } else if (selected.type === 'circle') {
      const { center, radius } = selected.item;
      const bounds = L.latLng(center.lat, center.lng).toBounds(radius * 2);
      map.flyToBounds(bounds, BOUNDS_OPTIONS);
    } else {
      const bounds = L.latLngBounds(selected.item.points.map((p) => [p.lat, p.lng]));
      map.flyToBounds(bounds, BOUNDS_OPTIONS);
    }
  };

  return (
    <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
      {/* Collapsible panel — slides out to the left of the handle */}
      <Collapse in={open} orientation="horizontal" timeout="auto" unmountOnExit>
        <Box sx={{ width: 280, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
            {user ? `${user.name}'s objects` : 'My markers'} ({items.length})
          </Typography>
          {items.length === 0 ? (
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                No objects to show
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {items.map((selected) => (
                <ListItemButton
                  key={`${selected.type}-${selected.item.id}`}
                  onClick={() => flyToItem(selected)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ItemIcon selected={selected} />
                  </ListItemIcon>
                  <ListItemText
                    primary={selected.item.name}
                    secondary={selected.item.description || undefined}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Collapse>

      {/* Chevron handle — always visible, pinned to the right edge */}
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Collapse markers list' : 'Expand markers list'}
        sx={{ alignSelf: 'flex-start', p: 1 }}
      >
        {open ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </ButtonBase>
    </Paper>
  );
}
