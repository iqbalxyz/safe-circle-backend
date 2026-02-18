import { Router } from 'express';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userSchema
} from '../schemas/users.schema';
import {
  createUserController,
  getUsersController,
  patchUserController
} from '../modules/controllers/users.controller';
import { validate } from '../middleware/validate.middleware';

const usersRoute = Router();

usersRoute.get(`/`, validate(userSchema), getUsersController);
usersRoute.post(`/register`, validate(createUserSchema), createUserController);
usersRoute.patch(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema.partial(), 'body'),
  patchUserController
);

export default usersRoute;
