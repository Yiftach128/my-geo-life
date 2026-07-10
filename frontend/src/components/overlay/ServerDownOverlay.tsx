import { Box, CircularProgress, Fade, IconButton, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useServerStatus } from '../../hooks/useServerStatus';

/**
 * Centered, dismissible card shown when the backend can't be reached. Not a blocking
 * backdrop — the rest of the UI stays interactive so the user can keep using the map
 * offline. Auto-dismisses when the server recovers (see `services/server-status.ts`).
 */
export function ServerDownOverlay() {
  const { isDown, dismissed, dismiss } = useServerStatus();
  const open = isDown && !dismissed;

  return (
    <Fade in={open} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: (theme) => theme.zIndex.modal + 1,
          pointerEvents: 'auto',
        }}
      >
        <Paper elevation={6} sx={{ px: 3, py: 2.5, maxWidth: 340, position: 'relative' }}>
          <IconButton
            aria-label="Dismiss"
            size="small"
            onClick={dismiss}
            sx={{ position: 'absolute', top: 4, right: 4 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CloudOffIcon color="error" />
            <Typography variant="subtitle1" fontWeight={600}>
              Server unavailable
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            We can&apos;t reach the server right now. Your changes may not be saved until the
            connection is restored.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Trying to reconnect…
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}
