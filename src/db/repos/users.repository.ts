import { HttpErrors } from '../../utils/error.util';
import { db } from '../database';
import { Users, UsersUpdate } from '../entities/users.entity';

export const UsersRepository = {
  getUsers: async (
    params: Partial<{ id: number; fullName: string; email: string }>
  ): Promise<Users[]> => {
    let query = db.selectFrom('users').selectAll();

    if (params.id) {
      query = query.where('id', '=', params.id);
    }
    if (params.fullName) {
      query = query.where('fullName', 'like', `%${params.fullName}%`);
    }
    if (params.email) {
      query = query.where('email', '=', params.email);
    }

    return await query.execute();
  },

  getSpecificUser: async (id: number): Promise<Users> => {
    const user = await db.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst();

    if (!user) {
      throw HttpErrors.notFound(`User with id ${id} not found`);
    }

    return user;
  },

  updateUser: async (id: number, data: UsersUpdate): Promise<Users> => {
    const result = await db.updateTable('users').set(data).where('id', '=', id).executeTakeFirst();

    if (!result || Number(result.numUpdatedRows) === 0) {
      throw HttpErrors.notFound(`User with id ${id} not found`);
    }

    // fetch updated row separately
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

    return user;
  },

  deleteUser: async (id: number): Promise<void> => {
    const result = await db.deleteFrom('users').where('id', '=', id).executeTakeFirst();

    if (!result || Number(result.numDeletedRows) === 0) {
      throw HttpErrors.notFound(`User with id ${id} not found`);
    }
  }
};
