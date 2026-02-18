import { HTTP_RESPONSE_STATUS_CODE } from './response.utils';

type HttpStatusCode = (typeof HTTP_RESPONSE_STATUS_CODE)[keyof typeof HTTP_RESPONSE_STATUS_CODE];

/**
 * Custom HTTP Error class with status code support
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: HttpStatusCode = HTTP_RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// Error factory object
export const HttpErrors = {
  forbidden: (message: string) => new HttpError(message, HTTP_RESPONSE_STATUS_CODE.FORBIDDEN),

  badRequest: (message: string) => new HttpError(message, HTTP_RESPONSE_STATUS_CODE.BAD_REQUEST),

  unauthorized: (message: string) => new HttpError(message, HTTP_RESPONSE_STATUS_CODE.UNAUTHORIZED),

  notFound: (message: string) => new HttpError(message, HTTP_RESPONSE_STATUS_CODE.NOT_FOUND),

  conflict: (message: string) => new HttpError(message, HTTP_RESPONSE_STATUS_CODE.CONFLICT),

  internal: (message: string) =>
    new HttpError(message, HTTP_RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR)
} as const;
