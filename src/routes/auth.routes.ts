import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { userLoginValidationSchema } from '../schemas/auth.schema';
import { createUserSchema } from '../schemas/users.schema';
import {
  loginAuthController,
  registerAuthController
} from '../modules/controllers/auth.controller';

const authRoute = Router();

authRoute.post('/login', validate(userLoginValidationSchema), loginAuthController);
authRoute.post('/register', validate(createUserSchema), registerAuthController);

export default authRoute;
