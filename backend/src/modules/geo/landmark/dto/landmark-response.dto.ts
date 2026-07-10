import { Landmark } from '../domain/landmark.entity.js';
import { Point } from '../../shared/domain/point.js';

/**
 * Outbound DTO. Translating a domain Landmark through this is what defines the
 * public API shape (camelCase, no mongoose internals).
 */
export class LandmarkResponseDto {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description?: string;
  readonly position: Point;
  readonly iconUrl?: string;
  readonly color?: string;
  readonly addressLabel: string | null;
  readonly createdAt: Date;

  private constructor(props: {
    id: string;
    ownerId: string;
    name: string;
    description?: string;
    position: Point;
    iconUrl?: string;
    color: string;
    addressLabel: string | null;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.name = props.name;
    this.description = props.description;
    this.position = props.position;
    this.iconUrl = props.iconUrl;
    this.color = props.color;
    this.addressLabel = props.addressLabel;
    this.createdAt = props.createdAt;
  }

  static fromDomain(landmark: Landmark): LandmarkResponseDto {
    return new LandmarkResponseDto({
      id: landmark.id,
      ownerId: landmark.ownerId,
      name: landmark.name,
      description: landmark.description,
      position: landmark.position,
      iconUrl: landmark.iconUrl,
      color: landmark.color,
      addressLabel: landmark.addressLabel,
      createdAt: landmark.createdAt,
    });
  }
}
