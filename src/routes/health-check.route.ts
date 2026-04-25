import { Router } from 'express';
import { db } from '../db/database';
import { sql } from 'kysely';
import { format } from 'date-fns';

const healthCheckRouter = Router();

healthCheckRouter.get('/', async (req, res) => {
  try {
    await sql`SELECT 1`.execute(db);

    res.status(200).json({
      status: 'healthy',
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      services: {
        server: { status: 'up', uptime: process.uptime() },
        database: { status: 'up' }
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      services: {
        server: { status: 'up', uptime: process.uptime() },
        database: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Database connection failed'
        }
      }
    });
  }
});

export default healthCheckRouter;
