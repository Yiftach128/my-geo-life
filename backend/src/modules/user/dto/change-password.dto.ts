import { z } from 'zod';

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, { message: 'Password must be less than 64 characters' }),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export class ChangePasswordDto {
  readonly oldPassword: string;
  readonly newPassword: string;

  constructor(data: ChangePasswordInput) {
    this.oldPassword = data.oldPassword;
    this.newPassword = data.newPassword;
  }
}
