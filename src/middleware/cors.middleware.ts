import '../utils/winston.util';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import app from '../routes/index.route';

const appMiddleware = express();

appMiddleware.use(
  cors({
    origin: true,
    credentials: true,
    preflightContinue: false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  })
);

appMiddleware.options('*', cors());
appMiddleware.use(express.json());
appMiddleware.use(cookieParser());
appMiddleware.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
appMiddleware.use(app);

export default appMiddleware;
