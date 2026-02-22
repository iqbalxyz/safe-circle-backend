import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
  refreshValidationSchema,
  userLoginValidationSchema,
  userLogoutValidationSchema
} from '../schemas/auth.schema';
import { createUserSchema } from '../schemas/users.schema';
import {
  loginAuthController,
  logoutAuthController,
  refreshAccessTokenController,
  registerAuthController
} from '../modules/controllers/auth.controller';

const authRoute = Router();

authRoute.post('/login', validate(userLoginValidationSchema), loginAuthController);
authRoute.post('/register', validate(createUserSchema), registerAuthController);
authRoute.post('/refresh', validate(refreshValidationSchema), refreshAccessTokenController);
authRoute.post('/logout', validate(userLogoutValidationSchema), logoutAuthController);

export default authRoute;
