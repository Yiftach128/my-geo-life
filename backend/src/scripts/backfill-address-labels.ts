import mongoose from 'mongoose';
import { config } from '../shared/config/env.js';
import { connectToDatabase } from '../shared/database/connection.js';
import { GeocodingService } from '../modules/geo/geocode/geocode.service.js';
import { Point, centroid } from '../modules/geo/shared/domain/point.js';
import { LandmarkModel } from '../modules/geo/landmark/persistence/landmark.model.js';
import { CircleModel } from '../modules/geo/circle/persistence/circle.model.js';
import { PolygonModel } from '../modules/geo/polygon/persistence/polygon.model.js';

/**
 * One-time backfill: give every pre-existing geo object an `addressLabel` by
 * reverse-geocoding its representative location (landmark position / circle
 * center / polygon centroid). Idempotent — only rows whose `addressLabel` is
 * null or absent are touched, so it is safe to re-run. Reverse calls go through
 * the same throttled, cached GeocodingService the app uses, so this proceeds at
 * roughly one object per second.
 *
 * Run from backend/ with:  npm run backfill:address-labels
 */

const geocoder = new GeocodingService({
  baseUrl: config.geocoderBaseUrl,
  userAgent: config.geocoderUserAgent,
  language: config.geocoderLanguage,
});

/** Missing = never set (legacy rows) OR explicitly null (a prior lookup failed). */
const MISSING = { $or: [{ addressLabel: null }, { addressLabel: { $exists: false } }] };

async function reverseLabel(point: Point): Promise<string | null> {
  try {
    return (await geocoder.reverse(point.lat, point.lng)).label;
  } catch (err) {
    console.error(`  reverse failed for ${point.lat},${point.lng}:`, err);
    return null;
  }
}

async function backfill(): Promise<void> {
  await connectToDatabase(config.mongoUri);

  const landmarks = await LandmarkModel.find(MISSING);
  console.log(`landmarks: ${landmarks.length} to backfill`);
  for (const doc of landmarks) {
    doc.addressLabel = await reverseLabel(doc.position);
    await doc.save();
  }

  const circles = await CircleModel.find(MISSING);
  console.log(`circles: ${circles.length} to backfill`);
  for (const doc of circles) {
    doc.addressLabel = await reverseLabel(doc.center);
    await doc.save();
  }

  const polygons = await PolygonModel.find(MISSING);
  console.log(`polygons: ${polygons.length} to backfill`);
  for (const doc of polygons) {
    doc.addressLabel = await reverseLabel(centroid(doc.points));
    await doc.save();
  }

  console.log('Backfill complete.');
}

backfill()
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
