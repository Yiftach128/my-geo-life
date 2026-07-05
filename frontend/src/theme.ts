import { createTheme } from '@mui/material/styles';

/** App-wide system UI font stack (Segoe UI on Windows, SF on macOS, Roboto on Android). */
export const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const theme = createTheme({
  typography: { fontFamily: SYSTEM_FONT },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Same font for Leaflet's own text (attribution/controls) and the map-label
        // tooltips that inherit from the container. Doubled class raises specificity
        // above leaflet.css regardless of stylesheet load order.
        '.leaflet-container.leaflet-container': { fontFamily: SYSTEM_FONT },
      },
    },
  },
});
