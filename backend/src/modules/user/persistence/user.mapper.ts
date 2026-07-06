import { HydratedDocument } from 'mongoose';
import { User } from '../domain/user.entity.js';
import { IUserSchema } from './user.model.js';

/**
 * Translates between the Mongoose document (persistence) and the framework-free
 * domain entity. Keeps mongoose out of services, controllers and the domain.
 */
export class UserMapper {
  static toDomain(doc: HydratedDocument<IUserSchema>): User {
    return new User({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.password,
      tokenVersion: doc.tokenVersion,
      createdAt: doc.createdAt,
      address: doc.address
        ? { label: doc.address.label, lat: doc.address.lat, lon: doc.address.lon }
        : undefined,
    });
  }
}
