import { type MutableRefObject } from 'react';
import {
  alpha,
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  List,
  ListItem,
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import L from 'leaflet';
import { POINT_FLY_ZOOM, type CircleDto, type LandmarkDto, type PolygonDto, type SelectedItem } from '../../types/api';
import { LANDMARK_ICONS, resolveIconKey } from '../map/landmarkIcons';
import { useAuth } from '../../hooks/useAuth';
import { usePersistentState } from '../../hooks/usePersistentState';
import { useDeleteLandmark } from '../../hooks/useLandmarks';
import { useDeleteCircle } from '../../hooks/useCircles';
import { useDeletePolygon } from '../../hooks/usePolygons';

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
  /** Open the edit side panel for an item (the list also flies to it first). */
  onEditItem: (item: SelectedItem) => void;
  /** Notify the page after a delete so it can close the panel if that item was open. */
  onDeleted: (item: SelectedItem) => void;
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

export function MapObjectsList({ landmarks, circles, polygons, visibility, mapRef, onEditItem, onDeleted }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = usePersistentState<boolean>('ui.objectsListOpen', true);
  const delLandmark = useDeleteLandmark();
  const delCircle = useDeleteCircle();
  const delPolygon = useDeletePolygon();

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

  // Edit = fly to the object, then open its edit side panel (via the page's setSelectedItem).
  const handleEdit = (selected: SelectedItem) => {
    flyToItem(selected);
    onEditItem(selected);
  };

  // Delete immediately (no confirmation, matching the rest of the app). Each hook removes the
  // item from the query cache, so the row disappears without a refetch.
  const handleDelete = (selected: SelectedItem) => {
    switch (selected.type) {
      case 'landmark':
        delLandmark.mutate(selected.item.id);
        break;
      case 'circle':
        delCircle.mutate(selected.item.id);
        break;
      case 'polygon':
        delPolygon.mutate(selected.item.id);
        break;
    }
    onDeleted(selected);
  };

  return (
    <Paper elevation={3} sx={{ position: 'relative', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
      {/* Collapsible panel — slides out to the left of the handle */}
      <Collapse in={open} orientation="horizontal" timeout="auto" unmountOnExit>
        <Box sx={{ width: 316, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" noWrap sx={{ pl: 2, pr: 5, py: 1 }}>
            {user ? `${user.name}'s objects` : 'My objects'} ({items.length})
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
                <ListItem
                  key={`${selected.type}-${selected.item.id}`}
                  disablePadding
                  secondaryAction={
                    <Box
                      className="row-actions"
                      sx={{
                        display: 'flex',
                        gap: 0.25,
                        opacity: 0,
                        transition: 'opacity 120ms',
                        pl: 3,
                        background: (theme) =>
                          `linear-gradient(to right, ${alpha(theme.palette.grey[100], 0)}, ${theme.palette.grey[100]} 20px)`,
                      }}
                    >
                      <IconButton
                        size="small"
                        aria-label={`Edit ${selected.item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(selected);
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Delete ${selected.item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(selected);
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ '&:hover .row-actions': { opacity: 1 } }}
                >
                  <ListItemButton onClick={() => flyToItem(selected)} sx={{ '&:hover': { bgcolor: 'grey.100' } }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ItemIcon selected={selected} />
                    </ListItemIcon>
                    <ListItemText
                      primary={selected.item.name}
                      secondary={selected.item.addressLabel || undefined}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Collapse>

      {/* Chevron handle — always visible, pinned to the right edge */}
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Collapse markers list' : 'Expand markers list'}
        sx={{
          p: 1,
          ...(open
            ? { position: 'absolute', top: 0, right: 0, zIndex: 1 }
            : { alignSelf: 'flex-start' }),
        }}
      >
        {open ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </ButtonBase>
    </Paper>
  );
}
