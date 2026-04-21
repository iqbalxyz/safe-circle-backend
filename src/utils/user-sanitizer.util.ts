import { Users } from '../db/entities/users.entity';
import { omitKeys } from './sanitize.util';

export const sanitizeUser = (user: Users): Omit<Users, 'passwordHash'> => {
  return omitKeys(user, ['passwordHash'] as const);
};
