/**
 * Framework-free geographic coordinate (WGS84). Shared value object embedded by
 * every geo entity (landmark position, circle center, polygon vertices). No
 * mongoose/zod imports here — persistence and validation live in their own layers.
 */
export interface Point {
  lat: number;
  lng: number;
}

/**
 * Vertex-average centroid: the mean of the given coordinates. Used to reduce a
 * polygon (which has no single location) to one representative point for reverse
 * geocoding. Fine for a display label; it does not account for antimeridian
 * crossings, and for a concave polygon the mean can fall outside the shape.
 */
export function centroid(points: Point[]): Point {
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}
