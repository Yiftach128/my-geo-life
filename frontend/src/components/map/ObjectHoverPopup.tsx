import { Popup } from 'react-leaflet';
import { Box, Divider, Typography } from '@mui/material';

interface Props {
  name: string;
  addressLabel: string | null;
  description?: string;
}

/**
 * Hover popup (a Leaflet <Popup>) showing a map object's name, resolved address, and
 * description. Empty address/description lines are omitted. Opened on the parent layer's
 * `mouseover` and closed on `mouseout` (see the layer components) rather than on click, with
 * no close button and `autoPan` disabled so hovering never moves the map.
 */
export function ObjectHoverPopup({ name, addressLabel, description }: Props) {
  return (
    <Popup className="object-hover-popup" closeButton={false} autoPan={false}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, direction: 'rtl', textAlign: 'right' }}>
        {/* component="div": MUI body2 renders as <p>, which Leaflet's
            `.leaflet-popup-content p { margin: 1.3em 0 }` would otherwise push apart. */}
        <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
          {name}
        </Typography>
        {addressLabel && (
          <Typography variant="body2" component="div" color="text.secondary" sx={{ lineHeight: 1.25 }}>
            {addressLabel}
          </Typography>
        )}
        {description && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Typography variant="body2" component="div" sx={{ lineHeight: 1.25 }}>
              {description}
            </Typography>
          </>
        )}
      </Box>
    </Popup>
  );
}
