import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useDeleteLandmark } from '../../hooks/useLandmarks';
import { useDeleteCircle } from '../../hooks/useCircles';
import { useDeletePolygon } from '../../hooks/usePolygons';
import type { SelectedItem } from '../../types/api';

/** Open state for the right-click delete menu: which object, and where to anchor it (viewport px). */
export interface ObjectContextMenuState {
  selected: SelectedItem;
  anchorPosition: { top: number; left: number };
}

interface Props {
  state: ObjectContextMenuState | null;
  onClose: () => void;
  onDeleted: (selected: SelectedItem) => void;
}

/**
 * A single-item "Delete" context menu anchored at the cursor. Owns the delete logic so the
 * page stays lean — it dispatches to the matching per-type delete hook (each already removes the
 * item from the query cache and logs out on 401). Deletion is immediate, with no confirmation.
 */
export function ObjectContextMenu({ state, onClose, onDeleted }: Props) {
  const delLandmark = useDeleteLandmark();
  const delCircle = useDeleteCircle();
  const delPolygon = useDeletePolygon();

  const handleDelete = () => {
    if (!state) return;
    const { selected } = state;
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
    <Menu
      open={Boolean(state)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={state?.anchorPosition}
    >
      <MenuItem onClick={handleDelete} sx={{ color: 'common.black', gap: 1.5, minWidth: 168 }}>
        <ListItemIcon sx={{ color: 'inherit' }}>
          <DeleteOutlineIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </MenuItem>
    </Menu>
  );
}
