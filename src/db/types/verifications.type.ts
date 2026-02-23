import { Insertable, Selectable, Updateable } from 'kysely/dist/cjs';

export interface VerificationsTable {
  incident_id: number;
  user_id: number;
  is_verified: boolean;
}

export type Verifications = Selectable<VerificationsTable>;
export type VerificationsInsert = Insertable<VerificationsTable>;
export type VerificationsUpdate = Updateable<VerificationsTable>;
