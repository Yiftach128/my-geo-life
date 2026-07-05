import { Request, Response } from 'express';
import { IUserService } from './user.service.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

/**
 * Thin HTTP adapter: read the validated DTO off the request, call the service,
 * translate the domain result to a response DTO. No try/catch (asyncHandler),
 * no business logic, no status-code decisions beyond the happy path :) :) :)
 */
export class UserController {
  constructor(private readonly userService: IUserService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.getAll();
    res.json(users.map((user) => UserResponseDto.fromDomain(user)));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.getById(req.params.id as string);
    res.json(UserResponseDto.fromDomain(user));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.create(req.dto as CreateUserDto);
    res.status(201).json(UserResponseDto.fromDomain(user));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.update(req.params.id as string, req.dto as UpdateUserDto);
    res.json(UserResponseDto.fromDomain(user));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.userService.delete(req.params.id as string);
    res.sendStatus(204);
  };
}
