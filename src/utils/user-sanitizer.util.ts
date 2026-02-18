import { Users } from '../db/types/users.type';
import { omitKeys } from './sanitize.util';

export const sanitizeUser = (user: Users): Omit<Users, 'password_hash'> => {
  return omitKeys(user, ['password_hash'] as const);
};
