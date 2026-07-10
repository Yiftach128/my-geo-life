import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

export interface PolygonProps {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  points: Point[];
  style: GeoStyle;
  addressLabel: string | null;
  createdAt: Date;
}

/**
 * Framework-free domain entity for an arbitrary closed shape. Covers squares AND
 * custom polygons — a square is just a 4-point polygon. `points` are ordered
 * vertices; the renderer closes the shape.
 */
export class Polygon {
  readonly id: string;
  readonly ownerId: string;
  name: string;
  description?: string;
  points: Point[];
  style: GeoStyle;
  addressLabel: string | null;
  readonly createdAt: Date;

  constructor(props: PolygonProps) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.name = props.name;
    this.description = props.description;
    this.points = props.points;
    this.style = props.style;
    this.addressLabel = props.addressLabel;
    this.createdAt = props.createdAt;
  }
}
