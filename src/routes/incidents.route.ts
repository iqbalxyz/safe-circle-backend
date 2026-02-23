import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  createIncidentController,
  deleteIncidentController,
  getIncidentDetailController,
  getIncidentsController,
  updateIncidentStatusController
} from '../modules/controllers/incident.controller';
import {
  incidentDetailParamsSchema,
  incidentQuerySchema,
  postIncidentSchema,
  updateIncidentStatusBodySchema,
  updateIncidentStatusParamsSchema,
  updateIncidentStatusQuerySchema
} from '../schemas/incidents.schema';
import { verifyIncidentController } from '../modules/controllers/verification.controller';

const incidentsRoute = Router();

incidentsRoute.get(
  '/',
  validate(incidentQuerySchema, 'query'),
  authenticate,
  getIncidentsController
);

incidentsRoute.get(
  '/:id',
  validate(incidentDetailParamsSchema, 'params'),
  authenticate,
  getIncidentDetailController
);

incidentsRoute.post(
  '/',
  validate(postIncidentSchema, 'body'),
  authenticate,
  createIncidentController
);

incidentsRoute.patch(
  '/:id',
  validate(updateIncidentStatusParamsSchema, 'params'),
  validate(updateIncidentStatusQuerySchema, 'query'),
  validate(updateIncidentStatusBodySchema.partial(), 'body'),
  authenticate,
  updateIncidentStatusController
);

incidentsRoute.delete(
  '/:id',
  validate(incidentDetailParamsSchema, 'params'),
  authenticate,
  deleteIncidentController
);

incidentsRoute.patch(
  '/:id/verify',
  validate(incidentDetailParamsSchema, 'params'),
  authenticate,
  verifyIncidentController
);

export default incidentsRoute;
