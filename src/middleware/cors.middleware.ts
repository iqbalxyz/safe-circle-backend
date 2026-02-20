import express from 'express';
import '../utils/winston.util';
import cors from 'cors';
import app from '../routes/index.route';
import cookieParser from 'cookie-parser';

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
appMiddleware.use(app);

export default appMiddleware;
