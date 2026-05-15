import { Request, Response } from 'express';
import { UserAuthRepository } from '../../db/repos/auth.repository';
import { OtpRepository } from '../../db/repos/otp.repository';
import { handleControllerError } from '../../utils/error-handler.util';
import { getRefreshTokenConfig } from '../../utils/jwt.util';
import { sendOtpEmail } from '../../utils/mailer.util'; // Imported utility
import { logger } from '../../utils/winston.util';
import {
  generateAndSaveOtpService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  registerUserService,
  resetPasswordService,
  verifyOtpService
} from '../services/auth.service';

/**
 * Controller to handle POST requests for creating a new user.
 **/
export const registerAuthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUserService(req.body);

    // Send registration OTP email - Passing full registration data for deferred insertion
    const { otpCode, expiryMinutes } = await generateAndSaveOtpService(
      result.user.email,
      req.body.fullName,
      req.body.password
    );
    sendOtpEmail({
      to: result.user.email,
      otpCode,
      expiresInMinutes: expiryMinutes,
      purpose: 'registration'
    }).catch((emailError) => {
      logger.error(
        `CRITICAL: Registration OTP delivery failed for ${result.user.email}:`,
        emailError
      );
    });

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please verify your email with the OTP sent to your inbox.',
      data: {
        user: result.user
      }
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for initiating a password reset.
 */
export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Email parameter is required' });
      return;
    }

    // Make sure user with the given email exists in the database.
    const users = await UserAuthRepository.getUserByEmail({ email: email });
    if (users.length === 0) {
      res.status(404).json({ success: false, error: 'No user found with this email address.' });
      return;
    }

    // Generate OTP for password reset
    const { otpCode, expiryMinutes } = await generateAndSaveOtpService(email);

    // Send forgot password OTP email
    sendOtpEmail({
      to: email,
      otpCode,
      expiresInMinutes: expiryMinutes,
      purpose: 'forgot-password'
    }).catch((emailError) => {
      logger.error(`CRITICAL: Forgot password OTP delivery failed for ${email}:`, emailError);
    });

    res.status(200).json({
      success: true,
      message: 'Password reset code dispatched to your inbox.'
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for user login.
 */
export const loginAuthController = async (req: Request, res: Response) => {
  try {
    const { user, accessToken, refreshToken } = await loginUserService(req.body);
    const { milliseconds } = getRefreshTokenConfig();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: milliseconds,
      path: '/'
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
 */
export const refreshAccessTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const tokens = await refreshAccessTokenService(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for user logout.
 */
export const logoutAuthController = async (req: Request, res: Response) => {
  let refreshToken = req.cookies?.refreshToken;

  if (!refreshToken && req.body?.refreshToken) {
    refreshToken = req.body.refreshToken;
    logger.info('Refresh token retrieved from request body');
  }

  if (refreshToken) {
    try {
      const result = await logoutUserService(refreshToken);
      console.log('Database Deletion Result:', result);

      if (Number(result.numDeletedRows) === 0) {
        logger.warn('No refresh token found in database to revoke');
      } else {
        logger.info(`Successfully revoked ${result.numDeletedRows} token(s)`);
      }
    } catch (error) {
      return handleControllerError(res, error);
    }
  } else {
    logger.warn('No refresh token provided in cookies or request body during logout');
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  return res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  });
};

/**
 * Controller to handle POST requests for resending an OTP.
 */
export const resendOtpController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // 1. Check for pending registration (unused OTP with metadata)
    const pendingOtp = await OtpRepository.findOtpByEmail(email);

    // 2. Check for existing user (for forgot password)
    const users = await UserAuthRepository.getUserByEmail({ email });
    const userExists = users.length > 0;

    if (!pendingOtp && !userExists) {
      res.status(404).json({
        success: false,
        error: 'No pending registration or user found with this email address.'
      });
      return;
    }

    let purpose: 'registration' | 'forgot-password' | 'resend' = 'resend';
    let fullName: string | undefined;
    let passwordHash: string | undefined;

    if (pendingOtp && pendingOtp.fullName) {
      // It's a registration resend
      purpose = 'registration';
      fullName = pendingOtp.fullName;
      passwordHash = pendingOtp.passwordHash;
    } else if (userExists) {
      // It's a forgot password resend
      purpose = 'forgot-password';
    }

    // Generate new OTP (passing through registration metadata if found)
    const { otpCode, expiryMinutes } = await generateAndSaveOtpService(
      email,
      fullName,
      undefined,
      passwordHash
    );

    // Resend OTP email with correct context
    await sendOtpEmail({
      to: email,
      otpCode,
      expiresInMinutes: expiryMinutes,
      purpose
    });

    res.status(200).json({
      success: true,
      message: `Verification code resent successfully for ${purpose.replace('-', ' ')}.`
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for verifying an OTP.
 */
export const verifyOtpController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpCode } = req.body;
    const result = await verifyOtpService(email, otpCode);

    if (!result) {
      res.status(401).json({ success: false, error: 'Invalid or expired OTP code' });
      return;
    }

    const { user, accessToken, refreshToken } = result;
    const { milliseconds } = getRefreshTokenConfig();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: milliseconds,
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Your account is now active/authenticated.',
      data: { user, accessToken, refreshToken }
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for resetting a password.
 */
export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpCode, newPassword } = req.body;
    const { user, accessToken, refreshToken } = await resetPasswordService(
      email,
      otpCode,
      newPassword
    );

    const { milliseconds } = getRefreshTokenConfig();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: milliseconds,
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You are now logged in.',
      data: { user, accessToken, refreshToken }
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};
