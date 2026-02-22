import { Router } from 'express';
import healthCheckRoute from './health-check.route';
import usersRoute from './users.route';
import authRoute from './auth.route';
import incidentsRoute from './incidents.route';

const app = Router();

app.use('/health-check', healthCheckRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/incidents', incidentsRoute);

export default app;
