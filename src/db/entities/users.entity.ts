import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type UserRole = 'resident' | 'admin';
export type Timestamp = ColumnType<Date, Date | string>;

export interface UsersTable {
  id: Generated<number>;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profileImgUrl: string | null;
  createdAt: Timestamp;
}

export type Users = Selectable<UsersTable>;
export type UsersInsert = Insertable<UsersTable>;
export type UsersUpdate = Updateable<UsersTable>;
