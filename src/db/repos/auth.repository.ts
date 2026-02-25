import { HttpErrors } from '../../utils/error.util';
import { logger } from '../../utils/winston.util';
import { db } from '../database';
import { Users, UsersInsert } from '../entities/users.entity';
import { format } from 'date-fns';

export const UserAuthRepository = {
  createUser: async (data: UsersInsert): Promise<Users> => {
    const result = await db.insertInto('users').values(data).executeTakeFirstOrThrow();

    const insertedId = result.insertId;

    if (!insertedId) {
      throw HttpErrors.internal('Failed to get inserted user id');
    }

    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', Number(insertedId))
      .executeTakeFirst();

    if (!user) {
      throw HttpErrors.internal('Failed to fetch inserted user');
    }

    return user;
  },

  getUserByEmail: async (params: Partial<{ email: string }>): Promise<Users[]> => {
    let query = db.selectFrom('users').selectAll();
    if (params.email) {
      query = query.where('email', '=', params.email);
    }

    return await query.execute();
  },

  createSession: async (session: { user_id: number; refresh_token: string; expires_at: Date }) => {
    const now = new Date();
    const sqlExpiresAt = format(session.expires_at, 'yyyy-MM-dd HH:mm:ss');
    const sqlNowDate = format(now, 'yyyy-MM-dd HH:mm:ss');
    return await db
      .insertInto('user_auth')
      .values({
        user_id: session.user_id,
        refresh_token: session.refresh_token,
        expires_at: sqlExpiresAt,
        created_at: sqlNowDate
      })
      .executeTakeFirstOrThrow();
  },

  getSessionByToken: async (token: string) => {
    return await db
      .selectFrom('user_auth')
      .selectAll()
      .where('refresh_token', '=', token)
      .executeTakeFirst();
  },

  deleteSession: async (tokenId: number) => {
    return await db.deleteFrom('user_auth').where('id', '=', tokenId).execute();
  },

  revokeRefreshToken: async (token: string) => {
    const result = await db
      .deleteFrom('user_auth')
      .where('refresh_token', '=', token)
      .executeTakeFirst();

    // result.numDeletedRows will tell you if a row was actually removed
    logger.info('Rows deleted:', result.numDeletedRows);
    return result;
  }
};
