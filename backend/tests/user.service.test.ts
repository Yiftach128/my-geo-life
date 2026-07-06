import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../src/modules/user/user.service.js';
import { CreateUserDto } from '../src/modules/user/dto/create-user.dto.js';
import { UpdateUserDto } from '../src/modules/user/dto/update-user.dto.js';
import { ChangePasswordDto } from '../src/modules/user/dto/change-password.dto.js';
import { InMemoryUserRepository } from './helpers/in-memory-user.repository.js';
import { NotFoundError, ConflictError, UnauthorizedError } from '../src/shared/errors/index.js';
import { IPasswordHasher } from '../src/shared/security/password-hasher.js';

class FakeHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return hashed === `hashed:${plain}`;
  }
}

describe('UserService', () => {
  let repo: InMemoryUserRepository;
  let service: UserService;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    service = new UserService(repo, new FakeHasher());
  });

  const create = (email = 'bob@example.com') =>
    service.create(new CreateUserDto({ name: 'Bob Bits', email, password: 'secret123' }));

  it('hashes the password on create (regression for the original plaintext bug)', async () => {
    const user = await create();
    expect(user.passwordHash).toBe('hashed:secret123');
  });

  it('throws ConflictError on a duplicate email', async () => {
    await create();
    await expect(create()).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws NotFoundError when getting a missing user', async () => {
    await expect(service.getById('nope')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when updating a missing user', async () => {
    await expect(
      service.update('nope', new UpdateUserDto({ name: 'Renamed' })),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when deleting a missing user', async () => {
    await expect(service.delete('nope')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('hashes the new password on change when the current password matches', async () => {
    const user = await create();
    await service.changePassword(
      user.id,
      new ChangePasswordDto({ oldPassword: 'secret123', newPassword: 'brandnew1' }),
    );
    const updated = await service.getById(user.id);
    expect(updated.passwordHash).toBe('hashed:brandnew1');
  });

  it('rejects a password change when the current password is wrong', async () => {
    const user = await create();
    await expect(
      service.changePassword(
        user.id,
        new ChangePasswordDto({ oldPassword: 'wrongpass', newPassword: 'brandnew1' }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
