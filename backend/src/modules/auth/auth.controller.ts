import { Request, Response } from 'express';
import { IAuthService } from './auth.service.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UnauthorizedError } from '../../shared/errors/index.js';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await this.authService.register(req.dto as RegisterDto);
    res.status(201).json(AuthResponseDto.fromDomain(user, token));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await this.authService.login(req.dto as LoginDto);
    res.json(AuthResponseDto.fromDomain(user, token));
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError('Not authenticated');
    await this.authService.logout(req.user.id);
    res.json({ message: 'Logged out successfully' });
  };
}
