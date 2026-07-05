import { User } from '../../user/domain/user.entity.js';
import { UserResponseDto } from '../../user/dto/user-response.dto.js';

/** Outbound shape for register/login: `{ user, token }`. */
export class AuthResponseDto {
  readonly user: UserResponseDto;
  readonly token: string;

  private constructor(user: UserResponseDto, token: string) {
    this.user = user;
    this.token = token;
  }

  static fromDomain(user: User, token: string): AuthResponseDto {
    return new AuthResponseDto(UserResponseDto.fromDomain(user), token);
  }
}
