import { Circle } from '../domain/circle.entity.js';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

export class CircleResponseDto {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description?: string;
  readonly center: Point;
  readonly radius: number;
  readonly style: GeoStyle;
  readonly createdAt: Date;

  private constructor(props: {
    id: string;
    ownerId: string;
    name: string;
    description?: string;
    center: Point;
    radius: number;
    style: GeoStyle;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.name = props.name;
    this.description = props.description;
    this.center = props.center;
    this.radius = props.radius;
    this.style = props.style;
    this.createdAt = props.createdAt;
  }

  static fromDomain(circle: Circle): CircleResponseDto {
    return new CircleResponseDto({
      id: circle.id,
      ownerId: circle.ownerId,
      name: circle.name,
      description: circle.description,
      center: circle.center,
      radius: circle.radius,
      style: circle.style,
      createdAt: circle.createdAt,
    });
  }
}
