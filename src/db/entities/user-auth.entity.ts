import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type Timestamp = ColumnType<Date, Date | string>;

export interface UserAuthTable {
  id: Generated<number>;
  userId: number;
  refreshToken: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

export type UserAuth = Selectable<UserAuthTable>;
export type UserAuthInsert = Insertable<UserAuthTable>;
export type UserAuthUpdate = Updateable<UserAuthTable>;
