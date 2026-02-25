import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely/dist/cjs';

export type UserRole = 'resident' | 'admin';
export type Timestamp = ColumnType<Date, Date | string>;

export interface UsersTable {
  id: Generated<number>;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  profile_img_url: string;
  created_at: Timestamp;
}

export type Users = Selectable<UsersTable>;
export type UsersInsert = Insertable<UsersTable>;
export type UsersUpdate = Updateable<UsersTable>;
