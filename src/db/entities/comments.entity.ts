import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type Timestamp = ColumnType<Date, Date | string>;

export interface CommentsTable {
  id: Generated<number>;
  incidentId: number;
  userId: number;
  content: string;
  isEdited: boolean;
  createdAt: Timestamp;
}

export type Comments = Selectable<CommentsTable>;
export type CommentsInsert = Insertable<CommentsTable>;
export type CommentsUpdate = Updateable<CommentsTable>;
