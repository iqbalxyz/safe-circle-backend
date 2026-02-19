import { Router } from 'express';
import healthCheckRoute from './health-check.route';
import usersRoute from './users.route';
import authRoute from './auth.routes';

const app = Router();

app.use('/health-check', healthCheckRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);

export default app;
