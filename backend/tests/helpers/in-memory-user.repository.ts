import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '../../src/modules/user/repository/user.repository.interface.js';
import { User } from '../../src/modules/user/domain/user.entity.js';

/**
 * Test double for IUserRepository. Lets services be unit-tested with zero
 * MongoDB dependency — the payoff of the repository + DI seams.
 */
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private seq = 0;

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async create(data: CreateUserData): Promise<User> {
    const user = new User({
      id: String(++this.seq),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      tokenVersion: 0,
      role: 'user',
      createdAt: new Date(),
      address: data.address,
    });
    this.users.push(user);
    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.passwordHash !== undefined) user.passwordHash = data.passwordHash;
    if (data.address !== undefined) user.address = data.address;
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }

  async incrementTokenVersion(id: string): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (user) user.tokenVersion += 1;
  }
}
