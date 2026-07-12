import { Box, Paper, Typography } from '@mui/material';

interface Props {
  /** When provided, the logo becomes a button that (re)opens the WelcomeCard. */
  onClick?: () => void;
}

/**
 * My Geo Life wordmark shown in the bottom-right corner of the map. When given `onClick` it
 * acts as a button that reopens the WelcomeCard (the parent overlay must enable pointerEvents
 * for it to receive clicks); without it, it's purely decorative.
 * The pin matches the favicon (public/my-geo-life-icon.svg) so the tab and app read as one brand.
 */
export function BrandLogo({ onClick }: Props) {
  return (
    <Paper
      elevation={2}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'About My Geo Life' : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        bgcolor: 'rgba(255, 255, 255, 0.92)',
        ...(onClick && {
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
        }),
      }}
    >
      <Box component="svg" viewBox="0 0 32 32" aria-hidden sx={{ width: 20, height: 20, flexShrink: 0 }}>
        <path
          fill="#1976d2"
          d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10z"
        />
        <circle cx="16" cy="12" r="3.75" fill="#fff" />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.2, lineHeight: 1 }}>
        My Geo Life
      </Typography>
    </Paper>
  );
}
