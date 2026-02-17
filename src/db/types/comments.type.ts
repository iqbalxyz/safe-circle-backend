import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely/dist/cjs';

export type Timestamp = ColumnType<Date, Date | string>;

export interface CommentsTable {
  id: Generated<number>;
  incident_id: number;
  user_id: number;
  content: string;
  created_at: Timestamp;
}

export type Comments = Selectable<CommentsTable>;
export type CommentsInsert = Insertable<CommentsTable>;
export type CommentsUpdate = Updateable<CommentsTable>;
