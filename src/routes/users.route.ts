import { Router } from 'express';
import { userSchema } from '../schemas/users.schema';
import { getUsersController } from '../modules/controllers/users.controller';
import { validate } from '../middleware/validate.middleware';

const usersRoute = Router();

usersRoute.get(`/users`, validate(userSchema), getUsersController);

export default usersRoute;
