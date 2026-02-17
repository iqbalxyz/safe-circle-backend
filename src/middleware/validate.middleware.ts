import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the entire request object against the schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for better readability
        const formattedErrors = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors
        });
      } else {
        // Handle unexpected errors
        res.status(500).json({
          success: false,
          error: 'Internal server error during validation'
        });
      }
    }
  };
};
