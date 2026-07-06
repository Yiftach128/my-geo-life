import { z } from 'zod';
import { addressSchema } from '../../user/dto/address.schema.js';
import { Address } from '../../user/domain/user.entity.js';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be less than 50 characters' }),
  email: z.email({ error: 'Invalid email format' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, { message: 'Password must be less than 64 characters' }),
  address: addressSchema.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export class RegisterDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly address?: Address;

  constructor(data: RegisterInput) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.address = data.address;
  }
}
