import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { RegisterDto } from '../src/modules/auth/dto/register.dto.js';
import { LoginDto } from '../src/modules/auth/dto/login.dto.js';
import { InMemoryUserRepository } from './helpers/in-memory-user.repository.js';
import { ConflictError, UnauthorizedError } from '../src/shared/errors/index.js';
import { IPasswordHasher } from '../src/shared/security/password-hasher.js';
import { ITokenService, TokenPayload } from '../src/shared/security/token.service.js';

class FakeHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return hashed === `hashed:${plain}`;
  }
}

class FakeTokenService implements ITokenService {
  async sign(payload: TokenPayload): Promise<string> {
    return `token:${payload.id}:${payload.version}`;
  }
  async verify(token: string): Promise<TokenPayload> {
    const [, id, version] = token.split(':');
    return { id, version: Number(version) };
  }
}

describe('AuthService', () => {
  let repo: InMemoryUserRepository;
  let service: AuthService;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    service = new AuthService(repo, new FakeHasher(), new FakeTokenService());
  });

  const register = (overrides: Partial<{ name: string; email: string; password: string }> = {}) =>
    service.register(
      new RegisterDto({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'password123',
        ...overrides,
      }),
    );

  it('registers a user with a hashed password and returns a token', async () => {
    const { user, token } = await register();
    expect(user.email).toBe('ada@example.com');
    expect(user.passwordHash).toBe('hashed:password123');
    expect(token).toBe(`token:${user.id}:0`);
  });

  it('rejects a duplicate email with ConflictError', async () => {
    await register();
    await expect(register()).rejects.toBeInstanceOf(ConflictError);
  });

  it('logs in with correct credentials', async () => {
    await register();
    const { token } = await service.login(
      new LoginDto({ email: 'ada@example.com', password: 'password123' }),
    );
    expect(token).toContain('token:');
  });

  it('rejects an unknown email with UnauthorizedError', async () => {
    await expect(
      service.login(new LoginDto({ email: 'nobody@example.com', password: 'password123' })),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects a wrong password with UnauthorizedError', async () => {
    await register();
    await expect(
      service.login(new LoginDto({ email: 'ada@example.com', password: 'wrongpass' })),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('increments the token version on logout', async () => {
    const { user } = await register();
    await service.logout(user.id);
    const found = await repo.findById(user.id);
    expect(found?.tokenVersion).toBe(1);
  });
});
