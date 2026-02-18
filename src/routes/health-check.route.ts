import { Router } from 'express';
import { db } from '../db/database';
import { sql } from 'kysely';

const healthCheckRouter = Router();

healthCheckRouter.get('/', async (req, res) => {
  try {
    await sql`SELECT 1`.execute(db);

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        server: { status: 'up', uptime: process.uptime() },
        database: { status: 'up' }
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
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
