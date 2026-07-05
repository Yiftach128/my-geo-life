import { Router } from 'express';
import { UserModel } from './persistence/user.model.js';
import { UserRepository } from './repository/user.repository.js';
import { IUserRepository } from './repository/user.repository.interface.js';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { IPasswordHasher } from '../../shared/security/password-hasher.js';
import { ITokenService } from '../../shared/security/token.service.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validateBody } from '../../shared/http/validate-body.js';
import { createAuthenticate } from '../../shared/http/authenticate.js';
import { createUserSchema, CreateUserDto } from './dto/create-user.dto.js';
import { updateUserSchema, UpdateUserDto } from './dto/update-user.dto.js';

export interface UserModuleDeps {
  passwordHasher: IPasswordHasher;
  tokenService: ITokenService;
}

export interface UserModule {
  router: Router;
  userRepository: IUserRepository;
}

/**
 * Self-wires the user feature and returns its router. Also exposes its
 * `userRepository` so the composition root can hand it to the auth module
 * (the single cross-module dependency).
 */
export function buildUserModule(deps: UserModuleDeps): UserModule {
  const userRepository = new UserRepository(UserModel);
  const userService = new UserService(userRepository, deps.passwordHasher);
  const controller = new UserController(userService);
  const authenticate = createAuthenticate(deps.tokenService, userRepository);

  const router = Router();
  router.use(authenticate); // protect all routes below

  router.get('/', asyncHandler(controller.getAll));
  router.get('/:id', asyncHandler(controller.getById));

  //validateBody(CreateUserDto: the constructor of this class) - does validation + attacthes DTO to req
  router.post('/', validateBody(createUserSchema, CreateUserDto), asyncHandler(controller.create));
  router.put('/:id', validateBody(updateUserSchema, UpdateUserDto), asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.delete));

  return { router, userRepository };
}
