import { useState } from 'react';
import { Box, Button, CircularProgress, Divider, TextField, Typography } from '@mui/material';
import { StyleEditor } from './StyleEditor';
import { useUpdateLandmark, useDeleteLandmark } from '../../hooks/useLandmarks';
import type { LandmarkDto } from '../../types/api';

interface Props {
  item: LandmarkDto;
  onClose: () => void;
}

export function LandmarkForm({ item, onClose }: Props) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? '');
  const [color, setColor] = useState(item.color);
  const [opacity, setOpacity] = useState(1);

  const update = useUpdateLandmark();
  const del = useDeleteLandmark();

  const handleSave = () => {
    update.mutate({ id: item.id, data: { name, description: description || undefined, color } });
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
      <StyleEditor
        color={color}
        opacity={opacity}
        onColorChange={setColor}
        onOpacityChange={setOpacity}
      />
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
