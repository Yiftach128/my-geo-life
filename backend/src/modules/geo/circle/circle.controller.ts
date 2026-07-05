import { Request, Response } from 'express';
import { ICircleService } from './circle.service.js';
import { CircleResponseDto } from './dto/circle-response.dto.js';
import { CreateCircleDto } from './dto/create-circle.dto.js';
import { UpdateCircleDto } from './dto/update-circle.dto.js';

export class CircleController {
  constructor(private readonly service: ICircleService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const items = await this.service.getAll(req.user!.id);
    res.json(items.map((item) => CircleResponseDto.fromDomain(item)));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.getById(req.params.id as string, req.user!.id);
    res.json(CircleResponseDto.fromDomain(item));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.create(req.dto as CreateCircleDto, req.user!.id);
    res.status(201).json(CircleResponseDto.fromDomain(item));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.update(
      req.params.id as string,
      req.dto as UpdateCircleDto,
      req.user!.id,
    );
    res.json(CircleResponseDto.fromDomain(item));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.params.id as string, req.user!.id);
    res.sendStatus(204);
  };
}
