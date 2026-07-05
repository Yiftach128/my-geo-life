import { Point } from '../../shared/domain/point.js';

export interface LandmarkProps {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  position: Point;
  iconUrl?: string;
  color: string;
  createdAt: Date;
}

/**
 * Framework-free domain entity for a single point marker. No mongoose/express
 * imports here; the response DTO shapes what reaches the client.
 */
export class Landmark {
  readonly id: string;
  readonly ownerId: string;
  name: string;
  description?: string;
  position: Point;
  iconUrl?: string;
  color: string;
  readonly createdAt: Date;

  constructor(props: LandmarkProps) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.name = props.name;
    this.description = props.description;
    this.position = props.position;
    this.iconUrl = props.iconUrl;
    this.color = props.color;
    this.createdAt = props.createdAt;
  }
}
