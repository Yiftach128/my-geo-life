import { Router, RequestHandler } from 'express';
import { CircleModel } from './persistence/circle.model.js';
import { CircleRepository } from './repository/circle.repository.js';
import { CircleService } from './circle.service.js';
import { CircleController } from './circle.controller.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { validateBody } from '../../../shared/http/validate-body.js';
import { createCircleSchema, CreateCircleDto } from './dto/create-circle.dto.js';
import { updateCircleSchema, UpdateCircleDto } from './dto/update-circle.dto.js';

export interface CircleModuleDeps {
  authenticate: RequestHandler;
}

export function buildCircleModule(deps: CircleModuleDeps): Router {
  const repository = new CircleRepository(CircleModel);
  const service = new CircleService(repository);
  const controller = new CircleController(service);

  const router = Router();
  router.use(deps.authenticate);

  router.get('/', asyncHandler(controller.getAll));
  router.get('/:id', asyncHandler(controller.getById));
  router.post('/', validateBody(createCircleSchema, CreateCircleDto), asyncHandler(controller.create));
  router.put('/:id', validateBody(updateCircleSchema, UpdateCircleDto), asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.delete));

  return router;
}
