import * as z from 'zod';

export const userSchema = z.object({
  fullName: z.string().optional().default('')
});

export const createUserSchema = z.object({
  fullName: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
  email: z.email(),
  password: z.string().min(8, { message: 'Password must be at least 9 characters' })
});

export const updateUserSchema = z.object({
  fullName: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
  email: z.email(),
  password: z.string().min(8, { message: 'Password must be at least 9 characters' })
});

export type CreateUserBodyRequest = z.infer<typeof createUserSchema>;
export type UpdateUserBodyRequest = z.infer<typeof updateUserSchema>;
