import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type Timestamp = ColumnType<Date, Date | string>;

export interface UserAuthTable {
  id: Generated<number>;
  user_id: number;
  refresh_token: string;
  expires_at: Timestamp;
  created_at: Timestamp;
}

export type UserAuth = Selectable<UserAuthTable>;
export type UserAuthInsert = Insertable<UserAuthTable>;
export type UserAuthUpdate = Updateable<UserAuthTable>;
