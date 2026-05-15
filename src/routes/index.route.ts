import { Router } from 'express';
import authRoute from './auth.route';
import incidentCommentsRoute from './comments.route';
import healthCheckRoute from './health-check.route';
import incidentsRoute from './incidents.route';
import usersRoute from './users.route';

const app = Router();

app.use('/api/health-check', healthCheckRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/incidents', incidentsRoute);
app.use('/api/incidents', incidentCommentsRoute);

export default app;
