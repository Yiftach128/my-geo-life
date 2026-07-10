import { useState } from 'react';
import { Box, Button, CircularProgress, Divider, TextField, Typography } from '@mui/material';
import { StyleEditor } from './StyleEditor';
import { useUpdateCircle, useDeleteCircle } from '../../hooks/useCircles';
import type { CircleDto, GeoStyle } from '../../types/api';

interface Props {
  item: CircleDto;
  onClose: () => void;
}

export function CircleForm({ item, onClose }: Props) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? '');
  const [color, setColor] = useState(item.style.strokeColor);
  const [opacity, setOpacity] = useState(item.style.opacity);
  const [fillOpacity, setFillOpacity] = useState(item.style.fillOpacity);

  const update = useUpdateCircle();
  const del = useDeleteCircle();

  const buildStyle = (): Partial<GeoStyle> => ({
    strokeColor: color,
    fillColor: color,
    opacity,
    fillOpacity,
    weight: item.style.weight,
  });

  const handleSave = () => {
    update.mutate({
      id: item.id,
      data: { name, description: description || undefined, style: buildStyle() },
    });
  };

  const handleDelete = () => {
    del.mutate(item.id);
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Circle
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Radius: {Math.round(item.radius)} m
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.addressLabel ?? 'Address unavailable'}
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
        fillOpacity={fillOpacity}
        onColorChange={setColor}
        onOpacityChange={setOpacity}
        onFillOpacityChange={setFillOpacity}
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
