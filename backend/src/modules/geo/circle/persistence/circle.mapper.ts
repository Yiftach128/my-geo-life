import { HydratedDocument } from 'mongoose';
import { Circle } from '../domain/circle.entity.js';
import { ICircleSchema } from './circle.model.js';

export class CircleMapper {
  static toDomain(doc: HydratedDocument<ICircleSchema>): Circle {
    return new Circle({
      id: doc._id.toString(),
      ownerId: doc.owner.toString(),
      name: doc.name,
      description: doc.description,
      center: { lat: doc.center.lat, lng: doc.center.lng },
      radius: doc.radius,
      style: {
        strokeColor: doc.style.strokeColor,
        fillColor: doc.style.fillColor,
        weight: doc.style.weight,
        opacity: doc.style.opacity,
        fillOpacity: doc.style.fillOpacity,
        dashArray: doc.style.dashArray,
      },
      createdAt: doc.createdAt,
    });
  }
}
