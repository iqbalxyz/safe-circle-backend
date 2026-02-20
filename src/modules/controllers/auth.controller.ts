import { Request, Response } from 'express';
import { handleControllerError } from '../../utils/error-handler.util';
import {
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  registerUserService
} from '../services/auth.service';
import { getRefreshConfig } from '../../utils/jwt.util';
import { logger } from '../../utils/winston.util';

/**
 * Controller to handle POST requests for creating a new user.
 * @params {Request} req - The Express request object, containing the user data in the request body.
 * @params {Response} res - The Express response object, used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when the response is sent. The response includes a success message and the created user data (excluding the password hash) if the user is created successfully, or an error message if there is an issue during user creation.
 **/
export const registerAuthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUserService(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for user login.
 * @param req - The Express request object, containing the user's login credentials (email and password) in the request body.
 * @param res - The Express response object, used to send the response back to the client. If the login is successful, the response includes a success message, the authenticated user information (excluding the password hash), and an access token. If there is an issue during login (e.g., invalid credentials), an error message is sent in the response.
 */
export const loginAuthController = async (req: Request, res: Response) => {
  try {
    const { user, accessToken, refreshToken } = await loginUserService(req.body);
    const { milliseconds } = getRefreshConfig();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: milliseconds
    });

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: { user, accessToken, refreshToken }
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for refreshing an access token.
 * @param req - The Express request object, containing the refresh token in the request body or cookies.
 * @param res - The Express response object, used to send the new access token back to the client. If there is an issue during refresh (e.g., invalid refresh token), an error message is sent in the response.
 */
export const refreshAccessTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const tokens = await refreshAccessTokenService(refreshToken);

    res.cookie('refreshToken', tokens.newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.json({ accessToken: tokens.accessToken, newRefreshToken: tokens.newRefreshToken });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for user logout.
 * @param req - The Express request object, containing the refresh token in the cookies. The controller will use this token to invalidate the user's session and log them out. If there is an issue during logout (e.g., invalid refresh token), an error message is sent in the response.
 * @param res - The Express response object, used to send a success message back to the client if the logout is successful, or an error message if there is an issue during logout.
 * @returns A promise that resolves when the response is sent. The response includes a success message if the logout is successful, or an error message if there is an issue during logout.
 */
// logout.controller.ts
export const logoutAuthController = async (req: Request, res: Response) => {
  console.log('Cookies Object:', req.cookies);

  // This must match the name used in Login exactly!
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    logger.warn('Token not found in cookies');
  } else {
    const result = await logoutUserService(refreshToken);
    console.log('Database Deletion Result:', result);
  }

  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out' });
};
