import { Router, type Request, type Response } from 'express';

const healthCheckRouter = Router();

healthCheckRouter.get('/health-check', (req: Request, res: Response) => {
  res.status(200).json({ message: 'System Operational' });
});

export default healthCheckRouter;
