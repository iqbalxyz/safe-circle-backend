import { UsersRepository } from '../../db/repos/users.repository';
import { Users, UsersInsert, UsersUpdate } from '../../db/types/users.type';
import { UserLoginRequest } from '../../schemas/auth.schema';
import {
  CreateUserBodyRequest,
  UpdateUserBodyRequest,
  updateUserSchema
} from '../../schemas/users.schema';
import { HttpErrors } from '../../utils/error.util';
import { sanitizeUser } from '../../utils/user-sanitizer.util';
import { logger } from '../../utils/winston.util';
import bcrypt from 'bcrypt';

type GetUsersParams = {
  id?: number;
  full_name?: string;
};

/**
 * Get Users Service
 * @param params - An object containing optional filters for retrieving users. The filters include:
 *   - id: Filter users by their unique identifier.
 *   - full_name: Filter users by their full name.
 * @returns if successful, it will return an array of user objects that match the provided filters,
 * excluding the password hash for security reasons. If no filters are provided,
 * it will return all users in the system (excluding password hashes).
 */
export const getUsersService = async (
  params: GetUsersParams
): Promise<Omit<Users, 'password_hash'>[]> => {
  logger.info('getUsers: processing request', params);

  const filterParams: Partial<{ id: number; fullName: string; email?: string }> = {};
  if (params.id !== undefined) filterParams.id = params.id;
  if (params.full_name !== undefined) filterParams.fullName = params.full_name;

  const result = await UsersRepository.getUsers(filterParams);
  return result.map(sanitizeUser);
};

/**
 * Create User Service
 * @param data - An object containing the necessary information to create a new user. The required fields include:
 *   - fullName: The full name of the user.
 *   - email: The email address of the user, which must be unique.
 *   - password: The password for the user account, which will be securely hashed before storage.
 * @returns if the user is created successfully, it will return the created user information (excluding the password hash).
 */
export const createUserService = async (
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

  const result = await UsersRepository.createUser(dbData);

  return sanitizeUser(result);
};

/**
 * Patch User Service
 * @param id
 * @param data - An object containing the fields to be updated for an existing user. The fields are optional and can include:
 *   - fullName: The new full name of the user.
 *   - email: The new email address of the user, which must be unique if provided.
 *   - password: The new password for the user account, which will be securely hashed before storage if provided.
 * @returns if the update is successful, it will return the updated user information (excluding the password hash).
 */
export const patchUserService = async (
  id: number,
  data: Partial<UpdateUserBodyRequest>
): Promise<Omit<Users, 'password_hash'>> => {
  logger.info('patchUser: processing request', { userId: id, data });

  // Check if user exists
  const existingUsers = await UsersRepository.getUsers({ id });
  if (existingUsers.length === 0) {
    throw HttpErrors.notFound(`User with id ${id} not found`);
  }

  // Validate partial update data
  const validatedData = updateUserSchema.partial().parse(data);

  // If email is being updated, check if it's already taken by another user
  if (validatedData.email) {
    const usersWithEmail = await UsersRepository.getUsers({ email: validatedData.email });
    const emailTakenByOtherUser = usersWithEmail.some((user) => user.id !== id);

    if (emailTakenByOtherUser) {
      throw HttpErrors.conflict('Email is already taken by another user');
    }
  }

  // Build update object (only include fields that are provided)
  const updateData: UsersUpdate = {};

  if (validatedData.fullName !== undefined) {
    updateData.full_name = validatedData.fullName;
  }

  if (validatedData.email !== undefined) {
    updateData.email = validatedData.email;
  }

  if (validatedData.password !== undefined) {
    updateData.password_hash = await bcrypt.hash(validatedData.password, 10);
  }

  // Only update if there's something to update
  if (Object.keys(updateData).length === 0) {
    return sanitizeUser(existingUsers[0]!);
  }

  const updatedUser = await UsersRepository.updateUser(id, updateData);

  logger.info('patchUser: user updated successfully', { userId: id });

  return sanitizeUser(updatedUser);
};

/**
 * User Login Service
 * @param data - An object containing the necessary information for a user to log in. The required fields include:
 *   - email: The email address of the user attempting to log in.
 *   - password: The password provided by the user, which will be compared against the stored hashed password for authentication.
 * @returns if the login is successfull, it will return authenticated user information (excluding the password hash)
 */
export const userLoginService = async (
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

/**
 * Delete User Service
 * @param id - The unique identifier of the user to be deleted. This service will check if the user exists before attempting deletion and will throw an error if the user is not found.
 * @returns if successful, the service will return void. If the user is not found, it will throw a 404 Not Found error.
 */
export const deleteUserService = async (id: number): Promise<void> => {
  logger.info('deleteUser: processing delete request', { userId: id });

  // Check if user exists
  const existingUsers = await UsersRepository.getUsers({ id });
  if (existingUsers.length === 0) {
    throw HttpErrors.notFound(`User with id ${id} not found`);
  }

  await UsersRepository.deleteUser(id);

  logger.info('deleteUser: user deleted successfully', { userId: id });
};
