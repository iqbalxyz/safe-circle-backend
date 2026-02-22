import 'dotenv/config';
import express, { type Application } from 'express';
import appMiddleware from './middleware/cors.middleware';
import './utils/bigint.util';

const app: Application = express();
const port: number = process.env.PORT != null ? parseInt(process.env.PORT) : 4000;

app.use(appMiddleware);

app.listen(port, () => {
  console.log(`App listen on port ${port}`);
});
