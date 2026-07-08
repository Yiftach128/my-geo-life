import { useState } from 'react';
import { Button, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlaceIcon from '@mui/icons-material/Place';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';
import type { DrawingAction } from '../../types/drawing';

interface Props {
  dispatch: React.Dispatch<DrawingAction>;
  disabled?: boolean;
}

/** Menu rows, one per shape type. */
const ITEMS = [
  { action: 'START_LANDMARK', label: 'Landmark', Icon: PlaceIcon },
  { action: 'START_CIRCLE', label: 'Circle', Icon: CircleOutlinedIcon },
  { action: 'START_POLYGON', label: 'Polygon', Icon: PentagonOutlinedIcon },
] as const;

export function AddItemButton({ dispatch, disabled }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const open = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);

  const select = (action: DrawingAction['type']) => {
    close();
    dispatch({ type: action } as DrawingAction);
  };

  return (
    <>
      <Tooltip title={disabled ? 'Sign in to add items' : 'Add item'} placement="bottom">
        <span>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={open}
            disabled={disabled}
            size="small"
          >
            Add
          </Button>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {ITEMS.map(({ action, label, Icon }) => (
          <MenuItem
            key={action}
            onClick={() => select(action)}
            aria-label={label}
            sx={{ gap: 1.5, minWidth: 168, py: 1 }}
          >
            <ListItemText primary={label} />
            <Icon fontSize="small" />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
