import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { emailVerificationLimiter } from '../middleware/rate-limiter.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  forgotPasswordController,
  loginAuthController,
  logoutAuthController,
  refreshAccessTokenController,
  registerAuthController,
  resendOtpController,
  resetPasswordController,
  verifyOtpController
} from '../modules/controllers/auth.controller';
import {
  refreshValidationSchema,
  resetPasswordValidationSchema,
  userLoginValidationSchema,
  verifyOtpValidationSchema
} from '../schemas/auth.schema';
import { createUserSchema } from '../schemas/users.schema';

const authRoute = Router();

// EMAIL VERIFICATION ROUTES
authRoute.post(
  '/register',
  validate(createUserSchema),
  emailVerificationLimiter,
  registerAuthController
);
authRoute.post(
  '/forgot-password',
  validate(userLoginValidationSchema.pick({ email: true })),
  emailVerificationLimiter,
  forgotPasswordController
);
authRoute.post(
  '/resend-otp',
  validate(userLoginValidationSchema.pick({ email: true })),
  emailVerificationLimiter,
  resendOtpController
);

// AUTH ROUTES
authRoute.post('/login', validate(userLoginValidationSchema), loginAuthController);
authRoute.post('/refresh', validate(refreshValidationSchema), refreshAccessTokenController);
authRoute.post('/logout', authenticate, logoutAuthController);
authRoute.post('/reset-password', validate(resetPasswordValidationSchema), resetPasswordController);
authRoute.post('/verify-otp', validate(verifyOtpValidationSchema), verifyOtpController);

export default authRoute;
