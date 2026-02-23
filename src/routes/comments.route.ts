import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  addCommentToIncidentController,
  deleteCommentController,
  getCommentsFromIncidentController,
  patchCommentController
} from '../modules/controllers/comments.controller';
import { incidentCommentsSchema, postCommentsBodySchema } from '../schemas/comments.schema';
import { incidentDetailParamsSchema } from '../schemas/incidents.schema';

const incidentCommentsRoute = Router();

incidentCommentsRoute.get(
  '/:id/comments',
  validate(incidentDetailParamsSchema, 'params'),
  authenticate,
  getCommentsFromIncidentController
);

incidentCommentsRoute.post(
  '/:id/comments',
  validate(incidentDetailParamsSchema, 'params'),
  validate(postCommentsBodySchema, 'body'),
  authenticate,
  addCommentToIncidentController
);

incidentCommentsRoute.patch(
  '/:id/comments/:id',
  validate(incidentCommentsSchema, 'params'),
  validate(postCommentsBodySchema.partial(), 'body'),
  authenticate,
  patchCommentController
);

incidentCommentsRoute.delete(
  '/:id/comments/:id',
  validate(incidentCommentsSchema, 'params'),
  authenticate,
  deleteCommentController
);

export default incidentCommentsRoute;
