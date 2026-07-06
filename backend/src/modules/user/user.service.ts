import { IUserRepository } from './repository/user.repository.interface.js';
import { IPasswordHasher } from '../../shared/security/password-hasher.js';
import { User } from './domain/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { NotFoundError, ConflictError, UnauthorizedError } from '../../shared/errors/index.js';

export interface IUserService {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
  create(dto: CreateUserDto): Promise<User>;
  update(id: string, dto: UpdateUserDto): Promise<User>;
  changePassword(id: string, dto: ChangePasswordDto): Promise<void>;
  delete(id: string): Promise<void>;
}

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  getAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await this.passwordHasher.hash(dto.password);
    return this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      address: dto.address,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const updated = await this.userRepository.update(id, {
      name: dto.name,
      address: dto.address,
    });
    if (!updated) throw new NotFoundError('User not found');
    return updated;
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.getById(id); // throws NotFoundError when missing

    const isMatch = await this.passwordHasher.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('Current password is incorrect');

    const passwordHash = await this.passwordHasher.hash(dto.newPassword);
    await this.userRepository.update(id, { passwordHash });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) throw new NotFoundError('User not found');
  }
}
