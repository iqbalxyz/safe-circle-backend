import { Router } from 'express';
import healthCheckRoute from './health-check.route';
import usersRoute from './users.route';

const app = Router();

app.use('/api', healthCheckRoute);
app.use('/api/users', usersRoute);

export default app;
