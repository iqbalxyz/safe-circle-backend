import { Insertable, Selectable, Updateable } from 'kysely';

export interface VerificationsTable {
  incidentId: number;
  userId: number;
  isVerified: boolean;
}

export type Verifications = Selectable<VerificationsTable>;
export type VerificationsInsert = Insertable<VerificationsTable>;
export type VerificationsUpdate = Updateable<VerificationsTable>;
