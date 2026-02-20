import { UserAuthRepository } from '../../db/repos/auth.repository';
import { UsersRepository } from '../../db/repos/users.repository';
import { Users, UsersInsert } from '../../db/types/users.type';
import { UserLoginRequest } from '../../schemas/auth.schema';
import { CreateUserBodyRequest } from '../../schemas/users.schema';
import { HttpErrors } from '../../utils/error.util';
import { sanitizeUser } from '../../utils/user-sanitizer.util';
import { logger } from '../../utils/winston.util';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.util';
import bcrypt from 'bcrypt';

/**
 * Create User Service
 * @param data - An object containing the necessary information to create a new user. The required fields include:
 *   - fullName: The full name of the user.
 *   - email: The email address of the user, which must be unique.
 *   - password: The password for the user account, which will be securely hashed before storage.
 * @returns if the user is created successfully, it will return the created user information (excluding the password hash).
 */
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

/**
 * User Login Service
 * @param data - An object containing the necessary information for a user to log in. The required fields include:
 *   - email: The email address of the user attempting to log in.
 *   - password: The password provided by the user, which will be compared against the stored hashed password for authentication.
 * @returns if the login is successfull, it will return authenticated user information (excluding the password hash)
 */
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

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });

  const { token: refreshToken, expiresInSeconds } = generateRefreshToken({
    userId: user.id,
    role: user.role
  });

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

export const refreshAccessTokenService = async (
  refreshToken: string
): Promise<{ accessToken: string; newRefreshToken: string }> => {
  const { verifyRefreshToken, generateAccessToken, generateRefreshToken } =
    await import('../../utils/jwt.util');
  const decoded = verifyRefreshToken(refreshToken) as { userId: number; role: string };

  const session = await UserAuthRepository.getSessionByToken(refreshToken);

  if (!session) {
    throw HttpErrors.unauthorized('Invalid or revoked refresh token');
  }

  if (new Date(session.expires_at) < new Date()) {
    await UserAuthRepository.deleteSession(session.id);
    throw HttpErrors.unauthorized('Refresh token expired');
  }

  const accessToken = generateAccessToken({ userId: decoded.userId, role: decoded.role });
  const { token: newRefreshToken, expiresInSeconds } = generateRefreshToken({
    userId: decoded.userId,
    role: decoded.role
  });

  await UserAuthRepository.deleteSession(session.id);

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  await UserAuthRepository.createSession({
    user_id: decoded.userId,
    refresh_token: newRefreshToken,
    expires_at: expiresAt
  });

  return { accessToken, newRefreshToken };
};

export const logoutUserService = async (refreshToken: string) => {
  return await UserAuthRepository.revokeRefreshToken(refreshToken);
};
