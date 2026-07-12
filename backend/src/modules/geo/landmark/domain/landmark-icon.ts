/**
 * Single source of truth for the preset landmark icons. The chosen key is
 * stored in the landmark's `iconUrl` field (a preset key, not a URL) and the
 * frontend maps each key to a Material icon glyph tinted by the landmark color.
 */
export const LANDMARK_ICON_KEYS = [
  'place',
  'restaurant',
  'park',
  'home',
  'star',
  'flag',
  'shopping',
  'hotel',
  'museum',
  'warning',
  'gym',
  'favorite',
  'pets',
  'viewpoint',
  'blocked',
  'attraction',
] as const;

export type LandmarkIconKey = (typeof LANDMARK_ICON_KEYS)[number];

/** Default icon applied when a client omits one on create (mirrors DEFAULT_COLOR). */
export const DEFAULT_ICON: LandmarkIconKey = 'place';
