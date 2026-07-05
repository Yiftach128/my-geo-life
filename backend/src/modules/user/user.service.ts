import { IUserRepository } from './repository/user.repository.interface.js';
import { IPasswordHasher } from '../../shared/security/password-hasher.js';
import { User } from './domain/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { NotFoundError, ConflictError } from '../../shared/errors/index.js';

export interface IUserService {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
  create(dto: CreateUserDto): Promise<User>;
  update(id: string, dto: UpdateUserDto): Promise<User>;
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
      age: dto.age,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    if (dto.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictError('Email already in use');
    }

    // const passwordHash = dto.password
    //   ? await this.passwordHasher.hash(dto.password)
    //   : undefined;
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await this.passwordHasher.hash(dto.password);
    } else {
      passwordHash = undefined;
    }

    const updated = await this.userRepository.update(id, {
      name: dto.name,
      email: dto.email,
      age: dto.age,
      passwordHash,
    });
    if (!updated) throw new NotFoundError('User not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) throw new NotFoundError('User not found');
  }
}
