import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export class LoginDto {
  readonly email: string;
  readonly password: string;

  constructor(data: LoginInput) {
    this.email = data.email;
    this.password = data.password;
  }
}
