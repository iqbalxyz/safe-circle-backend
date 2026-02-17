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
