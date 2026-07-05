import { Request, Response } from 'express';
import { ILandmarkService } from './landmark.service.js';
import { LandmarkResponseDto } from './dto/landmark-response.dto.js';
import { CreateLandmarkDto } from './dto/create-landmark.dto.js';
import { UpdateLandmarkDto } from './dto/update-landmark.dto.js';

/**
 * Thin HTTP adapter. The owner is always taken from the authenticated user
 * (`req.user`, guaranteed by the authenticate middleware), never the body.
 * No try/catch (asyncHandler), no business logic.
 */
export class LandmarkController {
  constructor(private readonly service: ILandmarkService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const items = await this.service.getAll(req.user!.id);
    res.json(items.map((item) => LandmarkResponseDto.fromDomain(item)));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.getById(req.params.id as string, req.user!.id);
    res.json(LandmarkResponseDto.fromDomain(item));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.create(req.dto as CreateLandmarkDto, req.user!.id);
    res.status(201).json(LandmarkResponseDto.fromDomain(item));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.update(
      req.params.id as string,
      req.dto as UpdateLandmarkDto,
      req.user!.id,
    );
    res.json(LandmarkResponseDto.fromDomain(item));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.params.id as string, req.user!.id);
    res.sendStatus(204);
  };
}
