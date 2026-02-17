import { HttpError } from '../../utils/error.util';
import { HTTP_RESPONSE_STATUS_CODE } from '../../utils/response.utils';
import { logger } from '../../utils/winston';
import { db } from '../database';
import { Users } from '../types/users.type';

type UserFilter = {
  id?: number;
  fullName?: string;
};

export type PublicUser = Omit<Users, 'password_hash'>;

const getUsers = async (filter: UserFilter): Promise<PublicUser[]> => {
  try {
    let query = db
      .selectFrom('users')
      .select(['id', 'full_name', 'email', 'role', 'is_active', 'profile_img_url', 'created_at']);

    if (filter.id !== undefined) {
      query = query.where('id', '=', filter.id);
    }
    if (filter.fullName !== undefined) {
      query = query.where('full_name', '=', filter.fullName);
    }

    const result = await query.orderBy('id', 'asc').execute();

    return result;
  } catch (error) {
    logger.error(`getUsers Error: ${error instanceof Error ? error.message : String(error)}`);
    throw new HttpError(
      `Failed to get users: ${error instanceof Error ? error.message : String(error)}`,
      HTTP_RESPONSE_STATUS_CODE.BAD_REQUEST
    );
  }
};

export const UsersRepository = {
  getUsers
};
