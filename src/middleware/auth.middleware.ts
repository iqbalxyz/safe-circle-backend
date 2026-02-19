import { Request, Response } from 'express';
import { Next } from 'mysql2/typings/mysql/lib/parsers/typeCast';
import { verifyAccessToken } from '../utils/jwt.util';

export const authenticate = (req: Request, res: Response, next: Next): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token === undefined) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token Verification Failed',
      data: null
    });
  }
  const user = verifyAccessToken(String(token));
  if (user === null) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid Token ',
      data: null
    });
  }
  next();
};
