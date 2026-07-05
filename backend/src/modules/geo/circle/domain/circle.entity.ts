import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

export interface CircleProps {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  center: Point;
  radius: number;
  style: GeoStyle;
  createdAt: Date;
}

/**
 * Framework-free domain entity for a filled circular area. `radius` is in meters
 * (Leaflet reads L.circle radius as meters on a real map).
 */
export class Circle {
  readonly id: string;
  readonly ownerId: string;
  name: string;
  description?: string;
  center: Point;
  radius: number;
  style: GeoStyle;
  readonly createdAt: Date;

  constructor(props: CircleProps) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.name = props.name;
    this.description = props.description;
    this.center = props.center;
    this.radius = props.radius;
    this.style = props.style;
    this.createdAt = props.createdAt;
  }
}
