import { useState } from 'react';
import { Button, Menu, MenuItem, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlaceIcon from '@mui/icons-material/Place';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';
import type { DrawingAction } from '../../types/drawing';

interface Props {
  dispatch: React.Dispatch<DrawingAction>;
  disabled?: boolean;
}

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
      <Tooltip title={disabled ? 'Sign in to add items' : 'Add item'} placement="left">
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
        <MenuItem onClick={() => select('START_LANDMARK')} title="Landmark" aria-label="Landmark" sx={{ justifyContent: 'center' }}>
          <PlaceIcon fontSize="small" />
        </MenuItem>
        <MenuItem onClick={() => select('START_CIRCLE')} title="Circle" aria-label="Circle" sx={{ justifyContent: 'center' }}>
          <CircleOutlinedIcon fontSize="small" />
        </MenuItem>
        <MenuItem onClick={() => select('START_POLYGON')} title="Polygon" aria-label="Polygon" sx={{ justifyContent: 'center' }}>
          <PentagonOutlinedIcon fontSize="small" />
        </MenuItem>
      </Menu>
    </>
  );
}
