import { Response } from 'express';
import { HttpError } from './error.util';
import { logger } from './winston.util';

export const handleControllerError = (res: Response, error: unknown): void => {
  logger.error('Controller error:', error);

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode
    });
  } else {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: message,
      statusCode: 500
    });
  }
};
