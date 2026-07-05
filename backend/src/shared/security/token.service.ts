import { SignJWT, jwtVerify } from 'jose';

export interface TokenPayload {
  id: string;
  version: number;
}

export interface ITokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}

export interface TokenServiceConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export class TokenService implements ITokenService {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;

  constructor(config: TokenServiceConfig) {
    this.secret = new TextEncoder().encode(config.jwtSecret);
    this.expiresIn = config.jwtExpiresIn;
  }

  async sign(payload: TokenPayload): Promise<string> {
    return new SignJWT({ id: payload.id, version: payload.version })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
  }

  async verify(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.secret);
    return {
      id: payload.id as string,
      version: payload.version as number,
    };
  }
}
