import { Box, Button, Fade, IconButton, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import GestureIcon from '@mui/icons-material/Gesture';

interface Props {
  open: boolean;
  onClose: () => void;      // dismiss (X / "Maybe later")
  onGetStarted: () => void; // dismiss + open AuthModal (logged-out only)
  isAuthenticated: boolean; // signed-in users get the info-only variant (no pitch / actions)
}

const FEATURES: { icon: typeof SearchIcon; text: string }[] = [
  { icon: SearchIcon, text: 'Search any address in seconds' },
  { icon: PlaceIcon, text: 'Drop landmarks & pins to mark the spots that matter' },
  { icon: GestureIcon, text: 'Draw circles & polygons to map out areas' },
];

/**
 * Welcome card shown to logged-out visitors on every load/refresh, and re-openable by anyone
 * via the BrandLogo. Not a blocking backdrop — the map stays interactive behind it (mirrors
 * ServerDownOverlay's floating pattern) so the user can dismiss and keep exploring. Whether it
 * should open is owned by MapPage; dismissing just closes it for this page view. Signed-in users
 * get an info-only variant (no sign-in pitch or action buttons — just an "already signed in" note).
 */
export function WelcomeCard({ open, onClose, onGetStarted, isAuthenticated }: Props) {
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
        <Paper elevation={6} sx={{ px: 3, py: 2.5, maxWidth: 380, position: 'relative' }}>
          <IconButton
            aria-label="Dismiss"
            size="small"
            onClick={onClose}
            sx={{ position: 'absolute', top: 4, right: 4 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Brand pin + heading (pin matches BrandLogo / the favicon) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pr: 3 }}>
              <Box
                component="svg"
                viewBox="0 0 32 32"
                aria-hidden
                sx={{ width: 36, height: 36, flexShrink: 0 }}
              >
                <path
                  fill="#1976d2"
                  d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10z"
                />
                <circle cx="16" cy="12" r="3.75" fill="#fff" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Welcome to My Geo Life
              </Typography>
            </Box>

            <Typography variant="body2">
              Map the places and areas that matter to you.
            </Typography>

            {/* Key features */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {FEATURES.map(({ icon: Icon, text }) => (
                <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary">
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {isAuthenticated ? (
              /* Signed-in: info-only, no sign-in pitch or actions */
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" sx={{ flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">
                  Already signed in
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Sign in for the full My Geo Life experience — save your places and areas to your
                  account and pick up on any device.
                </Typography>

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
                  <Button onClick={onClose}>Maybe later</Button>
                  <Button variant="contained" onClick={onGetStarted}>
                    Get started
                  </Button>
                </Box>
              </>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left', mt: 0.5 }}>
              By Yiftach Peleg
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}
