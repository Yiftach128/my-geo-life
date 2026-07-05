import { IUserRepository } from '../user/repository/user.repository.interface.js';
import { IPasswordHasher } from '../../shared/security/password-hasher.js';
import { ITokenService } from '../../shared/security/token.service.js';
import { User } from '../user/domain/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors/index.js';

export interface AuthResult {
  user: User;
  token: string;
}

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResult>;
  login(dto: LoginDto): Promise<AuthResult>;
  logout(userId: string): Promise<void>;
}

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      age: dto.age,
    });

    const token = await this.tokenService.sign({ id: user.id, version: user.tokenVersion });
    return { user, token };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const isMatch = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('Invalid email or password');

    const token = await this.tokenService.sign({ id: user.id, version: user.tokenVersion });
    return { user, token };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.incrementTokenVersion(userId);
  }
}
