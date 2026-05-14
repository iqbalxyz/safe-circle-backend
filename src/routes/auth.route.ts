import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
  refreshValidationSchema,
  userLoginValidationSchema,
  verifyOtpValidationSchema,
  resetPasswordValidationSchema
} from '../schemas/auth.schema';
import { createUserSchema } from '../schemas/users.schema';
import {
  loginAuthController,
  logoutAuthController,
  refreshAccessTokenController,
  registerAuthController,
  forgotPasswordController,
  verifyOtpController,
  resendOtpController,
  resetPasswordController
} from '../modules/controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const authRoute = Router();

authRoute.post('/login', validate(userLoginValidationSchema), loginAuthController);
authRoute.post('/register', validate(createUserSchema), registerAuthController);
authRoute.post(
  '/forgot-password',
  validate(userLoginValidationSchema.pick({ email: true })),
  forgotPasswordController
);
authRoute.post('/verify-otp', validate(verifyOtpValidationSchema), verifyOtpController);
authRoute.post('/reset-password', validate(resetPasswordValidationSchema), resetPasswordController);

authRoute.post(
  '/resend-otp',
  validate(userLoginValidationSchema.pick({ email: true })),
  resendOtpController
);
authRoute.post('/refresh', validate(refreshValidationSchema), refreshAccessTokenController);
authRoute.post('/logout', authenticate, logoutAuthController);

export default authRoute;
