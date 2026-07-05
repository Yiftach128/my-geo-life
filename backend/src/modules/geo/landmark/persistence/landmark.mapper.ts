import { HydratedDocument } from 'mongoose';
import { Landmark } from '../domain/landmark.entity.js';
import { ILandmarkSchema } from './landmark.model.js';

/**
 * Translates the Mongoose document (persistence) into the framework-free domain
 * entity, keeping mongoose out of services, controllers and the domain.
 */
export class LandmarkMapper {
  static toDomain(doc: HydratedDocument<ILandmarkSchema>): Landmark {
    return new Landmark({
      id: doc._id.toString(),
      ownerId: doc.owner.toString(),
      name: doc.name,
      description: doc.description,
      position: { lat: doc.position.lat, lng: doc.position.lng },
      iconUrl: doc.iconUrl,
      color: doc.color,
      createdAt: doc.createdAt,
    });
  }
}
