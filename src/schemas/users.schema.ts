import * as z from 'zod';

// Your existing schemas
export const userSchema = z.object({
  fullName: z.string().optional().default('')
});

export const createUserSchema = z.object({
  fullName: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
  email: z.email(),
  password: z.string().min(8, { message: 'Password must be at least 9 characters' })
});

export const updateUserSchema = z.object({
  fullName: z.string().min(3, { message: 'Name must be at least 3 characters long' }).optional(),
  email: z.email().optional(),
  password: z.string().min(8, { message: 'Password must be at least 9 characters' }).optional(),
  profileImage: z.string().optional(),
  role: z.enum(['resident', 'admin']).optional()
});

// Add this for validating user ID in params
export const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

export type User = z.infer<typeof userSchema>;
export type CreateUserBodyRequest = z.infer<typeof createUserSchema>;
export type UpdateUserBodyRequest = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
