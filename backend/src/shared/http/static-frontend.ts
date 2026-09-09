import express, { Router, Request, Response, NextFunction } from 'express';
import path from 'node:path';

/** Request paths owned by the API; never answered with the SPA shell. */
const API_PREFIXES = ['/api', '/auth'];

/**
 * Serves the built React app from `staticDir`, for the production image where
 * Express is the only server. Not mounted in dev, where Vite serves the
 * frontend and proxies API calls here.
 *
 * Vite hashes everything under `assets/`, so those files are cached for a year.
 * Everything else (index.html, favicon) is `no-cache` so a new deploy shows up
 * on the next load. Any other GET/HEAD outside the API falls back to index.html
 * so client-side routes survive a refresh. API paths fall through untouched, so
 * an unknown API route still 404s instead of returning HTML.
 */
export function staticFrontend(staticDir: string): Router {
  const router = Router();
  const indexHtml = path.join(staticDir, 'index.html');

  router.use(
    express.static(staticDir, {
      index: false,
      setHeaders: (res, filePath) => {
        const hashed = path.relative(staticDir, filePath).split(path.sep)[0] === 'assets';
        res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'no-cache');
      },
    }),
  );

  router.use((req: Request, res: Response, next: NextFunction) => {
    const isPageRequest = req.method === 'GET' || req.method === 'HEAD';
    const isApiPath = API_PREFIXES.some((prefix) => req.path.startsWith(prefix));
    if (!isPageRequest || isApiPath) {
      next();
      return;
    }
    res.set('Cache-Control', 'no-cache');
    res.sendFile(indexHtml);
  });

  return router;
}
