import { config } from './shared/config/env.js';
import { connectToDatabase } from './shared/database/connection.js';
import { buildApp } from './app.js';

async function bootstrap(): Promise<void> {
  await connectToDatabase(config.mongoUri);
  const app = buildApp();
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
