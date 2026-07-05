import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be less than 50 characters' }),
  email: z.email({ error: 'Invalid email format' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, { message: 'Password must be less than 64 characters' }),
  age: z
    .number()
    .min(0, { message: 'Age must be a positive number' })
    .max(120, { message: 'Age must be less than 120' })
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Simple data holder. Built from already-validated input by validateBody. */
export class CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly age?: number;

  constructor(data: CreateUserInput) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.age = data.age;
  }
}
