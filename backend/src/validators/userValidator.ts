import { z } from 'zod';

export const createUserSchema = z.object({
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

export const updateUserSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be less than 50 characters' })
    .optional(),
  email: z.email({ error: 'Invalid email format' }).optional(),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, { message: 'Password must be less than 64 characters' })
    .optional(),
  age: z.number()
    .min(0, { message: 'Age must be a positive number' })
    .max(120, { message: 'Age must be less than 120' })
    .optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;