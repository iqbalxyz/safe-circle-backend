import 'dotenv/config';
import express, { type Application } from 'express';
import appMiddleware from './middleware/cors.middleware';
import limiter from './middleware/rate-limiter.middleware';
import './utils/bigint.util';

const app: Application = express();
const port: number = process.env.PORT != null ? parseInt(process.env.PORT) : 4000;

app.use(appMiddleware);

app.set('trust proxy', 1);
app.use(limiter);

// Debug routes (remove this in production)
app.get('/debug-ip', (req, res) => {
  res.json({
    ip: req.ip,
    headers: req.headers['x-forwarded-for']
  });
});

app.listen(port, () => {
  console.log(`App listen on port ${port}`);
});
