import { createTheme } from '@mui/material/styles';

/** App-wide system UI font stack (Segoe UI on Windows, SF on macOS, Roboto on Android). */
export const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Single source of truth for corner rounding across every button and overlay. */
const RADIUS = 8;

export const theme = createTheme({
  shape: { borderRadius: RADIUS },
  typography: { fontFamily: SYSTEM_FONT },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Same font for Leaflet's own text (attribution/controls) and the map-label
        // tooltips that inherit from the container. Doubled class raises specificity
        // above leaflet.css regardless of stylesheet load order.
        '.leaflet-container.leaflet-container': { fontFamily: SYSTEM_FONT },
        // Match Leaflet's zoom control to the app's radius (leaflet.css hardcodes 4px).
        '.leaflet-bar': { borderRadius: `${RADIUS}px` },
        '.leaflet-bar a:first-of-type': {
          borderTopLeftRadius: `${RADIUS}px`,
          borderTopRightRadius: `${RADIUS}px`,
        },
        '.leaflet-bar a:last-of-type': {
          borderBottomLeftRadius: `${RADIUS}px`,
          borderBottomRightRadius: `${RADIUS}px`,
        },
      },
    },
    // All buttons read as one neutral, white control that greys on hover — no
    // colored accent. Destructive "Delete" (color="error") keeps its red text via
    // the more-specific outlinedError slot.
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none' },
        contained: ({ theme }) => ({
          backgroundColor: '#fff',
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': { backgroundColor: theme.palette.grey[100] },
        }),
        outlined: ({ theme }) => ({
          backgroundColor: '#fff',
          color: theme.palette.text.primary,
          borderColor: theme.palette.divider,
          '&:hover': {
            backgroundColor: theme.palette.grey[100],
            borderColor: theme.palette.grey[400],
          },
        }),
        text: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&:hover': { backgroundColor: theme.palette.grey[100] },
        }),
      },
    },
    // Toggle buttons match: white default, grey hover, grey (not blue) selection.
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: '#fff',
          '&:hover': { backgroundColor: theme.palette.grey[100] },
          '&.Mui-selected': {
            backgroundColor: theme.palette.grey[300],
            '&:hover': { backgroundColor: theme.palette.grey[400] },
          },
        }),
      },
    },
    // Opaque input so the SearchBar reads cleanly over the map (previously an
    // inline bgcolor); harmless for the form inputs, which already sit on white.
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: '#fff' },
      },
    },
  },
});
