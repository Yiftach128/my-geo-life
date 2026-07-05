import { Router, RequestHandler } from 'express';
import { LandmarkModel } from './persistence/landmark.model.js';
import { LandmarkRepository } from './repository/landmark.repository.js';
import { LandmarkService } from './landmark.service.js';
import { LandmarkController } from './landmark.controller.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { validateBody } from '../../../shared/http/validate-body.js';
import { createLandmarkSchema, CreateLandmarkDto } from './dto/create-landmark.dto.js';
import { updateLandmarkSchema, UpdateLandmarkDto } from './dto/update-landmark.dto.js';

export interface LandmarkModuleDeps {
  authenticate: RequestHandler;
}

/**
 * Self-wires the landmark feature (repo → service → controller) and returns its
 * router. Receives the shared `authenticate` handler from the geo module.
 */
export function buildLandmarkModule(deps: LandmarkModuleDeps): Router {
  const repository = new LandmarkRepository(LandmarkModel);
  const service = new LandmarkService(repository);
  const controller = new LandmarkController(service);

  const router = Router();
  router.use(deps.authenticate); // protect all routes below

  router.get('/', asyncHandler(controller.getAll));
  router.get('/:id', asyncHandler(controller.getById));
  router.post('/', validateBody(createLandmarkSchema, CreateLandmarkDto), asyncHandler(controller.create));
  router.put('/:id', validateBody(updateLandmarkSchema, UpdateLandmarkDto), asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.delete));

  return router;
}
