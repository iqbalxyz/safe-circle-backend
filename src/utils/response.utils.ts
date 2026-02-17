/** HTTP status codes used throughout the application */
export const HTTP_RESPONSE_STATUS_CODE = {
  STATUS_OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_IMPLEMENTED: 501,
  INTERNAL_SERVER_ERROR: 500,
  DATA_EXIST: -100
} as const;
