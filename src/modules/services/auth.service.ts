import bcrypt from 'bcrypt';
import { Users, UsersInsert } from '../../db/entities/users.entity';
import { UserAuthRepository } from '../../db/repos/auth.repository';
import { OtpRepository } from '../../db/repos/otp.repository';
import { UsersRepository } from '../../db/repos/users.repository';
import { UserLoginRequest } from '../../schemas/auth.schema';
import { CreateUserBodyRequest } from '../../schemas/users.schema';
import { HttpErrors } from '../../utils/error.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../../utils/jwt.util';
import { sanitizeUser } from '../../utils/user-sanitizer.util';
import { logger } from '../../utils/winston.util';

// ================= REGISTER =================

export const registerUserService = async (
  data: CreateUserBodyRequest
): Promise<{
  user: Omit<Users, 'passwordHash' | 'id' | 'createdAt' | 'profileImgUrl'>;
}> => {
  logger.info('createUser: processing request', { email: data.email });

  const existingUser = await UsersRepository.getUsers({ email: data.email });
  if (existingUser.length > 0) {
    throw HttpErrors.conflict('User with this email already exists');
  }

  return {
    user: {
      fullName: data.fullName,
      email: data.email,
      role: 'resident'
    }
  };
};

// ================= LOGIN =================

export const loginUserService = async (
  data: UserLoginRequest,
  skipPasswordCheck: boolean = false
): Promise<{ user: Omit<Users, 'passwordHash'>; accessToken: string; refreshToken: string }> => {
  logger.info('userLogin: processing login request', { email: data.email, skipPasswordCheck });

  const users = await UserAuthRepository.getUserByEmail({ email: data.email });

  if (users.length === 0) {
    throw HttpErrors.unauthorized('Invalid email');
  }

  const user = users[0]!;

  // Only run password verification if skipPasswordCheck is explicitly false
  if (!skipPasswordCheck) {
    if (!data.password) {
      throw HttpErrors.badRequest('Password is required for standard login');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw HttpErrors.unauthorized('Invalid password');
    }
  }

  // 🔑 JWT PAYLOAD MUST MATCH req.user.id
  const payload = {
    id: user.id,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);

  const { token: refreshToken, expiresInSeconds } = generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  await UserAuthRepository.createSession({
    user_id: user.id,
    refresh_token: refreshToken,
    expires_at: expiresAt
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};

// ================= REFRESH TOKEN =================

export const refreshAccessTokenService = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const decoded = verifyRefreshToken(refreshToken) as {
    id: number;
    role: string;
  };

  const session = await UserAuthRepository.getSessionByToken(refreshToken);

  if (!session) {
    throw HttpErrors.unauthorized('Invalid or revoked refresh token');
  }

  if (new Date(session.expiresAt) < new Date()) {
    await UserAuthRepository.deleteSession(session.id);
    throw HttpErrors.unauthorized('Refresh token expired');
  }

  const payload = {
    id: decoded.id,
    role: decoded.role
  };

  const accessToken = generateAccessToken(payload);

  const { token: newRefreshToken, expiresInSeconds } = generateRefreshToken(payload);

  // revoke old session
  await UserAuthRepository.deleteSession(session.id);

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  await UserAuthRepository.createSession({
    user_id: decoded.id,
    refresh_token: newRefreshToken,
    expires_at: expiresAt
  });

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
};

// ================= LOGOUT =================

export const logoutUserService = async (refreshToken: string) => {
  return await UserAuthRepository.revokeRefreshToken(refreshToken);
};

// ================= SEND EMAIL FOR REGISTRATION OR FORGOT PASSWORD =================

export const generateAndSaveOtpService = async (
  email: string,
  fullName?: string,
  password?: string,
  existingPasswordHash?: string
): Promise<{ otpCode: string; expiryMinutes: number }> => {
  const numericOtp = Math.floor(100000 + Math.random() * 900000);
  const otpCode = String(numericOtp);
  const expiryMinutes = 10;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60000);

  let passwordHash: string | undefined = existingPasswordHash;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  // Check if OTP already exists for the email (for resending)
  const existingOtp = await OtpRepository.findOtpByEmail(email);
  if (existingOtp) {
    await OtpRepository.markOtpAsUsed(existingOtp.id);
  }

  // Directly leverage the decoupled repository interface
  await OtpRepository.createOtp({ email, otpCode, expiresAt, fullName, passwordHash });

  return { otpCode, expiryMinutes };
};

// ================= VERIFY OTP =================

export const verifyOtpService = async (
  email: string,
  otpCode: string
): Promise<{
  user: Omit<Users, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
} | null> => {
  const activeOtp = await OtpRepository.findValidOtp(email, otpCode);

  if (!activeOtp) {
    return null;
  }

  let user: Omit<Users, 'passwordHash'>;

  // Check if this was a registration OTP (contains fullName and passwordHash)
  if (activeOtp.fullName && activeOtp.passwordHash) {
    const profileImgUrl = `https://ui-avatars.com/api/?name=${activeOtp.fullName.split(' ').join('+')}&background=random`;

    const dbData: UsersInsert = {
      fullName: activeOtp.fullName,
      email: activeOtp.email,
      passwordHash: activeOtp.passwordHash,
      role: 'resident',
      profileImgUrl: profileImgUrl,
      createdAt: new Date()
    };

    const result = await UserAuthRepository.createUser(dbData);
    user = sanitizeUser(result);
  } else {
    // For standard login/forgot password, user should already exist
    const users = await UserAuthRepository.getUserByEmail({ email: email });
    if (users.length === 0) {
      return null;
    }
    user = sanitizeUser(users[0]!);
  }

  // 🔑 Generate tokens for the verified user
  const payload = {
    id: user.id,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const { token: refreshToken, expiresInSeconds } = generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  await UserAuthRepository.createSession({
    user_id: user.id,
    refresh_token: refreshToken,
    expires_at: expiresAt
  });

  await OtpRepository.markOtpAsUsed(activeOtp.id);

  return {
    user,
    accessToken,
    refreshToken
  };
};

// ================= VALIDATE OTP (WITHOUT USING IT) =================

export const validateOtpService = async (email: string, otpCode: string): Promise<boolean> => {
  const activeOtp = await OtpRepository.findValidOtp(email, otpCode);
  return !!activeOtp;
};

// ================= RESET PASSWORD =================

export const resetPasswordService = async (
  email: string,
  otpCode: string,
  newPassword: string
): Promise<{ user: Omit<Users, 'passwordHash'>; accessToken: string; refreshToken: string }> => {
  const activeOtp = await OtpRepository.findValidOtp(email, otpCode);

  if (!activeOtp) {
    throw HttpErrors.unauthorized('Invalid or expired OTP verification code');
  }

  // Ensure user exists
  const users = await UserAuthRepository.getUserByEmail({ email });
  if (users.length === 0) {
    throw HttpErrors.notFound('User not found');
  }

  const user = users[0]!;

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password in DB
  await UserAuthRepository.updateUserPassword(email, passwordHash);

  // Mark OTP as used
  await OtpRepository.markOtpAsUsed(activeOtp.id);

  // 🔑 Generate tokens so the user is logged in after reset
  const payload = {
    id: user.id,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const { token: refreshToken, expiresInSeconds } = generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  await UserAuthRepository.createSession({
    user_id: user.id,
    refresh_token: refreshToken,
    expires_at: expiresAt
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};
