import * as z from 'zod';

export const userLoginValidationSchema = z.object({
  email: z.email(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }).optional()
});

export const refreshValidationSchema = z.object({
  refreshToken: z.string()
});

export type UserLoginRequest = z.infer<typeof userLoginValidationSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshValidationSchema>;

export type InternalLoginRequest = UserLoginRequest & {
  skipPasswordCheck?: boolean;
};

export const verifyOtpValidationSchema = z.object({
  email: z.email('Invalid email address'),
  otpCode: z.string().length(6, 'OTP code must be 6 digits')
});

export type VerifyOtpRequest = z.infer<typeof verifyOtpValidationSchema>;

export const resetPasswordValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
  otpCode: z.string().length(6, 'OTP code must be 6 digits'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordValidationSchema>;
