import bcrypt from 'bcrypt';
import { Users, UsersUpdate } from '../../db/entities/users.entity';
import { UsersRepository } from '../../db/repos/users.repository';
import { UpdateUserBodyRequest, updateUserSchema } from '../../schemas/users.schema';
import { HttpErrors } from '../../utils/error.util';
import { sanitizeUser } from '../../utils/user-sanitizer.util';
import { logger } from '../../utils/winston.util';

type GetUsersParams = {
  id?: number;
  fullName?: string;
};

/**
 * Get Users Service
 * @param params - An object containing optional filters for retrieving users. The filters include:
 *   - id: Filter users by their unique identifier.
 *   - fullName: Filter users by their full name.
 * @returns if successful, it will return an array of user objects that match the provided filters,
 * excluding the password hash for security reasons. If no filters are provided,
 * it will return all users in the system (excluding password hashes).
 */
export const getUsersService = async (
  params: GetUsersParams
): Promise<Omit<Users, 'passwordHash'>[]> => {
  logger.info('getUsers: processing request', params);

  const filterParams: Partial<{ id: number; fullName: string; email?: string }> = {};
  if (params.id !== undefined) filterParams.id = params.id;
  if (params.fullName !== undefined) filterParams.fullName = params.fullName;

  const result = await UsersRepository.getUsers(filterParams);
  return result.map(sanitizeUser);
};

export const getSpecificUserService = async (id: number): Promise<Omit<Users, 'passwordHash'>> => {
  logger.info('getSpecificUser: processing request', { userId: id });
  const result = await UsersRepository.getSpecificUser(id);
  if (result === undefined || result === null) {
    throw HttpErrors.notFound(`User with id ${id} not found`);
  }

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
): Promise<Omit<Users, 'passwordHash'>> => {
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
    updateData.fullName = validatedData.fullName;
  }

  if (validatedData.email !== undefined) {
    updateData.email = validatedData.email;
  }

  if (validatedData.password !== undefined) {
    updateData.passwordHash = await bcrypt.hash(validatedData.password, 10);
  }

  if (validatedData.profileImage !== undefined) {
    updateData.profileImgUrl = validatedData.profileImage;
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
