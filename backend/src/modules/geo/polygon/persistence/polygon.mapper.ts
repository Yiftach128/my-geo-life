import { HydratedDocument } from 'mongoose';
import { Polygon } from '../domain/polygon.entity.js';
import { IPolygonSchema } from './polygon.model.js';

export class PolygonMapper {
  static toDomain(doc: HydratedDocument<IPolygonSchema>): Polygon {
    return new Polygon({
      id: doc._id.toString(),
      ownerId: doc.owner.toString(),
      name: doc.name,
      description: doc.description,
      points: doc.points.map((p) => ({ lat: p.lat, lng: p.lng })),
      style: {
        strokeColor: doc.style.strokeColor,
        fillColor: doc.style.fillColor,
        weight: doc.style.weight,
        opacity: doc.style.opacity,
        fillOpacity: doc.style.fillOpacity,
        dashArray: doc.style.dashArray,
      },
      addressLabel: doc.addressLabel ?? null,
      createdAt: doc.createdAt,
    });
  }
}
