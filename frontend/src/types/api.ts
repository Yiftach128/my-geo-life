export interface Point {
  lat: number;
  lng: number;
}

export interface GeoStyle {
  strokeColor: string;
  fillColor: string;
  weight: number;
  opacity: number;
  fillOpacity: number;
  dashArray?: string;
}

export const DEFAULT_COLOR = '#3388ff';

/** Zoom level used when flying the map to a single point (address search, landmark click). */
export const POINT_FLY_ZOOM = 16;

export const DEFAULT_GEO_STYLE: GeoStyle = {
  strokeColor: DEFAULT_COLOR,
  fillColor: DEFAULT_COLOR,
  weight: 3,
  opacity: 1,
  fillOpacity: 0.2,
};

/** A geocoded address: the picked location's display label plus its coordinates. */
export interface Address {
  label: string;
  lat: number;
  lon: number;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  address?: Address;
}

export interface AuthResponse {
  user: UserDto;
  token: string;
}

export interface LandmarkDto {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  position: Point;
  iconUrl?: string;
  color: string;
  addressLabel: string | null;
  createdAt: string;
}

export interface CircleDto {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  center: Point;
  radius: number;
  style: GeoStyle;
  addressLabel: string | null;
  createdAt: string;
}

export interface PolygonDto {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  points: Point[];
  style: GeoStyle;
  addressLabel: string | null;
  createdAt: string;
}

export interface CreateLandmarkPayload {
  name: string;
  position: Point;
  color?: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateLandmarkPayload {
  name?: string;
  description?: string;
  color?: string;
  position?: Point;
  iconUrl?: string;
}

export interface CreateCirclePayload {
  name: string;
  center: Point;
  radius: number;
  style?: Partial<GeoStyle>;
  description?: string;
}

export interface UpdateCirclePayload {
  name?: string;
  description?: string;
  style?: Partial<GeoStyle>;
}

export interface CreatePolygonPayload {
  name: string;
  points: Point[];
  style?: Partial<GeoStyle>;
  description?: string;
}

export interface UpdatePolygonPayload {
  name?: string;
  description?: string;
  style?: Partial<GeoStyle>;
}

export type SelectedItem =
  | { type: 'landmark'; item: LandmarkDto }
  | { type: 'circle'; item: CircleDto }
  | { type: 'polygon'; item: PolygonDto };

import type L from 'leaflet';

export function toPathOptions(style: GeoStyle): L.PathOptions {
  return {
    color: style.strokeColor,
    fillColor: style.fillColor,
    weight: style.weight,
    opacity: style.opacity,
    fillOpacity: style.fillOpacity,
    dashArray: style.dashArray,
  };
}
