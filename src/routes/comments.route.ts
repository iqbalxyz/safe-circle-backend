import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  addCommentToIncidentController,
  deleteCommentController,
  getCommentsFromIncidentController,
  patchCommentController
} from '../modules/controllers/comments.controller';
import {
  incidentCommentsSchema,
  postCommentsBodySchema,
  postCommentsParamsSchema
} from '../schemas/comments.schema';

const incidentCommentsRoute = Router();

incidentCommentsRoute.get(
  '/:id/comments',
  validate(incidentCommentsSchema, 'params'),
  authenticate,
  getCommentsFromIncidentController
);

incidentCommentsRoute.post(
  '/:id/comments',
  validate(postCommentsParamsSchema, 'params'),
  validate(postCommentsBodySchema, 'body'),
  authenticate,
  addCommentToIncidentController
);

incidentCommentsRoute.patch(
  '/:id/comments/:id',
  validate(postCommentsParamsSchema, 'params'),
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
