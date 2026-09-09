# syntax=docker/dockerfile:1
# One image for the whole app: Express serves the API and the built React app
# on a single port. Build context is the repo root so both apps are visible.

# ---- frontend: type-check and bundle the React app ----
FROM node:24-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- backend: compile TypeScript, then drop dev dependencies ----
FROM node:24-alpine AS backend-build
WORKDIR /build
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

# ---- runtime: compiled API + production deps + static frontend, nothing else ----
FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    STATIC_DIR=/app/public
WORKDIR /app
# package.json is needed at runtime for "type": "module"
COPY --from=backend-build /build/package.json ./
COPY --from=backend-build /build/node_modules ./node_modules
COPY --from=backend-build /build/dist ./dist
COPY --from=frontend-build /build/dist ./public
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
