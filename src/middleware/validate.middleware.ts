import { RequestHandler } from 'express';
import * as z from 'zod';

export const validate =
  <T extends z.ZodTypeAny>(
    schema: T,
    source: 'body' | 'params' | 'query' = 'body'
  ): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
      return;
    }

    req[source] = result.data; // runtime overwrite
    next();
  };
