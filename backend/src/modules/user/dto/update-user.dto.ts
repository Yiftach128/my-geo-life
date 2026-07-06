import { z } from 'zod';
import { addressSchema } from './address.schema.js';
import { Address } from '../domain/user.entity.js';

// Profile edits are limited to name and address. Email is immutable, and password
// changes go through the dedicated PUT /passwordchange/:id endpoint (which
// reauthenticates with the current password) — never this one.
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be less than 50 characters' })
    .optional(),
  address: addressSchema.optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export class UpdateUserDto {
  readonly name?: string;
  readonly address?: Address;

  constructor(data: UpdateUserInput) {
    this.name = data.name;
    this.address = data.address;
  }
}
