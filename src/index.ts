import 'dotenv/config';
import express, { type Application } from 'express';
import appMiddleware from './middleware/cors.middleware';
import { globalLimiter } from './middleware/rate-limiter.middleware';
import './utils/bigint.util';

const app: Application = express();
const port: number = process.env.PORT != null ? parseInt(process.env.PORT) : 4000;

app.use(appMiddleware);
app.use(globalLimiter);

app.set('trust proxy', 1);

app.listen(port, () => {
  console.log(`App listen on port ${port}`);
});
