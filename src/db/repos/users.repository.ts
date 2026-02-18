import { db } from '../database';
import { Users, UsersInsert, UsersUpdate } from '../types/users.type';

export const UsersRepository = {
  getUsers: async (
    params: Partial<{ id: number; fullName: string; isActive: boolean; email: string }>
  ): Promise<Users[]> => {
    let query = db.selectFrom('users').selectAll();

    if (params.id) {
      query = query.where('id', '=', params.id);
    }
    if (params.fullName) {
      query = query.where('full_name', 'like', `%${params.fullName}%`);
    }
    if (params.isActive !== undefined) {
      query = query.where('is_active', '=', params.isActive);
    }
    if (params.email) {
      query = query.where('email', '=', params.email);
    }

    return await query.execute();
  },

  getUsersByEmails: async (emails: string[]): Promise<Users[]> => {
    return await db.selectFrom('users').selectAll().where('email', 'in', emails).execute();
  },

  createUser: async (data: UsersInsert): Promise<Users> => {
    const result = await db.insertInto('users').values(data).executeTakeFirstOrThrow();

    const insertedId = result.insertId;

    if (!insertedId) {
      throw new Error('Failed to get inserted user id');
    }

    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', Number(insertedId))
      .executeTakeFirst();

    if (!user) {
      throw new Error('Failed to fetch inserted user');
    }

    return user;
  },

  updateUser: async (id: number, data: UsersUpdate): Promise<Users> => {
    const result = await db.updateTable('users').set(data).where('id', '=', id).executeTakeFirst();

    if (!result || Number(result.numUpdatedRows) === 0) {
      throw new Error(`User with id ${id} not found`);
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
      throw new Error(`User with id ${id} not found`);
    }
  }
};
