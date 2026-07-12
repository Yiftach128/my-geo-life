import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authorizeSelf } from '../src/shared/http/authorize-self.js';
import { requireAdmin } from '../src/shared/http/require-admin.js';
import { ForbiddenError, UnauthorizedError } from '../src/shared/errors/index.js';
import type { User, UserRole } from '../src/modules/user/domain/user.entity.js';

/** Minimal req: the guards only read `params.id` and `user.{id,role}`. */
const makeReq = (params: Record<string, string>, user?: Partial<User>): Request =>
  ({ params, user: user as User | undefined }) as unknown as Request;

const fakeUser = (id: string, role: UserRole = 'user'): Partial<User> => ({ id, role });

const res = {} as Response;

describe('authorizeSelf', () => {
  it('passes when :id matches the authenticated user', () => {
    const next = vi.fn() as unknown as NextFunction;
    authorizeSelf(makeReq({ id: 'abc' }, fakeUser('abc')), res, next);
    expect(next).toHaveBeenCalledWith(); // next() with no error
  });

  it('rejects a foreign id with ForbiddenError (403)', () => {
    const next = vi.fn() as unknown as NextFunction;
    authorizeSelf(makeReq({ id: 'someone-else' }, fakeUser('abc')), res, next);
    const err = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.statusCode).toBe(403);
  });

  it('rejects when no user is attached with UnauthorizedError (401)', () => {
    const next = vi.fn() as unknown as NextFunction;
    authorizeSelf(makeReq({ id: 'abc' }, undefined), res, next);
    expect((next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeInstanceOf(
      UnauthorizedError,
    );
  });
});

describe('requireAdmin', () => {
  it('passes for an admin user', () => {
    const next = vi.fn() as unknown as NextFunction;
    requireAdmin(makeReq({}, fakeUser('abc', 'admin')), res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a non-admin user with ForbiddenError (403)', () => {
    const next = vi.fn() as unknown as NextFunction;
    requireAdmin(makeReq({}, fakeUser('abc', 'user')), res, next);
    const err = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.statusCode).toBe(403);
  });

  it('rejects when no user is attached with UnauthorizedError (401)', () => {
    const next = vi.fn() as unknown as NextFunction;
    requireAdmin(makeReq({}, undefined), res, next);
    expect((next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
