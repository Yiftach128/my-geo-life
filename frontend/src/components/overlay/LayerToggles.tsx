import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';

interface LayerVisibility {
  landmarks: boolean;
  circles: boolean;
  polygons: boolean;
}

interface Props {
  visibility: LayerVisibility;
  onChange: (next: LayerVisibility) => void;
  disabled?: boolean;
}

export function LayerToggles({ visibility, onChange, disabled }: Props) {
  const active = Object.entries(visibility)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const handleChange = (_: React.MouseEvent, values: string[]) => {
    onChange({
      landmarks: values.includes('landmarks'),
      circles: values.includes('circles'),
      polygons: values.includes('polygons'),
    });
  };

  return (
    <Tooltip title={disabled ? 'Sign in to see layers' : ''} placement="bottom">
      <Box>
        <ToggleButtonGroup
          value={active}
          onChange={handleChange}
          size="small"
          sx={{ bgcolor: 'white', borderRadius: 1 }}
          disabled={disabled}
        >
          <ToggleButton value="landmarks" title="Landmarks" aria-label="Landmarks" sx={{ px: 1 }}>
            <PlaceIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="circles" title="Circles" aria-label="Circles" sx={{ px: 1 }}>
            <CircleOutlinedIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="polygons" title="Polygons" aria-label="Polygons" sx={{ px: 1 }}>
            <PentagonOutlinedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Tooltip>
  );
}
