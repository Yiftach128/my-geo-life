import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(3000),
  GEOCODER_BASE_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  // Nominatim rejects stock library/browser User-Agents. App name only by default —
  // no personal info in committed code; override in a local .env to add a contact.
  GEOCODER_USER_AGENT: z.string().min(1).default('MyGeoLife/1.0'),
  GEOCODER_LANGUAGE: z.string().default('he,en'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

// A single, typed, validated source of truth for configuration. Nothing else in
// the codebase reads process.env directly.
export const config = {
  mongoUri: parsed.data.MONGO_URI,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  port: parsed.data.PORT,
  geocoderBaseUrl: parsed.data.GEOCODER_BASE_URL,
  geocoderUserAgent: parsed.data.GEOCODER_USER_AGENT,
  geocoderLanguage: parsed.data.GEOCODER_LANGUAGE,
} as const;

export type Config = typeof config;
