import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be less than 50 characters' }),
  email: z.email({ error: 'Invalid email format' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, { message: 'Password must be less than 64 characters' }),
  age: z.number()
    .min(0, { message: 'Age must be a positive number' })
    .max(120, { message: 'Age must be less than 120' })
    .optional()
});

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email format' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;