import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  deleteUserController,
  getSpecificUserController,
  getUsersController,
  patchUserController
} from '../modules/controllers/users.controller';
import { updateUserSchema, userIdParamSchema, userSchema } from '../schemas/users.schema';

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
  authenticate,
  upload.single('image'),
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema.partial(), 'body'),
  patchUserController
);

usersRoute.delete(
  '/:id',
  validate(userIdParamSchema, 'params'),
  authenticate,
  deleteUserController
);

export default usersRoute;
