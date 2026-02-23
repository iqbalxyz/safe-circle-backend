import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { refreshValidationSchema, userLoginValidationSchema } from '../schemas/auth.schema';
import { createUserSchema } from '../schemas/users.schema';
import {
  loginAuthController,
  logoutAuthController,
  refreshAccessTokenController,
  registerAuthController
} from '../modules/controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const authRoute = Router();

authRoute.post('/login', validate(userLoginValidationSchema), loginAuthController);
authRoute.post('/register', validate(createUserSchema), registerAuthController);
authRoute.post('/refresh', validate(refreshValidationSchema), refreshAccessTokenController);
authRoute.post('/logout', authenticate, logoutAuthController);

export default authRoute;
