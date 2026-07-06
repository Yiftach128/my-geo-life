import { User, Address } from '../domain/user.entity.js';

/**
 * Outbound DTO. Translating a domain User through this is what guarantees
 * `passwordHash` and `tokenVersion` never reach the client (replaces the old
 * mongoose `toJSON` transform).
 */
export class UserResponseDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
  readonly address?: Address;

  private constructor(props: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    address?: Address;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.createdAt = props.createdAt;
    this.address = props.address;
  }

  static fromDomain(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      address: user.address,
    });
  }
}
