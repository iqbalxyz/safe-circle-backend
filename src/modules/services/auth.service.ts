import { UserAuthRepository } from '../../db/repos/auth.repository';
import { UsersRepository } from '../../db/repos/users.repository';
import { Users, UsersInsert } from '../../db/entities/users.entity';
import { UserLoginRequest } from '../../schemas/auth.schema';
import { CreateUserBodyRequest } from '../../schemas/users.schema';
import { HttpErrors } from '../../utils/error.util';
import { sanitizeUser } from '../../utils/user-sanitizer.util';
import { logger } from '../../utils/winston.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../../utils/jwt.util';
import bcrypt from 'bcrypt';

// ================= REGISTER =================

export const registerUserService = async (
  data: CreateUserBodyRequest
): Promise<Omit<Users, 'password_hash'>> => {
  logger.info('createUser: processing request', { email: data.email });

  const existingUser = await UsersRepository.getUsers({ email: data.email });
  if (existingUser.length > 0) {
    throw HttpErrors.conflict('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const dbData: UsersInsert = {
    full_name: data.fullName,
    email: data.email,
    password_hash: passwordHash,
    role: 'resident',
    profile_img_url: '',
    created_at: new Date()
  };

  const result = await UserAuthRepository.createUser(dbData);

  return sanitizeUser(result);
};

// ================= LOGIN =================

export const loginUserService = async (
  data: UserLoginRequest
): Promise<{ user: Omit<Users, 'password_hash'>; accessToken: string; refreshToken: string }> => {
  logger.info('userLogin: processing login request', { email: data.email });

  const users = await UserAuthRepository.getUserByEmail({ email: data.email });

  if (users.length === 0) {
    throw HttpErrors.unauthorized('Invalid email');
  }

  const user = users[0]!;

  const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

  if (!isPasswordValid) {
    throw HttpErrors.unauthorized('Invalid password');
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

  if (new Date(session.expires_at) < new Date()) {
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
    refreshToken
  };
};

// ================= LOGOUT =================

export const logoutUserService = async (refreshToken: string) => {
  return await UserAuthRepository.revokeRefreshToken(refreshToken);
};
