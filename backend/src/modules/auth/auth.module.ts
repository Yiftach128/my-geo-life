import { Router } from 'express';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { IUserRepository } from '../user/repository/user.repository.interface.js';
import { IPasswordHasher } from '../../shared/security/password-hasher.js';
import { ITokenService } from '../../shared/security/token.service.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validateBody } from '../../shared/http/validate-body.js';
import { createAuthenticate } from '../../shared/http/authenticate.js';
import { registerSchema, RegisterDto } from './dto/register.dto.js';
import { loginSchema, LoginDto } from './dto/login.dto.js';

export interface AuthModuleDeps {
  userRepository: IUserRepository;
  passwordHasher: IPasswordHasher;
  tokenService: ITokenService;
}

/**
 * Self-wires the auth feature. Reuses the user repository handed in by the
 * composition root (auth → user), and builds its own protect middleware for
 * the logout route.
 */
export function buildAuthModule(deps: AuthModuleDeps): { router: Router } {
  const authService = new AuthService(deps.userRepository, deps.passwordHasher, deps.tokenService);
  const controller = new AuthController(authService);
  const authenticate = createAuthenticate(deps.tokenService, deps.userRepository);

  const router = Router();
  router.post('/register', validateBody(registerSchema, RegisterDto), asyncHandler(controller.register));
  router.post('/login', validateBody(loginSchema, LoginDto), asyncHandler(controller.login));
  router.post('/logout', authenticate, asyncHandler(controller.logout));

  return { router };
}
