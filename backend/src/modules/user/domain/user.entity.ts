export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  tokenVersion: number;
  createdAt: Date;
  age?: number;
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
  readonly createdAt: Date;
  age?: number;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.tokenVersion = props.tokenVersion;
    this.createdAt = props.createdAt;
    this.age = props.age;
  }
}
