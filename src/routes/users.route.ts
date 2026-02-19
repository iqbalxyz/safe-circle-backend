import { Router } from 'express';
import { updateUserSchema, userIdParamSchema, userSchema } from '../schemas/users.schema';
import {
  deleteUserController,
  getSpecificUserController,
  getUsersController,
  patchUserController
} from '../modules/controllers/users.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const usersRoute = Router();

usersRoute.get(`/`, validate(userSchema), authenticate, getUsersController);

usersRoute.get(
  `/:id`,
  validate(userIdParamSchema, 'params'),
  authenticate,
  getSpecificUserController
);

usersRoute.patch(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema.partial(), 'body'),
  authenticate,
  patchUserController
);

usersRoute.delete(
  '/:id',
  validate(userIdParamSchema, 'params'),
  authenticate,
  deleteUserController
);

export default usersRoute;
