import { Insertable, Selectable, Updateable } from 'kysely/dist/cjs';

export interface VerificationsTable {
  user_id: number;
  incident_id: number;
  is_verified: boolean;
}

export type verifications = Selectable<VerificationsTable>;
export type verificationsInsert = Insertable<VerificationsTable>;
export type verificationsUpdate = Updateable<VerificationsTable>;
