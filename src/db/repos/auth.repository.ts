import { HttpErrors } from '../../utils/error.util';
import { db } from '../database';
import { Users, UsersInsert } from '../types/users.type';

export const UserAuthRepository = {
  getUserByEmail: async (params: Partial<{ email: string }>): Promise<Users[]> => {
    let query = db.selectFrom('users').selectAll();
    if (params.email) {
      query = query.where('email', '=', params.email);
    }

    return await query.execute();
  },

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
  }
};
