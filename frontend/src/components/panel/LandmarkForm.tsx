import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { StyleEditor } from './StyleEditor';
import { TooltipToggleButton } from '../common/TooltipToggleButton';
import { LANDMARK_ICONS, LANDMARK_ICON_KEYS, resolveIconKey } from '../map/landmarkIcons';
import { useUpdateLandmark, useDeleteLandmark } from '../../hooks/useLandmarks';
import { useReverseGeocode } from '../../hooks/useGeocode';
import type { LandmarkDto } from '../../types/api';

interface Props {
  item: LandmarkDto;
  onClose: () => void;
}

export function LandmarkForm({ item, onClose }: Props) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? '');
  const [color, setColor] = useState(item.color);
  const [icon, setIcon] = useState(resolveIconKey(item.iconUrl));

  const { data: address, isFetching: addressLoading } = useReverseGeocode(
    item.position.lat,
    item.position.lng,
  );

  const update = useUpdateLandmark();
  const del = useDeleteLandmark();

  const handleSave = () => {
    update.mutate({
      id: item.id,
      data: { name, description: description || undefined, color, iconUrl: icon },
    });
  };

  const handleDelete = () => {
    del.mutate(item.id);
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Landmark
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {addressLoading ? 'Resolving address…' : (address ?? 'Address unavailable')}
      </Typography>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        size="small"
        inputProps={{ minLength: 2, maxLength: 80 }}
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        size="small"
        multiline
        rows={2}
        inputProps={{ maxLength: 500 }}
      />
      <Divider />
      <Box>
        <Typography variant="body2" gutterBottom>
          Icon
        </Typography>
        <ToggleButtonGroup
          value={icon}
          exclusive
          onChange={(_, value) => value && setIcon(value)}
          size="small"
          sx={{ flexWrap: 'wrap' }}
        >
          {LANDMARK_ICON_KEYS.map((key) => {
            const { label, Icon } = LANDMARK_ICONS[key];
            return (
              <TooltipToggleButton key={key} value={key} tooltip={label} aria-label={label} sx={{ p: 0.75 }}>
                <Icon fontSize="small" sx={{ color }} />
              </TooltipToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Box>
      <StyleEditor color={color} onColorChange={setColor} />
      <Divider />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={update.isPending || name.length < 2}
          size="small"
          fullWidth
        >
          {update.isPending ? <CircularProgress size={16} /> : 'Save'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={del.isPending}
          size="small"
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
}
