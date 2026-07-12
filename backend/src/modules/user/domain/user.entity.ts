/** A geocoded address: the picked location's display label plus its coordinates. */
export interface Address {
  label: string;
  lat: number;
  lon: number;
}

export type UserRole = 'user' | 'admin';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  tokenVersion: number;
  role: UserRole;
  createdAt: Date;
  address?: Address;
}

/**
 * Framework-free domain entity. Carries `passwordHash` and `tokenVersion`
 * (the domain truth the auth flow needs); the response DTO strips both before
 * anything reaches the client. No mongoose/express imports here.
 */
export class User {
  readonly id: string;
  name: string;
  email: string;
  passwordHash: string;
  tokenVersion: number;
  role: UserRole;
  readonly createdAt: Date;
  address?: Address;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.tokenVersion = props.tokenVersion;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.address = props.address;
  }
}
