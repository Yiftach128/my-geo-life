import { Box, Slider, Typography } from '@mui/material';

interface Props {
  color: string;
  opacity: number;
  fillOpacity?: number;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onFillOpacityChange?: (fillOpacity: number) => void;
}

export function StyleEditor({
  color,
  opacity,
  fillOpacity,
  onColorChange,
  onOpacityChange,
  onFillOpacityChange,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ minWidth: 50 }}>
          Color
        </Typography>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', padding: 0 }}
        />
      </Box>
      <Box>
        <Typography variant="body2" gutterBottom>
          Opacity: {Math.round(opacity * 100)}%
        </Typography>
        <Slider
          value={opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(_, v) => onOpacityChange(v as number)}
          size="small"
        />
      </Box>
      {onFillOpacityChange !== undefined && fillOpacity !== undefined && (
        <Box>
          <Typography variant="body2" gutterBottom>
            Fill opacity: {Math.round(fillOpacity * 100)}%
          </Typography>
          <Slider
            value={fillOpacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(_, v) => onFillOpacityChange(v as number)}
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}
