import { Router } from 'express';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userLoginValidationSchema,
  userSchema
} from '../schemas/users.schema';
import {
  createUserController,
  deleteUserController,
  getUsersController,
  patchUserController,
  userLoginController
} from '../modules/controllers/users.controller';
import { validate } from '../middleware/validate.middleware';

const usersRoute = Router();

usersRoute.get(`/users`, validate(userSchema), getUsersController);
usersRoute.post(`/users`, validate(createUserSchema), createUserController);
usersRoute.post('/users/login', validate(userLoginValidationSchema), userLoginController);
usersRoute.delete('/users/:id', validate(userIdParamSchema, 'params'), deleteUserController);
usersRoute.patch(
  '/users/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema.partial(), 'body'),
  patchUserController
);

export default usersRoute;
