import { User, Address } from '../domain/user.entity.js';

/** Already-hashed creation payload (the service hashes before calling). */
export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  address?: Address;
}

/** Partial, already-hashed update payload. Undefined fields are ignored. */
export interface UpdateUserData {
  name?: string;
  email?: string;
  passwordHash?: string;
  address?: Address;
}

/**
 * The persistence abstraction (DIP seam). Returns/accepts domain `User`
 * objects only — never mongoose documents. `create`/`update` may throw
 * `ConflictError` when a write violates the unique-email index.
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  incrementTokenVersion(id: string): Promise<void>;
}
