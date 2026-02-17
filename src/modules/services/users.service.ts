import { PublicUser, UsersRepository } from '../../db/repos/users.repository';
import { logger } from '../../utils/winston';

export const getUsersService = async (fullName: string): Promise<PublicUser[]> => {
  logger.info('getUsers: processing request', { fullName });

  const result = await UsersRepository.getUsers({ fullName });
  return result;
};
