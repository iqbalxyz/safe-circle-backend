import { Users } from '../db/entities/users.entity';
import { omitKeys } from './sanitize.util';

export const sanitizeUser = (user: Users): Omit<Users, 'password_hash'> => {
  return omitKeys(user, ['password_hash'] as const);
};
