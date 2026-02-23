import * as z from 'zod';

export const userLoginValidationSchema = z.object({
  email: z.email(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
});

export const refreshValidationSchema = z.object({
  refreshToken: z.string()
});

export type UserLoginRequest = z.infer<typeof userLoginValidationSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshValidationSchema>;
