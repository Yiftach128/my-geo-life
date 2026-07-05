/**
 * Framework-free geographic coordinate (WGS84). Shared value object embedded by
 * every geo entity (landmark position, circle center, polygon vertices). No
 * mongoose/zod imports here — persistence and validation live in their own layers.
 */
export interface Point {
  lat: number;
  lng: number;
}
