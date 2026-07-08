import { useCallback } from 'react';
import { Box, CircularProgress, IconButton, Tooltip as MuiTooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import L from 'leaflet';

interface Props {
  loading: boolean;
  text: string | null;
  /** Whether the current user may create a landmark (i.e. is signed in). */
  canAdd: boolean;
  onAdd: () => void;
  onDismiss: () => void;
}

/**
 * Content of the click-to-address popup, rendered *inside* a Leaflet tooltip anchored to
 * the right of the probe pin. Layout: [ + ] [ address / spinner ] [ × ]. The + creates a
 * landmark at the pin; it is disabled (with a hint) when signed out.
 */
export function ProbePopup({ loading, text, canAdd, onAdd, onDismiss }: Props) {
  // Stop map interactions underneath the popup so clicking +/× doesn't also re-probe.
  const stopLeafletPropagation = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  const addButton = (
    <IconButton size="small" color="primary" onClick={onAdd} disabled={!canAdd} aria-label="Add landmark here">
      <AddIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Box ref={stopLeafletPropagation} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {canAdd ? (
        addButton
      ) : (
        // A disabled button doesn't emit hover events, so wrap it in a span for the tooltip.
        <MuiTooltip title="Sign in to add">
          <span>{addButton}</span>
        </MuiTooltip>
      )}
      {loading && <CircularProgress size={14} />}
      <Typography variant="body2" sx={{ minWidth: 0 }}>
        {loading ? 'Resolving address…' : (text ?? 'No address found')}
      </Typography>
      <IconButton size="small" onClick={onDismiss} aria-label="Dismiss">
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
