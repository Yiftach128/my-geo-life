import { Polygon } from '../domain/polygon.entity.js';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

export class PolygonResponseDto {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description?: string;
  readonly points: Point[];
  readonly style: GeoStyle;
  readonly createdAt: Date;

  private constructor(props: {
    id: string;
    ownerId: string;
    name: string;
    description?: string;
    points: Point[];
    style: GeoStyle;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.name = props.name;
    this.description = props.description;
    this.points = props.points;
    this.style = props.style;
    this.createdAt = props.createdAt;
  }

  static fromDomain(polygon: Polygon): PolygonResponseDto {
    return new PolygonResponseDto({
      id: polygon.id,
      ownerId: polygon.ownerId,
      name: polygon.name,
      description: polygon.description,
      points: polygon.points,
      style: polygon.style,
      createdAt: polygon.createdAt,
    });
  }
}
