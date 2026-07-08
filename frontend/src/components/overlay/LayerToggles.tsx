import { Box, ToggleButtonGroup, Tooltip } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';
import { TooltipToggleButton } from '../common/TooltipToggleButton';

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
          disabled={disabled}
          sx={{
            // Always-white buttons; on/off is carried by icon color, not a filled
            // background (overrides the global grey[300] selected style in theme.ts).
            '& .MuiToggleButton-root': {
              color: 'grey.500', // off → light grey icon (via currentColor)
              backgroundColor: '#fff',
              '&:hover': { backgroundColor: 'grey.100' },
              '&.Mui-selected': {
                color: 'text.primary', // on → near-black icon
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: 'grey.100' },
              },
              '&.Mui-disabled': { color: 'grey.400' }, // even lighter when signed out
            },
          }}
        >
          <TooltipToggleButton value="landmarks" tooltip="Toggle landmarks" aria-label="Landmarks" sx={{ px: 1 }}>
            <PlaceIcon fontSize="small" />
          </TooltipToggleButton>
          <TooltipToggleButton value="circles" tooltip="Toggle circles" aria-label="Circles" sx={{ px: 1 }}>
            <CircleOutlinedIcon fontSize="small" />
          </TooltipToggleButton>
          <TooltipToggleButton value="polygons" tooltip="Toggle polygons" aria-label="Polygons" sx={{ px: 1 }}>
            <PentagonOutlinedIcon fontSize="small" />
          </TooltipToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Tooltip>
  );
}
