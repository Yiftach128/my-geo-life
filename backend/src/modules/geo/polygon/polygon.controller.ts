import { Request, Response } from 'express';
import { IPolygonService } from './polygon.service.js';
import { PolygonResponseDto } from './dto/polygon-response.dto.js';
import { CreatePolygonDto } from './dto/create-polygon.dto.js';
import { UpdatePolygonDto } from './dto/update-polygon.dto.js';

export class PolygonController {
  constructor(private readonly service: IPolygonService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const items = await this.service.getAll(req.user!.id);
    res.json(items.map((item) => PolygonResponseDto.fromDomain(item)));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.getById(req.params.id as string, req.user!.id);
    res.json(PolygonResponseDto.fromDomain(item));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.create(req.dto as CreatePolygonDto, req.user!.id);
    res.status(201).json(PolygonResponseDto.fromDomain(item));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.update(
      req.params.id as string,
      req.dto as UpdatePolygonDto,
      req.user!.id,
    );
    res.json(PolygonResponseDto.fromDomain(item));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.params.id as string, req.user!.id);
    res.sendStatus(204);
  };
}
