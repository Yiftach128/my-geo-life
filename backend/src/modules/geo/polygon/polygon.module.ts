import { Router, RequestHandler } from 'express';
import { PolygonModel } from './persistence/polygon.model.js';
import { PolygonRepository } from './repository/polygon.repository.js';
import { PolygonService } from './polygon.service.js';
import { PolygonController } from './polygon.controller.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { validateBody } from '../../../shared/http/validate-body.js';
import { createPolygonSchema, CreatePolygonDto } from './dto/create-polygon.dto.js';
import { updatePolygonSchema, UpdatePolygonDto } from './dto/update-polygon.dto.js';

export interface PolygonModuleDeps {
  authenticate: RequestHandler;
}

export function buildPolygonModule(deps: PolygonModuleDeps): Router {
  const repository = new PolygonRepository(PolygonModel);
  const service = new PolygonService(repository);
  const controller = new PolygonController(service);

  const router = Router();
  router.use(deps.authenticate);

  router.get('/', asyncHandler(controller.getAll));
  router.get('/:id', asyncHandler(controller.getById));
  router.post('/', validateBody(createPolygonSchema, CreatePolygonDto), asyncHandler(controller.create));
  router.put('/:id', validateBody(updatePolygonSchema, UpdatePolygonDto), asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.delete));

  return router;
}
