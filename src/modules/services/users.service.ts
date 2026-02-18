import { UsersRepository } from '../../db/repos/users.repository';
import { Users, UsersInsert, UsersUpdate } from '../../db/types/users.type';
import {
  CreateUserBodyRequest,
  UpdateUserBodyRequest,
  updateUserSchema
} from '../../schemas/users.schema';
import { sanitizeUser } from '../../utils/user-sanitizer.util';
import { logger } from '../../utils/winston.util';
import bcrypt from 'bcrypt';

type GetUsersParams = {
  id?: number;
  full_name?: string;
  is_active?: boolean;
};

/*
Get Users Service
*/
export const getUsersService = async (
  params: GetUsersParams
): Promise<Omit<Users, 'password_hash'>[]> => {
  logger.info('getUsers: processing request', params);

  const filterParams: Partial<{ id: number; fullName: string; isActive: boolean; email?: string }> =
    {};
  if (params.id !== undefined) filterParams.id = params.id;
  if (params.full_name !== undefined) filterParams.fullName = params.full_name;
  if (params.is_active !== undefined) filterParams.isActive = params.is_active;

  const result = await UsersRepository.getUsers(filterParams);
  return result.map(sanitizeUser);
};

/*
Get Users Service
*/
export const createUserService = async (
  data: CreateUserBodyRequest
): Promise<Omit<Users, 'password_hash'>> => {
  logger.info('createUser: processing request', { email: data.email });

  const existingUser = await UsersRepository.getUsers({ email: data.email });
  if (existingUser.length > 0) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const dbData: UsersInsert = {
    full_name: data.fullName,
    email: data.email,
    password_hash: passwordHash,
    role: 'resident',
    is_active: true,
    profile_img_url: '',
    created_at: new Date()
  };

  const result = await UsersRepository.createUser(dbData);

  return sanitizeUser(result);
};

/*
Patch Users Service
*/
export const patchUserService = async (
  id: number,
  data: Partial<UpdateUserBodyRequest>
): Promise<Omit<Users, 'password_hash'>> => {
  logger.info('patchUser: processing request', { userId: id, data });

  // Check if user exists
  const existingUsers = await UsersRepository.getUsers({ id });
  if (existingUsers.length === 0) {
    throw new Error(`User with id ${id} not found`);
  }

  // Validate partial update data
  const validatedData = updateUserSchema.partial().parse(data);

  // If email is being updated, check if it's already taken by another user
  if (validatedData.email) {
    const usersWithEmail = await UsersRepository.getUsers({ email: validatedData.email });
    const emailTakenByOtherUser = usersWithEmail.some((user) => user.id !== id);

    if (emailTakenByOtherUser) {
      throw new Error('Email is already taken by another user');
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
