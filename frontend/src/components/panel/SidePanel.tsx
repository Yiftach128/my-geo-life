import { Box, Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LandmarkForm } from './LandmarkForm';
import { CircleForm } from './CircleForm';
import { PolygonForm } from './PolygonForm';
import type { SelectedItem } from '../../types/api';

interface Props {
  selectedItem: SelectedItem | null;
  onClose: () => void;
}

export function SidePanel({ selectedItem, onClose }: Props) {
  return (
    <Drawer
      anchor="left"
      open={selectedItem !== null}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: 320, p: 2 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {selectedItem?.type === 'landmark' && (
        <LandmarkForm key={selectedItem.item.id} item={selectedItem.item} onClose={onClose} />
      )}
      {selectedItem?.type === 'circle' && (
        <CircleForm key={selectedItem.item.id} item={selectedItem.item} onClose={onClose} />
      )}
      {selectedItem?.type === 'polygon' && (
        <PolygonForm key={selectedItem.item.id} item={selectedItem.item} onClose={onClose} />
      )}
    </Drawer>
  );
}
