import { UserAuthRepository } from '../../db/repos/auth.repository';
import { UsersRepository } from '../../db/repos/users.repository';
import { Users, UsersInsert } from '../../db/types/users.type';
import { UserLoginRequest } from '../../schemas/auth.schema';
import { CreateUserBodyRequest } from '../../schemas/users.schema';
import { HttpErrors } from '../../utils/error.util';
import { sanitizeUser } from '../../utils/user-sanitizer.util';
import { logger } from '../../utils/winston.util';
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

  const users = await UsersRepository.getUsers({ email: data.email });
  if (users.length === 0) {
    throw HttpErrors.unauthorized('Invalid email');
  }

  const user = users[0]!;
  const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
  if (!isPasswordValid) {
    throw HttpErrors.unauthorized('Invalid password');
  }

  const { generateAccessToken, generateRefreshToken } = await import('../../utils/jwt.util');
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};
