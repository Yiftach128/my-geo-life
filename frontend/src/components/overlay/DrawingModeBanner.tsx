import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import type { DrawingAction, DrawingState } from '../../types/drawing';

const INSTRUCTIONS: Partial<Record<DrawingState['mode'], string>> = {
  landmark: 'Click on the map to place a landmark',
  'circle-center': 'Click to set the circle center',
  'circle-radius': 'Move mouse to set radius, then click to confirm',
  polygon: 'Click to add vertices. Click the first point (highlighted) to close the polygon.',
};

interface Props {
  state: DrawingState;
  dispatch: React.Dispatch<DrawingAction>;
  isSubmitting: boolean;
}

export function DrawingModeBanner({ state, dispatch, isSubmitting }: Props) {
  if (state.mode === 'idle') return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1100,
        pointerEvents: 'auto',
      }}
    >
      <Paper elevation={3} sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        {isSubmitting && <CircularProgress size={16} />}
        <Typography variant="body2">{INSTRUCTIONS[state.mode]}</Typography>
        <Button
          size="small"
          onClick={() => dispatch({ type: 'CANCEL' })}
          disabled={isSubmitting}
        >
          Cancel (ESC)
        </Button>
      </Paper>
    </Box>
  );
}
