import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import type { SvgIconComponent } from '@mui/icons-material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ParkIcon from '@mui/icons-material/Park';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import FlagIcon from '@mui/icons-material/Flag';
import StoreIcon from '@mui/icons-material/Store';
import HotelIcon from '@mui/icons-material/Hotel';
import MuseumIcon from '@mui/icons-material/Museum';
import WarningIcon from '@mui/icons-material/Warning';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PetsIcon from '@mui/icons-material/Pets';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import AttractionsIcon from '@mui/icons-material/Attractions';

/**
 * Single source of truth for the preset landmark icons (frontend side). Keys
 * mirror the backend's LANDMARK_ICON_KEYS; the key is stored in the landmark's
 * `iconUrl` field. Used by both the edit-form picker and the map renderer.
 */
export const LANDMARK_ICONS = {
  place: { label: 'Place', Icon: LocationOnIcon },
  restaurant: { label: 'Restaurant', Icon: RestaurantIcon },
  park: { label: 'Park', Icon: ParkIcon },
  home: { label: 'Home', Icon: HomeIcon },
  star: { label: 'Star', Icon: StarIcon },
  flag: { label: 'Flag', Icon: FlagIcon },
  shopping: { label: 'Shopping', Icon: StoreIcon },
  hotel: { label: 'Hotel', Icon: HotelIcon },
  museum: { label: 'Museum', Icon: MuseumIcon },
  warning: { label: 'Warning', Icon: WarningIcon },
  gym: { label: 'Gym', Icon: FitnessCenterIcon },
  favorite: { label: 'Favorite', Icon: FavoriteIcon },
  pets: { label: 'Pets', Icon: PetsIcon },
  viewpoint: { label: 'Viewpoint', Icon: VisibilityIcon },
  blocked: { label: 'No access', Icon: NotInterestedIcon },
  attraction: { label: 'Attraction', Icon: AttractionsIcon },
} satisfies Record<string, { label: string; Icon: SvgIconComponent }>;

export type IconKey = keyof typeof LANDMARK_ICONS;

export const LANDMARK_ICON_KEYS = Object.keys(LANDMARK_ICONS) as IconKey[];

export const DEFAULT_ICON: IconKey = 'place';

/** Narrow an arbitrary stored value to a known preset key, falling back to the default. */
export function resolveIconKey(key: string | undefined): IconKey {
  return key !== undefined && key in LANDMARK_ICONS ? (key as IconKey) : DEFAULT_ICON;
}

const SIZE = 30;
const iconCache = new Map<string, L.DivIcon>();

/**
 * Build a Leaflet marker icon showing the preset glyph tinted by `color`.
 * The color is applied inline as `fill` on the <svg> (SVG fill is inherited by
 * the child <path>s), so tinting does not depend on MUI's injected CSS being
 * present in the Leaflet-managed DOM. Results are memoized by key + color.
 */
export function landmarkDivIcon(key: string | undefined, color: string): L.DivIcon {
  const iconKey = resolveIconKey(key);
  const cacheKey = `${iconKey}|${color}`;
  const cached = iconCache.get(cacheKey);
  if (cached) return cached;

  const { Icon } = LANDMARK_ICONS[iconKey];
  // renderToStaticMarkup may prepend an Emotion <style> block; strip it since the
  // glyph is fully styled inline (width/height/fill) and we don't want stray
  // <style> tags injected into every Leaflet marker.
  const svg = renderToStaticMarkup(
    <Icon style={{ width: SIZE, height: SIZE, fill: color, color }} />,
  ).replace(/<style[\s\S]*?<\/style>/g, '');
  const divIcon = L.divIcon({
    className: '',
    html: `<div style="width:${SIZE}px;height:${SIZE}px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.55))">${svg}</div>`,
    iconSize: [SIZE, SIZE],
    iconAnchor: [SIZE / 2, SIZE / 2],
  });
  iconCache.set(cacheKey, divIcon);
  return divIcon;
}
